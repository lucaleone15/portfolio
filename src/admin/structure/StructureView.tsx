import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';
import type { Language } from '../../types';
import { BlockSchema, SectionSchema, StoredProjectSchema, StudySchema, type Block, type StoredProject } from '../../content/schema';
import { FieldEditor } from '../fields/FieldEditor';
import { emptyOf, getAt } from '../fields/schemaWalk';
import { BLOCK_TYPES, emptyBlock } from './blockTemplates';
import { BlockList } from './BlockList';
import { Button } from '../ui';

/**
 * Structure mode: the project as a plan (card, SEO, header, brief, sections and their blocks,
 * credits) on the left, the selected part's form on the right — a full-screen sheet on phones.
 * Selections are paths in the project ("carte", "study.sections.2.content.1"…).
 */

type Field = [path: string, schema: z.ZodTypeAny];
const P = StoredProjectSchema.shape;
const S = StudySchema.shape;

export const GROUPS: { id: string; label: string; fields: Field[] }[] = [
  {
    id: 'carte',
    label: 'Carte de l’accueil',
    fields: [
      ['name', P.name],
      ['kind', P.kind],
      ['number', P.number],
      ['year', P.year],
      ['imageUrl', P.imageUrl],
      ['video', P.video],
      ['accentColor', P.accentColor],
      ['accentColorDark', P.accentColorDark],
      ['stack', P.stack],
      ...Object.entries(P.card.shape).map(([k, s]) => [`card.${k}`, s] as Field),
    ],
  },
  { id: 'seo', label: 'Référencement', fields: [['seo', P.seo]] },
  {
    id: 'entete',
    label: 'En-tête de l’étude',
    fields: (['kicker', 'title', 'hook', 'intro', 'meta', 'hero', 'links'] as const).map((k) => [`study.${k}`, S[k]] as Field),
  },
  { id: 'brief', label: 'Brief', fields: [['study.brief', S.brief]] },
  {
    id: 'credits',
    label: 'Crédits',
    fields: [
      ['study.credits', S.credits],
      ['study.creditsNote', S.creditsNote],
    ],
  },
];

/** The outline entry holding a path (a field clicked in Page mode → its group, section or block) */
export function selectionFor(path: string): string {
  const block = /^study\.sections\.\d+\.content\.\d+/.exec(path);
  if (block) return block[0];
  const section = /^study\.sections\.\d+/.exec(path);
  if (section) return section[0];
  for (const g of GROUPS) if (g.fields.some(([p]) => path === p || path.startsWith(p + '.'))) return g.id;
  return 'carte';
}

