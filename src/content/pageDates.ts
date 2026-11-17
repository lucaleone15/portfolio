import type { Language } from '../types';

/**
 * Publication and update dates of the pages, as YYYY-MM-DD. Updates come from git at build time
 * (scripts/page-dates.mjs → __PAGE_DATES__), so they only move when a page's content changes.
 * A project's publication date is its `published` field, else the day its file was first
 * committed. Outside a build (tests, admin preview): today.
 */

export interface PageDates {
  published: string;
  modified: string;
}

const BUILT = typeof __PAGE_DATES__ === 'undefined' ? null : __PAGE_DATES__;
const today = () => new Date().toISOString().slice(0, 10);

/** Never updated before it was published */
const ordered = (published: string, modified: string): PageDates => ({ published, modified: modified < published ? published : modified });

export function siteDates(): PageDates {
  return ordered(BUILT?.site.published ?? today(), BUILT?.site.modified ?? today());
}

export function projectDates(id: string, published?: string): PageDates {
  const built = BUILT?.projects[id];
  const modified = built?.modified ?? today();
  return ordered(published ?? built?.added ?? modified, modified);
}

const MONTHS: Record<Language, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** "17 novembre 2026" / "17 November 2026", the same in Node and every browser (no Intl) */
export function formatDate(iso: string, lang: Language): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}
