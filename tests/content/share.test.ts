import { personalShareImage, projectShareImage } from '../../src/content/og';
import { realContent } from './fixtures';

test('each project and language gets its own share image, renamed when what it shows changes', () => {
  const c = realContent();
  const hug = c.projects.hug;
  const fr = projectShareImage(hug, 'fr', c.site);
  expect(fr).toMatch(/^\/og\/hug-fr-[0-9a-f]{8}\.jpg$/);
  expect(projectShareImage(hug, 'en', c.site)).toMatch(/^\/og\/hug-en-[0-9a-f]{8}\.jpg$/);
  expect(projectShareImage(hug, 'fr', c.site)).toBe(fr);
  const changed = structuredClone(hug);
  changed.card.hook = { fr: 'Une autre accroche', en: 'Another hook' };
  expect(projectShareImage(changed, 'fr', c.site)).not.toBe(fr);
  const unrelated = structuredClone(hug);
  unrelated.study.intro = { fr: 'Autre intro', en: 'Other intro' };
  expect(projectShareImage(unrelated, 'fr', c.site)).toBe(fr);
});

test('the personal image follows the hero texts, per language', () => {
  const c = realContent();
  const fr = personalShareImage(c.site, 'fr');
  expect(fr).toMatch(/^\/og\/luca-leone-fr-[0-9a-f]{8}\.jpg$/);
  expect(personalShareImage(c.site, 'en')).toMatch(/^\/og\/luca-leone-en-[0-9a-f]{8}\.jpg$/);
  const s = structuredClone(c.site);
  s.hero.outcomes[0] = { fr: 'sites web', en: 'websites' };
  expect(personalShareImage(s, 'fr')).not.toBe(fr);
});

test('a project without a cover uses the personal image', () => {
  const c = realContent();
  const p = { ...c.projects.hug, imageUrl: '' };
  expect(projectShareImage(p, 'fr', c.site)).toBe(personalShareImage(c.site, 'fr'));
});
