import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import type { Language } from '../../types';
import type { Content } from '../../content/schema';
import { isTxt } from '../../content/localize';
import { ContentProvider } from '../../content/ContentContext';
import { EditProvider } from '../../content/edit';
import type { Txt } from '../../content/txt';
import { StaticLanguageProvider } from '../../context/LanguageContext';
import { StaticRouterProvider } from '../../router';
import { getAt } from '../fields/schemaWalk';
import { InlineEditor } from './InlineEditor';

/**
 * Real site components rendered from the draft, in a fixed language and page, made editable:
 * a click on a text (data-edit pointing at a Txt of `doc`) opens the in-place editor, a click
 * on anything else marked data-edit calls onOpen. Links and other clicks are switched off.
 */
export function EditablePreview({
  doc,
  content,
  url,
  lang,
  onEdit,
  onOpen,
  onInsert = () => {},
  children,
}: {
  /** The page whose paths data-edit refers to (a project, or the site's texts) */
  doc: unknown;
  content: Content;
  url: string;
  lang: Language;
  onEdit: (path: string, value: unknown) => void;
  onOpen: (path: string) => void;
  onInsert?: (section: number, at: number) => void;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState<{ path: string; el: HTMLElement } | null>(null);
  const editApi = useMemo(() => ({ onInsert }), [onInsert]);

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-slot]')) return;
    e.preventDefault();
    e.stopPropagation();
    const el = target.closest<HTMLElement>('[data-edit]');
    if (!el) return;
    const path = el.dataset.edit!;
    const v = getAt(doc, path);
    // Texts in both languages, and names of people, companies and schools (plain text), are written in place
    if (isTxt(v) || (typeof v === 'string' && /(^|\.)(name|company|institution)$/.test(path))) setEditing({ path, el });
    else onOpen(path);
  };
  const value = editing ? (getAt(doc, editing.path) as Txt | string | undefined) : undefined;

  return (
    <div onClickCapture={onClick} className="admin-preview overflow-hidden rounded-3xl border border-[var(--color-border)] dark:border-white/10">
      <StaticRouterProvider url={url}>
        <StaticLanguageProvider lang={lang}>
          <ContentProvider value={content} preview>
            <MotionConfig reducedMotion="always">
              <EditProvider value={editApi}>{children}</EditProvider>
            </MotionConfig>
          </ContentProvider>
        </StaticLanguageProvider>
      </StaticRouterProvider>
      {editing && value !== undefined && <InlineEditor target={editing.el} path={editing.path} value={value} lang={lang} onChange={(v) => onEdit(editing.path, v)} onClose={() => setEditing(null)} />}
    </div>
  );
}
