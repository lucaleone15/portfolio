import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifyPassword, verifyTotp } from './auth';
import { createLoginLimiter } from './rateLimit';
import { createSessionStore } from './sessions';

/**
 * The private admin (dashboard), entirely under ADMIN_PATH — an address that is never linked:
 *   GET  P/, P/<client route>   the admin app (dist-admin/admin.html, with <base href="P/">)
 *   GET  P/assets/*             its files
 *   POST P/api/login            { password, code } → session cookie
 *   POST P/api/logout · GET P/api/me
 * Anything else under P/api/ needs a session; without one it gets the site's own 404, the same
 * as an address that doesn't exist. Mutations need an `X-Admin: 1` header (a cross-site form
 * can't send it). Everything under P is noindex.
 * Without ADMIN_PATH, ADMIN_PASSWORD_HASH and ADMIN_TOTP_SECRET the admin doesn't exist.
 */

type Env = Record<string, string | undefined>;
type Next = () => void;
export type Handler = (req: IncomingMessage, res: ServerResponse, next: Next) => void;

export interface AdminDeps {
  dataDir: string;
  repoRoot: string;
  distAdmin: string;
  /** The site's 404 page */
  notFound: (req: IncomingMessage, res: ServerResponse) => void;
  onPublished: () => void;
  /** Dev server: serves admin.html through Vite instead of dist-admin */
  servePage?: (req: IncomingMessage, res: ServerResponse, html: (raw: string) => string) => void;
  now?: () => number;
}

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  /** Path below P/api, e.g. "/content/site" */
  route: string;
  query: URLSearchParams;
  json: <T = unknown>(limit?: number) => Promise<T>;
  send: (status: number, body?: unknown) => void;
}

const COOKIE = 'll_admin';
const MAX_JSON = 2_000_000;
const DAY = 86_400_000;

const MIME: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

export const mimeOf = (file: string) => MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

export function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/** A file inside `root`, never outside it */
export function fileIn(root: string, rel: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(rel);
  } catch {
    return null;
  }
  const file = path.resolve(root, '.' + path.posix.normalize('/' + decoded));
  if (!file.startsWith(root + path.sep)) return null;
  try {
    return fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
}

const cookieOf = (req: IncomingMessage) =>
  String(req.headers.cookie ?? '')
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === COOKIE)?.[1] ?? '';

const clientIp = (req: IncomingMessage) =>
  String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

const isLocalHost = (req: IncomingMessage) => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(String(req.headers.host ?? ''));

/** Routes needing a session, added by the content, upload and publish modules */
export type ApiRoute = (ctx: Ctx) => Promise<boolean> | boolean;

