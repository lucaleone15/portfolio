import type { Language } from '../types';
import type { StoredProject } from './schema';
import { hashFr } from './txt';

/**
 * Share images (og:image): the personal one (/og-image.jpg) for every page, and one per project
 * and language, drawn at build time by scripts/share-images.mjs from what the card shows. The
 * file name carries a fingerprint of that content: when it changes, so does the address, and
 * LinkedIn & co. can't keep showing an old picture from their cache.
 */

/** Bump when the drawing itself changes (src/content/ShareCard.tsx) */
export const SHARE_CARD_VERSION = 1;
export const PERSONAL_SHARE_IMAGE = '/og-image.jpg';
export const SHARE_SIZE = { width: 1200, height: 630 };

/** What a project's share image shows, in that language */
export function shareCardInputs(p: StoredProject, lang: Language) {
  return {
    v: SHARE_CARD_VERSION,
    name: p.name,
    kind: p.kind,
    year: p.year,
    cover: p.imageUrl,
    logo: p.logo?.srcDark ?? '',
    accent: p.accentColor ?? '',
    hook: p.card.hook?.[lang] ?? '',
    label: (p.card.badge ?? p.card.category)[lang],
  };
}

export function projectShareImage(p: StoredProject, lang: Language): string {
  if (!p.imageUrl) return PERSONAL_SHARE_IMAGE;
  return `/og/${p.id}-${lang}-${hashFr(JSON.stringify(shareCardInputs(p, lang)))}.jpg`;
}
