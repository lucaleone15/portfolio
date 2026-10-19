import { maskedOutput } from '../../server/admin/maskedOutput';

test('only the question is ever shown, never what is typed (even when the line is redrawn)', () => {
  const shown: string[] = [];
  const write = maskedOutput('Mot de passe : ', (s) => shown.push(s));
  write('Mot de passe : ');
  write('a');
  write('0');
  write('Mot de passe : a0b0'); // readline redrawing the whole line
  write('\r\n');
  expect(shown.join('')).toBe('Mot de passe : Mot de passe : \r\n');
  expect(shown.join('')).not.toContain('a0b0');
  expect(shown.join('')).not.toContain('0');
});
