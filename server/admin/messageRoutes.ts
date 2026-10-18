import { MESSAGE_STATUSES, type MessageStatus, type MessageStore } from '../messages';
import type { ApiRoute } from './handler';

/**
 * GET    messages           { messages (newest first), unread }
 * GET    messages/unread    { unread }   (the tab's badge)
 * PATCH  messages/<id>      { status: new | read | replied | archived }
 * DELETE messages/<id>
 */
export function createMessageRoutes(store: MessageStore): ApiRoute {
  return async (ctx) => {
    const { route, req } = ctx;
    if (route === '/messages' && req.method === 'GET') {
      ctx.send(200, { messages: store.list(), unread: store.unread() });
      return true;
    }
    if (route === '/messages/unread' && req.method === 'GET') {
      ctx.send(200, { unread: store.unread() });
      return true;
    }
    const m = /^\/messages\/([\w-]+)$/.exec(route);
    if (!m) return false;
    if (req.method === 'PATCH') {
      const { status } = await ctx.json<{ status: MessageStatus }>();
      if (!MESSAGE_STATUSES.includes(status)) {
        ctx.send(422, { error: 'status' });
        return true;
      }
      const updated = store.update(m[1], { status });
      if (updated) ctx.send(200, updated);
      else ctx.send(404, { error: 'missing' });
      return true;
    }
    if (req.method === 'DELETE') {
      if (store.remove(m[1])) ctx.send(204);
      else ctx.send(404, { error: 'missing' });
      return true;
    }
    return false;
  };
}
