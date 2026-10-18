import fs from 'node:fs';
import path from 'node:path';
import { englishTodo } from '../../src/content/txt';
import { allPages, pageData, type PageRef } from '../../src/content/pages';
import { DraftError, type DraftStore } from './draft';
import type { ApiRoute, Ctx } from './handler';

/**
 * GET    content                     the draft (or the published content), revisions, changed pages, English to do
 * PUT    content/<page>              { data, revision } → { revision } | 422 { issues } | 409 stale
 * DELETE content/project:<id>
 * POST   content/project:<id>/rename { to }
 * POST   draft/discard
 */

const STATUS: Record<DraftError['code'], number> = { invalid: 422, 'invalid-id': 422, taken: 409, stale: 409, missing: 404 };

const isRef = (s: string): s is PageRef => s === 'site' || s === 'index' || /^project:[a-z0-9-]+$/.test(s);

/** Files uploaded but not published yet, as site paths ("/images/case/hug/x-1a2b3c4d.webp") */
export function stagedFiles(stagingDir: string): string[] {
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
      else out.push('/' + path.relative(stagingDir, full).split(path.sep).join('/'));
    }
  };
  walk(stagingDir);
  return out.sort();
}

export function contentState(draft: DraftStore, stagingDir: string) {
  const state = draft.read();
  const todo = englishTodo(allPages(state.content).map((ref) => ({ ref, data: pageData(state.content, ref) })));
  return { ...state, ...todo, staged: stagedFiles(stagingDir) };
}

export function createContentRoutes(draft: DraftStore, stagingDir: string): ApiRoute {
  const guard = async (ctx: Ctx, fn: () => void | Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      if (!(err instanceof DraftError)) throw err;
      ctx.send(STATUS[err.code], { error: err.code, issues: err.issues });
    }
  };

  return async (ctx) => {
    const { route, req } = ctx;
    if (route === '/content' && req.method === 'GET') {
      ctx.send(200, contentState(draft, stagingDir));
      return true;
    }
    if (route === '/draft/discard' && req.method === 'POST') {
      draft.discard();
      ctx.send(204);
      return true;
    }
    const m = /^\/content\/([^/]+)(\/rename)?$/.exec(route);
    if (!m || !isRef(decodeURIComponent(m[1]))) return false;
    const ref = decodeURIComponent(m[1]) as PageRef;
    const id = ref.startsWith('project:') ? ref.slice('project:'.length) : null;

    if (!m[2] && req.method === 'PUT') {
      const { data, revision } = await ctx.json<{ data: unknown; revision: number }>();
      await guard(ctx, () => ctx.send(200, draft.write(ref, data, Number(revision ?? 0))));
      return true;
    }
    if (!m[2] && req.method === 'DELETE' && id) {
      await guard(ctx, () => (draft.remove(id), ctx.send(204)));
      return true;
    }
    if (m[2] && req.method === 'POST' && id) {
      const { to } = await ctx.json<{ to: string }>();
      await guard(ctx, () => (draft.rename(id, String(to ?? '')), ctx.send(204)));
      return true;
    }
    return false;
  };
}
