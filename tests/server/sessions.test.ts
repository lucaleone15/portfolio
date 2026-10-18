import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createSessionStore } from '../../server/admin/sessions';

const DAY = 86_400_000;
let file: string;
let clock: number;
const store = () => createSessionStore(file, { idleMs: 7 * DAY, maxMs: 30 * DAY, now: () => clock });

beforeEach(() => {
  file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'claude-sessions-')), 'sessions.json');
  clock = 1_000_000;
});

test('a session expires after 7 idle days', () => {
  const s = store();
  const token = s.create();
  clock += 6 * DAY;
  expect(s.check(token)).toBe(true);
  clock += 6 * DAY; // 6 days after the last check
  expect(s.check(token)).toBe(true);
  clock += 7 * DAY + 1;
  expect(s.check(token)).toBe(false);
});

test('a session expires after 30 days even when used', () => {
  const s = store();
  const token = s.create();
  for (let d = 0; d < 30; d += 5) {
    clock += 5 * DAY;
    s.check(token);
  }
  clock += 1;
  expect(s.check(token)).toBe(false);
});

test('destroy ends it, the file never holds the token, and it survives a restart', () => {
  const token = store().create();
  expect(fs.readFileSync(file, 'utf8')).not.toContain(token);
  expect(store().check(token)).toBe(true);
  store().destroy(token);
  expect(store().check(token)).toBe(false);
  expect(store().check('nope')).toBe(false);
});