export function createAdminHandler(env: Env, deps: AdminDeps, apiRoutes: ApiRoute[] = []): Handler {
  const P = (env.ADMIN_PATH ?? '').replace(/\/+$/, '');
  const enabled = /^\/[\w-]+$/.test(P) && !!env.ADMIN_PASSWORD_HASH && !!env.ADMIN_TOTP_SECRET;
  if (!enabled) return (_req, _res, next) => next();

  const now = deps.now ?? Date.now;
  const adminDir = path.join(deps.dataDir, 'admin');
  const sessions = createSessionStore(path.join(adminDir, 'sessions.json'), { idleMs: 7 * DAY, maxMs: 30 * DAY, now });
  const limiter = createLoginLimiter({ now });
  const totpFile = path.join(adminDir, 'totp.json');
  const lastCounter = (): number | null => {
    try {
      return JSON.parse(fs.readFileSync(totpFile, 'utf8')).last ?? null;
    } catch {
      return null;
    }
  };

  const withBase = (raw: string) => raw.replace('<head>', `<head><base href="${P}/">`);

  const servePage = (req: IncomingMessage, res: ServerResponse) => {
    if (deps.servePage) return deps.servePage(req, res, withBase);
    const file = path.join(deps.distAdmin, 'admin.html');
    if (!fs.existsSync(file)) return deps.notFound(req, res);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(withBase(fs.readFileSync(file, 'utf8')));
  };

  const login = async (ctx: Ctx) => {
    const ip = clientIp(ctx.req);
    const wait = limiter.retryAfterMs(ip);
    if (wait > 0) return ctx.send(429, { retryAfter: Math.ceil(wait / 1000) });
    const { password = '', code = '' } = await ctx.json<{ password?: string; code?: string }>(2_000);
    const passwordOk = await verifyPassword(String(password), env.ADMIN_PASSWORD_HASH!);
    const counter = passwordOk ? verifyTotp(env.ADMIN_TOTP_SECRET!, String(code).replace(/\s/g, ''), now(), lastCounter()) : null;
    if (counter === null) {
      limiter.fail(ip);
      return ctx.send(401, { error: 'invalid' });
    }
    limiter.succeed(ip);
    fs.mkdirSync(adminDir, { recursive: true });
    fs.writeFileSync(totpFile, JSON.stringify({ last: counter }));
    const token = sessions.create();
    const secure = isLocalHost(ctx.req) ? '' : '; Secure';
    ctx.res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly${secure}; SameSite=Strict; Path=${P}; Max-Age=${(30 * DAY) / 1000}`);
    ctx.send(204);
  };

  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { pathname } = url;
    if (pathname !== P && !pathname.startsWith(P + '/')) return next();
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');

    if (pathname === P) {
      res.statusCode = 301;
      res.setHeader('Location', `${P}/`);
      return res.end();
    }

    const rest = pathname.slice(P.length);
    if (!rest.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return deps.notFound(req, res);
      if (rest.startsWith('/assets/')) {
        const file = fileIn(path.join(deps.distAdmin, 'assets'), rest.slice('/assets/'.length));
        if (!file) return deps.notFound(req, res);
        res.setHeader('Content-Type', mimeOf(file));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return fs.createReadStream(file).pipe(res);
      }
      // Files waiting to be published (uploads), shown by the admin preview
      if (rest.startsWith('/staged/')) {
        if (!sessions.check(cookieOf(req))) return deps.notFound(req, res);
        const file = fileIn(path.join(adminDir, 'uploads'), rest.slice('/staged/'.length));
        if (!file) return deps.notFound(req, res);
        res.setHeader('Content-Type', mimeOf(file));
        res.setHeader('Cache-Control', 'private, no-cache');
        return fs.createReadStream(file).pipe(res);
      }
      return servePage(req, res);
    }

    const route = rest.slice('/api'.length);
    const ctx: Ctx = {
      req,
      res,
      route,
      query: url.searchParams,
      json: async <T,>(limit = MAX_JSON) => {
        const body = await readBody(req, limit);
        try {
          return (body.length ? JSON.parse(body.toString('utf8')) : {}) as T;
        } catch {
          throw Object.assign(new Error('bad json'), { status: 400 });
        }
      },
      send: (status, body) => {
        res.statusCode = status;
        res.setHeader('Cache-Control', 'no-store');
        if (body === undefined) return res.end();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(body));
      },
    };

    const run = async () => {
      const mutation = req.method !== 'GET' && req.method !== 'HEAD';
      if (mutation && req.headers['x-admin'] !== '1') return ctx.send(403, { error: 'forbidden' });
      if (route === '/login' && req.method === 'POST') return login(ctx);

      const token = cookieOf(req);
      if (!sessions.check(token)) return deps.notFound(req, res);

      if (route === '/me' && req.method === 'GET') return ctx.send(204);
      if (route === '/logout' && req.method === 'POST') {
        sessions.destroy(token);
        res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=${P}; Max-Age=0`);
        return ctx.send(204);
      }
      for (const handle of apiRoutes) if (await handle(ctx)) return;
      deps.notFound(req, res);
    };

    run().catch((err: Error & { status?: number }) => {
      if (res.headersSent) return res.end();
      ctx.send(err.status ?? 500, { error: err.status ? err.message : 'server' });
      if (!err.status) console.error('[admin]', err);
    });
  };
}
