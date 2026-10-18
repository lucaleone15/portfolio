import type { Content } from './schema';
import site from '../../content/site.json';
import index from '../../content/projects.json';

/**
 * The published content (content/ in the repo). Checked against the schema at build time
 * (checkContent, called by scripts/prerender.mjs) rather than here, so zod stays out of the
 * visitors' bundle.
 */
const files = import.meta.glob('../../content/projects/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

export const CONTENT = {
  site,
  index,
  projects: Object.fromEntries(Object.values(files).map((p) => [(p as { id: string }).id, p])),
} as unknown as Content;
