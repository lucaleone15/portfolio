import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Messages from the contact form, kept on the server (DATA_DIR/messages.json) for the atelier's
 * inbox, next to the email. Deleted automatically after 12 months — stated in the privacy
 * policy (src/components/PrivacyPolicy.tsx).
 */

/** 'spam': judged doubtful when it arrived (no notification email); one click puts it back */
export type MessageStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';

export interface Message {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: 'fr' | 'en';
  /** Page the form was sent from */
  page: string;
  status: MessageStatus;
  /** The notification email went out */
  emailed?: boolean;
}

export const MESSAGE_STATUSES: MessageStatus[] = ['new', 'read', 'replied', 'archived', 'spam'];
const RETENTION_MS = 365 * 86_400_000;
/** A flood can't fill the disk: past this, the oldest messages go */
const MAX_MESSAGES = 2000;

export function createMessageStore(dataDir: string, opts: { now?: () => number; max?: number } = {}) {
  const now = opts.now ?? Date.now;
  const max = opts.max ?? MAX_MESSAGES;
  const file = path.join(dataDir, 'messages.json');

  const save = (all: Message[]) => {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(all, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  const load = (): Message[] => {
    let raw: string;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }
    let all: Message[];
    try {
      all = JSON.parse(raw);
      if (!Array.isArray(all)) throw new Error('not a list');
    } catch {
      // Damaged: set aside (never overwritten), and start a new inbox
      const aside = `${file}.damaged-${new Date(now()).toISOString().replace(/[:.]/g, '-')}`;
      fs.renameSync(file, aside);
      console.error(`[messages] ${file} was damaged, moved to ${aside}`);
      return [];
    }
    const kept = all.filter((m) => now() - Date.parse(m.receivedAt) < RETENTION_MS);
    // Past the retention period: deleted from the file too, not just hidden
    if (kept.length !== all.length) save(kept);
    return kept;
  };

  return {
    add(input: Omit<Message, 'id' | 'receivedAt' | 'status'> & { status?: MessageStatus }): Message {
      const m: Message = { id: crypto.randomUUID(), receivedAt: new Date(now()).toISOString(), status: 'new', ...input };
      save([m, ...load()].sort((x, y) => y.receivedAt.localeCompare(x.receivedAt)).slice(0, max));
      return m;
    },
    /** Newest first; past the retention period they're gone (and dropped from the file) */
    list(): Message[] {
      return load().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    },
    /** Drops expired messages from the file (also run once a day by the server) */
    prune(): void {
      load();
    },
    unread(): number {
      return load().filter((m) => m.status === 'new').length;
    },
    update(id: string, patch: Partial<Pick<Message, 'status' | 'emailed'>>): Message | null {
      const all = load();
      const m = all.find((x) => x.id === id);
      if (!m) return null;
      Object.assign(m, patch);
      save(all);
      return m;
    },
    remove(id: string): boolean {
      const all = load();
      const kept = all.filter((m) => m.id !== id);
      if (kept.length === all.length) return false;
      save(kept);
      return true;
    },
  };
}

export type MessageStore = ReturnType<typeof createMessageStore>;
