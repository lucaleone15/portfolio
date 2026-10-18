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
