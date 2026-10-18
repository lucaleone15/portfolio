import { useEffect, useRef, useState } from 'react';
import type { Content } from '../../content/schema';
import { isEnglishReady } from '../../content/localize';
import { projectIdOf, type PageRef } from '../../content/pages';
import type { PublishStatus, PublishSummary } from '../api';
import { Button, Pill } from '../ui';

export interface PublishApi {
  getPublish: () => Promise<PublishSummary>;
  startPublish: () => Promise<PublishStatus>;
  resolveConflict: (ref: PageRef, keep: 'draft' | 'repo') => Promise<void>;
  /** Throws the whole draft away */
  discard?: () => Promise<void>;
}

/** Follows a publish to its end (panel closed while it ran): the final state */
export async function waitForPublish(getPublish: () => Promise<PublishSummary>, intervalMs = 3000): Promise<PublishStatus['state']> {
  for (;;) {
    try {
      const { status } = await getPublish();
      if (status.state !== 'running') return status.state;
    } catch {
      // network hiccup: ask again
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

const STEPS: [NonNullable<PublishStatus['step']>, string][] = [
  ['pull', 'Récupération des changements'],
  ['check', 'Vérification'],
  ['write', 'Écriture'],
  ['build', 'Construction du site (≈ 1 min)'],
  ['push', 'Envoi sur GitHub'],
  ['swap', 'Mise en ligne'],
];

const SITE_TABS: Record<string, string> = { hero: 'hero', about: 'a-propos', skills: 'competences', contact: 'contact', seo: 'seo' };

/** Where a text lives in the admin, opened in English on that very field */
export function adminPathOf(ref: string, path: string): string {
  const id = projectIdOf(ref as PageRef);
  if (id) return `/projets/${id}?lang=en&path=${path}`;
  if (ref === 'site') return `/site/${SITE_TABS[path.split('.')[0]] ?? 'hero'}?lang=en&path=${path}`;
  return '/';
}

const SITE = 'https://luca-leone.ch';
const publicUrl = (ref: PageRef) => (projectIdOf(ref) ? `${SITE}/projets/${projectIdOf(ref)}` : `${SITE}/`);

function errorText(error: NonNullable<PublishStatus['error']>): string {
  switch (error.code) {
    case 'code-changed':
      return `Du code a changé sur GitHub (fichiers : ${(error.files ?? []).join(', ')}). Redéploie le site à la main, puis publie.`;
    case 'build-failed':
      return 'La construction du site a échoué. Le site en ligne n’a pas changé.';
    case 'push-rejected':
      return 'GitHub a refusé l’envoi. Le site en ligne n’a pas changé. Réessaie.';
    case 'dirty':
      return 'Le dossier du site sur le serveur contient des modifications non commitées.';
    case 'nothing':
      return 'Rien à publier : le brouillon est identique au site en ligne.';
    case 'busy':
      return 'Une publication est déjà en cours.';
    default:
      return 'La publication a échoué. Le site en ligne n’a pas changé.';
  }
}

/**
 * Publishing, step by step: what changed and the English to review first, then the progress,
 * then the outcome. Opening it sends the pending saves first, so what is shown is what goes out.
 */
export function PublishPanel({
  api,
  flush,
  navigate,
  content,
  onClose,
  onPublished,
  onDiscarded,
  pollMs = 1500,
}: {
  api: PublishApi;
  flush: () => Promise<void>;
  navigate: (to: string) => void;
  content: Content;
  onClose: () => void;
  onPublished: () => void;
  onDiscarded?: () => void;
  pollMs?: number;
}) {
  const [summary, setSummary] = useState<PublishSummary | null>(null);
  const [status, setStatus] = useState<PublishStatus | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [offline, setOffline] = useState(false);
  const alive = useRef(true);

  const load = async () => {
    await flush();
    const s = await api.getPublish();
    if (!alive.current) return;
    setSummary(s);
    if (s.status.state === 'running') setStatus(s.status);
  };

  useEffect(() => {
    alive.current = true;
    void load();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While it runs, ask for progress
  useEffect(() => {
    if (status?.state !== 'running') return;
    const t = setTimeout(async () => {
      try {
        const s = await api.getPublish();
        if (!alive.current) return;
        setOffline(false);
        setStatus(s.status);
        if (s.status.state === 'done') onPublished();
      } catch {
        // Lost the connection for a moment: keep asking (the publish goes on on the server)
        if (!alive.current) return;
        setOffline(true);
        setStatus((st) => (st ? { ...st } : st));
      }
    }, pollMs);
    return () => clearTimeout(t);
  }, [status, api, pollMs, onPublished]);

  const publish = async () => {
    setResolved(new Set());
    setStatus(await api.startPublish());
  };

  if (!summary) return <p className="text-sm text-neutral-500">Préparation…</p>;
  const todo = [...summary.stale.map((t) => ({ ...t, kind: 'à revoir' })), ...summary.missingEn.map((t) => ({ ...t, kind: 'manquant' }))];
  const frOnly = summary.changed.filter(({ ref }) => {
    const id = projectIdOf(ref);
    return id && content.projects[id] && !isEnglishReady(content.projects[id]);
  });

  if (status?.state === 'running') {
    const current = STEPS.findIndex(([s]) => s === status.step);
    return (
      <>
      {offline && <p className="mb-3 text-sm font-semibold text-[var(--accent)]">Connexion perdue, nouvel essai… La publication continue sur le serveur.</p>}
      <ol className="space-y-3" aria-live="polite">
        {STEPS.map(([s, label], i) => (
          <li key={s} className={`flex items-center gap-3 text-sm font-semibold ${i < current ? 'text-emerald-600 dark:text-emerald-400' : i === current ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
            <span className={`grid size-6 place-items-center rounded-full text-xs ${i < current ? 'bg-emerald-500/15' : i === current ? 'animate-pulse bg-[rgba(var(--accent-rgb),0.15)] text-[var(--accent)]' : 'bg-neutral-500/10'}`}>{i < current ? '✓' : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      </>
    );
  }

  if (status?.state === 'done') {
    return (
      <div>
        <p className="font-syne text-2xl font-extrabold">C’est en ligne.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {(status.published ?? []).map((ref) => (
            <li key={ref}>
              <a href={publicUrl(ref)} target="_blank" rel="noopener" className="font-semibold text-[var(--accent)] underline underline-offset-2">
                {summary.changed.find((c) => c.ref === ref)?.label ?? ref} ↗
              </a>
            </li>
          ))}
        </ul>
        <Button className="mt-6" onClick={onClose}>
          Fermer
        </Button>
      </div>
    );
  }

  const error = status?.state === 'failed' ? status.error : undefined;

  return (
    <div className="space-y-6">
      {error?.code === 'conflict' ? (
        <div className="rounded-2xl border border-[var(--accent)]/30 p-4">
          <p className="font-semibold">Ces pages ont aussi été modifiées ailleurs :</p>
          <ul className="mt-3 space-y-3">
            {(error.pages ?? []).map((ref) => (
              <li key={ref} className="flex flex-wrap items-center gap-2">
                <span className="mr-auto text-sm font-bold">{summary.changed.find((c) => c.ref === ref)?.label ?? ref}</span>
                {resolved.has(ref) ? (
                  <Pill tone="accent">réglé</Pill>
                ) : (
                  <>
                    <Button onClick={() => api.resolveConflict(ref, 'draft').then(() => setResolved((r) => new Set(r).add(ref)))}>Garder mon brouillon</Button>
                    <Button onClick={() => api.resolveConflict(ref, 'repo').then(() => setResolved((r) => new Set(r).add(ref)))}>Garder la version du dépôt</Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        error && (
          <div role="alert" className="rounded-2xl bg-[rgba(var(--accent-rgb),0.08)] p-4 text-sm font-semibold text-[var(--accent)]">
            <p>{errorText(error)}</p>
            {error.log && (
              <details className="mt-2 font-normal text-neutral-600 dark:text-[#A1A1AA]">
                <summary className="cursor-pointer">Détails</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs">{error.log}</pre>
              </details>
            )}
          </div>
        )
      )}

      <div>
        <p className="eyebrow text-neutral-500 dark:text-[#A1A1AA]">Ce qui change</p>
        {summary.changed.length ? (
          <ul className="mt-2 space-y-1 text-sm font-semibold">
            {summary.changed.map((c) => (
              <li key={c.ref}>{c.label}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">Rien pour l’instant.</p>
        )}
      </div>

      {frOnly.map(({ ref, label }) => (
        <p key={ref} className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          <strong>{label}</strong> : ce projet n’apparaîtra que sur le site français.
        </p>
      ))}

      {todo.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 p-4">
          <p className="font-semibold">{todo.length === 1 ? '1 texte anglais pas à jour' : `${todo.length} textes anglais pas à jour`}</p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {todo.map((t) => (
              <li key={`${t.ref}:${t.path}`}>
                <button type="button" onClick={() => navigate(adminPathOf(t.ref, t.path))} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-[var(--color-surface)] dark:hover:bg-white/5">
                  <Pill tone={t.kind === 'manquant' ? 'accent' : 'warn'}>{t.kind}</Pill>
                  <span className="truncate">{t.fr}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        {api.discard && summary.changed.length > 0 && (
          <Button
            variant="quiet"
            className="mr-auto"
            onClick={async () => {
              if (!window.confirm('Annuler toutes les modifications du brouillon ? Le site en ligne ne change pas, mais le brouillon est perdu.')) return;
              await api.discard!();
              onDiscarded?.();
              onClose();
            }}
          >
            Annuler toutes les modifications
          </Button>
        )}
        <Button onClick={onClose}>Fermer</Button>
        <Button variant="primary" disabled={!summary.changed.length || (error?.code === 'conflict' && (error.pages ?? []).some((p) => !resolved.has(p)))} onClick={publish}>
          {todo.length ? 'Publier quand même' : 'Publier'}
        </Button>
      </div>
    </div>
  );
}
