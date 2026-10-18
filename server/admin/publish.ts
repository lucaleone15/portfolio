import fs from 'node:fs';
import path from 'node:path';
import { pageLabel, type PageRef } from '../../src/content/pages';
import type { DraftStore } from './draft';
import type { Git } from './git';

/**
 * Publish: the draft goes live and into git.
 *   git mode (server):  pull → check → write → commit → build into dist-next → push → swap dist
 *   files mode (local): check → write (content/ and public/; Vite reloads, Luca commits himself)
 * Nothing irreversible happens before the push succeeds: a failure anywhere leaves the live
 * site (dist/) and the clone on their previous version, and the draft untouched.
 */

export type PublishStep = 'pull' | 'check' | 'write' | 'build' | 'push' | 'swap';
export type PublishErrorCode = 'busy' | 'dirty' | 'code-changed' | 'conflict' | 'build-failed' | 'push-rejected' | 'nothing' | 'failed';

export interface JobStatus {
  state: 'idle' | 'running' | 'done' | 'failed';
  step?: PublishStep;
  error?: { code: PublishErrorCode; pages?: PageRef[]; files?: string[]; log?: string };
  finishedAt?: string;
  /** Pages that went live (done) */
  published?: PageRef[];
}

/** Changes pulled from GitHub that need a manual redeploy (server code — src/content is bundled into it —, dependencies, the admin itself) */
const PROTECTED = [/^server\//, /^src\/content\//, /^package\.json$/, /^package-lock\.json$/, /^src\/admin\//, /^admin\.html$/, /^vite\.admin\.config\.ts$/];

class Stop extends Error {
  constructor(public detail: NonNullable<JobStatus['error']>) {
    super(detail.code);
  }
}

/** Uploaded files the draft uses (a card cover also brings its sm/ and md/ copies) */
function referencedUploads(draftJson: string, stagingDir: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const src = '/' + path.relative(stagingDir, full).split(path.sep).join('/');
        const original = src.replace(/^\/images\/(sm|md)\//, '/images/');
        if (draftJson.includes(`"${src}"`) || draftJson.includes(`"${original}"`)) out.push(src);
      }
    }
  };
  walk(stagingDir);
  return out;
}

/**
 * Uploads no page uses, more than a day old: abandoned (a replaced image, a test). Younger ones
 * may belong to an edit not saved yet, and stay.
 */
function pruneStaged(stagingDir: string, draftJson: string, olderThanMs = 86_400_000) {
  const used = new Set(referencedUploads(draftJson, stagingDir));
  const walk = (dir: string) => {
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const src = '/' + path.relative(stagingDir, full).split(path.sep).join('/');
        if (!used.has(src) && Date.now() - fs.statSync(full).mtimeMs > olderThanMs) fs.rmSync(full, { force: true });
      }
    }
  };
  walk(stagingDir);
}

export function createPublisher(deps: {
  mode: 'git' | 'files';
  repoRoot: string;
  draft: DraftStore;
  stagingDir: string;
  git?: Git;
  build?: () => Promise<{ ok: boolean; log: string }>;
  onPublished: () => void;
}) {
  let status: JobStatus = { state: 'idle' };
  let job: Promise<JobStatus> = Promise.resolve(status);
  const step = (s: PublishStep) => (status = { ...status, step: s });
  const dist = (name: string) => path.join(deps.repoRoot, name);

  const write = () => {
    const state = deps.draft.read();
    const changed = state.changed;
    if (!changed.length) throw new Stop({ code: 'nothing' });
    deps.draft.applyTo(deps.repoRoot);
    const uploads = referencedUploads(JSON.stringify(state.content), deps.stagingDir);
    for (const src of uploads) {
      const to = path.join(deps.repoRoot, 'public', src);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(deps.stagingDir, src), to);
    }
    return { changed, uploads, content: state.content };
  };

  const finish = (changed: PageRef[], uploads: string[]) => {
    deps.onPublished();
    // Not discard(): pages saved while the site was building stay in the draft
    deps.draft.settle();
    for (const src of uploads) fs.rmSync(path.join(deps.stagingDir, src), { force: true });
    // Housekeeping: an error here must not turn a publish that is live into a "failed" one
    try {
      pruneStaged(deps.stagingDir, JSON.stringify(deps.draft.read().content));
    } catch (err) {
      console.error('[admin] cleaning up old uploads failed', err);
    }
    status = { state: 'done', finishedAt: new Date().toISOString(), published: changed };
  };

  async function runGit() {
    const git = deps.git!;
    step('pull');
    if (!(await git.isClean())) throw new Stop({ code: 'dirty' });
    await git.fetch();
    const incoming = await git.changedFiles('HEAD', 'origin/main');
    const blocked = incoming.filter((f) => PROTECTED.some((re) => re.test(f)));
    if (blocked.length) throw new Stop({ code: 'code-changed', files: blocked });
    if (!(await git.fastForward())) throw new Stop({ code: 'dirty' });
    const base = await git.head();

    step('check');
    const conflicts = deps.draft.conflicts();
    if (conflicts.length) throw new Stop({ code: 'conflict', pages: conflicts });
    deps.draft.refreshUntouched();

    step('write');
    const { changed, uploads, content } = write();
    try {
      await git.commitAll(['content', 'public/images', 'public/videos', 'public/pdf'], `Content: ${changed.map((r) => pageLabel(r, content)).join(', ')}`);

      step('build');
      fs.rmSync(dist('dist-next'), { recursive: true, force: true });
      const built = await deps.build!();
      if (!built.ok) throw new Stop({ code: 'build-failed', log: built.log.split('\n').slice(-40).join('\n') });

      step('push');
      if ((await git.push()) !== 'ok') throw new Stop({ code: 'push-rejected' });
    } catch (err) {
      await git.resetHard(base).catch(() => {});
      fs.rmSync(dist('dist-next'), { recursive: true, force: true });
      throw err;
    }

    step('swap');
    fs.rmSync(dist('dist-prev'), { recursive: true, force: true });
    if (fs.existsSync(dist('dist'))) fs.renameSync(dist('dist'), dist('dist-prev'));
    fs.renameSync(dist('dist-next'), dist('dist'));
    fs.rmSync(dist('dist-prev'), { recursive: true, force: true });
    finish(changed, uploads);
  }

  async function runFiles() {
    step('check');
    const conflicts = deps.draft.conflicts();
    if (conflicts.length) throw new Stop({ code: 'conflict', pages: conflicts });
    deps.draft.refreshUntouched();
    step('write');
    const { changed, uploads } = write();
    finish(changed, uploads);
  }

  return {
    start(): JobStatus {
      if (status.state === 'running') return { ...status, error: { code: 'busy' } };
      status = { state: 'running', step: deps.mode === 'git' ? 'pull' : 'check' };
      job = (deps.mode === 'git' ? runGit() : runFiles())
        .catch((err) => {
          status = {
            state: 'failed',
            step: status.step,
            finishedAt: new Date().toISOString(),
            error: err instanceof Stop ? err.detail : { code: 'failed', log: String((err as Error)?.message ?? err) },
          };
          if (!(err instanceof Stop)) console.error('[admin] publish failed', err);
        })
        .then(() => status);
      return status;
    },
    status: () => status,
    /** Resolves when the current job is over */
    wait: () => job,
  };
}

export type Publisher = ReturnType<typeof createPublisher>;
