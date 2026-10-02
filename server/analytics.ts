import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * First-party, privacy-friendly analytics (no third party, no cookie, no IP stored):
 *   POST /api/hit         { p: path, r: referrer }  → one line in .data/hits.ndjson
 *   GET  /stats?key=…     small HTML dashboard (last 30 days)    ← STATS_KEY env
 *   GET  /api/stats?key=… the same numbers as JSON
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

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

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

  const readHits = (days: number): Hit[] => {
    if (!fs.existsSync(file)) return [];
    const since = Date.now() - days * 86_400_000;
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Hit;
        } catch {
          return null;
        }
      })
      .filter((h): h is Hit => !!h && Date.parse(h.t) >= since);
  };

  const summarize = (hits: Hit[]) => {
    const count = (key: (h: Hit) => string) => {
      const map = new Map<string, number>();
      hits.forEach((h) => map.set(key(h), (map.get(key(h)) ?? 0) + 1));
      return [...map.entries()].sort((a, b) => b[1] - a[1]);
    };
    return {
      total: hits.length,
      byDay: count((h) => h.t.slice(0, 10)).sort((a, b) => a[0].localeCompare(b[0])),
      pages: count((h) => h.p).slice(0, 20),
      projects: count((h) => h.p).filter(([p]) => p.startsWith('/projets/') || p.startsWith('/en/projects/')),
      referrers: count((h) => h.r || '(direct)').slice(0, 15),
    };
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

    if (url.pathname === '/stats' || url.pathname === '/api/stats') {
      if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const stats = summarize(readHits(30));
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      if (url.pathname === '/api/stats') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(stats));
        return;
      }
      const max = Math.max(1, ...stats.byDay.map(([, n]) => n));
      const table = (title: string, rows: [string, number][]) =>
        `<h2>${title}</h2><table>${rows.map(([k, n]) => `<tr><td>${escapeHtml(k)}</td><td>${n}</td></tr>`).join('') || '<tr><td>—</td></tr>'}</table>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Stats · luca-leone.ch</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{font-size:28px}h2{font-size:16px;margin-top:32px}
table{width:100%;border-collapse:collapse}td{padding:6px 0;border-bottom:1px solid #eee}td:last-child{text-align:right;font-variant-numeric:tabular-nums}
.bars{display:flex;align-items:flex-end;gap:3px;height:120px;margin-top:12px}.bars span{flex:1;background:#C50E36;border-radius:3px 3px 0 0;min-height:2px}</style>
<h1>${stats.total} pages vues <small style="color:#888;font-weight:400">· 30 derniers jours</small></h1>
<div class="bars">${stats.byDay.map(([d, n]) => `<span title="${d} : ${n}" style="height:${(n / max) * 100}%"></span>`).join('')}</div>
${table('Projets ouverts', stats.projects)}${table('Pages', stats.pages)}${table('Provenance', stats.referrers)}`);
      return;
    }

    next();
  };
}
