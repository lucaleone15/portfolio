import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * First-party, privacy-friendly analytics (no third party, no cookie, no IP stored):
 *   POST /api/hit         { p: path, r: referrer }  → one line in .data/hits.ndjson
 * Read in the atelier (Statistiques, server/stats.ts).
 * Bots are ignored; the client skips visitors with Do Not Track (src/App.tsx).
 * Retention: hits older than 13 months are deleted (checked once a day) — stated in the
 * privacy policy (src/components/PrivacyPolicy.tsx).
 */

type Env = Record<string, string | undefined>;
interface Hit {
  t: string; // ISO date-time
  p: string; // path
  r: string; // referrer host ('' = direct / same site)
}

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor/i;
const MAX_BODY = 2_000;
const RETENTION_MS = 395 * 86_400_000; // ~13 months

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk;
      if (body.length > MAX_BODY) req.destroy();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

export function createAnalyticsHandler(env: Env, dataDir = path.resolve(process.cwd(), '.data')) {
  const file = path.join(dataDir, 'hits.ndjson');
  let lastPrune = 0;

  // Drop hits past the retention period (at most once a day)
  const pruneIfDue = () => {
    if (Date.now() - lastPrune < 86_400_000 || !fs.existsSync(file)) return;
    lastPrune = Date.now();
    const cutoff = Date.now() - RETENTION_MS;
    const kept = fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => {
        try {
          return line && Date.parse(JSON.parse(line).t) >= cutoff;
        } catch {
          return false;
        }
      });
    fs.writeFileSync(file, kept.length ? kept.join('\n') + '\n' : '');
  };

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/api/hit' && req.method === 'POST') {
      res.statusCode = 204;
      res.end();
      if (BOT_RE.test(String(req.headers['user-agent'] ?? ''))) return;
      try {
        const { p, r } = JSON.parse(await readBody(req)) as { p?: string; r?: string };
        if (typeof p !== 'string' || !p.startsWith('/') || p.length > 200) return;
        let ref = '';
        try {
          const host = r ? new URL(r).hostname : '';
          ref = host && !host.endsWith('luca-leone.ch') && host !== 'localhost' ? host : '';
        } catch {
          // not a URL: ignore
        }
        const hit: Hit = { t: new Date().toISOString(), p: p.split('?')[0], r: ref };
        fs.mkdirSync(dataDir, { recursive: true });
        pruneIfDue();
        fs.appendFile(file, JSON.stringify(hit) + '\n', () => {});
      } catch {
        // malformed beacon: ignore
      }
      return;
    }

    next();
  };
}
