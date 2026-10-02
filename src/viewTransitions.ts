import type { CSSProperties } from 'react';

/**
 * Shared view-transition name for a project's main image: set on the project card and on
 * the project page's gallery, so navigating between them morphs one into the other.
 * The `project-media` class lets index.css style every such morph at once.
 */
export function projectMediaTransition(projectId: string): CSSProperties {
  return {
    viewTransitionName: `project-${projectId}`,
    viewTransitionClass: 'project-media',
  } as CSSProperties;
}