export function StructureView({
  project,
  lang,
  selection,
  onSelect,
  onEdit,
}: {
  project: StoredProject;
  lang: Language;
  selection: string;
  onSelect: (path: string) => void;
  /** Writes a value at a path of the project */
  onEdit: (path: string, value: unknown) => void;
}) {
  const [sheet, setSheet] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const sections = project.study.sections;

  const select = (path: string) => {
    onSelect(path);
    setSheet(true);
  };

  // A selection coming from Page mode scrolls into view in the plan
  useEffect(() => {
    document.querySelector(`[data-outline="${CSS.escape(selection)}"]`)?.scrollIntoView({ block: 'nearest' });
    panel.current?.scrollTo({ top: 0 });
  }, [selection]);

  const setSections = (next: unknown) => onEdit('study.sections', next);
  const moveSection = (from: number, to: number) => {
    const next = [...sections];
    [next[from], next[to]] = [next[to], next[from]];
    setSections(next);
    onSelect(`study.sections.${to}`);
  };
  const addBlock = (si: number, type: Block['type'], at = sections[si].content.length) => {
    const content = [...sections[si].content];
    content.splice(at, 0, emptyBlock(type));
    onEdit(`study.sections.${si}.content`, content);
    select(`study.sections.${si}.content.${at}`);
  };

  const item = (path: string, label: string, extra?: string) => (
    <button
      type="button"
      data-outline={path}
      onClick={() => select(path)}
      className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold transition ${selection === path ? 'bg-[rgba(var(--accent-rgb),0.12)] text-[var(--accent)]' : 'hover:bg-[var(--color-surface)] dark:hover:bg-white/5'}`}
    >
      <span className="truncate">{label}</span>
      {extra && <span className="ml-auto shrink-0 text-xs font-normal text-neutral-500">{extra}</span>}
    </button>
  );

  return (
    <div className="md:grid md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-8">
      <nav aria-label="Plan du projet" className="space-y-1 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:overflow-y-auto md:pb-10">
        {GROUPS.slice(0, 4).map((g) => item(g.id, g.label))}
        <p className="eyebrow px-3 pb-1 pt-5 text-neutral-500 dark:text-[#A1A1AA]">Sections</p>
        {sections.map((section, si) => (
          <div key={si} className="rounded-2xl border border-[var(--color-border)] p-1.5 dark:border-white/10">
            <div className="flex items-center">
              <div className="min-w-0 flex-1">{item(`study.sections.${si}`, section.nav.fr || section.title.fr || 'Section sans titre')}</div>
              <button type="button" aria-label="Monter la section" disabled={si === 0} onClick={() => moveSection(si, si - 1)} className="grid size-9 place-items-center rounded-full text-neutral-500 disabled:opacity-25">
                ↑
              </button>
              <button type="button" aria-label="Descendre la section" disabled={si === sections.length - 1} onClick={() => moveSection(si, si + 1)} className="grid size-9 place-items-center rounded-full text-neutral-500 disabled:opacity-25">
                ↓
              </button>
            </div>
            <BlockList
              section={si}
              blocks={section.content}
              selection={selection}
              onSelect={select}
              onReorder={(content) => onEdit(`study.sections.${si}.content`, content)}
            />
            <AddBlockMenu onPick={(type) => addBlock(si, type)} />
          </div>
        ))}
        <div className="px-1 pt-2">
          <Button
            variant="quiet"
            onClick={() => {
              setSections([...sections, { ...(emptyOf(SectionSchema) as object), id: `section-${sections.length + 1}`, content: [] }]);
              select(`study.sections.${sections.length}`);
            }}
          >
            + Ajouter une section
          </Button>
        </div>
        <div className="pt-4">{item('credits', 'Crédits')}</div>
      </nav>

      <div
        ref={panel}
        className={`${sheet ? 'fixed inset-0 z-40 overflow-y-auto bg-[var(--color-paper)] px-4 pb-24 pt-4 dark:bg-[#0A0A0C]' : 'hidden'} md:static md:block md:overflow-visible md:bg-transparent md:p-0`}
      >
        <button type="button" onClick={() => setSheet(false)} className="mb-4 min-h-11 font-syne text-sm font-bold text-[var(--accent)] md:hidden">
          ‹ Retour au plan
        </button>
        <Panel project={project} lang={lang} selection={selection} onEdit={onEdit} onSelect={onSelect} />
      </div>
    </div>
  );
}

function Panel({ project, lang, selection, onEdit, onSelect }: { project: StoredProject; lang: Language; selection: string; onEdit: (path: string, v: unknown) => void; onSelect: (p: string) => void }) {
  const group = GROUPS.find((g) => g.id === selection);
  const block = /^study\.sections\.(\d+)\.content\.(\d+)$/.exec(selection);
  const section = /^study\.sections\.(\d+)$/.exec(selection);
  const title = (t: string, sub?: string) => (
    <div className="mb-6">
      <h2 className="font-syne text-2xl font-extrabold tracking-tight">{t}</h2>
      {sub && <p className="mt-1 text-sm text-neutral-500 dark:text-[#A1A1AA]">{sub}</p>}
    </div>
  );

  if (group) {
    return (
      <div className="space-y-6">
        {title(group.label)}
        {group.fields.map(([path, schema]) => (
          <FieldEditor key={path} schema={schema} value={getAt(project, path)} lang={lang} path={path} onChange={(v) => onEdit(path, v)} />
        ))}
      </div>
    );
  }

  if (block) {
    const [si, bi] = [Number(block[1]), Number(block[2])];
    const value = project.study.sections[si]?.content[bi];
    if (!value) return null;
    const label = BLOCK_TYPES.find((b) => b.type === value.type)?.label ?? value.type;
    return (
      <div>
        <div className="flex items-start justify-between gap-4">
          {title(label, `Section « ${project.study.sections[si].nav.fr} »`)}
          <Button
            variant="danger"
            onClick={() => {
              onEdit(`study.sections.${si}.content`, project.study.sections[si].content.filter((_, j) => j !== bi));
              onSelect(`study.sections.${si}`);
            }}
          >
            Supprimer
          </Button>
        </div>
        <FieldEditor schema={BlockSchema} value={value} lang={lang} path={selection} bare onChange={(v) => onEdit(selection, v)} />
      </div>
    );
  }

  if (section) {
    const si = Number(section[1]);
    const value = project.study.sections[si];
    if (!value) return null;
    const shape = SectionSchema.shape;
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          {title('Section', 'Le titre, le libellé du sommaire et l’ancre. Les blocs se gèrent dans le plan.')}
          <Button
            variant="danger"
            onClick={() => {
              if (!window.confirm(`Supprimer la section « ${value.nav.fr} » et ses ${value.content.length} blocs ?`)) return;
              onEdit('study.sections', project.study.sections.filter((_, j) => j !== si));
              onSelect('entete');
            }}
          >
            Supprimer
          </Button>
        </div>
        {(['title', 'nav', 'id', 'tone'] as const).map((k) => (
          <FieldEditor key={k} schema={shape[k]} value={value[k]} lang={lang} path={`${selection}.${k}`} onChange={(v) => onEdit(`${selection}.${k}`, v)} />
        ))}
      </div>
    );
  }
  return null;
}

export function AddBlockMenu({ onPick }: { onPick: (type: Block['type']) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative px-1.5 pb-1">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-h-10 text-xs font-bold text-[var(--accent)]">
        + Ajouter un bloc
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-30 grid w-64 grid-cols-2 gap-1 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#1A1A1E]">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => {
                onPick(b.type);
                setOpen(false);
              }}
              className="min-h-10 rounded-lg px-2 text-left text-xs font-semibold hover:bg-[var(--color-surface)] dark:hover:bg-white/5"
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
