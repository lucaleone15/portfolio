import fs from 'node:fs';
import path from 'node:path';
import { ContentSchema, type Content } from '../../src/content/schema';

/** The real published content, read from disk (a fresh copy each call) */
export function realContent(): Content {
  const dir = path.join(process.cwd(), 'content');
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const projects = Object.fromEntries(
    fs.readdirSync(path.join(dir, 'projects')).map((f) => {
      const p = read(path.join('projects', f));
      return [p.id, p];
    }),
  );
  return ContentSchema.parse({ site: read('site.json'), index: read('projects.json'), projects });
}

/** drivegear hidden, oceansight without English */
export function testContent(): Content {
  const c = realContent();
  c.index.hidden = ['drivegear'];
  c.projects.oceansight.study.title.en = '';
  return c;
}

const t = (fr: string) => ({ fr, en: fr });

/** The smallest valid project */
export const minimalProject = () => ({
  id: 'test',
  kind: 'school',
  name: 'Test',
  number: '07',
  year: '2026',
  imageUrl: '/images/test.webp',
  stack: [t('Figma')],
  card: { subtitle: t('s'), category: t('c'), summary: t('r'), overview: t('o') },
  seo: { title: t('T'), description: t('D') },
  study: {
    kicker: t('k'),
    title: t('Titre'),
    hook: t('h'),
    intro: t('i'),
    meta: [{ label: t('Année'), value: t('2026') }],
    brief: [{ label: t('Le problème'), text: t('…') }],
    sections: [{ id: 'idee', nav: t('Idée'), title: t("L'idée"), content: [{ type: 'text', text: t('Paragraphe') }] }],
    credits: [{ name: 'Luca Leone', role: t('Tout') }],
  },
});

