import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createGit, runCommand, type Run } from '../../server/admin/git';
import { createDeployer, createDeployHandler, validSignature } from '../../server/deploy';
import { serve, tmpDir } from './helpers';

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'user.name=T', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

let laptop: string, server: string;
let npmCalls: string[][];
let failOn: string | null;

/** npm on the "server": records the call, and build:site writes BUILD_OUT_DIR like the real one */
const fakeNpm: Run = async (_cmd, args, opts) => {
  npmCalls.push(args);
  if (failOn && args.includes(failOn)) return { code: 1, stdout: '', stderr: `${failOn} broke` };
  if (args[1] === 'build:site') {
    const out = path.join(opts.cwd, opts.env?.BUILD_OUT_DIR ?? 'dist');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'index.html'), fs.readFileSync(path.join(opts.cwd, 'page.txt'), 'utf8'));
  }
  return { code: 0, stdout: '', stderr: '' };
};

function setup() {
  const root = tmpDir('deploy');
  const remote = path.join(root, 'remote.git');
  laptop = path.join(root, 'laptop');
  server = path.join(root, 'server');
  git(root, 'init', '-q', '--bare', '-b', 'main', remote);
  git(root, 'clone', '-q', remote, laptop);
  git(laptop, 'checkout', '-q', '-b', 'main');
  fs.writeFileSync(path.join(laptop, 'page.txt'), 'v1');
  fs.mkdirSync(path.join(laptop, 'server'));
  fs.writeFileSync(path.join(laptop, 'server/index.ts'), '// v1\n');
  fs.writeFileSync(path.join(laptop, '.gitignore'), 'dist\ndist-next\ndist-prev\n');
  git(laptop, 'add', '-A');
  git(laptop, 'commit', '-q', '-m', 'v1');
  git(laptop, 'push', '-q', 'origin', 'main');
  git(root, 'clone', '-q', remote, server);
  fs.mkdirSync(path.join(server, 'dist'));
  fs.writeFileSync(path.join(server, 'dist/index.html'), 'v1');
  npmCalls = [];
  failOn = null;
}

function push(file: string, text: string) {
  fs.mkdirSync(path.dirname(path.join(laptop, file)), { recursive: true });
  fs.writeFileSync(path.join(laptop, file), text);
  git(laptop, 'add', '-A');
  git(laptop, 'commit', '-q', '-m', `edit ${file}`);
  git(laptop, 'push', '-q', 'origin', 'main');
}

function deployer(extra: Partial<Parameters<typeof createDeployer>[0]> = {}) {
  const notes: string[] = [];
  let deployed = 0;
  const d = createDeployer({
    repoRoot: server,
    git: createGit(runCommand, server, { name: 'T', email: 't@t' }),
    run: fakeNpm,
    isBusy: () => false,
    onDeployed: () => deployed++,
    notify: async (subject) => void notes.push(subject),
    waitStepMs: 5,
    ...extra,
  });
  return { d, notes, deployed: () => deployed };
}

const live = () => fs.readFileSync(path.join(server, 'dist/index.html'), 'utf8');

beforeEach(setup);

test('a pushed content change goes live without a restart', async () => {
  push('page.txt', 'v2');
  const { d, notes, deployed } = deployer();
  d.start();
  const result = await d.wait();
  expect(result).toMatchObject({ state: 'done', restartNeeded: false });
  expect(live()).toBe('v2');
  expect(git(server, 'rev-parse', 'HEAD')).toBe(git(laptop, 'rev-parse', 'HEAD'));
  expect(npmCalls).toEqual([['run', 'build:site']]);
  expect(deployed()).toBe(1);
  expect(notes).toEqual([]);
  expect(fs.existsSync(path.join(server, 'dist-next'))).toBe(false);
});

test('nothing new on GitHub: nothing is built', async () => {
  const { d } = deployer();
  d.start();
  expect(await d.wait()).toMatchObject({ state: 'done', upToDate: true });
  expect(npmCalls).toEqual([]);
});

