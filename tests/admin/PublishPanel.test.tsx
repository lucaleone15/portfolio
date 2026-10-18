import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PublishPanel, type PublishApi } from '../../src/admin/publish/PublishPanel';
import { realContent } from '../content/fixtures';

const summary = (extra: object = {}) => ({
  status: { state: 'idle' },
  changed: [{ ref: 'project:hug', label: 'HUG' }],
  stale: [
    { ref: 'project:hug', path: 'study.title', fr: 'Les HUG mènent l’enquête' },
    { ref: 'project:hug', path: 'study.hook', fr: 'Sur dix inscrits…' },
  ],
  missingEn: [],
  ...extra,
});

function fakeApi(after: object): PublishApi & { calls: string[] } {
  const calls: string[] = [];
  let started = false;
  return {
    calls,
    getPublish: async () => {
      calls.push('get');
      return (started ? { ...summary(), status: after } : summary()) as never;
    },
    startPublish: async () => {
      calls.push('start');
      started = true;
      return { state: 'running', step: 'pull' } as never;
    },
    resolveConflict: async (ref, keep) => void calls.push(`resolve ${ref} ${keep}`),
  };
}

const renderPanel = (api: PublishApi, flush = async () => {}, navigate = (_: string) => {}) =>
  render(<PublishPanel api={api} flush={flush} navigate={navigate} content={realContent()} onClose={() => {}} onPublished={() => {}} pollMs={10} />);

test('pending saves are sent before the summary is asked for', async () => {
  const order: string[] = [];
  const api = fakeApi({ state: 'done' });
  const get = api.getPublish;
  api.getPublish = async () => (order.push('get'), get());
  renderPanel(api, async () => void order.push('flush'));
  await screen.findByText('HUG');
  expect(order.slice(0, 2)).toEqual(['flush', 'get']);
});

test('out-of-date English is listed, linked, and the button says so', async () => {
  const went: string[] = [];
  renderPanel(fakeApi({ state: 'done' }), undefined, (to) => went.push(to));
  expect(await screen.findByText('2 textes anglais pas à jour')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Publier quand même' })).toBeTruthy();
  fireEvent.click(screen.getByText('Les HUG mènent l’enquête'));
  expect(went).toEqual(['/projets/hug?lang=en&path=study.title']);
});

test('a conflict offers both versions page by page', async () => {
  const api = fakeApi({ state: 'failed', error: { code: 'conflict', pages: ['project:hug'] } });
  renderPanel(api);
  fireEvent.click(await screen.findByRole('button', { name: 'Publier quand même' }));
  expect(await screen.findByText('Ces pages ont aussi été modifiées ailleurs :')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Garder mon brouillon' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Garder la version du dépôt' }));
  await waitFor(() => expect(api.calls).toContain('resolve project:hug repo'));
});

test('a failed build says the live site did not change', async () => {
  renderPanel(fakeApi({ state: 'failed', error: { code: 'build-failed', log: 'boom' } }));
  fireEvent.click(await screen.findByRole('button', { name: 'Publier quand même' }));
  expect(await screen.findByText('La construction du site a échoué. Le site en ligne n’a pas changé.')).toBeTruthy();
});

test('success shows it is live', async () => {
  renderPanel(fakeApi({ state: 'done', published: ['project:hug'] }));
  fireEvent.click(await screen.findByRole('button', { name: 'Publier quand même' }));
  expect(await screen.findByText('C’est en ligne.')).toBeTruthy();
});

test('a progress check that fails is retried instead of hanging on "running"', async () => {
  const api = fakeApi({ state: 'done', published: ['project:hug'] });
  const get = api.getPublish;
  let failOnce = true;
  api.getPublish = async () => {
    if (api.calls.includes('start') && failOnce) {
      failOnce = false;
      throw new TypeError('Failed to fetch');
    }
    return get();
  };
  renderPanel(api);
  fireEvent.click(await screen.findByRole('button', { name: 'Publier quand même' }));
  expect(await screen.findByText('C’est en ligne.')).toBeTruthy();
});

test('the whole draft can be thrown away, after a confirmation', async () => {
  const api = fakeApi({ state: 'done' });
  const discarded: string[] = [];
  api.discard = async () => void discarded.push('yes');
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  renderPanel(api);
  fireEvent.click(await screen.findByRole('button', { name: 'Annuler toutes les modifications' }));
  await waitFor(() => expect(discarded).toEqual(['yes']));
  expect(confirm).toHaveBeenCalled();
  confirm.mockRestore();
});

test('a failed discard is reported, not swallowed', async () => {
  const api = fakeApi({ state: 'done' });
  api.discard = async () => {
    throw new Error('offline');
  };
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
  renderPanel(api);
  fireEvent.click(await screen.findByRole('button', { name: 'Annuler toutes les modifications' }));
  expect(await screen.findByText('Le brouillon n’a pas pu être annulé. Réessaie.')).toBeTruthy();
  confirm.mockRestore();
});
