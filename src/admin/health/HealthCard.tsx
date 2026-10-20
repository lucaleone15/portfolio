import { useState, type ReactNode } from 'react';
import type { Language } from '../../types';
import { scoreTone, type CheckStatus, type Health } from '../../content/health';

/**
 * "Santé de la page": the score out of 100, what to fix (each line opens its field), how the
 * page shows in Google, and its share image. Folded by default: the score and the number of
 * points to fix stay in sight.
 */

const TONE: Record<CheckStatus, string> = {
  ok: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  bad: 'text-[var(--accent)]',
};
const RING: Record<CheckStatus, string> = { ok: '#10b981', warn: '#f59e0b', bad: 'var(--accent)' };
const MARK: Record<CheckStatus, string> = { ok: '✓', warn: '!', bad: '✕' };

function Score({ value }: { value: number }) {
  const tone = scoreTone(value);
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-14 shrink-0 place-items-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-black/[0.07] dark:text-white/10" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={RING[tone]} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} />
      </svg>
      <span className={`text-[15px] font-extrabold tabular-nums ${TONE[tone]}`}>{value}</span>
    </span>
  );
}

/** How the page shows in Google's results */
export function GooglePreview({ title, url, description }: { title: string; url: string; description: string }) {
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 font-[Arial,sans-serif] dark:border-white/10 dark:bg-[#202124]">
      <p className="text-xs text-neutral-500 dark:text-[#bdc1c6]">Aperçu Google</p>
      <p className="mt-2 text-[13px] text-[#202124] dark:text-[#dadce0]">{url}</p>
      <p className="mt-0.5 text-[19px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{cut(title || '(sans titre)', 60)}</p>
      <p className="mt-1 text-[13px] leading-snug text-[#4d5156] dark:text-[#bdc1c6]">{cut(description || '(sans description)', 160)}</p>
    </div>
  );
}

export function HealthCard({
  health,
  lang,
  onGo,
  google,
  share,
}: {
  health: Health;
  lang: Language;
  onGo: (path: string) => void;
  google: { title: string; url: string; description: string };
  /** The share image, drawn small */
  share?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const todo = health.checks.filter((c) => c.status !== 'ok');
  return (
    <section className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left">
        <Score value={health.score} />
        <span className="min-w-0 flex-1">
          <span className="block font-syne text-base font-extrabold">Santé de la page · {lang.toUpperCase()}</span>
          <span className="block text-sm text-neutral-500 dark:text-[#A1A1AA]">{todo.length ? `${todo.length} point${todo.length > 1 ? 's' : ''} à corriger` : 'Tout est en ordre'}</span>
        </span>
        <span aria-hidden="true" className="text-neutral-400">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] p-4 dark:border-white/10">
          <div className="grid gap-4 lg:grid-cols-2">
            <GooglePreview {...google} />
            {share && (
              <div className="rounded-2xl border border-[var(--color-border)] p-4 dark:border-white/10">
                <p className="text-xs text-neutral-500 dark:text-[#A1A1AA]">Image de partage (LinkedIn, WhatsApp…)</p>
                <div className="mt-2 overflow-hidden rounded-xl">{share}</div>
              </div>
            )}
          </div>
          <ul className="mt-4 divide-y divide-[var(--color-border)] dark:divide-white/10">
            {[...todo, ...health.checks.filter((c) => c.status === 'ok')].map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={!c.path}
                  onClick={() => c.path && onGo(c.path)}
                  className="flex w-full items-start gap-3 py-2.5 text-left disabled:cursor-default enabled:hover:bg-[var(--color-surface)] enabled:dark:hover:bg-white/5"
                >
                  <span className={`mt-0.5 w-4 shrink-0 text-center font-bold ${TONE[c.status]}`} aria-hidden="true">
                    {MARK[c.status]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{c.label}</span>
                    {c.detail && <span className="block text-xs text-neutral-500 dark:text-[#A1A1AA]">{c.detail}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
