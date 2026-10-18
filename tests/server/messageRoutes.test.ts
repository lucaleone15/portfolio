import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createAdminRoutes } from '../../server/admin/routes';
import { createMessageStore } from '../../server/messages';
import { minimalProject, realContent } from '../content/fixtures';
import { login, notFound, serve, testEnv, tmpDir } from './helpers';

test('the inbox: list with the unread count, change a status, delete — only with a session', async () => {
  const repo = tmpDir('repo');
  const data = tmpDir('data');
  const put = (rel: string, d: unknown) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), JSON.stringify(d, null, 2) + '\n');
  };
  put('content/site.json', realContent().site);
  put('content/projects.json', { order: ['a'], hidden: [], redirects: {} });
  put('content/projects/a.json', { ...minimalProject(), id: 'a' });
  execFileSync('git', ['init', '-q'], { cwd: repo });
  const store = createMessageStore(data);
  const m = store.add({ name: 'Camille', email: 'c@example.com', subject: 'Projet', message: 'Bonjour', lang: 'fr', page: '/' });
  const srv = await serve(createAdminRoutes(await testEnv(), { dataDir: data, repoRoot: repo, distAdmin: tmpDir('da'), notFound, onPublished: () => {} }));
  expect((await fetch(`${srv.base}/atelier/api/messages`)).status).toBe(404);
  const cookie = await login(srv.base);
  const call = (method: string, url: string, body?: unknown) =>
    fetch(`${srv.base}/atelier/api/${url}`, { method, headers: { Cookie: cookie, 'X-Admin': '1', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });

  const list = await (await call('GET', 'messages')).json();
  expect(list.unread).toBe(1);
  expect(list.messages[0]).toMatchObject({ id: m.id, name: 'Camille', status: 'new' });
  expect((await (await call('GET', 'messages/unread')).json()).unread).toBe(1);

  expect((await call('PATCH', `messages/${m.id}`, { status: 'replied' })).status).toBe(200);
  expect(store.list()[0].status).toBe('replied');
  expect((await call('PATCH', `messages/${m.id}`, { status: 'spam' })).status).toBe(422);
  expect((await call('PATCH', 'messages/nope', { status: 'read' })).status).toBe(404);
  expect((await call('DELETE', `messages/${m.id}`)).status).toBe(204);
  expect(store.list()).toEqual([]);
  await srv.close();
});
