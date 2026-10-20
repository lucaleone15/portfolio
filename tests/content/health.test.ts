import { projectHealth, siteHealth } from '../../src/content/health';
import { realContent } from './fixtures';

const statusOf = (r: ReturnType<typeof projectHealth>, id: string) => r.checks.find((c) => c.id === id)?.status;

test('a published project in good shape scores high', () => {
  const c = realContent();
  const r = projectHealth(c.projects.hug, 'fr', c);
  expect(r.score).toBeGreaterThanOrEqual(85);
  expect(statusOf(r, 'cover')).toBe('ok');
  expect(statusOf(r, 'todo')).toBe('ok');
});

test('a new project from the template is flagged where it matters, with paths to the fields', () => {
  const c = realContent();
  const p = structuredClone(c.projects.hug);
  p.seo.title = { fr: '', en: '' };
  p.seo.description = { fr: 'Trop court.', en: '' };
  p.imageUrl = '';
  p.study.intro = { fr: '[À COMPLÉTER]', en: '' };
  p.study.sections[0].content.push({ type: 'image', image: { src: '/x.webp', width: 10, height: 10, alt: { fr: '', en: '' } } });
  const r = projectHealth(p, 'fr', c);
  expect(statusOf(r, 'seo-title')).toBe('bad');
  expect(r.checks.find((x) => x.id === 'seo-title')?.path).toBe('seo.title');
  expect(statusOf(r, 'seo-description')).toBe('warn');
  expect(statusOf(r, 'cover')).toBe('bad');
  expect(r.checks.find((x) => x.id === 'todo')).toMatchObject({ status: 'bad', count: 1, path: 'study.intro' });
  expect(r.checks.find((x) => x.id === 'alt')).toMatchObject({ status: 'bad', count: 1 });
  expect(r.score).toBeLessThan(60);
});

test('two pages with the same Google title are pointed out', () => {
  const c = realContent();
  c.projects.oceansight.seo.title = { ...c.projects.hug.seo.title };
  expect(statusOf(projectHealth(c.projects.hug, 'fr', c), 'seo-unique')).toBe('warn');
});

test('in English, missing or out-of-date English counts', () => {
  const c = realContent();
  const p = structuredClone(c.projects.hug);
  p.study.hook.en = '';
  p.study.title = { ...p.study.title, fr: 'Changé' };
  const r = projectHealth(p, 'en', c);
  expect(r.checks.find((x) => x.id === 'english')).toMatchObject({ status: 'bad' });
  expect(projectHealth(p, 'fr', c).checks.find((x) => x.id === 'english')).toBeUndefined();
});

test('the site pages are checked too (Google titles and descriptions of each page)', () => {
  const c = realContent();
  c.site.seo.contact.title = { fr: 'x'.repeat(80), en: c.site.seo.contact.title.en };
  const r = siteHealth(c.site, 'fr', c);
  expect(r.checks.find((x) => x.id === 'seo-title-contact')).toMatchObject({ status: 'warn', path: 'seo.contact.title' });
});
