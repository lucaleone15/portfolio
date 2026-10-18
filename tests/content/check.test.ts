import { vi } from 'vitest';

test('the published content passes the build-time check', async () => {
  const { checkContent } = await import('../../src/content/check');
  expect(() => checkContent()).not.toThrow();
});

test('a broken content file stops the build with its path', async () => {
  vi.resetModules();
  vi.doMock('../../src/content/load', async () => {
    const { realContent } = await import('./fixtures');
    const c = realContent() as any;
    c.projects.hug.kind = 'nope';
    return { CONTENT: c };
  });
  const { checkContent } = await import('../../src/content/check');
  expect(() => checkContent()).toThrow(/projects\.hug\.kind/);
  vi.doUnmock('../../src/content/load');
});
