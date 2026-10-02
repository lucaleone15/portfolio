import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { createContactHandler } from './contact';
import { createAnalyticsHandler } from './analytics';

/**
 * Production server (replaces `vite preview`, which Vite says isn't meant for production).
 * Built with esbuild to dist-server/index.mjs; run from the project root: `npm start`.
 *
 * - Serves the prerendered pages: /x → dist/x.html or dist/x/index.html; unknown pages get
 *   dist/404.html with a real 404 status
 * - brotli / gzip for text files (cached in memory)
 * - Cache: hashed build assets 1 year (immutable), HTML always revalidated, the rest 30 days
 * - Security headers incl. a strict CSP (only own scripts + the inline theme script, by hash)
 * - www.* is redirected (301) to the bare domain
 * - POST /api/contact (server/contact.ts) and first-party analytics (server/analytics.ts)
 *
 * Env (.env in the project root): PORT (default 3000), SMTP_* / CONTACT_TO, STATS_KEY.
 */

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // no .env file: rely on the real environment
}
const env = process.env as Record<string, string | undefined>;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.xml', '.txt', '.svg']);

// CSP: allow the inline theme script in index.html by its hash (computed from the build)
const inlineScriptHashes = (() => {
  try {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    return [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(
      ([, code]) => `'sha256-${crypto.createHash('sha256').update(code).digest('base64')}'`,
    );
  } catch {
    return [];
  }
})();

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'", // React style attributes
    "font-src 'self'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

const compressedCache = new Map<string, Buffer>();

/** Resolve a URL path to a file inside dist (never outside it). */
function resolveFile(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const base = path.join(DIST, clean);
  if (!base.startsWith(DIST)) return null;
  const trimmed = base.replace(/[/\\]+$/, '');
  for (const candidate of [base, `${trimmed}.html`, path.join(trimmed, 'index.html')]) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      // try the next one
    }
  }
  return null;
}

function cacheControl(file: string): string {
  const rel = path.relative(DIST, file);
  if (rel.startsWith(`assets${path.sep}`)) return 'public, max-age=31536000, immutable';
  if (file.endsWith('.html')) return 'no-cache';
  return 'public, max-age=2592000'; // 30 days
}

function send(req: http.IncomingMessage, res: http.ServerResponse, file: string, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const stat = fs.statSync(file);
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
  res.setHeader('Cache-Control', cacheControl(file));
  res.setHeader('ETag', etag);
  res.setHeader('Vary', 'Accept-Encoding');
  if (status === 200 && req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }
  res.statusCode = status;

  const accept = String(req.headers['accept-encoding'] ?? '');
  const encoding = COMPRESSIBLE.has(ext) ? (accept.includes('br') ? 'br' : accept.includes('gzip') ? 'gzip' : null) : null;
  let body: Buffer = fs.readFileSync(file);
  if (encoding) {
    const key = `${file}:${stat.mtimeMs}:${encoding}`;
    let packed = compressedCache.get(key);
    if (!packed) {
      packed = encoding === 'br' ? zlib.brotliCompressSync(body) : zlib.gzipSync(body, { level: 9 });
      compressedCache.set(key, packed);
    }
    body = packed;
    res.setHeader('Content-Encoding', encoding);
  }
  res.setHeader('Content-Length', body.length);
  res.end(req.method === 'HEAD' ? undefined : body);
}

const contact = createContactHandler(env);
const analytics = createAnalyticsHandler(env);

const server = http.createServer((req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);

  // One canonical host: www.luca-leone.ch → luca-leone.ch (301, path and query kept), so
  // search engines only ever see one version of the site
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? '').split(',')[0].trim();
  if (host.startsWith('www.')) {
    res.statusCode = 301;
    res.setHeader('Location', `https://${host.slice(4)}${req.url ?? '/'}`);
    res.end();
    return;
  }

  const next404 = () => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.end();
      return;
    }
    const urlPath = new URL(req.url ?? '/', 'http://localhost').pathname;
    const file = resolveFile(urlPath);
    if (file) return send(req, res, file);
    // Unknown asset → plain 404; unknown page → the 404 page
    if (path.extname(urlPath)) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    send(req, res, path.join(DIST, '404.html'), 404);
  };

  analytics(req, res, () => contact(req, res, next404));
});

const port = Number(env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`luca-leone.ch → http://localhost:${port}`));
