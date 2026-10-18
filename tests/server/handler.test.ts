import fs from 'node:fs';
import path from 'node:path';
import { createAdminHandler } from '../../server/admin/handler';
import { currentCode, notFound, serve, testEnv, tmpDir, TEST_PASSWORD } from './helpers';

let srv: Awaited<ReturnType<typeof serve>>;
let distAdmin: string;

async function start(env?: Record<string, string | undefined>) {
  const dataDir = tmpDir('data');
  distAdmin = tmpDir('dist-admin');
  fs.writeFileSync(path.join(distAdmin, 'admin.html'), '<!doctype html><html><head><title>Atelier</title></head><body></body></html>');
  fs.mkdirSync(path.join(distAdmin, 'assets'));
  fs.writeFileSync(path.join(distAdmin, 'assets', 'app.js'), 'console.log(1)');
  const handler = createAdminHandler(env ?? (await testEnv()), { dataDir, repoRoot: tmpDir('repo'), distAdmin, notFound, onPublished: () => {} });
  srv = await serve(handler);
}
afterEach(() => srv?.close());

const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(srv.base + url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin': '1', ...headers }, body: JSON.stringify(body) });

test('without ADMIN_PATH the admin does not exist', async () => {
  await start({});
  const res = await fetch(`${srv.base}/atelier/`);
  expect(res.status).toBe(404);
  expect(await res.text()).toBe('SITE404');
});

test('an API call without a session gets the site 404, and every admin response is noindex', async () => {
  await start();
  const res = await fetch(`${srv.base}/atelier/api/content`);
  expect(res.status).toBe(404);
  expect(await res.text()).toBe('SITE404');
  expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
});

test('the page is served with its base, and its assets', async () => {
  await start();
  expect((await fetch(`${srv.base}/atelier`, { redirect: 'manual' })).status).toBe(301);
  const page = await fetch(`${srv.base}/atelier/projets/hug`);
  expect(page.status).toBe(200);
  expect(await page.text()).toContain('<base href="/atelier/">');
  expect(await (await fetch(`${srv.base}/atelier/assets/app.js`)).text()).toBe('console.log(1)');
  expect((await fetch(`${srv.base}/atelier/assets/..%2f..%2fadmin.html`)).status).toBe(404);
});

test('signing in with the right code gives an HttpOnly cookie that opens the API', async () => {
  await start();
  const res = await post('/atelier/api/login', { password: TEST_PASSWORD, code: currentCode() });
  expect(res.status).toBe(204);
  const cookie = res.headers.get('set-cookie')!;
  expect(cookie).toMatch(/^ll_admin=[\w-]+;/);
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('SameSite=Strict');
  expect(cookie).toContain('Path=/atelier');
  const me = await fetch(`${srv.base}/atelier/api/me`, { headers: { Cookie: cookie.split(';')[0] } });
  expect(me.status).toBe(204);
});

test('wrong codes: 401, then 429 after five', async () => {
  await start();
  for (let i = 0; i < 5; i++) expect((await post('/atelier/api/login', { password: TEST_PASSWORD, code: '000000' })).status).toBe(401);
  const locked = await post('/atelier/api/login', { password: TEST_PASSWORD, code: currentCode() });
  expect(locked.status).toBe(429);
  expect((await locked.json()).retryAfter).toBeGreaterThan(0);
});

test('a mutation without X-Admin is refused', async () => {
  await start();
  const res = await fetch(`${srv.base}/atelier/api/logout`, { method: 'POST' });
  expect(res.status).toBe(403);
});
