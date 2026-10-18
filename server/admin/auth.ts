import crypto from 'node:crypto';

/**
 * Admin sign-in: a password (scrypt hash in .env, ADMIN_PASSWORD_HASH) and a 6-digit code from
 * an authenticator app (TOTP, RFC 6238; base32 secret in .env, ADMIN_TOTP_SECRET).
 */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

const scrypt = (pw: string, salt: Buffer, N: number, r: number, p: number, keylen: number) =>
  new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(pw, salt, keylen, { N, r, p, maxmem: 256 * N * r }, (err, key) => (err ? reject(err) : resolve(key))),
  );

/** "scrypt$N$r$p$<salt b64>$<hash b64>" */
export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(pw, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p, SCRYPT.keylen);
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [algo, N, r, p, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  try {
    const key = await scrypt(pw, Buffer.from(salt, 'base64'), Number(N), Number(r), Number(p), expected.length);
    return crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** RFC 4648 base32, no padding */
export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('invalid base32');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** The 6-digit code of a 30-second step (HMAC-SHA1) */
export function totpAt(secretB32: string, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = crypto.createHmac('sha1', base32Decode(secretB32)).update(msg).digest();
  const offset = mac[mac.length - 1] & 15;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

/**
 * The step a code belongs to (the current one, or one step either side for clock drift), or
 * null. A step at or before `lastCounter` is refused: each code works once.
 */
export function verifyTotp(secretB32: string, code: string, nowMs: number, lastCounter: number | null): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const now = Math.floor(nowMs / 30_000);
  for (const counter of [now - 1, now, now + 1]) {
    if (lastCounter !== null && counter <= lastCounter) continue;
    if (crypto.timingSafeEqual(Buffer.from(totpAt(secretB32, counter)), Buffer.from(code))) return counter;
  }
  return null;
}
