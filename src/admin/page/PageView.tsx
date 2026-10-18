import { useMemo } from 'react';
import type { Language } from '../../types';
import type { Content, StoredProject } from '../../content/schema';
import { toCaseStudy, toProject } from '../../content/localize';
import { CaseStudy } from '../../components/CaseStudy';
import { projectPath } from '../../router';
import { projectAccentVars } from '../../data/portfolioData';
import { EditablePreview } from './EditablePreview';

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
 * Page mode for a project: the real case study from the draft, in the chosen language. A click
 * on a text edits it in place; a click elsewhere in a block (images, figures, galleries…) opens
 * that block's form; "+" between blocks inserts one.
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
  const shown = useMemo(() => withPreviewSrcs(project, preview), [project, preview]);
  const previewContent = useMemo(() => ({ ...content, projects: { ...content.projects, [project.id]: shown } }), [content, project.id, shown]);
  const view = toProject(shown, lang, true);
  const study = toCaseStudy(shown, lang, { keepIncomplete: true });

  return (
    <EditablePreview doc={project} content={previewContent} url={projectPath(lang, project.id)} lang={lang} onEdit={onEdit} onOpen={onOpen} onInsert={onInsert}>
      <div style={projectAccentVars(view)} className="project-accent bg-[#F9F9FB] px-5 py-10 text-neutral-900 dark:bg-[#0A0A0C] dark:text-white sm:px-10 sm:py-14">
        {study && <CaseStudy project={view} study={study} />}
      </div>
    </EditablePreview>
  );
}
