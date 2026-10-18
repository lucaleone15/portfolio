// One-shot: writes content/*.json from the TypeScript data (src/data, the components' constants).
// French and English are walked side by side along the content schema: where the schema has a
// Txt they become { fr, en, enOf }, everywhere else both languages must hold the same value.
// Any difference in structure is listed and stops the script.
// Run: npx tsx@4.19.2 scripts/migrate-content.ts   (deleted once the migration is done)
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ProjectsIndexSchema, SiteSchema, StoredProjectSchema, TxtSchema } from '../src/content/schema';
import { hashFr } from '../src/content/txt';
import { getCaseStudy } from '../src/data/caseStudies';
import {
  EDUCATION_TIMELINE,
  EDUCATION_TIMELINE_EN,
  EXPERIENCE_TIMELINE,
  EXPERIENCE_TIMELINE_EN,
  LANGUAGES,
  UNIFIED_PROJECTS,
  USER_INFO,
} from '../src/data/portfolioData';
import { META } from '../src/seo';
import { OUTCOMES } from '../src/components/Hero';
import { SKILLS_DATA } from '../src/components/SkillsSection';
import { translations } from '../src/context/LanguageContext';

const problems: string[] = [];

function zip(schema: z.ZodTypeAny, fr: unknown, en: unknown, at: string): unknown {
  if (schema === TxtSchema || (schema instanceof z.ZodObject && schema.shape === TxtSchema.shape)) {
    if (typeof fr !== 'string' || typeof en !== 'string') {
      problems.push(`${at}: expected text in both languages (fr: ${typeof fr}, en: ${typeof en})`);
      return undefined;
    }
    return { fr, en, enOf: hashFr(fr) };
  }
  if (schema instanceof z.ZodOptional) {
    if (fr === undefined && en === undefined) return undefined;
    if (fr === undefined || en === undefined) {
      problems.push(`${at}: present in ${fr === undefined ? 'en' : 'fr'} only`);
      return undefined;
    }
    return zip(schema.unwrap(), fr, en, at);
  }
  if (schema instanceof z.ZodArray || schema instanceof z.ZodTuple) {
    if (!Array.isArray(fr) || !Array.isArray(en) || fr.length !== en.length) {
      problems.push(`${at}: lists differ (fr ${Array.isArray(fr) ? fr.length : typeof fr}, en ${Array.isArray(en) ? en.length : typeof en})`);
      return undefined;
    }
    return fr.map((item, i) =>
      zip(schema instanceof z.ZodArray ? schema.element : (schema as z.ZodTuple).items[i], item, en[i], `${at}.${i}`),
    );
  }
  if (schema instanceof z.ZodDiscriminatedUnion) {
    const type = (fr as { type: string }).type;
    if (type !== (en as { type: string }).type) {
      problems.push(`${at}: block type ${type} vs ${(en as { type: string }).type}`);
      return undefined;
    }
    return zip(schema.optionsMap.get(type)!, fr, en, at);
  }
  if (schema instanceof z.ZodObject) {
    const out: Record<string, unknown> = {};
    const known = Object.keys(schema.shape);
    for (const key of new Set([...Object.keys(fr as object), ...Object.keys(en as object)])) {
      const a = (fr as Record<string, unknown>)[key];
      const b = (en as Record<string, unknown>)[key];
      if (!known.includes(key)) {
        if (a !== undefined || b !== undefined) problems.push(`${at}.${key}: not in the schema`);
        continue;
      }
    }
    for (const key of known) {
      const v = zip(schema.shape[key], (fr as Record<string, unknown>)[key], (en as Record<string, unknown>)[key], `${at}.${key}`);
      if (v !== undefined) out[key] = v;
    }
    return out;
  }
  if (schema instanceof z.ZodRecord) {
    return Object.fromEntries(
      Object.keys(fr as object).map((key) => [key, zip(schema.valueSchema, (fr as never)[key], (en as never)[key], `${at}.${key}`)]),
    );
  }
  // Shared value (string, number, boolean, enum, literal…): the same in both languages
  if (JSON.stringify(fr) !== JSON.stringify(en)) problems.push(`${at}: shared value differs (fr ${JSON.stringify(fr)}, en ${JSON.stringify(en)})`);
  return fr;
}

