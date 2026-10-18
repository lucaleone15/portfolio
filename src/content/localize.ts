import type { Language, Project } from '../types';
import type { CaseContent, CaseStudy } from '../data/caseStudies/types';
import type { Content, Site, StoredProject } from './schema';
import { isMissingEn, type Txt } from './txt';

/**
 * Stored content (one structure, Txt in both languages) → the shapes the components render.
 *
 * English that isn't written yet: on the public site, the smallest list item holding it (a block,
 * a step, a figure, a section…) is left out; when it sits outside any list, the whole thing is
 * unavailable in English (toCaseStudy → null). With `keepIncomplete` (admin preview) nothing is
 * left out: the missing English shows as "⟨à traduire⟩ " + the French, so indices stay stable.
 */

const MISSING = Symbol('missing English');
export const TO_TRANSLATE = '⟨à traduire⟩ ';

export const isTxt = (v: unknown): v is Txt =>
  !!v &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  typeof (v as Txt).fr === 'string' &&
  typeof (v as Txt).en === 'string' &&
  Object.keys(v).every((k) => k === 'fr' || k === 'en' || k === 'enOf');

function loc(value: unknown, lang: Language, keepIncomplete: boolean): unknown {
  if (isTxt(value)) {
    if (lang === 'fr') return value.fr;
    if (isMissingEn(value) && value.fr.trim() !== '') return keepIncomplete ? TO_TRANSLATE + value.fr : MISSING;
    return value.en;
  }
  if (Array.isArray(value)) {
    const out = value.map((item) => loc(item, lang, keepIncomplete));
    return out.filter((item) => item !== MISSING);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const v = loc(item, lang, keepIncomplete);
      if (v === MISSING) return MISSING;
      if (v !== undefined) out[key] = v;
    }
    return out;
  }
  return value;
}

/** Localized value, or null when a text outside any list has no English yet */
function localize<T>(value: unknown, lang: Language, keepIncomplete = false): T | null {
  const out = loc(value, lang, keepIncomplete);
  return out === MISSING ? null : (out as T);
}

/** Paragraphs are stored as { type: 'text' } blocks; the case study component takes plain strings */
const unwrapText = (content: CaseContent): CaseContent =>
  content.map((item) => (typeof item === 'object' && (item as { type: string }).type === 'text' ? (item as unknown as { text: string }).text : item));

export function isEnglishReady(p: StoredProject): boolean {
  const { kicker, title, hook, intro } = p.study;
  return localize({ card: p.card, seo: p.seo, head: { kicker, title, hook, intro } }, 'en') !== null;
}

export function toProject(p: StoredProject, lang: Language, keepIncomplete = false): Project {
  const card = localize<Record<string, string>>(p.card, lang, keepIncomplete) ?? localize<Record<string, string>>(p.card, lang, true)!;
  return {
    id: p.id,
    kind: p.kind,
    name: p.name,
    number: p.number,
    year: p.year,
    imageUrl: p.imageUrl,
    stack: localize<string[]>(p.stack, lang, keepIncomplete)!,
    accentColor: p.accentColor,
    accentColorDark: p.accentColorDark,
    logo: p.logo,
    video: p.video,
    ...card,
  } as Project;
}

export function projectSeo(p: StoredProject, lang: Language): { title: string; description: string } {
  return localize(p.seo, lang) ?? localize(p.seo, lang, true)!;
}

export function toCaseStudy(p: StoredProject, lang: Language, opts: { keepIncomplete?: boolean } = {}): CaseStudy | null {
  if (lang === 'en' && !opts.keepIncomplete && !isEnglishReady(p)) return null;
  const study = localize<CaseStudy>(p.study, lang, !!opts.keepIncomplete);
  if (!study) return null;
  return { ...study, sections: study.sections.map((s) => ({ ...s, content: unwrapText(s.content) })) };
}

export interface LocalizedSite {
  contact: Site['contact'];
  hero: {
    eyebrow: string;
    headline: { before: string; accent: string; joiner: string };
    outcomes: string[];
    lead: string;
    availability: { before: string; link: string; after: string };
  };
  about: {
    bio: string;
    languages: { name: string; level: string }[];
    passions: string[];
    education: { period: string; title: string; institution: string; location: string; details: string }[];
    experience: { period: string; title: string; company: string; location: string; description: string }[];
  };
  skills: { id: string; number: string; title: string; desc: string; tools: string[] }[];
  seo: Record<keyof Site['seo'], { title: string; description: string }>;
}

/** The site's fixed texts never disappear: missing English falls back to the French */
export function toSite(s: Site, lang: Language, keepIncomplete = false): LocalizedSite {
  return (localize<LocalizedSite>(s, lang, keepIncomplete) ?? localize<LocalizedSite>(s, lang, true))!;
}

/** Projects shown on the site in that language, in the home page's order */
export function visibleProjects(c: Content, lang: Language): StoredProject[] {
  return c.index.order
    .filter((id) => !c.index.hidden.includes(id))
    .map((id) => c.projects[id])
    .filter((p): p is StoredProject => !!p && (lang === 'fr' || isEnglishReady(p)));
}
