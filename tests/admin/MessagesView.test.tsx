import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MessagesView, type MessagesApi } from '../../src/admin/pages/MessagesPage';

const msg = (id: string, status: string, name: string, receivedAt = '2026-10-18T09:00:00Z') => ({
  id, status, name, receivedAt, email: `${id}@example.com`, subject: 'Stage / emploi', message: 'Bonjour,\nje vous écris…', lang: 'fr', page: '/contact', emailed: true,
});

function fakeApi(initial: ReturnType<typeof msg>[]): MessagesApi & { calls: string[] } {
  let list = [...initial];
  const calls: string[] = [];
  return {
    calls,
    list: async () => ({ messages: list as never, unread: list.filter((m) => m.status === 'new').length }),
    setStatus: async (id, status) => {
      calls.push(`${id}:${status}`);
      list = list.map((m) => (m.id === id ? { ...m, status } : m));
    },
    remove: async (id) => {
      calls.push(`delete ${id}`);
      list = list.filter((m) => m.id !== id);
    },
  };
}

test('the inbox lists messages, opening one marks it read', async () => {
  const api = fakeApi([msg('a', 'new', 'Camille'), msg('b', 'archived', 'Noé')]);
  render(<MessagesView api={api} onUnread={() => {}} />);
  fireEvent.click(await screen.findByText('Camille'));
  expect(screen.queryByText('Noé')).toBeNull(); // archived ones are in their own tab
  await waitFor(() => expect(api.calls).toContain('a:read'));
  expect(screen.getByRole('link', { name: /Répondre/ }).getAttribute('href')).toMatch(/^mailto:a@example\.com\?subject=/);
});

test('archive and the archived tab', async () => {
  const api = fakeApi([msg('a', 'read', 'Camille')]);
  render(<MessagesView api={api} onUnread={() => {}} />);
  fireEvent.click(await screen.findByText('Camille'));
  fireEvent.click(screen.getByRole('button', { name: 'Archiver' }));
  await waitFor(() => expect(api.calls).toContain('a:archived'));
  fireEvent.click(screen.getByRole('tab', { name: /Archivés/ }));
  expect(await screen.findByText('Camille')).toBeTruthy();
});

test('an empty inbox says so', async () => {
  render(<MessagesView api={fakeApi([])} onUnread={() => {}} />);
  expect(await screen.findByText('Aucun message pour l’instant.')).toBeTruthy();
});
