import { useMemo, useState, type MouseEvent } from 'react';
import { MotionConfig } from 'motion/react';
import type { Language } from '../../types';
import type { Content, StoredProject } from '../../content/schema';
import { isTxt, toCaseStudy, toProject } from '../../content/localize';
import { ContentProvider } from '../../content/ContentContext';
import { EditProvider } from '../../content/edit';
import type { Txt } from '../../content/txt';
import { CaseStudy } from '../../components/CaseStudy';
import { StaticLanguageProvider } from '../../context/LanguageContext';
import { StaticRouterProvider, projectPath } from '../../router';
import { projectAccentVars } from '../../data/portfolioData';
import { getAt } from '../fields/schemaWalk';
import { InlineEditor } from './InlineEditor';

/** Site paths of uploads not published yet, rewritten to where the admin can show them */
export function withPreviewSrcs<T>(value: T, preview: (src: string) => string): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return /^\/(images|videos|pdf)\//.test(v) ? preview(v) : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(value) as T;
}

/**
 * Page mode: the real case study, rendered from the draft in the chosen language. A click on a
 * text opens the in-place editor; a click elsewhere in a block (images, figures, galleries…)
 * opens that block's form; "+" between blocks inserts one. Links and the image viewer are
 * switched off: a click here always means "edit this".
 */
export function PageView({
  project,
  content,
  lang,
  preview,
  onEdit,
  onOpen,
  onInsert,
}: {
  project: StoredProject;
  content: Content;
  lang: Language;
  preview: (src: string) => string;
  onEdit: (path: string, value: unknown) => void;
  onOpen: (path: string) => void;
  onInsert: (section: number, at: number) => void;
}) {
  const [editing, setEditing] = useState<{ path: string; el: HTMLElement } | null>(null);
  const shown = useMemo(() => withPreviewSrcs(project, preview), [project, preview]);
  const previewContent = useMemo(() => ({ ...content, projects: { ...content.projects, [project.id]: shown } }), [content, project.id, shown]);
  const view = toProject(shown, lang, true);
  const study = toCaseStudy(shown, lang, { keepIncomplete: true });
  const editApi = useMemo(() => ({ onInsert }), [onInsert]);

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-slot]')) return;
    e.preventDefault();
    e.stopPropagation();
    const el = target.closest<HTMLElement>('[data-edit]');
    if (!el) return;
    const path = el.dataset.edit!;
    if (isTxt(getAt(project, path))) setEditing({ path, el });
    else onOpen(path);
  };

  const value = editing ? (getAt(project, editing.path) as Txt | undefined) : undefined;

  return (
    <div onClickCapture={onClick} className="admin-preview overflow-hidden rounded-3xl border border-[var(--color-border)] dark:border-white/10">
      <StaticRouterProvider url={projectPath(lang, project.id)}>
        <StaticLanguageProvider lang={lang}>
          <ContentProvider value={previewContent} preview>
            <MotionConfig reducedMotion="always">
              <EditProvider value={editApi}>
                <div style={projectAccentVars(view)} className="project-accent bg-[#F9F9FB] px-5 py-10 text-neutral-900 dark:bg-[#0A0A0C] dark:text-white sm:px-10 sm:py-14">
                  {study && <CaseStudy project={view} study={study} />}
                </div>
              </EditProvider>
            </MotionConfig>
          </ContentProvider>
        </StaticLanguageProvider>
      </StaticRouterProvider>
      {editing && value && (
        <InlineEditor target={editing.el} value={value} lang={lang} onChange={(v) => onEdit(editing.path, v)} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
