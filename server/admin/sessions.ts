import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Admin sessions, kept on the server (DATA_DIR/admin/sessions.json) so a restart doesn't sign
 * Luca out. The browser holds a random token; the file only holds its SHA-256.
 */

interface Entry {
  created: number;
  seen: number;
}

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function createSessionStore(file: string, opts: { idleMs: number; maxMs: number; now?: () => number }) {
  const now = opts.now ?? Date.now;

  const load = (): Record<string, Entry> => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return {};
    }
  };
  const save = (sessions: Record<string, Entry>) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(sessions), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  const alive = (e: Entry, t: number) => t - e.seen <= opts.idleMs && t - e.created <= opts.maxMs;

  return {
    create(): string {
      const token = crypto.randomBytes(32).toString('base64url');
      const t = now();
      const sessions = Object.fromEntries(Object.entries(load()).filter(([, e]) => alive(e, t)));
      sessions[sha256(token)] = { created: t, seen: t };
      save(sessions);
      return token;
    },
    check(token: string): boolean {
      if (!token) return false;
      const sessions = load();
      const key = sha256(token);
      const entry = sessions[key];
      const t = now();
      if (!entry || !alive(entry, t)) return false;
      entry.seen = t;
      save(sessions);
      return true;
    },
    destroy(token: string): void {
      const sessions = load();
      delete sessions[sha256(token)];
      save(sessions);
    },
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
