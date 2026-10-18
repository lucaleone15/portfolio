import type React from 'react';
import { Project } from '../types';
import { CONTENT } from '../content/load';

/** Contact details (content/site.json → contact), for code outside React: SEO, prerender, privacy policy */
export const USER_INFO = CONTENT.site.contact;

/** Text on a fill of this colour: white when it reads (≥ 4.5:1, WCAG AA for small text), dark otherwise */
function textOn(hex: string) {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return 1.05 / (luminance + 0.05) >= 4.5 ? '#FFFFFF' : '#0A0A0C';
}

/** CSS variables for a project's accent; pair with the `project-accent` class (see index.css). */
export function projectAccentVars(project: Pick<Project, 'accentColor' | 'accentColorDark'>) {
  const light = project.accentColor || '#C50E36';
  const dark = project.accentColorDark || light;
  return {
    '--pa-l': light,
    '--pa-d': dark,
    '--pa-on-l': textOn(light),
    '--pa-on-d': textOn(dark),
  } as React.CSSProperties;
}

export type ProjectKind = 'pro' | 'school-client' | 'school';

/** How a project came about, shown on its card and page */
export const PROJECT_KIND_LABEL: Record<ProjectKind, { fr: string; en: string }> = {
  pro: { fr: 'Projet professionnel', en: 'Professional work' },
  'school-client': { fr: 'Académique · vrai client', en: 'Academic · real client' },
  school: { fr: 'Projet académique', en: 'Academic project' },
};
