import { applyTheme, nextTheme, readTheme, saveTheme } from '../../src/admin/theme';

beforeEach(() => localStorage.clear());

test('the choice cycles system → light → dark → system', () => {
  expect(nextTheme('system')).toBe('light');
  expect(nextTheme('light')).toBe('dark');
  expect(nextTheme('dark')).toBe('system');
});

test('a saved choice is applied and remembered; system follows the device', () => {
  expect(readTheme()).toBe('system');
  saveTheme('dark');
  expect(readTheme()).toBe('dark');
  applyTheme('dark', false);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  applyTheme('light', true);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  applyTheme('system', true);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});
