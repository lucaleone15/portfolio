import { projectShareImage } from '../../src/content/og';
import { realContent } from './fixtures';

test('each project and language gets its own share image, renamed when what it shows changes', () => {
  const c = realContent();
  const hug = c.projects.hug;
  const fr = projectShareImage(hug, 'fr');
  expect(fr).toMatch(/^\/og\/hug-fr-[0-9a-f]{8}\.jpg$/);
  expect(projectShareImage(hug, 'en')).toMatch(/^\/og\/hug-en-[0-9a-f]{8}\.jpg$/);
  expect(projectShareImage(hug, 'fr')).toBe(fr);
  const changed = structuredClone(hug);
  changed.card.hook = { fr: 'Une autre accroche', en: 'Another hook' };
  expect(projectShareImage(changed, 'fr')).not.toBe(fr);
  const unrelated = structuredClone(hug);
  unrelated.study.intro = { fr: 'Autre intro', en: 'Other intro' };
  expect(projectShareImage(unrelated, 'fr')).toBe(fr);
});

test('a project without a cover falls back to the personal image', () => {
  const c = realContent();
  const p = { ...c.projects.hug, imageUrl: '' };
  expect(projectShareImage(p, 'fr')).toBe('/og-image.jpg');
});
