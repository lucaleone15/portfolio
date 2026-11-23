import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Git, Run } from './admin/git';
import { readBody } from './admin/handler';

/**
 * Automatic deploy: GitHub calls POST /api/deploy after every push to main (a webhook signed
 * with DEPLOY_WEBHOOK_SECRET), and the site updates itself, like the atelier's "Publier":
 *   fetch → fast-forward → npm ci (only if the dependencies changed) → build next to the live
 *   site (dist-next) → swap dist
 * The live site keeps running the whole time; a failure leaves it and the clone as they were.
 *
 * What a swap can't update is the running server's own code (server/, src/content/ which is
 * bundled into it, the dependencies): it is rebuilt, then the app has to restart. With
 * DEPLOY_RESTART=exit the process exits once the new site is live and the host starts it
 * again; otherwise an email says to restart it from the Infomaniak Manager.
 */

export type DeployStep = 'wait' | 'fetch' | 'install' | 'build' | 'swap';
export type DeployErrorCode = 'dirty' | 'diverged' | 'install-failed' | 'build-failed' | 'busy-timeout' | 'failed';

export interface DeployStatus {
  state: 'idle' | 'running' | 'done' | 'failed';
  step?: DeployStep;
  /** Commit now live (done) */
  head?: string;
  /** Nothing new on GitHub (done) */
  upToDate?: boolean;
  /** The server's own code changed: live once the app restarts */
  restartNeeded?: boolean;
  error?: { code: DeployErrorCode; log?: string };
  finishedAt?: string;
}

