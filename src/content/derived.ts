import type { Language } from '../types';
import type { Content } from './schema';
import { visibleProjects } from './localize';
import { tx } from './txt';

/**
 * Texts that count or list the projects, rebuilt from the content at every build so they never
 * go stale: "{N} projets…" in the SEO descriptions, the AI catalogues (public/ai-catalog.json,
 * public/.well-known/) and the project list of public/llms.txt.
 */

const SITE_URL = 'https://luca-leone.ch';

const WORDS: Record<Language, string[]> = {
  fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
};

export function countWord(n: number, lang: Language, capitalized = false): string {
  const word = WORDS[lang][n] ?? String(n);
  return capitalized ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/** {n} / {N}: number of projects shown on the site, in words (lower case / capitalised); {names}: their names */
export function fillTemplate(text: string, c: Content, lang: Language): string {
  const projects = visibleProjects(c, lang);
  return text
    .replaceAll('{n}', countWord(projects.length, lang))
    .replaceAll('{N}', countWord(projects.length, lang, true))
    .replaceAll('{names}', projects.map((p) => p.name).join(', '));
}

const KIND_FR = { pro: 'Expérience professionnelle', 'school-client': 'Projet académique avec un vrai client', school: 'Projet académique' };

/** The numbered project list of llms.txt: each project's own entry, or one built from its card */
export function llmsProjectsBlock(c: Content): string {
  return visibleProjects(c, 'fr')
    .map((p, i) => {
      const entry =
        p.seo.llms?.trim() ||
        [
          `**[${p.name}](${SITE_URL}/projets/${p.id})** (${p.year}) :`,
          `   - *Type* : ${KIND_FR[p.kind]}.`,
          `   - *Description* : ${tx(p.card.summary, 'fr')}`,
          `   - *Outils* : ${p.stack.map((s) => tx(s, 'fr')).join(', ')}.`,
        ].join('\n');
      return `${i + 1}. ${entry}`;
    })
    .join('\n\n');
}

/** A public file with its placeholders filled; llms.txt also gets its project list between the markers */
export function fillDerivedFile(name: string, text: string, c: Content): string {
  let out = fillTemplate(text, c, 'fr');
  if (name === 'llms.txt') out = out.replace(/<!--projets:start-->[\s\S]*?<!--projets:end-->\n/, `${llmsProjectsBlock(c)}\n`);
  return out;
}

export const DERIVED_FILES = ['llms.txt', 'ai-catalog.json', '.well-known/ai-catalog.json', '.well-known/ard.json'];
