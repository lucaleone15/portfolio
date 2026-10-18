import { vi } from 'vitest';
import { ApiError } from '../../src/admin/api';
import { createDraftClient, type DraftApi } from '../../src/admin/store';
import { realContent } from '../content/fixtures';

function fakeApi(): DraftApi & { saves: { ref: string; revision: number; keepalive?: boolean }[]; fail: unknown[] } {
  const content = realContent();
  const revisions: Record<string, number> = { site: 0, index: 0, 'project:hug': 0 };
  const api = {
    saves: [] as { ref: string; revision: number; keepalive?: boolean }[],
    fail: [] as unknown[],
    getContent: async () => ({ content, revisions: { ...revisions }, changed: [], baseCommit: 'abc', stale: [], missingEn: [] }),
    savePage: async (ref: string, _data: unknown, revision: number, opts?: { keepalive?: boolean }) => {
      api.saves.push({ ref, revision, keepalive: opts?.keepalive });
      const err = api.fail.shift();
      if (err) throw err;
      return { revision: revision + 1 };
    },
  };
  return api;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('two edits within the debounce make one save', async () => {
  const api = fakeApi();
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'HUG 1'));
  await vi.advanceTimersByTimeAsync(500);
  store.update('project:hug', (p) => void (p.name = 'HUG 2'));
  await vi.advanceTimersByTimeAsync(900);
  expect(api.saves).toEqual([{ ref: 'project:hug', revision: 0, keepalive: undefined }]);
  expect(store.getState().saveState).toBe('saved');
  expect(store.getState().content.projects.hug.name).toBe('HUG 2');
});

test('offline: shown, retried 3 s later, then saved', async () => {
  const api = fakeApi();
  api.fail.push(new TypeError('Failed to fetch'));
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'Hors ligne'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('offline');
  await vi.advanceTimersByTimeAsync(3100);
  expect(api.saves).toHaveLength(2);
  expect(store.getState().saveState).toBe('saved');
});

test('signed out: edits are kept and sent after signing in again', async () => {
  const api = fakeApi();
  api.fail.push(new ApiError(404, 'SITE404'));
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'Gardé'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('signedOut');
  expect([...store.getState().pending]).toEqual(['project:hug']);
  await vi.advanceTimersByTimeAsync(10_000);
  expect(api.saves).toHaveLength(1);
  await store.resumeAfterLogin();
  expect(api.saves).toHaveLength(2);
  expect(store.getState().saveState).toBe('saved');
});

test('saved elsewhere first: conflict', async () => {
  const api = fakeApi();
  api.fail.push(new ApiError(409, { error: 'stale' }));
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'X'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('conflict');
});

test('leaving the page sends pending saves with keepalive', async () => {
  const api = fakeApi();
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'Vite'));
  window.dispatchEvent(new Event('pagehide'));
  await vi.advanceTimersByTimeAsync(0);
  expect(api.saves).toEqual([{ ref: 'project:hug', revision: 0, keepalive: true }]);
  store.dispose();
});

test('the English to do follows the edits', async () => {
  const api = fakeApi();
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.study.title.fr = 'Un autre titre'));
  expect(store.getState().stale).toContainEqual({ ref: 'project:hug', path: 'study.title', fr: 'Un autre titre' });
});

test('a server error (5xx) is retried like a network failure, not shown as a lasting error', async () => {
  const api = fakeApi();
  api.fail.push(new ApiError(503, 'restarting'));
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'X'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('offline');
  await vi.advanceTimersByTimeAsync(3100);
  expect(store.getState().saveState).toBe('saved');
});

test('a refused save (422) clears once the page saves again', async () => {
  const api = fakeApi();
  api.fail.push(new ApiError(422, { issues: [] }));
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'X'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('invalid');
  store.update('project:hug', (p) => void (p.name = 'Y'));
  await vi.advanceTimersByTimeAsync(900);
  expect(store.getState().saveState).toBe('saved');
});

test('leaving while a save is in flight still sends the latest edit, one revision ahead', async () => {
  const api = fakeApi();
  let release!: () => void;
  const slow = api.savePage;
  let first = true;
  api.savePage = async (...args) => {
    if (first) {
      first = false;
      await new Promise<void>((r) => (release = r));
    }
    return slow(...args);
  };
  const store = createDraftClient(api, { debounceMs: 800, retryMs: 3000 });
  await store.load();
  store.update('project:hug', (p) => void (p.name = 'Un'));
  await vi.advanceTimersByTimeAsync(900); // first save starts and hangs
  store.update('project:hug', (p) => void (p.name = 'Deux'));
  window.dispatchEvent(new Event('pagehide'));
  await vi.advanceTimersByTimeAsync(0);
  expect(api.saves.at(-1)).toEqual({ ref: 'project:hug', revision: 1, keepalive: true });
  release();
  store.dispose();
});

test('signing out sends pending edits first', async () => {
  const { signOutAfterSaving } = await import('../../src/admin/store');
  const order: string[] = [];
  await signOutAfterSaving({ flush: async () => void order.push('flush') }, async () => void order.push('logout'));
  expect(order).toEqual(['flush', 'logout']);
});
