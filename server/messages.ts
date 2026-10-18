import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Messages from the contact form, kept on the server (DATA_DIR/messages.json) for the atelier's
 * inbox, next to the email. Deleted automatically after 12 months — stated in the privacy
 * policy (src/components/PrivacyPolicy.tsx).
 */

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived';

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

export const MESSAGE_STATUSES: MessageStatus[] = ['new', 'read', 'replied', 'archived'];
const RETENTION_MS = 365 * 86_400_000;

export function createMessageStore(dataDir: string, opts: { now?: () => number } = {}) {
  const now = opts.now ?? Date.now;
  const file = path.join(dataDir, 'messages.json');

  const load = (): Message[] => {
    try {
      const all = JSON.parse(fs.readFileSync(file, 'utf8')) as Message[];
      return all.filter((m) => now() - Date.parse(m.receivedAt) < RETENTION_MS);
    } catch {
      return [];
    }
  };
  const save = (all: Message[]) => {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(all, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };

  return {
    add(input: Omit<Message, 'id' | 'receivedAt' | 'status'>): Message {
      const m: Message = { id: crypto.randomUUID(), receivedAt: new Date(now()).toISOString(), status: 'new', ...input };
      save([m, ...load()]);
      return m;
    },
    /** Newest first; past the retention period they're gone (and dropped from the file) */
    list(): Message[] {
      const all = load().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
      return all;
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
