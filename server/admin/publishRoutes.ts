import { englishTodo } from '../../src/content/txt';
import { allPages, pageData, pageLabel, type PageRef } from '../../src/content/pages';
import type { DraftStore } from './draft';
import type { ApiRoute } from './handler';
import type { Publisher } from './publish';

/**
 * GET  publish          { status, changed: [{ ref, label }], stale, missingEn }
 * POST publish          starts it → 202 status | 409 busy
 * POST publish/resolve  { ref, keep: 'draft' | 'repo' } → 204
 */
export function createPublishRoutes(publisher: Publisher, draft: DraftStore): ApiRoute {
  return async (ctx) => {
    const { route, req } = ctx;
    if (route === '/publish' && req.method === 'GET') {
      const state = draft.read();
      const todo = englishTodo(allPages(state.content).map((ref) => ({ ref, data: pageData(state.content, ref) })));
      ctx.send(200, { status: publisher.status(), changed: state.changed.map((ref) => ({ ref, label: pageLabel(ref, state.content) })), ...todo });
      return true;
    }
    if (route === '/publish' && req.method === 'POST') {
      const status = publisher.start();
      ctx.send(status.error?.code === 'busy' ? 409 : 202, status);
      return true;
    }
    if (route === '/publish/resolve' && req.method === 'POST') {
      const { ref, keep } = await ctx.json<{ ref: PageRef; keep: 'draft' | 'repo' }>();
      if (keep !== 'draft' && keep !== 'repo') {
        ctx.send(422, { error: 'keep' });
        return true;
      }
      draft.resolve(ref, keep);
      ctx.send(204);
      return true;
    }
    return false;
  };
}
