import type { Language } from '../types';
import type { Content, Site, StoredProject } from './schema';
import { SITE_PAGES } from './sitePages';
import { isMissingEn, isStale, walkTxt, type Txt } from './txt';

/**
 * "Santé de la page": what to fix before publishing, per page and per language, with a score
 * out of 100. Each check points at the field to open. Nothing here blocks a publish.
 * Lengths follow Google's display limits (titles ≤ 60 characters, descriptions 120–160).
 */

export type CheckStatus = 'ok' | 'warn' | 'bad';
export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
  /** Field to open (a path in the page) */
  path?: string;
  count?: number;
}
export interface Health {
  score: number;
  checks: Check[];
}

const TODO = '[À COMPLÉTER';

function score(checks: Check[]): number {
  const lost = checks.reduce((n, c) => n + (c.status === 'bad' ? 15 : c.status === 'warn' ? 6 : 0), 0);
  return Math.max(0, 100 - lost);
}

function titleCheck(id: string, label: string, text: string, path: string): Check {
  const n = text.trim().length;
  if (!n) return { id, label, status: 'bad', detail: 'Vide : Google inventera un titre.', path };
  if (n > 60) return { id, label, status: 'warn', detail: `${n} caractères : coupé dans Google au-delà de 60.`, path };
  if (n < 30) return { id, label, status: 'warn', detail: `${n} caractères : un peu court, 30 à 60 c'est mieux.`, path };
  return { id, label, status: 'ok', detail: `${n} caractères.`, path };
}

function descriptionCheck(id: string, label: string, text: string, path: string): Check {
  const n = text.trim().length;
  if (!n) return { id, label, status: 'bad', detail: 'Vide : Google prendra un bout de texte au hasard.', path };
  if (n < 120 || n > 160) return { id, label, status: 'warn', detail: `${n} caractères : 120 à 160 pour un affichage complet.`, path };
  return { id, label, status: 'ok', detail: `${n} caractères.`, path };
}

/** Texts still marked [À COMPLÉTER] in that language */
function todoCheck(value: unknown, lang: Language): Check {
  const paths: string[] = [];
  walkTxt(value, '', (t, path) => {
    if (t[lang].includes(TODO)) paths.push(path);
  });
  return paths.length
    ? { id: 'todo', label: 'Textes à compléter', status: 'bad', count: paths.length, detail: `${paths.length} texte(s) encore marqué(s) [À COMPLÉTER].`, path: paths[0] }
    : { id: 'todo', label: 'Textes à compléter', status: 'ok', detail: 'Aucun [À COMPLÉTER] oublié.' };
}

/** Images whose alternative text is missing or too short to describe them */
function altCheck(value: unknown, lang: Language): Check {
  const missing: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) return v.forEach((x, i) => walk(x, path ? `${path}.${i}` : String(i)));
    if (!v || typeof v !== 'object') return;
    const o = v as { src?: unknown; alt?: Txt };
    if (typeof o.src === 'string' && o.alt && typeof o.alt === 'object' && 'fr' in o.alt) {
      if (o.alt[lang].trim().length < 8) missing.push(`${path}.alt`);
      return;
    }
    for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(value, '');
  return missing.length
    ? { id: 'alt', label: 'Textes alternatifs des images', status: 'bad', count: missing.length, detail: `${missing.length} image(s) sans description utile (lecteurs d'écran, Google Images).`, path: missing[0] }
    : { id: 'alt', label: 'Textes alternatifs des images', status: 'ok', detail: 'Toutes les images sont décrites.' };
}

