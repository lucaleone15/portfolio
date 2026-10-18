import { vi } from 'vitest';
import { adminConfigured, me } from '../../src/admin/api';

afterEach(() => vi.restoreAllMocks());

test('a page that is not the admin API does not count as signed in', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<!doctype html><html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } }));
  expect(await me()).toBe(false);
});

test('the admin API answering 204 means signed in', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
  expect(await me()).toBe(true);
});

test('without the <base> the server injects, the admin is not set up', () => {
  document.head.querySelector('base')?.remove();
  expect(adminConfigured()).toBe(false);
  const base = document.createElement('base');
  base.href = '/atelier/';
  base.dataset.admin = '';
  document.head.append(base);
  expect(adminConfigured()).toBe(true);
});
