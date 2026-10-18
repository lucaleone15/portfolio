import { BlockSchema, StoredProjectSchema } from '../../src/content/schema';
import { minimalProject } from './fixtures';

const t = (fr: string) => ({ fr, en: fr });


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
