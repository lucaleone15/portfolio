import type { z } from 'zod';
import { ProjectsIndexSchema, SiteSchema, StoredProjectSchema, type Content } from './schema';

/**
 * The units the admin saves and publishes: the site's fixed texts, the projects list, and each
 * project. One page = one file in content/.
 */
export type PageRef = 'site' | 'index' | `project:${string}`;

export const projectRef = (id: string): PageRef => `project:${id}`;
export const projectIdOf = (ref: PageRef): string | null => (ref.startsWith('project:') ? ref.slice('project:'.length) : null);

/** Path of the page's file, relative to the repo root */
export function pageFile(ref: PageRef): string {
  if (ref === 'site') return 'content/site.json';
  if (ref === 'index') return 'content/projects.json';
  return `content/projects/${projectIdOf(ref)}.json`;
}

export function pageSchema(ref: PageRef): z.ZodTypeAny {
  if (ref === 'site') return SiteSchema;
  if (ref === 'index') return ProjectsIndexSchema;
  return StoredProjectSchema;
}

/** A page's name for people: "Textes du site", "Liste des projets", or the project's name */
export function pageLabel(ref: PageRef, content?: Content): string {
  if (ref === 'site') return 'Textes du site';
  if (ref === 'index') return 'Liste des projets';
  const id = projectIdOf(ref)!;
  return content?.projects[id]?.name ?? id;
}

export function pageData(content: Content, ref: PageRef): unknown {
  if (ref === 'site') return content.site;
  if (ref === 'index') return content.index;
  return content.projects[projectIdOf(ref)!];
}

export const allPages = (content: Content): PageRef[] => ['site', 'index', ...Object.keys(content.projects).map(projectRef)];
