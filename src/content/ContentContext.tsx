import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Project } from '../types';
import type { CaseStudy } from '../data/caseStudies/types';
import { useLanguage } from '../context/LanguageContext';
import { CONTENT } from './load';
import type { Content } from './schema';
import { toCaseStudy, toProject, toSite, visibleProjects, type LocalizedSite } from './localize';

/**
 * The content the components render. Defaults to the published content (content/); the admin
 * wraps its preview in a provider holding the draft. Components read content only through
 * these hooks, never by importing content/ themselves.
 */
const ContentContext = createContext<{ content: Content; preview: boolean }>({ content: CONTENT, preview: false });

export function ContentProvider({ value, preview = false, children }: { value?: Content; preview?: boolean; children: ReactNode }) {
  const ctx = useMemo(() => ({ content: value ?? CONTENT, preview }), [value, preview]);
  return <ContentContext.Provider value={ctx}>{children}</ContentContext.Provider>;
}

export const useContent = (): Content => useContext(ContentContext).content;

export function useSite(): LocalizedSite {
  const { content, preview } = useContext(ContentContext);
  const { lang } = useLanguage();
  return useMemo(() => toSite(content.site, lang, preview), [content.site, lang, preview]);
}

export const useContact = () => useContent().site.contact;

/** Projects shown on the site in the current language, in order */
export function useProjects(): Project[] {
  const content = useContent();
  const { lang } = useLanguage();
  return useMemo(() => visibleProjects(content, lang).map((p) => toProject(p, lang)), [content, lang]);
}

export function useCaseStudy(projectId: string): CaseStudy | null {
  const { content, preview } = useContext(ContentContext);
  const { lang } = useLanguage();
  const project = content.projects[projectId];
  return useMemo(() => (project ? toCaseStudy(project, lang, { keepIncomplete: preview }) : null), [project, lang, preview]);
}
