import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDraftStore } from '../../server/admin/draft';
import { createGit, runCommand } from '../../server/admin/git';
import { createPublisher } from '../../server/admin/publish';
import { minimalProject, realContent } from '../content/fixtures';
import { tmpDir } from './helpers';

const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-c', 'user.name=T', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const writeJson = (root: string, rel: string, data: unknown) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), JSON.stringify(data, null, 2) + '\n');
};
const project = (id: string, title: string) => {
  const p = minimalProject();
  return { ...p, id, name: id.toUpperCase(), study: { ...p.study, title: { fr: title, en: title } } };
};

let remote: string, server: string, laptop: string, data: string;
let buildFails: boolean;

function setup() {
  const root = tmpDir('publish');
  remote = path.join(root, 'remote.git');
  laptop = path.join(root, 'laptop');
  server = path.join(root, 'server');
  data = path.join(root, 'data');
  git(root, 'init', '-q', '--bare', '-b', 'main', remote);
  git(root, 'clone', '-q', remote, laptop);
  writeJson(laptop, 'content/site.json', realContent().site);
  writeJson(laptop, 'content/projects.json', { order: ['a', 'b'], hidden: [], redirects: {} });
  writeJson(laptop, 'content/projects/a.json', project('a', 'A v1'));
  writeJson(laptop, 'content/projects/b.json', project('b', 'B v1'));
  fs.mkdirSync(path.join(laptop, 'server'));
  fs.writeFileSync(path.join(laptop, 'server/index.ts'), '// v1\n');
  fs.writeFileSync(path.join(laptop, '.gitignore'), 'dist\ndist-next\ndist-prev\n');
  git(laptop, 'checkout', '-q', '-b', 'main');
  git(laptop, 'add', '-A');
  git(laptop, 'commit', '-q', '-m', 'init');
  git(laptop, 'push', '-q', 'origin', 'main');
  git(root, 'clone', '-q', '-b', 'main', remote, server);
  fs.mkdirSync(path.join(server, 'dist'));
  fs.writeFileSync(path.join(server, 'dist/index.html'), 'old site');
  buildFails = false;
}

function publisher() {
  const draft = createDraftStore({ repoRoot: server, dir: path.join(data, 'draft') });
  const published: string[] = [];
  const pub = createPublisher({
    mode: 'git',
    repoRoot: server,
    draft,
    stagingDir: path.join(data, 'uploads'),
    git: createGit(runCommand, server, { name: 'Luca Leone (dashboard)', email: 'luca@luca-leone.ch' }),
    build: async () => {
      if (buildFails) return { ok: false, log: 'vite: boom' };
      const a = JSON.parse(fs.readFileSync(path.join(server, 'content/projects/a.json'), 'utf8'));
      fs.mkdirSync(path.join(server, 'dist-next'), { recursive: true });
      fs.writeFileSync(path.join(server, 'dist-next/index.html'), `site with ${a.study.title.fr}`);
      return { ok: true, log: '' };
    },
    onPublished: () => published.push('reloaded'),
  });
  return { draft, pub, published };
}

const head = (cwd: string) => git(cwd, 'rev-parse', 'HEAD');
const site = () => fs.readFileSync(path.join(server, 'dist/index.html'), 'utf8');

beforeEach(setup);

test('publishing: commit pushed, new build live, draft cleared', async () => {
  const { draft, pub, published } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  const status = await pub.wait();
  expect(status.state).toBe('done');
  expect(site()).toBe('site with A v2');
  expect(git(remote, 'log', '-1', '--format=%s', 'main')).toBe('Content: A');
  expect(git(remote, 'log', '-1', '--format=%an', 'main')).toBe('Luca Leone (dashboard)');
  expect(published).toEqual(['reloaded']);
  expect(draft.read().changed).toEqual([]);
  expect(fs.existsSync(path.join(server, 'dist-next'))).toBe(false);
});

