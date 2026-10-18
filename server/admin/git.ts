import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

/**
 * The few git commands Publish needs, on the server's own clone (remote `origin`, branch
 * `main`). With ADMIN_GIT_SSH_KEY, git talks to GitHub with that deploy key.
 */

export type Run = (cmd: string, args: string[], opts: { cwd: string; env?: NodeJS.ProcessEnv }) => Promise<{ code: number; stdout: string; stderr: string }>;

export const runCommand: Run = (cmd, args, opts) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => resolve({ code: 1, stdout, stderr: stderr + String(err) }));
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });

export function createGit(run: Run, repoRoot: string, env: { sshKey?: string; name: string; email: string }) {
  const gitEnv: NodeJS.ProcessEnv = env.sshKey ? { GIT_SSH_COMMAND: `ssh -i ${env.sshKey} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new` } : {};
  const git = (...args: string[]) => run('git', args, { cwd: repoRoot, env: gitEnv });
  const must = async (...args: string[]) => {
    const r = await git(...args);
    if (r.code !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr.trim()}`);
    return r.stdout.trim();
  };

  return {
    async isClean() {
      return (await must('status', '--porcelain')) === '';
    },
    head: () => must('rev-parse', 'HEAD'),
    async fetch() {
      await must('fetch', '--quiet', 'origin', 'main');
    },
    async changedFiles(from: string, to: string) {
      const out = await must('diff', '--name-only', from, to);
      return out ? out.split('\n') : [];
    },
    /** false when the server's clone has diverged from GitHub */
    async fastForward() {
      return (await git('merge', '--ff-only', '--quiet', 'origin/main')).code === 0;
    },
    async commitAll(paths: string[], message: string) {
      const existing = paths.filter((p) => fs.existsSync(path.join(repoRoot, p)));
      await must('add', '-A', '--', ...existing);
      await must('-c', `user.name=${env.name}`, '-c', `user.email=${env.email}`, 'commit', '--quiet', '-m', message);
    },
    async push(): Promise<'ok' | 'rejected'> {
      return (await git('push', '--quiet', 'origin', 'HEAD:main')).code === 0 ? 'ok' : 'rejected';
    },
    /** Back to a commit, dropping files Publish wrote that git doesn't know yet */
    async resetHard(ref: string) {
      await must('reset', '--hard', '--quiet', ref);
      await git('clean', '-fdq', '--', 'content', 'public');
    },
  };
}

export type Git = ReturnType<typeof createGit>;
