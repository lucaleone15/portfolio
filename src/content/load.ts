import { ContentSchema, type Content } from './schema';
import site from '../../content/site.json';
import index from '../../content/projects.json';

/** The published content (content/ in the repo), checked against the schema: a bad file fails the build */
const files = import.meta.glob('../../content/projects/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

export const CONTENT: Content = ContentSchema.parse({
  site,
  index,
  projects: Object.fromEntries(Object.values(files).map((p) => [(p as { id: string }).id, p])),
});