function englishCheck(value: unknown): Check {
  let missing = 0;
  let stale = 0;
  let first: string | undefined;
  walkTxt(value, '', (t, path) => {
    if (isMissingEn(t) && t.fr.trim()) {
      missing++;
      first ??= path;
    } else if (isStale(t)) {
      stale++;
      first ??= path;
    }
  });
  if (!missing && !stale) return { id: 'english', label: 'Version anglaise', status: 'ok', detail: 'À jour.' };
  const parts = [missing && `${missing} manquant(s)`, stale && `${stale} à revoir`].filter(Boolean).join(', ');
  return { id: 'english', label: 'Version anglaise', status: missing ? 'bad' : 'warn', count: missing + stale, detail: `Textes anglais : ${parts}.`, path: first };
}

/** Every Google title of the site in that language, to spot duplicates */
function allTitles(content: Content, lang: Language): string[] {
  return [
    ...SITE_PAGES.map((p) => content.site.seo[p].title[lang].trim()),
    ...Object.values(content.projects).map((p) => p.seo.title[lang].trim()),
  ].filter(Boolean);
}

export function projectHealth(p: StoredProject, lang: Language, content: Content): Health {
  const title = p.seo.title[lang];
  const checks: Check[] = [
    titleCheck('seo-title', 'Titre Google', title, 'seo.title'),
    descriptionCheck('seo-description', 'Description Google', p.seo.description[lang], 'seo.description'),
  ];
  const same = allTitles(content, lang).filter((t) => t === title.trim()).length;
  checks.push(
    title.trim() && same > 1
      ? { id: 'seo-unique', label: 'Titre unique', status: 'warn', detail: 'Une autre page a le même titre Google.', path: 'seo.title' }
      : { id: 'seo-unique', label: 'Titre unique', status: 'ok', detail: 'Aucune autre page n’a ce titre.' },
  );
  checks.push(
    p.imageUrl
      ? { id: 'cover', label: 'Couverture', status: 'ok', detail: 'Elle sert aussi à l’image de partage.' }
      : { id: 'cover', label: 'Couverture', status: 'bad', detail: 'Pas de couverture : carte vide sur l’accueil et image de partage sans visuel.', path: 'imageUrl' },
  );
  checks.push(
    p.card.hook?.[lang]?.trim()
      ? { id: 'hook', label: 'Accroche de la carte', status: 'ok', detail: 'Écrite sur l’image de la carte et de partage.' }
      : { id: 'hook', label: 'Accroche de la carte', status: 'warn', detail: 'Sans accroche, la carte et l’image de partage n’ont que le nom.', path: 'card.hook' },
  );
  checks.push(todoCheck(p, lang), altCheck(p, lang));
  const filled = p.study.sections.filter((s) => s.content.length > 0).length;
  checks.push(
    filled >= 2
      ? { id: 'story', label: 'Étude de cas', status: 'ok', detail: `${filled} sections.` }
      : { id: 'story', label: 'Étude de cas', status: 'warn', detail: 'Moins de deux sections avec du contenu.', path: 'study.sections' },
  );
  if (lang === 'en') checks.push(englishCheck(p));
  return { score: score(checks), checks };
}

const PAGE_NAMES: Record<(typeof SITE_PAGES)[number], string> = {
  home: 'Accueil',
  projets: 'Projets',
  'a-propos': 'À propos',
  contact: 'Contact',
  privacy: 'Confidentialité',
  notfound: 'Page 404',
};

export function siteHealth(site: Site, lang: Language, content: Content): Health {
  const checks: Check[] = [];
  for (const page of SITE_PAGES) {
    if (page === 'notfound') continue;
    checks.push(titleCheck(`seo-title-${page}`, `Titre Google · ${PAGE_NAMES[page]}`, site.seo[page].title[lang], `seo.${page}.title`));
    checks.push(descriptionCheck(`seo-description-${page}`, `Description Google · ${PAGE_NAMES[page]}`, site.seo[page].description[lang], `seo.${page}.description`));
  }
  checks.push(todoCheck(site, lang));
  if (lang === 'en') checks.push(englishCheck(site));
  return { score: score(checks), checks };
}

export const scoreTone = (n: number): CheckStatus => (n >= 90 ? 'ok' : n >= 70 ? 'warn' : 'bad');
