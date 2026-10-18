import { waitForPublish } from '../../src/admin/publish/PublishPanel';

test('a publish left running in the background is followed until it ends', async () => {
  const states = ['running', 'running', 'done'];
  const result = await waitForPublish(async () => ({ status: { state: states.shift() } }) as never, 1);
  expect(result).toBe('done');
});
