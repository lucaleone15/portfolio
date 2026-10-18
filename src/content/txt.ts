import type { Language } from '../types';

/**
 * A text in both languages. `enOf` is the fingerprint of the French text the English was
 * written from: when the French changes afterwards, the English is flagged "à revoir".
 */
export interface Txt {
  fr: string;
  en: string;
  enOf?: string;
}

/** FNV-1a (32 bits) as 8 hex characters: short, stable, and the same in Node and the browser */
export function hashFr(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export const tx = (t: Txt, lang: Language): string => t[lang];

export const isMissingEn = (t: Txt): boolean => t.en.trim() === '';

export const isStale = (t: Txt): boolean => !isMissingEn(t) && t.enOf !== hashFr(t.fr);

/** Writing the English marks it as up to date with the current French */
export const setEn = (t: Txt, en: string): Txt => ({ ...t, en, enOf: hashFr(t.fr) });

/** Writing the French leaves `enOf` alone: that is what makes the English out of date */
export const setFr = (t: Txt, fr: string): Txt => ({ ...t, fr });

const isTxtValue = (v: unknown): v is Txt =>
  !!v && typeof v === 'object' && !Array.isArray(v) && typeof (v as Txt).fr === 'string' && typeof (v as Txt).en === 'string';

/** Calls `fn` for every Txt inside `value`, with its dotted path ("study.sections.2.title") */
export function walkTxt(value: unknown, path: string, fn: (t: Txt, path: string) => void): void {
  if (isTxtValue(value)) return fn(value, path);
  if (Array.isArray(value)) return value.forEach((item, i) => walkTxt(item, path ? `${path}.${i}` : String(i), fn));
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) walkTxt(item, path ? `${path}.${key}` : key, fn);
  }
}

/** English to write or review, page by page */
export function englishTodo(pages: { ref: string; data: unknown }[]) {
  const stale: { ref: string; path: string; fr: string }[] = [];
  const missingEn: { ref: string; path: string; fr: string }[] = [];
  for (const { ref, data } of pages) {
    walkTxt(data, '', (t, path) => {
      if (isStale(t)) stale.push({ ref, path, fr: t.fr });
      else if (isMissingEn(t) && t.fr.trim() !== '') missingEn.push({ ref, path, fr: t.fr });
    });
  }
  return { stale, missingEn };
}
