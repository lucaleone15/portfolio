import path from 'node:path';
import { createAdminHandler, type AdminDeps, type ApiRoute } from './handler';
import { createDraftStore } from './draft';
import { createContentRoutes } from './contentRoutes';

type Env = Record<string, string | undefined>;

/** The admin handler with all its API modules (content, uploads, publishing) */
export function createAdminRoutes(env: Env, deps: AdminDeps) {
  const draft = createDraftStore({ repoRoot: deps.repoRoot, dir: path.join(deps.dataDir, 'admin', 'draft') });
  const routes: ApiRoute[] = [createContentRoutes(draft)];
  return createAdminHandler(env, deps, routes);
}
