import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createAdminRoutes } from '../../server/admin/routes';
import { minimalProject, realContent } from '../content/fixtures';
import { login, notFound, serve, testEnv, tmpDir } from './helpers';

let srv: Awaited<ReturnType<typeof serve>>;
let cookie: string;

beforeEach(async () => {
  const repo = tmpDir('repo');
  const put = (rel: string, data: unknown) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), JSON.stringify(data, null, 2) + '\n');
  };
  const c = realContent();
  put('content/site.json', c.site);
  put('content/projects.json', { order: ['a'], hidden: [], redirects: {} });
  put('content/projects/a.json', { ...minimalProject(), id: 'a' });
  execFileSync('git', ['init', '-q'], { cwd: repo });
  srv = await serve(createAdminRoutes(await testEnv(), { dataDir: tmpDir('data'), repoRoot: repo, distAdmin: tmpDir('da'), notFound, onPublished: () => {} }));
  cookie = await login(srv.base);
});
afterEach(() => srv.close());

const call = (method: string, url: string, body?: unknown) =>
  fetch(`${srv.base}/atelier/api/${url}`, {
    method,
    headers: { Cookie: cookie, 'X-Admin': '1', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

test('GET content gives the draft, revisions and the English to do', async () => {
  const res = await call('GET', 'content');
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.content.projects.a.id).toBe('a');
  expect(body.revisions['project:a']).toBe(0);
  expect(body.changed).toEqual([]);
  expect(Array.isArray(body.stale)).toBe(true);
});

test('PUT a page: saved, then stale on an old revision, invalid on a bad shape', async () => {
  const p = { ...minimalProject(), id: 'a' };
  p.study.title = { fr: 'Nouveau titre', en: 'Titre', enOf: 'old' } as typeof p.study.title;
  const ok = await call('PUT', 'content/project:a', { data: p, revision: 0 });
  expect(ok.status).toBe(200);
  expect((await ok.json()).revision).toBe(1);
  expect((await call('PUT', 'content/project:a', { data: p, revision: 0 })).status).toBe(409);
  const bad = await call('PUT', 'content/project:a', { data: { id: 'a' }, revision: 1 });
  expect(bad.status).toBe(422);
  expect((await bad.json()).issues.length).toBeGreaterThan(0);
  const after = await (await call('GET', 'content')).json();
  expect(after.changed).toEqual(['project:a']);
  expect(after.stale).toContainEqual({ ref: 'project:a', path: 'study.title', fr: 'Nouveau titre' });
});

test('rename, delete and discard', async () => {
  const renamed = await call('POST', 'content/project:a/rename', { to: 'b' });
  expect(renamed.status).toBe(204);
  expect((await call('POST', 'content/project:b/rename', { to: 'Pas bon' })).status).toBe(422);
  expect((await call('DELETE', 'content/project:b')).status).toBe(204);
  expect((await (await call('GET', 'content')).json()).content.projects).toEqual({});
  expect((await call('POST', 'draft/discard')).status).toBe(204);
  expect(Object.keys((await (await call('GET', 'content')).json()).content.projects)).toEqual(['a']);
});