/** Changes that the running process can't pick up by itself */
const NEEDS_RESTART = [/^server\//, /^src\/content\//, /^package\.json$/, /^package-lock\.json$/];
const DEPENDENCIES = [/^package\.json$/, /^package-lock\.json$/];
/** The atelier's own page and bundle (served from disk: a rebuild is enough) */
const ADMIN = [/^src\/admin\//, /^admin\.html$/, /^vite\.admin\.config\.ts$/];

class Stop extends Error {
  constructor(public detail: NonNullable<DeployStatus['error']>) {
    super(detail.code);
  }
}

const tail = (log: string, lines = 40) => log.trim().split('\n').slice(-lines).join('\n');

export function createDeployer(deps: {
  repoRoot: string;
  git: Git;
  run: Run;
  /** The atelier is publishing: wait for it (both move the clone and dist/) */
  isBusy: () => boolean;
  onDeployed: () => void;
  notify?: (subject: string, text: string) => Promise<void>;
  /** Exit the process after a deploy that needs a restart (the host starts it again) */
  exitForRestart?: () => void;
  waitStepMs?: number;
  maxWaitMs?: number;
}) {
  let status: DeployStatus = { state: 'idle' };
  let job: Promise<DeployStatus> = Promise.resolve(status);
  /** A push arrived during a deploy: run once more afterwards */
  let again = false;
  const dir = (name: string) => path.join(deps.repoRoot, name);
  const step = (s: DeployStep) => (status = { ...status, step: s });
  const npm = (args: string[], env?: NodeJS.ProcessEnv) => deps.run('npm', args, { cwd: deps.repoRoot, env });

  async function waitForPublish() {
    const stepMs = deps.waitStepMs ?? 5_000;
    const max = deps.maxWaitMs ?? 15 * 60_000;
    for (let waited = 0; deps.isBusy(); waited += stepMs) {
      if (waited >= max) throw new Stop({ code: 'busy-timeout' });
      await new Promise((r) => setTimeout(r, stepMs));
    }
  }

  async function deploy(): Promise<DeployStatus> {
    const git = deps.git;
    step('wait');
    await waitForPublish();

    step('fetch');
    await git.fetch();
    const base = await git.head();
    const incoming = await git.changedFiles('HEAD', 'origin/main');
    if (!incoming.length) return { state: 'done', upToDate: true, head: base, finishedAt: new Date().toISOString() };
    if (!(await git.isClean())) throw new Stop({ code: 'dirty' });
    if (!(await git.fastForward())) throw new Stop({ code: 'diverged' });
    const touches = (list: RegExp[]) => incoming.some((f) => list.some((re) => re.test(f)));
    const restartNeeded = touches(NEEDS_RESTART);

    try {
      if (touches(DEPENDENCIES)) {
        step('install');
        // Dev dependencies too: the site is built here (and by the atelier's "Publier")
        const r = await npm(['ci', '--include=dev', '--no-audit', '--no-fund']);
        if (r.code !== 0) throw new Stop({ code: 'install-failed', log: tail(r.stdout + r.stderr) });
      }

      step('build');
      fs.rmSync(dir('dist-next'), { recursive: true, force: true });
      const site = await npm(['run', 'build:site'], { BUILD_OUT_DIR: 'dist-next' });
      if (site.code !== 0) throw new Stop({ code: 'build-failed', log: tail(site.stdout + site.stderr) });
      if (restartNeeded || touches(ADMIN)) {
        const admin = await npm(['run', 'build:admin']);
        if (admin.code !== 0) throw new Stop({ code: 'build-failed', log: tail(admin.stdout + admin.stderr) });
      }
      if (restartNeeded) {
        const server = await npm(['run', 'build:server']);
        if (server.code !== 0) throw new Stop({ code: 'build-failed', log: tail(server.stdout + server.stderr) });
      }
    } catch (err) {
      // Back to what is live: the clone on its previous commit, no half-built site
      await git.resetHard(base).catch(() => {});
      fs.rmSync(dir('dist-next'), { recursive: true, force: true });
      throw err;
    }

    step('swap');
    fs.rmSync(dir('dist-prev'), { recursive: true, force: true });
    if (fs.existsSync(dir('dist'))) fs.renameSync(dir('dist'), dir('dist-prev'));
    fs.renameSync(dir('dist-next'), dir('dist'));
    fs.rmSync(dir('dist-prev'), { recursive: true, force: true });
    deps.onDeployed();
    return { state: 'done', head: await git.head(), restartNeeded, finishedAt: new Date().toISOString() };
  }

  async function report(result: DeployStatus) {
    const commit = result.head?.slice(0, 7) ?? '';
    try {
      if (result.state === 'failed') {
        await deps.notify?.(
          'Déploiement échoué · luca-leone.ch',
          `Le site en ligne n'a pas changé (étape : ${result.step ?? '?'}, erreur : ${result.error?.code}).\n\n${result.error?.log ?? ''}`,
        );
      } else if (result.restartNeeded && !deps.exitForRestart) {
        await deps.notify?.(
          'Redémarrage nécessaire · luca-leone.ch',
          `Le site (${commit}) est en ligne, mais ce push change le code du serveur ou ses dépendances : redémarre l'application depuis le Manager Infomaniak (site Node.js → Redémarrer) pour qu'il s'applique.`,
        );
      }
    } catch (err) {
      console.error('[deploy] notification failed', err);
    }
  }

  function run() {
    status = { state: 'running', step: 'wait' };
    job = deploy()
      .catch((err): DeployStatus => {
        if (!(err instanceof Stop)) console.error('[deploy] failed', err);
        return {
          state: 'failed',
          step: status.step,
          finishedAt: new Date().toISOString(),
          error: err instanceof Stop ? err.detail : { code: 'failed', log: String((err as Error)?.message ?? err) },
        };
      })
      .then(async (result) => {
        status = result;
        console.log(`[deploy] ${result.state}${result.upToDate ? ' (up to date)' : ''}${result.head ? ` ${result.head.slice(0, 7)}` : ''}${result.error ? ` ${result.error.code}` : ''}`);
        await report(result);
        if (again) {
          again = false;
          return run();
        }
        if (result.state === 'done' && result.restartNeeded && deps.exitForRestart) {
          console.log('[deploy] restarting for the new server code');
          deps.exitForRestart();
        }
        return status;
      });
    return job;
  }

  return {
    /** Starts a deploy, or queues one more if a deploy is already running */
    start(): DeployStatus {
      if (status.state === 'running') {
        again = true;
        return status;
      }
      void run();
      return status;
    },
    status: () => status,
    isRunning: () => status.state === 'running',
    /** Resolves when the current deploy (and any queued one) is over */
    wait: () => job,
  };
}

export type Deployer = ReturnType<typeof createDeployer>;

/** GitHub's signature of the raw body: "sha256=" + HMAC-SHA256 with the webhook secret */
export function validSignature(secret: string, body: Buffer, header: string | undefined): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = Buffer.from('sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex'));
  const given = Buffer.from(header);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

/**
 * POST /api/deploy, called by the GitHub webhook. Without DEPLOY_WEBHOOK_SECRET the route
 * doesn't exist (next()). Answers at once (GitHub gives up after 10 s); the deploy runs after.
 */
export function createDeployHandler(secret: string | undefined, deployer: Deployer) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (!secret || pathname !== '/api/deploy') return next();
    const answer = (code: number, text: string) => {
      res.statusCode = code;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(text);
    };
    if (req.method !== 'POST') return answer(405, 'POST only');
    let body: Buffer;
    try {
      body = await readBody(req, 5_000_000);
    } catch {
      return answer(413, 'Too large');
    }
    if (!validSignature(secret, body, req.headers['x-hub-signature-256'] as string | undefined)) return answer(401, 'Bad signature');

    const event = req.headers['x-github-event'];
    if (event === 'ping') return answer(200, 'pong');
    if (event !== 'push') return answer(202, `Ignored: ${String(event)}`);
    let ref = '';
    try {
      ref = JSON.parse(body.toString('utf8')).ref ?? '';
    } catch {
      // A form-encoded webhook: payload=<json>
      try {
        ref = JSON.parse(new URLSearchParams(body.toString('utf8')).get('payload') ?? '{}').ref ?? '';
      } catch {
        return answer(400, 'Unreadable payload');
      }
    }
    if (ref !== 'refs/heads/main') return answer(202, `Ignored: ${ref}`);
    deployer.start();
    return answer(202, 'Deploying');
  };
}
