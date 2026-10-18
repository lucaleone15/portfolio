import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BlockSchema, StoredProjectSchema } from '../../src/content/schema';
import { hashFr } from '../../src/content/txt';
import { FieldEditor } from '../../src/admin/fields/FieldEditor';

const figures = BlockSchema.options.find((o) => o.shape.type.value === 'figures')!;
const block = () => ({ type: 'figures', items: [{ value: 12, label: { fr: 'tests', en: 'tests', enOf: hashFr('tests') } }] });

function Harness({ initial, schema, lang, onValue, path = '' }: { initial: unknown; schema: any; lang: 'fr' | 'en'; onValue: (v: any) => void; path?: string }) {
  const [value, setValue] = useState(initial);
  return <FieldEditor schema={schema} value={value} lang={lang} path={path} onChange={(v) => (setValue(v), onValue(v))} />;
}

test('in French, typing changes fr and leaves enOf alone', () => {
  let last: any;
  render(<Harness initial={block()} schema={figures} lang="fr" onValue={(v) => (last = v)} />);
  fireEvent.change(screen.getByLabelText('Libellé'), { target: { value: 'tests utilisateurs' } });
  expect(last.items[0].label).toEqual({ fr: 'tests utilisateurs', en: 'tests', enOf: hashFr('tests') });
});

test('in English, typing changes en and marks it up to date with the French', () => {
  let last: any;
  const b = block();
  b.items[0].label = { fr: 'tests utilisateurs', en: 'tests', enOf: hashFr('tests') };
  render(<Harness initial={b} schema={figures} lang="en" onValue={(v) => (last = v)} />);
  expect(screen.getByText('à revoir')).toBeTruthy();
  expect(screen.getByText('tests utilisateurs')).toBeTruthy(); // the French, shown above
  fireEvent.change(screen.getByLabelText('Libellé'), { target: { value: 'user tests' } });
  expect(last.items[0].label).toEqual({ fr: 'tests utilisateurs', en: 'user tests', enOf: hashFr('tests utilisateurs') });
});

test('missing English is flagged', () => {
  const b = block();
  b.items[0].label = { fr: 'tests', en: '', enOf: undefined as unknown as string };
  render(<Harness initial={b} schema={figures} lang="en" onValue={() => {}} />);
  expect(screen.getByText('manquant')).toBeTruthy();
});

test('list items move down, and an optional field can be added', () => {
  let last: any;
  const b = block();
  b.items.push({ value: 4, label: { fr: 'écrans', en: 'screens', enOf: hashFr('écrans') } });
  render(<Harness initial={b} schema={figures} lang="fr" onValue={(v) => (last = v)} />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Descendre' })[0]);
  expect(last.items.map((i: any) => i.value)).toEqual([4, 12]);
  fireEvent.click(screen.getByRole('button', { name: 'Ajouter Source' }));
  expect(last.source).toEqual({ fr: '', en: '' });
});

test('SEO title shows its length against the 60-character limit', () => {
  const seo = StoredProjectSchema.shape.seo;
  render(<Harness initial={{ title: { fr: 'x'.repeat(61), en: '' }, description: { fr: '', en: '' } }} schema={seo} lang="fr" path="seo" onValue={() => {}} />);
  expect(screen.getByText('61 / 60')).toBeTruthy();
});
