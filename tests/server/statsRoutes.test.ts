import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createAdminRoutes } from '../../server/admin/routes';
import { createAnalyticsHandler } from '../../server/analytics';
import { minimalProject, realContent } from '../content/fixtures';
import { login, notFound, serve, testEnv, tmpDir } from './helpers';

test('the old /stats page is gone, even with the old key', async () => {
  const handler = createAnalyticsHandler({ STATS_KEY: 'secret' }, tmpDir('data'));
  const srv = await serve(handler as never);
  for (const url of ['/stats?key=secret', '/api/stats?key=secret']) {
    const res = await fetch(srv.base + url);
    expect(await res.text()).toBe('SITE404');
  }
  await srv.close();
});

test('the atelier serves the statistics, only with a session', async () => {
  const repo = tmpDir('repo');
  const data = tmpDir('data');
  const put = (rel: string, d: unknown) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), JSON.stringify(d, null, 2) + '\n');
  };
  put('content/site.json', realContent().site);
  put('content/projects.json', { order: ['a'], hidden: [], redirects: {} });
  put('content/projects/a.json', { ...minimalProject(), id: 'a', name: 'Projet A' });
  execFileSync('git', ['init', '-q'], { cwd: repo });
  const now = new Date().toISOString();
  fs.writeFileSync(path.join(data, 'hits.ndjson'), [{ t: now, p: '/projets/a', r: '' }, { t: now, p: '/', r: 'google.com' }].map((h) => JSON.stringify(h)).join('\n') + '\n');
  const srv = await serve(createAdminRoutes(await testEnv(), { dataDir: data, repoRoot: repo, distAdmin: tmpDir('da'), notFound, onPublished: () => {} }));
  expect((await fetch(`${srv.base}/atelier/api/stats?days=7`)).status).toBe(404);
  const cookie = await login(srv.base);
  const res = await fetch(`${srv.base}/atelier/api/stats?days=7`, { headers: { Cookie: cookie } });
  expect(res.status).toBe(200);
  const s = await res.json();
  expect(s.total).toBe(2);
  expect(s.projects).toEqual([{ id: 'a', name: 'Projet A', views: 1, fr: 1, en: 0 }]);
  expect((await (await fetch(`${srv.base}/atelier/api/stats?days=999`, { headers: { Cookie: cookie } })).json()).days).toBe(30);
  await srv.close();
});
