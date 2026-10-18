import { createAdminHandler, type AdminDeps, type ApiRoute } from './handler';

type Env = Record<string, string | undefined>;

/** The admin handler with all its API modules (content, uploads, publishing) */
export function createAdminRoutes(env: Env, deps: AdminDeps) {
  const routes: ApiRoute[] = [];
  return createAdminHandler(env, deps, routes);
}
