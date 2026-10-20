import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Language } from '../../types';
import { projectRef } from '../../content/pages';
import type { StoredProject } from '../../content/schema';
import { upload } from '../api';
import { MediaContext, type Media } from '../fields/FieldEditor';
import { setAt } from '../fields/schemaWalk';
import { Panel, StructureView, selectionFor } from '../structure/StructureView';
import { BLOCK_TYPES, emptyBlock } from '../structure/blockTemplates';
import { PageView } from '../page/PageView';
import { HealthCard } from '../health/HealthCard';
import { SharePreview } from '../health/SharePreview';
import { projectHealth } from '../../content/health';
import type { Block } from '../../content/schema';
import { useDraftClient, useDraftState, useStaged } from '../DraftContext';
import { adminNavigate } from '../nav';
import { Button, Dialog, pageClass } from '../ui';

export type Mode = 'page' | 'structure';

/** Folder of the project's case study images (public/images/case/<folder>/), e.g. "karting" */
export function caseFolderOf(p: StoredProject): string {
  return /\/images\/case\/([a-z0-9-]+)\//.exec(JSON.stringify(p.study))?.[1] ?? p.id;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
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

  const [drawer, setDrawer] = useState(false);
  const [inserting, setInserting] = useState<{ section: number; at: number } | null>(null);

  useEffect(() => {
    if (query.get('path')) setSelection(selectionFor(query.get('path')!));
  }, [query]);

  // Back in Page mode, the part selected in Structure scrolls into view and flashes once
  useEffect(() => {
    if (mode !== 'page') return;
    const el = document.querySelector<HTMLElement>(`.admin-preview [data-edit="${CSS.escape(selection)}"], .admin-preview [data-edit^="${CSS.escape(selection)}."]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
    el.classList.add('admin-flash');
    const t = setTimeout(() => el.classList.remove('admin-flash'), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onOpen = useCallback((path: string) => {
    setSelection(selectionFor(path));
    setDrawer(true);
  }, []);
  const onInsert = useCallback((section: number, at: number) => setInserting({ section, at }), []);

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
  const insert = (type: Block['type']) => {
    if (!inserting) return;
    const { section, at } = inserting;
    const blocks = [...project.study.sections[section].content];
    blocks.splice(at, 0, emptyBlock(type));
    edit(`study.sections.${section}.content`, blocks);
    setInserting(null);
    onOpen(`study.sections.${section}.content.${at}`);
  };

  return (
    <MediaContext.Provider value={media}>
      <div className={pageClass}>
        <EditorBar title={project.name} back={() => adminNavigate('/')} mode={mode} lang={lang} onMode={setMode} onLang={setLang} />
        <WritingRules />
        <HealthCard
          health={projectHealth(project, lang, state.content)}
          lang={lang}
          onGo={(path) => {
            setMode('structure');
            setSelection(selectionFor(path));
            setTimeout(() => document.querySelector(`[data-path="${path}"]`)?.scrollIntoView({ block: 'center' }), 80);
          }}
          google={{
            title: project.seo.title[lang],
            url: lang === 'fr' ? `luca-leone.ch › projets › ${project.id}` : `luca-leone.ch › en › projects › ${project.id}`,
            description: project.seo.description[lang],
          }}
          share={<SharePreview project={project} lang={lang} site={state.content.site} preview={preview} />}
        />
        {mode === 'structure' ? (
          <StructureView project={project} lang={lang} selection={selection} onSelect={setSelection} onEdit={edit} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {[['carte', 'Carte de l’accueil'], ['seo', 'Référencement']].map(([g, label]) => (
                <Button key={g} onClick={() => onOpen(g)}>
                  {label}
                </Button>
              ))}
              <p className="ml-auto self-center text-xs text-neutral-500 dark:text-[#A1A1AA]">Clique sur un texte pour l’écrire, sur un bloc pour le régler.</p>
            </div>
            <PageView project={project} content={state.content} lang={lang} preview={preview} onEdit={edit} onOpen={onOpen} onInsert={onInsert} />
          </>
        )}
        {mode === 'page' && drawer && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/20 backdrop-blur-[1px]" onClick={(e) => e.target === e.currentTarget && setDrawer(false)}>
            <aside className="h-full w-full overflow-y-auto bg-[var(--color-paper)] px-5 pb-24 pt-5 shadow-2xl dark:bg-[#0F0F12] sm:max-w-xl sm:px-8">
              <button type="button" onClick={() => setDrawer(false)} className="mb-4 min-h-11 font-syne text-sm font-bold text-[var(--accent)]">
                Fermer ✕
              </button>
              <Panel project={project} lang={lang} selection={selection} onEdit={edit} onSelect={setSelection} />
            </aside>
          </div>
        )}
        <Dialog open={!!inserting} title="Ajouter un bloc" onClose={() => setInserting(null)}>
          <div className="grid grid-cols-2 gap-2">
            {BLOCK_TYPES.map((b) => (
              <Button key={b.type} onClick={() => insert(b.type)} className="justify-start">
                {b.label}
              </Button>
            ))}
          </div>
        </Dialog>
      </div>
    </MediaContext.Provider>
  );
}
