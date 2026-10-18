import { render, screen } from '@testing-library/react';
import { StatsView } from '../../src/admin/pages/StatsPage';

const stats = {
  days: 7,
  total: 120,
  previousTotal: 100,
  byDay: Array.from({ length: 7 }, (_, i) => ({ day: `2026-10-${12 + i}`, views: 10 + i })),
  projects: [{ id: 'hug', name: 'HUG', views: 40, fr: 30, en: 10 }],
  pages: [{ path: '/', label: 'Accueil', views: 50 }],
  referrers: [
    { host: '', views: 70 },
    { host: 'linkedin.com', views: 30 },
  ],
  languages: { fr: 90, en: 30 },
};

test('headline numbers, the change against the previous period, and the lists', () => {
  render(<StatsView stats={stats} />);
  expect(screen.getByText('120')).toBeTruthy();
  expect(screen.getByText('+20 %')).toBeTruthy();
  expect(screen.getByText('25 %')).toBeTruthy(); // share in English
  expect(screen.getAllByText('linkedin.com').length).toBeGreaterThan(0);
  expect(screen.getByText('Accès direct')).toBeTruthy();
  expect(screen.getByText('HUG')).toBeTruthy();
  // every bar of the daily chart has an accessible value
  expect(screen.getByRole('table', { name: 'Pages vues par jour' }).querySelectorAll('tbody tr')).toHaveLength(7);
});

test('an empty period says so', () => {
  render(<StatsView stats={{ ...stats, total: 0, previousTotal: 0, projects: [], pages: [], referrers: [], languages: { fr: 0, en: 0 }, byDay: stats.byDay.map((d) => ({ ...d, views: 0 })) }} />);
  expect(screen.getByText('Pas encore de visites sur cette période.')).toBeTruthy();
});
