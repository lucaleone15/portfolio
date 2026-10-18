import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { hashPassword, totpAt } from '../../server/admin/auth';

export const TEST_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
export const TEST_PASSWORD = 'un-mot-de-passe-de-test';
export const currentCode = (now = Date.now()) => totpAt(TEST_SECRET, Math.floor(now / 30_000));

export const tmpDir = (prefix: string) => fs.mkdtempSync(path.join(os.tmpdir(), `claude-${prefix}-`));

export async function testEnv(extra: Record<string, string> = {}) {
  return {
    ADMIN_PATH: '/atelier',
    ADMIN_PASSWORD_HASH: await hashPassword(TEST_PASSWORD),
    ADMIN_TOTP_SECRET: TEST_SECRET,
    ...extra,
  } as Record<string, string | undefined>;
}

/** Serves a handler on a random port; unknown requests get "SITE404" with a 404 */
export async function serve(handler: (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void) {
  const server = http.createServer((req, res) =>
    handler(req, res, () => {
      res.statusCode = 404;
      res.end('SITE404');
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { base, close: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}

export const notFound = (_req: http.IncomingMessage, res: http.ServerResponse) => {
  res.statusCode = 404;
  res.end('SITE404');
};

/** A logged-in cookie for that server */
export async function login(base: string): Promise<string> {
  const res = await fetch(`${base}/atelier/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin': '1' },
    body: JSON.stringify({ password: TEST_PASSWORD, code: currentCode() }),
  });
  if (res.status !== 204) throw new Error(`login failed: ${res.status}`);
  return res.headers.get('set-cookie')!.split(';')[0];
}
