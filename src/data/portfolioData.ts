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

/** WCAG contrast ratio between two #RRGGBB colours */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const channel = (i: number) => {
      const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The same hue, darkened just enough to be read as small text on the light page (≥ 4.5:1) */
function readableOnLight(hex: string) {
  const rgb = [0, 1, 2].map((i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16));
  for (let k = 1; k >= 0.3; k -= 0.02) {
    const out = `#${rgb.map((c) => Math.round(c * k).toString(16).padStart(2, '0')).join('')}`;
    if (contrast(out, '#F9F9FB') >= 4.5) return out;
  }
  return '#0A0A0C';
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
    '--pa-text-l': readableOnLight(light),
  } as React.CSSProperties;
}

export type ProjectKind = 'pro' | 'school-client' | 'school';

/** How a project came about, shown on its card and page */
export const PROJECT_KIND_LABEL: Record<ProjectKind, { fr: string; en: string }> = {
  pro: { fr: 'Projet professionnel', en: 'Professional work' },
  'school-client': { fr: 'Académique · vrai client', en: 'Academic · real client' },
  school: { fr: 'Projet académique', en: 'Academic project' },
};
