import { hashFr, isMissingEn, isStale, setEn, setFr, tx } from '../../src/content/txt';

test('hashFr is stable and short', () => {
  expect(hashFr('Bonjour')).toBe(hashFr('Bonjour'));
  expect(hashFr('a')).toMatch(/^[0-9a-f]{8}$/);
  expect(hashFr('a')).not.toBe(hashFr('b'));
});

test('editing FR after EN makes EN stale', () => {
  const t = setEn({ fr: 'Salut', en: '' }, 'Hi');
  expect(isStale(t)).toBe(false);
  expect(isStale(setFr(t, 'Bonjour'))).toBe(true);
});

test('missing EN is not stale, it is missing', () => {
  const t = { fr: 'Salut', en: '' };
  expect(isMissingEn(t)).toBe(true);
  expect(isStale(t)).toBe(false);
});

test('tx picks the language', () => {
  expect(tx({ fr: 'a', en: 'b' }, 'en')).toBe('b');
  expect(tx({ fr: 'a', en: 'b' }, 'fr')).toBe('a');
});
