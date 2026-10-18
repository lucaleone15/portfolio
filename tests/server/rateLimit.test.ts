import { createLoginLimiter } from '../../server/admin/rateLimit';

const MIN = 60_000;
let clock = 0;
const limiter = () => createLoginLimiter({ now: () => clock });

test('5 failures from one IP lock it for 15 minutes', () => {
  const l = limiter();
  for (let i = 0; i < 4; i++) l.fail('1.1.1.1');
  expect(l.retryAfterMs('1.1.1.1')).toBe(0);
  l.fail('1.1.1.1');
  expect(l.retryAfterMs('1.1.1.1')).toBeGreaterThan(14 * MIN);
  expect(l.retryAfterMs('2.2.2.2')).toBe(0);
  clock += 15 * MIN + 1;
  expect(l.retryAfterMs('1.1.1.1')).toBe(0);
});

test('20 failures in an hour lock everyone', () => {
  const l = limiter();
  for (let i = 0; i < 20; i++) l.fail(`10.0.0.${i % 4}`);
  expect(l.retryAfterMs('9.9.9.9')).toBeGreaterThan(59 * MIN);
});

test('a success clears the IP', () => {
  const l = limiter();
  for (let i = 0; i < 4; i++) l.fail('3.3.3.3');
  l.succeed('3.3.3.3');
  l.fail('3.3.3.3');
  expect(l.retryAfterMs('3.3.3.3')).toBe(0);
});
