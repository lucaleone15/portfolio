import { waitForPublish } from '../../src/admin/publish/PublishPanel';

test('a publish left running in the background is followed until it ends', async () => {
  const states = ['running', 'running', 'done'];
  const result = await waitForPublish(async () => ({ status: { state: states.shift() } }) as never, 1);
  expect(result).toBe('done');
});

test('a signed-out or unreachable server stops the follow instead of looping forever', async () => {
  const { ApiError } = await import('../../src/admin/api');
  expect(await waitForPublish(async () => Promise.reject(new ApiError(404, '')), 1)).toBe('unknown');
  let n = 0;
  expect(await waitForPublish(async () => (n++, Promise.reject(new TypeError('offline'))), 1, 5)).toBe('unknown');
  expect(n).toBe(5);
});
