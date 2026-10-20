import type { Language } from '../types';
import type { Site, StoredProject } from './schema';
import { hashFr } from './txt';

/**
 * Share images (og:image), drawn at build time by src/content/shareImages.ts:
 *   - the personal one (portrait + the hero's words), for every page, per language;
 *   - one per project and language, from what its card shows.
 * The file name carries a fingerprint of what the image shows: when that changes, so does the
 * address, and LinkedIn & co. can't keep showing an old picture from their cache.
 */

/** Bump when the drawing itself changes (src/content/ShareCard.tsx) */
export const SHARE_CARD_VERSION = 6;
export const SHARE_SIZE = { width: 1200, height: 630 };

/** What the personal image shows, in that language */
export function personalCardInputs(site: Site, lang: Language) {
  const { headline, outcomes } = site.hero;
  return {
    v: SHARE_CARD_VERSION,
    before: headline.before[lang],
    accent: headline.accent[lang],
    joiner: headline.joiner[lang],
    outcome: outcomes[0]?.[lang] ?? '',
  };
}

export function personalShareImage(site: Site, lang: Language): string {
  return `/og/luca-leone-${lang}-${hashFr(JSON.stringify(personalCardInputs(site, lang)))}.jpg`;
}

/** What a project's share image shows, in that language */
export function shareCardInputs(p: StoredProject, lang: Language) {
  return {
    v: SHARE_CARD_VERSION,
    name: p.name,
    year: p.year,
    cover: p.imageUrl,
    logo: p.logo?.srcDark ?? '',
    hook: p.card.hook?.[lang] ?? '',
    role: (p.card.badge ?? p.card.category)[lang],
  };
}

/** A project's own image; without a cover, the personal one */
export function projectShareImage(p: StoredProject, lang: Language, site: Site): string {
  if (!p.imageUrl) return personalShareImage(site, lang);
  return `/og/${p.id}-${lang}-${hashFr(JSON.stringify(shareCardInputs(p, lang)))}.jpg`;
}
