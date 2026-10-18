import { computeStats } from '../../server/stats';

const NOW = Date.parse('2026-10-18T12:00:00Z');
const at = (daysAgo: number, p: string, r = '') => ({ t: new Date(NOW - daysAgo * 86_400_000).toISOString(), p, r });
const names = { hug: 'HUG', oceansight: 'OceanSight' };

const hits = [
  at(0, '/'),
  at(0, '/projets/hug', 'linkedin.com'),
  at(1, '/en/projects/hug', 'linkedin.com'),
  at(2, '/projets/oceansight'),
  at(6, '/en/'),
  at(8, '/'), // previous period
  at(9, '/projets/hug'),
  at(40, '/'), // out of range
];

test('a 7-day range: totals, the previous period, every day filled', () => {
  const s = computeStats(hits, { days: 7, now: NOW, projectNames: names });
  expect(s.total).toBe(5);
  expect(s.previousTotal).toBe(2);
  expect(s.byDay).toHaveLength(7);
  expect(s.byDay.at(-1)).toEqual({ day: '2026-10-18', views: 2 });
  expect(s.byDay.reduce((n, d) => n + d.views, 0)).toBe(5);
});

test('projects add up both languages, named from the content', () => {
  const s = computeStats(hits, { days: 7, now: NOW, projectNames: names });
  expect(s.projects).toEqual([
    { id: 'hug', name: 'HUG', views: 2, fr: 1, en: 1 },
    { id: 'oceansight', name: 'OceanSight', views: 1, fr: 1, en: 0 },
  ]);
});

test('languages, referrers and page labels', () => {
  const s = computeStats(hits, { days: 7, now: NOW, projectNames: names });
  expect(s.languages).toEqual({ fr: 3, en: 2 });
  expect(s.referrers).toEqual([{ host: '', views: 3 }, { host: 'linkedin.com', views: 2 }]);
  expect(s.referrers.find((r) => r.host === '')?.views).toBe(3);
  expect(s.pages.find((p) => p.path === '/')?.label).toBe('Accueil');
  expect(s.pages.find((p) => p.path === '/projets/hug')?.label).toBe('Projet · HUG');
  expect(s.pages.find((p) => p.path === '/en/')?.label).toBe('Accueil (EN)');
});
