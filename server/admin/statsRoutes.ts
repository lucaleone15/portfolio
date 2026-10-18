import path from 'node:path';
import { computeStats, readHits } from '../stats';
import type { DraftStore } from './draft';
import type { ApiRoute } from './handler';

const RANGES = [7, 30, 90];

/** GET stats?days=7|30|90 → the page views of that period and the one before */
export function createStatsRoutes(dataDir: string, draft: DraftStore): ApiRoute {
  const file = path.join(dataDir, 'hits.ndjson');
  return (ctx) => {
    if (ctx.route !== '/stats' || ctx.req.method !== 'GET') return false;
    const asked = Number(ctx.query.get('days'));
    const days = RANGES.includes(asked) ? asked : 30;
    const now = Date.now();
    const projectNames = Object.fromEntries(Object.values(draft.read().content.projects).map((p) => [p.id, p.name]));
    ctx.send(200, computeStats(readHits(file, now - (2 * days + 1) * 86_400_000), { days, now, projectNames }));
    return true;
  };
}
