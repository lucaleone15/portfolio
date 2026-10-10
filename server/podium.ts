import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * "Lights out" leaderboard (the F1 start in ⌘K, src/easter/lightsOut.ts):
 *   GET  /api/podium                → { top: [{ name, ms, date }], total }
 *   POST /api/podium { name, ms }   → { ok, rank } (one entry per name: its best time)
 * Stored in .data/podium.json: a pseudo, a time and a date, nothing else (no IP).
 *
 * A reaction time can't be proven from the browser, so the board only keeps what is
 * humanly possible (100 ms to 1 s), accepts a few posts per IP and refuses pseudos that
 * look like links or insults.
 */

interface Entry {
  name: string;
  ms: number;
  date: string; // YYYY-MM-DD
}

const MIN_MS = 100; // faster is anticipation or a script
const MAX_MS = 1000;
const MAX_ENTRIES = 200;
const SHOWN = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const NAME_RE = /^[\p{L}\p{N} ._'-]{2,16}$/u;
const BLOCKED = /(https?|www\.|\.com|\.ch|con+ard|salop|pute|encul|merde|nazi|fuck|shit|bitch|dick|cunt|nigg)/i;

const json = (res: ServerResponse, status: number, body: object) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk;
      if (body.length > 1_000) req.destroy();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

export function createPodiumHandler(dataDir = path.resolve(process.cwd(), '.data')) {
  const file = path.join(dataDir, 'podium.json');
  const hits = new Map<string, number[]>();

  const load = (): Entry[] => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return [];
    }
  };
  const save = (entries: Entry[]) => {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(entries));
  };
  const rateLimited = (ip: string) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > RATE_MAX;
  };

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/podium')) return next();

    if (req.method === 'GET') {
      const entries = load();
      return json(res, 200, { top: entries.slice(0, SHOWN), total: entries.length });
    }
    if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });

    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    if (rateLimited(forwarded || req.socket.remoteAddress || 'unknown')) return json(res, 429, { error: 'rate_limited' });

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(await readBody(req));
    } catch {
      return json(res, 400, { error: 'invalid_json' });
    }
    const name = String(payload.name ?? '').replace(/\s+/g, ' ').trim();
    const ms = Math.round(Number(payload.ms));
    // As typed (links keep their dots) and squeezed ("c o n n a r d" is still an insult)
    if (!NAME_RE.test(name) || BLOCKED.test(name) || BLOCKED.test(name.replace(/[\s._'-]/g, ''))) return json(res, 422, { error: 'invalid_name' });
    if (!Number.isFinite(ms) || ms < MIN_MS || ms > MAX_MS) return json(res, 422, { error: 'invalid_time' });

    const entries = load();
    const key = name.toLowerCase();
    const existing = entries.find((e) => e.name.toLowerCase() === key);
    const date = new Date().toISOString().slice(0, 10);
    if (existing) {
      if (ms < existing.ms) Object.assign(existing, { name, ms, date });
    } else {
      entries.push({ name, ms, date });
    }
    entries.sort((a, b) => a.ms - b.ms);
    entries.length = Math.min(entries.length, MAX_ENTRIES);
    save(entries);

    const rank = entries.findIndex((e) => e.name.toLowerCase() === key) + 1;
    return json(res, 200, { ok: true, rank: rank || null, best: entries.find((e) => e.name.toLowerCase() === key)?.ms ?? ms });
  };
}