test('server code and dependencies: install, full build, and a note to restart', async () => {
  fs.writeFileSync(path.join(laptop, 'page.txt'), 'v2');
  fs.writeFileSync(path.join(laptop, 'package-lock.json'), '{}');
  push('server/index.ts', '// v2\n');
  const { d, notes } = deployer();
  d.start();
  expect(await d.wait()).toMatchObject({ state: 'done', restartNeeded: true });
  expect(npmCalls.map((a) => a.slice(0, 2).join(' '))).toEqual(['ci --include=dev', 'run build:site', 'run build:admin', 'run build:server']);
  expect(notes).toEqual(['Redémarrage nécessaire · luca-leone.ch']);
});

test('DEPLOY_RESTART=exit: the process is asked to exit instead of a note', async () => {
  push('server/index.ts', '// v2\n');
  let exited = 0;
  const { d, notes } = deployer({ exitForRestart: () => exited++ });
  d.start();
  await d.wait();
  expect(exited).toBe(1);
  expect(notes).toEqual([]);
});

test('a failed build leaves the live site and the clone as they were', async () => {
  const before = git(server, 'rev-parse', 'HEAD');
  push('page.txt', 'v2');
  failOn = 'build:site';
  const { d, notes, deployed } = deployer();
  d.start();
  expect(await d.wait()).toMatchObject({ state: 'failed', step: 'build', error: { code: 'build-failed' } });
  expect(live()).toBe('v1');
  expect(git(server, 'rev-parse', 'HEAD')).toBe(before);
  expect(fs.existsSync(path.join(server, 'dist-next'))).toBe(false);
  expect(deployed()).toBe(0);
  expect(notes).toEqual(['Déploiement échoué · luca-leone.ch']);
});

test('waits for a publish from the atelier to finish', async () => {
  push('page.txt', 'v2');
  let busy = true;
  setTimeout(() => (busy = false), 30);
  const { d } = deployer({ isBusy: () => busy });
  d.start();
  expect(d.status().step).toBe('wait');
  expect(await d.wait()).toMatchObject({ state: 'done' });
  expect(live()).toBe('v2');
});

test('a push during a deploy runs one more deploy afterwards', async () => {
  push('page.txt', 'v2');
  let busy = true;
  const { d } = deployer({ isBusy: () => busy });
  d.start();
  push('page.txt', 'v3');
  d.start();
  busy = false;
  await d.wait();
  await d.wait();
  expect(live()).toBe('v3');
});

describe('webhook', () => {
  const SECRET = 'le-secret';
  const sign = (body: string) => 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');
  const body = JSON.stringify({ ref: 'refs/heads/main' });

  test('signature check', () => {
    expect(validSignature(SECRET, Buffer.from(body), sign(body))).toBe(true);
    expect(validSignature(SECRET, Buffer.from(body), sign(body + ' '))).toBe(false);
    expect(validSignature(SECRET, Buffer.from(body), undefined)).toBe(false);
  });

  async function call(headers: Record<string, string>, payload = body, secret: string | null = SECRET) {
    let started = 0;
    const handler = createDeployHandler(secret ?? undefined, { start: () => (started++, { state: 'running' }) } as never);
    const { base, close } = await serve(handler);
    const res = await fetch(`${base}/api/deploy`, { method: 'POST', headers, body: payload });
    const text = await res.text();
    await close();
    return { status: res.status, text, started };
  }

  test('a signed push to main starts a deploy', async () => {
    expect(await call({ 'x-github-event': 'push', 'x-hub-signature-256': sign(body), 'content-type': 'application/json' })).toMatchObject({ status: 202, started: 1 });
  });

  test('a bad signature, another branch or a ping start nothing', async () => {
    expect(await call({ 'x-github-event': 'push', 'x-hub-signature-256': sign('other') })).toMatchObject({ status: 401, started: 0 });
    const other = JSON.stringify({ ref: 'refs/heads/test' });
    expect(await call({ 'x-github-event': 'push', 'x-hub-signature-256': sign(other) }, other)).toMatchObject({ status: 202, started: 0 });
    expect(await call({ 'x-github-event': 'ping', 'x-hub-signature-256': sign(body) })).toMatchObject({ status: 200, text: 'pong', started: 0 });
  });

  test('without a secret the route does not exist', async () => {
    expect(await call({ 'x-github-event': 'push' }, body, null)).toMatchObject({ status: 404, started: 0 });
  });
});