/** Paragraphs become { type: 'text' } blocks */
const withTextBlocks = <T extends { sections: { content: unknown[] }[] }>(study: T): T => ({
  ...study,
  sections: study.sections.map((s) => ({ ...s, content: s.content.map((c) => (typeof c === 'string' ? { type: 'text', text: c } : c)) })),
});

const projectIn = (item: (typeof UNIFIED_PROJECTS)[number], lang: 'fr' | 'en') => ({
  id: item.id,
  kind: item.kind,
  name: item.name,
  number: item.number,
  year: item.year,
  imageUrl: item.imageUrl,
  stack: lang === 'fr' ? item.stack : item.stackEn,
  accentColor: item.accentColor,
  accentColorDark: item.accentColorDark,
  logo: item.logo,
  video: item.video,
  card: item[lang],
  seo: META[item.id][lang],
  study: withTextBlocks(getCaseStudy(item.id, lang)!),
});

const HERO = {
  fr: {
    eyebrow: 'Étudiant en ingénierie des médias · HEIG-VD',
    headline: { before: 'Je transforme des', accent: 'idées', joiner: 'en' },
    lead: 'De A à Z, avec une approche qui allie créativité et technique : contenus, réseaux sociaux, identité visuelle, UI/UX et développement web.',
    availability: { before: 'Je cherche actuellement une entreprise pour réaliser mon ', link: 'travail de Bachelor', after: '.' },
  },
  en: {
    eyebrow: 'Media Engineering student · HEIG-VD',
    headline: { before: 'I turn', accent: 'ideas', joiner: 'into' },
    lead: 'End to end, with an approach that blends creativity and technique: content, social media, visual identity, UI/UX and web development.',
    availability: { before: "I'm currently looking for a company to host my ", link: 'Bachelor thesis', after: '.' },
  },
};
const PASSIONS = { fr: ['Automobile', 'Sport', 'Voyage', 'Technologies'], en: ['Automotive', 'Sports', 'Travel', 'Technology'] };
const PAGES = ['home', 'projets', 'a-propos', 'contact', 'privacy', 'notfound'];

const siteIn = (lang: 'fr' | 'en') => ({
  contact: USER_INFO,
  hero: { ...HERO[lang], outcomes: OUTCOMES[lang] },
  about: {
    bio: (translations[lang] as Record<string, string>)['about.bio'],
    languages: LANGUAGES[lang],
    passions: PASSIONS[lang],
    education: lang === 'fr' ? EDUCATION_TIMELINE : EDUCATION_TIMELINE_EN,
    experience: lang === 'fr' ? EXPERIENCE_TIMELINE : EXPERIENCE_TIMELINE_EN,
  },
  skills: SKILLS_DATA.map((s) => ({
    id: s.id,
    number: s.number,
    title: lang === 'fr' ? s.titleFr : s.titleEn,
    desc: lang === 'fr' ? s.descFr : s.descEn,
    tools: lang === 'fr' ? s.tools : s.toolsEn,
  })),
  seo: Object.fromEntries(PAGES.map((p) => [p, META[p][lang]])),
});

const out = path.join(process.cwd(), 'content');
const write = (file: string, data: unknown) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

const site = zip(SiteSchema, siteIn('fr'), siteIn('en'), 'site');
const projects = UNIFIED_PROJECTS.map((item) => zip(StoredProjectSchema, projectIn(item, 'fr'), projectIn(item, 'en'), item.id));

if (problems.length) {
  console.error(`${problems.length} difference(s) between French and English:\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}

write(path.join(out, 'site.json'), SiteSchema.parse(site));
for (const p of projects) {
  const project = StoredProjectSchema.parse(p);
  write(path.join(out, 'projects', `${project.id}.json`), project);
}
write(
  path.join(out, 'projects.json'),
  ProjectsIndexSchema.parse({ order: UNIFIED_PROJECTS.map((p) => p.id), hidden: [], redirects: { 'hug-sangsationnel': 'hug' } }),
);
console.log(`wrote content/site.json, content/projects.json and ${projects.length} projects`);
