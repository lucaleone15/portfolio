import path from 'node:path';
import { createAdminHandler, type AdminDeps, type ApiRoute } from './handler';
import { createDraftStore } from './draft';
import { createContentRoutes } from './contentRoutes';
import { createUploadRoutes } from './uploadRoutes';
import { createGit, runCommand } from './git';
import { createPublisher } from './publish';
import { createPublishRoutes } from './publishRoutes';
import { createStatsRoutes } from './statsRoutes';
import { createMessageRoutes } from './messageRoutes';
import { createMessageStore } from '../messages';

type Env = Record<string, string | undefined>;

/** The admin handler with all its API modules (content, uploads, publishing) */
export function createAdminRoutes(env: Env, deps: AdminDeps) {
  const adminDir = path.join(deps.dataDir, 'admin');
  const stagingDir = path.join(adminDir, 'uploads');
  const draft = createDraftStore({ repoRoot: deps.repoRoot, dir: path.join(adminDir, 'draft') });
  const mode = env.ADMIN_PUBLISH_MODE === 'git' ? 'git' : 'files';
  const publisher = createPublisher({
    mode,
    repoRoot: deps.repoRoot,
    draft,
    stagingDir,
    git: createGit(runCommand, deps.repoRoot, {
      sshKey: env.ADMIN_GIT_SSH_KEY || undefined,
      name: env.ADMIN_GIT_NAME || 'Luca Leone (dashboard)',
      email: env.ADMIN_GIT_EMAIL || 'luca@luca-leone.ch',
    }),
    // The site only (client + prerender), next to the live one; the server bundle isn't rebuilt
    build: async () => {
      const r = await runCommand('npm', ['run', 'build:site'], { cwd: deps.repoRoot, env: { BUILD_OUT_DIR: 'dist-next' } });
      return { ok: r.code === 0, log: r.stdout + r.stderr };
    },
    onPublished: deps.onPublished,
  });
  const routes: ApiRoute[] = [createContentRoutes(draft, stagingDir), createUploadRoutes(deps.dataDir), createPublishRoutes(publisher, draft), createStatsRoutes(deps.dataDir, draft), createMessageRoutes(createMessageStore(deps.dataDir))];
  return createAdminHandler(env, deps, routes);
}
