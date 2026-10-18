import { base32Decode, base32Encode, hashPassword, totpAt, verifyPassword, verifyTotp } from '../../server/admin/auth';

// RFC 6238, appendix B (SHA-1): the ASCII secret "12345678901234567890"
const SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

test('base32 round trip', () => {
  expect(base32Encode(Buffer.from('12345678901234567890'))).toBe(SECRET);
  expect(base32Decode(SECRET).toString()).toBe('12345678901234567890');
});

test('TOTP matches the RFC 6238 test vectors (6 digits)', () => {
  expect(totpAt(SECRET, Math.floor(59 / 30))).toBe('287082');
  expect(totpAt(SECRET, Math.floor(1111111109 / 30))).toBe('081804');
});

test('a code is accepted one step late, not two, and only once', () => {
  const now = 1_111_111_109_000;
  const step = Math.floor(now / 30_000);
  expect(verifyTotp(SECRET, totpAt(SECRET, step - 1), now, null)).toBe(step - 1);
  expect(verifyTotp(SECRET, totpAt(SECRET, step - 2), now, null)).toBeNull();
  expect(verifyTotp(SECRET, totpAt(SECRET, step), now, step)).toBeNull();
  expect(verifyTotp(SECRET, 'abcdef', now, null)).toBeNull();
});

test('password hash round trip', async () => {
  const stored = await hashPassword('correct horse');
  expect(stored).toMatch(/^scrypt\$16384\$8\$1\$/);
  expect(await verifyPassword('correct horse', stored)).toBe(true);
  expect(await verifyPassword('wrong', stored)).toBe(false);
  expect(await verifyPassword('x', 'garbage')).toBe(false);
});
