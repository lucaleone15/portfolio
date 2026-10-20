import { fireEvent, render, screen } from '@testing-library/react';
import { HealthCard } from '../../src/admin/health/HealthCard';

const health = {
  score: 64,
  checks: [
    { id: 'seo-title', label: 'Titre Google', status: 'bad' as const, detail: 'Vide.', path: 'seo.title' },
    { id: 'cover', label: 'Couverture', status: 'ok' as const, detail: 'Ok.' },
    { id: 'alt', label: 'Textes alternatifs des images', status: 'bad' as const, count: 2, detail: '2 images.', path: 'study.sections.0.content.1.image.alt' },
  ],
};

test('the score and what to fix; a click opens the field', () => {
  const went: string[] = [];
  render(<HealthCard health={health} lang="fr" onGo={(p) => went.push(p)} google={{ title: 'Titre', url: 'luca-leone.ch › projets › hug', description: 'Desc' }} />);
  expect(screen.getByText('64')).toBeTruthy();
  expect(screen.getByText('2 points à corriger')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Santé de la page/ }));
  fireEvent.click(screen.getByRole('button', { name: /Titre Google/ }));
  expect(went).toEqual(['seo.title']);
  expect(screen.getByText('luca-leone.ch › projets › hug')).toBeTruthy();
});