test('server code pushed from the laptop: refused, nothing committed', async () => {
  fs.writeFileSync(path.join(laptop, 'server/index.ts'), '// v2\n');
  git(laptop, 'commit', '-qam', 'server change');
  git(laptop, 'push', '-q', 'origin', 'main');
  const before = head(server);
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  const status = await pub.wait();
  expect(status.error?.code).toBe('code-changed');
  expect(status.error?.files).toEqual(['server/index.ts']);
  expect(head(server)).toBe(before);
  expect(site()).toBe('old site');
});

test('the same page changed on the laptop: conflict', async () => {
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A brouillon'), 0);
  writeJson(laptop, 'content/projects/a.json', project('a', 'A portable'));
  git(laptop, 'commit', '-qam', 'laptop a');
  git(laptop, 'push', '-q', 'origin', 'main');
  pub.start();
  const status = await pub.wait();
  expect(status.error?.code).toBe('conflict');
  expect(status.error?.pages).toEqual(['project:a']);
  expect(site()).toBe('old site');
});

test('another page changed on the laptop: kept, and the publish goes through', async () => {
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  writeJson(laptop, 'content/projects/b.json', project('b', 'B portable'));
  git(laptop, 'commit', '-qam', 'laptop b');
  git(laptop, 'push', '-q', 'origin', 'main');
  pub.start();
  expect((await pub.wait()).state).toBe('done');
  git(laptop, 'pull', '-q');
  expect(JSON.parse(fs.readFileSync(path.join(laptop, 'content/projects/b.json'), 'utf8')).study.title.fr).toBe('B portable');
  expect(JSON.parse(fs.readFileSync(path.join(laptop, 'content/projects/a.json'), 'utf8')).study.title.fr).toBe('A v2');
});

test('a failed build changes nothing and keeps the draft', async () => {
  buildFails = true;
  const before = head(server);
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  const status = await pub.wait();
  expect(status.error?.code).toBe('build-failed');
  expect(status.error?.log).toContain('boom');
  expect(head(server)).toBe(before);
  expect(git(server, 'status', '--porcelain')).toBe('');
  expect(site()).toBe('old site');
  expect(draft.read().changed).toEqual(['project:a']);
});

test('a refused push changes nothing', async () => {
  fs.writeFileSync(path.join(remote, 'hooks/pre-receive'), '#!/bin/sh\necho refused >&2\nexit 1\n', { mode: 0o755 });
  const before = head(server);
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  const status = await pub.wait();
  expect(status.error?.code).toBe('push-rejected');
  expect(head(server)).toBe(before);
  expect(site()).toBe('old site');
  expect(fs.existsSync(path.join(server, 'dist-next'))).toBe(false);
});

test('uncommitted changes on the server: refused', async () => {
  fs.writeFileSync(path.join(server, 'stray.txt'), 'x');
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  expect((await pub.wait()).error?.code).toBe('dirty');
});

test('one publish at a time', async () => {
  const { draft, pub } = publisher();
  draft.write('project:a', project('a', 'A v2'), 0);
  pub.start();
  expect(pub.start().error?.code).toBe('busy');
  await pub.wait();
});

test('uploads referenced by the draft are published with it', async () => {
  const { draft, pub } = publisher();
  fs.mkdirSync(path.join(data, 'uploads/images/sm'), { recursive: true });
  fs.mkdirSync(path.join(data, 'uploads/images/md'), { recursive: true });
  for (const f of ['images/cover-1a2b3c4d.webp', 'images/sm/cover-1a2b3c4d.webp', 'images/md/cover-1a2b3c4d.webp', 'images/unused-00000000.webp'])
    fs.writeFileSync(path.join(data, 'uploads', f), 'img');
  draft.write('project:a', { ...project('a', 'A v2'), imageUrl: '/images/cover-1a2b3c4d.webp' }, 0);
  pub.start();
  expect((await pub.wait()).state).toBe('done');
  const files = git(remote, 'ls-tree', '-r', '--name-only', 'main');
  expect(files).toContain('public/images/cover-1a2b3c4d.webp');
  expect(files).toContain('public/images/sm/cover-1a2b3c4d.webp');
  expect(files).not.toContain('unused');
});
