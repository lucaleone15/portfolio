import { BlockSchema, StoredProjectSchema } from '../../src/content/schema';

const t = (fr: string) => ({ fr, en: fr });

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

test('a minimal project is valid', () => {
  expect(() => StoredProjectSchema.parse(minimalProject())).not.toThrow();
});

test('a project id must be a URL slug', () => {
  expect(StoredProjectSchema.safeParse({ ...minimalProject(), id: 'Hug Projet' }).success).toBe(false);
});

test('a figures block needs numeric values', () => {
  expect(BlockSchema.safeParse({ type: 'figures', items: [{ value: 'x' }] }).success).toBe(false);
  expect(BlockSchema.safeParse({ type: 'figures', items: [{ value: 12, label: t('tests') }] }).success).toBe(true);
});
