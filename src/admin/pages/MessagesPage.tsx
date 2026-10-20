import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Button, Pill, pageClass } from '../ui';

/**
 * Messages: the contact form's inbox (server/messages.ts). Opening a message marks it read;
 * "Répondre" opens the mail app (and marks it answered); archive, or delete for good.
 */

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived' | 'spam';
export interface Message {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: 'fr' | 'en';
  page: string;
  status: MessageStatus;
  emailed?: boolean;
}

export interface MessagesApi {
  list: () => Promise<{ messages: Message[]; unread: number }>;
  setStatus: (id: string, status: MessageStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const messagesApi: MessagesApi = {
  list: () => api('GET', 'messages'),
  setStatus: (id, status) => api('PATCH', `messages/${id}`, { status }),
  remove: (id) => api('DELETE', `messages/${id}`),
};

export const getUnread = () => api<{ unread: number }>('GET', 'messages/unread');

type Tab = 'inbox' | 'unread' | 'archived' | 'spam';
const TABS: [Tab, string][] = [
  ['inbox', 'Boîte de réception'],
  ['unread', 'Non lus'],
  ['archived', 'Archivés'],
  ['spam', 'Spam probable'],
];
const STATUS_PILL: Record<MessageStatus, [string, 'accent' | 'muted' | 'warn'] | null> = {
  new: ['nouveau', 'accent'],
  read: null,
  replied: ['répondu', 'muted'],
  archived: ['archivé', 'muted'],
  spam: ['spam probable', 'warn'],
};

const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
};
const fullDate = (iso: string) => new Date(iso).toLocaleString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** The address in a mailto: link, everything but the @ encoded (no extra recipients or headers) */
const mailtoAddress = (email: string) => encodeURIComponent(email).replace(/%40/g, '@');

function replyHref(m: Message) {
  const subject = m.lang === 'en' ? `Re: your message${m.subject ? ` (${m.subject})` : ''}` : `Re : votre message${m.subject ? ` (${m.subject})` : ''}`;
  const quoted = m.message
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
  const body = `${m.lang === 'en' ? `Hello ${m.name},` : `Bonjour ${m.name},`}\n\n\n\n${quoted}`;
  return `mailto:${mailtoAddress(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function MessagesView({ api: io, onUnread }: { api: MessagesApi; onUnread: (n: number) => void }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>('inbox');
  const [openId, setOpenId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    try {
      const r = await io.list();
      setMessages(r.messages);
      onUnread(r.unread);
      setError(false);
    } catch {
      setError(true);
    }
  }, [io, onUnread]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const shown = useMemo(
    () => (messages ?? []).filter((m) =>
        tab === 'archived' ? m.status === 'archived' : tab === 'spam' ? m.status === 'spam' : tab === 'unread' ? m.status === 'new' : m.status !== 'archived' && m.status !== 'spam',
      ),
    [messages, tab],
  );
  const open = messages?.find((m) => m.id === openId) ?? null;

  const setStatus = async (m: Message, status: MessageStatus) => {
    setFailed(false);
    setMessages((all) => all?.map((x) => (x.id === m.id ? { ...x, status } : x)) ?? null);
    try {
      await io.setStatus(m.id, status);
    } catch {
      setFailed(true);
    }
    void reload();
  };
  const select = (m: Message) => {
    setOpenId(m.id);
    if (m.status === 'new') void setStatus(m, 'read');
  };

  if (error) return <p className="text-sm text-[var(--accent)]">Impossible de charger les messages.</p>;
  if (!messages) return <p className="text-sm text-neutral-500">Chargement…</p>;

  const count = (t: Tab) => (t === 'unread' || t === 'spam' ? messages.filter((m) => m.status === (t === 'unread' ? 'new' : 'spam')).length : 0);
  // A message in the last 30 days whose notification email didn't go out: the mail settings need a look
  const mailBroken = messages.some((m) => m.emailed === false && m.status !== 'spam' && Date.now() - Date.parse(m.receivedAt) < 30 * 86_400_000);

  return (
    <>
    {mailBroken && (
      <p role="alert" className="mb-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <strong>Les emails de notification ne partent plus</strong> pour certains messages récents : ils sont bien ici, mais vérifie les réglages SMTP du serveur.
      </p>
    )}
    {failed && (
      <p role="alert" className="mb-4 text-sm font-semibold text-[var(--accent)]">
        La modification n’a pas pu être enregistrée.
      </p>
    )}
    <div className="md:grid md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-6">
      <div className={open ? 'hidden md:block' : ''}>
        <div className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Dossiers">
          {TABS.map(([t, label]) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => (setTab(t), setOpenId(null))}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${tab === t ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 hover:bg-[var(--color-surface)] dark:text-[#A1A1AA] dark:hover:bg-white/5'}`}
            >
              {label}
              {count(t) > 0 && ` · ${count(t)}`}
            </button>
          ))}
        </div>
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-neutral-500 dark:border-white/10">Aucun message pour l’instant.</p>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-neutral-500 dark:border-white/10">Rien dans ce dossier.</p>
        ) : (
          <ul className="space-y-2">
            {shown.map((m) => {
              const pill = STATUS_PILL[m.status];
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => select(m)}
                    aria-current={openId === m.id ? 'true' : undefined}
                    className={`w-full rounded-2xl border p-4 text-left transition ${openId === m.id ? 'border-[var(--accent)] shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.12)]' : 'border-[var(--color-border)] hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20'} bg-white dark:bg-white/[0.03]`}
                  >
                    <div className="flex items-baseline gap-2">
                      {m.status === 'new' && <span className="size-2 shrink-0 rounded-full bg-[var(--accent)]" aria-label="non lu" />}
                      <span className={`min-w-0 flex-1 truncate ${m.status === 'new' ? 'font-bold' : 'font-semibold'}`}>{m.name}</span>
                      <span className="shrink-0 text-xs text-neutral-500 dark:text-[#A1A1AA]">{when(m.receivedAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {m.subject && <span className="truncate text-xs font-semibold text-neutral-600 dark:text-neutral-300">{m.subject}</span>}
                      {pill && <Pill tone={pill[1]}>{pill[0]}</Pill>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-[#A1A1AA]">{m.message}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {open ? (
        <article className="rounded-2xl border border-[var(--color-border)] bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
          <button type="button" onClick={() => setOpenId(null)} className="mb-4 min-h-11 font-syne text-sm font-bold text-[var(--accent)] md:hidden">
            ‹ Messages
          </button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-syne text-2xl font-extrabold tracking-tight">{open.name}</h2>
              <a href={`mailto:${mailtoAddress(open.email)}`} className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
                {open.email}
              </a>
            </div>
            {open.subject && <Pill>{open.subject}</Pill>}
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-[#A1A1AA]">
            {fullDate(open.receivedAt)} · {open.lang === 'en' ? 'en anglais' : 'en français'} · depuis {open.page}
            {open.status === 'spam' ? ' · classé spam probable à l’arrivée, aucun email envoyé' : open.emailed === false && ' · l’email de notification n’est pas parti'}
          </p>
          <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed">{open.message}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={replyHref(open)}
              onClick={() => void setStatus(open, 'replied')}
              className="font-syne inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-[var(--accent-contrast-text)] hover:opacity-90"
            >
              Répondre
            </a>
            {open.status === 'spam' && <Button onClick={() => void setStatus(open, 'new')}>Pas un spam</Button>}
            {open.status === 'spam' ? null : open.status === 'archived' ? (
              <Button onClick={() => void setStatus(open, 'read')}>Désarchiver</Button>
            ) : (
              <Button onClick={() => (void setStatus(open, 'archived'), setOpenId(null))}>Archiver</Button>
            )}
            {open.status !== 'new' && open.status !== 'spam' && <Button onClick={() => void setStatus(open, 'new')}>Marquer non lu</Button>}
            {open.status !== 'spam' && open.status !== 'new' && open.status !== 'replied' && (
              <Button variant="quiet" onClick={() => (void setStatus(open, 'spam'), setOpenId(null))}>
                C’est un spam
              </Button>
            )}
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm(`Supprimer définitivement le message de ${open.name} ?`)) return;
                setOpenId(null);
                await io.remove(open.id);
                void reload();
              }}
            >
              Supprimer
            </Button>
          </div>
        </article>
      ) : (
        <div className="hidden items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-sm text-neutral-500 dark:border-white/10 md:flex">Choisis un message.</div>
      )}
    </div>
    </>
  );
}

export function MessagesPage({ onUnread }: { onUnread: (n: number) => void }) {
  return (
    <div className={pageClass}>
      <p className="eyebrow text-[var(--accent)]">Messages</p>
      <h1 className="mb-6 mt-2 font-syne text-3xl font-extrabold tracking-tight md:text-4xl">Formulaire de contact</h1>
      <MessagesView api={messagesApi} onUnread={onUnread} />
      <p className="mt-8 text-xs text-neutral-500 dark:text-[#A1A1AA]">Les messages sont supprimés automatiquement 12 mois après leur réception (voir la politique de confidentialité).</p>
    </div>
  );
}
