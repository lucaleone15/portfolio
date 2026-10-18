import { useEffect, useMemo, useState } from 'react';
import type { Language } from '../../types';
import { projectRef } from '../../content/pages';
import type { StoredProject } from '../../content/schema';
import { upload } from '../api';
import { MediaContext, type Media } from '../fields/FieldEditor';
import { setAt } from '../fields/schemaWalk';
import { StructureView, selectionFor } from '../structure/StructureView';
import { useDraftClient, useDraftState, useStaged } from '../DraftContext';
import { adminNavigate } from '../nav';
import { Button } from '../ui';

export type Mode = 'page' | 'structure';

/** Folder of the project's case study images (public/images/case/<folder>/), e.g. "karting" */
export function caseFolderOf(p: StoredProject): string {
  return /\/images\/case\/([a-z0-9-]+)\//.exec(JSON.stringify(p.study))?.[1] ?? p.id;
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-[var(--color-border)] p-1 dark:border-white/10">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`min-h-9 rounded-full px-3.5 font-syne text-xs font-bold transition ${value === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 dark:text-[#A1A1AA]'}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function EditorBar({ title, back, mode, lang, onMode, onLang, pageMode = true }: { title: string; back: () => void; mode: Mode; lang: Language; onMode: (m: Mode) => void; onLang: (l: Language) => void; pageMode?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button type="button" onClick={back} className="min-h-11 font-syne text-sm font-bold text-neutral-500 hover:text-[var(--accent)] dark:text-[#A1A1AA]">
        ‹
      </button>
      <h1 className="mr-auto min-w-0 truncate font-syne text-2xl font-extrabold tracking-tight">{title}</h1>
      {pageMode && <Segmented label="Mode d’édition" value={mode} onChange={onMode} options={[['page', 'Page'], ['structure', 'Structure']]} />}
      <Segmented label="Langue" value={lang} onChange={onLang} options={[['fr', 'FR'], ['en', 'EN']]} />
    </div>
  );
}

const RULES_KEY = 'atelier:rules-folded';

function WritingRules() {
  const [folded, setFolded] = useState(() => {
    try {
      return localStorage.getItem(RULES_KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () => {
    setFolded(!folded);
    try {
      localStorage.setItem(RULES_KEY, folded ? '0' : '1');
    } catch {
      // private mode
    }
  };
  return (
    <div className="mb-6 rounded-2xl bg-[rgba(var(--accent-rgb),0.07)] px-4 py-3 text-sm">
      <button type="button" onClick={toggle} aria-expanded={!folded} className="flex min-h-9 w-full items-center justify-between font-semibold">
        Règles d’écriture des études de cas <span aria-hidden="true">{folded ? '+' : '−'}</span>
      </button>
      {!folded && (
        <ul className="mt-1 list-disc space-y-1 pb-1 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>À la première personne : « j’ai » pour mon travail, « nous » pour l’équipe.</li>
          <li>Aucun chiffre inventé : chaque nombre vient des documents du projet (brief, rapport, notes de tests).</li>
          <li>Ce qui manque encore s’écrit [À COMPLÉTER].</li>
        </ul>
      )}
    </div>
  );
}

export function ProjectEditor({ id, query }: { key?: string; id: string; query: URLSearchParams }) {
  const client = useDraftClient();
  const state = useDraftState();
  const { preview, addStaged } = useStaged();
  const [mode, setMode] = useState<Mode>(query.get('mode') === 'structure' || query.get('path') ? 'structure' : 'page');
  const [lang, setLang] = useState<Language>(query.get('lang') === 'en' ? 'en' : 'fr');
  const [selection, setSelection] = useState(query.get('path') ? selectionFor(query.get('path')!) : 'carte');
  const project = state.loaded ? state.content.projects[id] : undefined;
  const folder = project ? caseFolderOf(project) : id;

  const media: Media = useMemo(
    () => ({
      preview,
      upload: async (file, kind, cover) => {
        const out = await upload(file, kind, cover ? '' : `case/${folder}`);
        addStaged(out.src);
        if (cover) ['sm', 'md'].forEach((v) => addStaged(out.src.replace('/images/', `/images/${v}/`)));
        return out;
      },
    }),
    [preview, addStaged, folder],
  );

  useEffect(() => {
    if (query.get('path')) setSelection(selectionFor(query.get('path')!));
  }, [query]);

  if (!state.loaded) return <p className="px-4 py-10 text-sm text-neutral-500 md:px-8">Chargement…</p>;
  if (!project) {
    return (
      <div className="px-4 py-10 md:px-8">
        <p>Ce projet n’existe pas (ou plus).</p>
        <Button className="mt-4" onClick={() => adminNavigate('/')}>
          Retour aux projets
        </Button>
      </div>
    );
  }

  const edit = (path: string, value: unknown) => client.update(projectRef(id), (draft) => setAt(draft, path, value));

  return (
    <MediaContext.Provider value={media}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <EditorBar title={project.name} back={() => adminNavigate('/')} mode={mode} lang={lang} onMode={setMode} onLang={setLang} />
        <WritingRules />
        {mode === 'structure' ? (
          <StructureView project={project} lang={lang} selection={selection} onSelect={setSelection} onEdit={edit} />
        ) : (
          <p className="text-sm text-neutral-500">Mode Page : à venir.</p>
        )}
      </div>
    </MediaContext.Provider>
  );
}
