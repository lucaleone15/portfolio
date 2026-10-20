import { vi } from 'vitest';

vi.mock('../../src/content/load', async () => {
  const { testContent } = await import('./fixtures');
  return { CONTENT: testContent() };
});

const { getAllRoutes, getHeadData, renderSitemap } = await import('../../src/seo');
const { visibleProjects, toCaseStudy } = await import('../../src/content/localize');
const { CONTENT } = await import('../../src/content/load');
const { canonicalPagePath } = await import('../../server/canonical');

const projectSlugs = (lang: 'fr' | 'en') =>
  getAllRoutes()
    .filter((r) => r.name === 'project' && r.lang === lang)
    .map((r) => (r as { slug: string }).slug);

test('a hidden project is nowhere', () => {
  expect(projectSlugs('fr')).not.toContain('drivegear');
  expect(projectSlugs('en')).not.toContain('drivegear');
  expect(visibleProjects(CONTENT, 'fr').map((p) => p.id)).not.toContain('drivegear');
  const sitemap = renderSitemap({ page: () => '2026-10-18', cv: '2026-10-18' });
  expect(sitemap).not.toContain('drivegear');
});

test('a project without English exists in French only', () => {
  expect(projectSlugs('fr')).toContain('oceansight');
  expect(projectSlugs('en')).not.toContain('oceansight');
  expect(toCaseStudy(CONTENT.projects.oceansight, 'en')).toBeNull();
  expect(getHeadData({ name: 'project', lang: 'fr', slug: 'oceansight' }).alternates.map((a) => a.hreflang)).toEqual(['fr', 'x-default']);
  expect(renderSitemap({ page: () => '2026-10-18', cv: '2026-10-18' })).not.toContain('/en/projects/oceansight');
});

test('renamed projects redirect from content/projects.json', () => {
  const redirects = { ancien: 'nouveau' };
  expect(canonicalPagePath('/projets/ancien', redirects)).toBe('/projets/nouveau');
  expect(canonicalPagePath('/en/projects/ancien', redirects)).toBe('/en/projects/nouveau');
  expect(canonicalPagePath('/projets/hug-sangsationnel', CONTENT.index.redirects)).toBe('/projets/hug');
  expect(canonicalPagePath('/projets/autre.html', redirects)).toBe('/projets/autre');
});

test('a project page announces its own share image with its size', async () => {
  const { getHeadData, renderHeadTags } = await import('../../src/seo');
  const tags = renderHeadTags(getHeadData({ name: 'project', lang: 'fr', slug: 'hug' }));
  expect(tags).toMatch(/<meta property="og:image" content="https:\/\/luca-leone\.ch\/og\/hug-fr-[0-9a-f]{8}\.jpg" \/>/);
  expect(tags).toContain('<meta property="og:image:width" content="1200" />');
  expect(tags).toContain('<meta property="og:image:height" content="630" />');
});
