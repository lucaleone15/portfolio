import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from './portfolioData';

export interface StoredProjectsData {
  fr: Project[];
  en: Project[];
}

/**
 * Projects are read-only and loaded directly from the curated code dataset.
 * On-site editing is disabled as requested.
 */
export function getCustomProjects(): StoredProjectsData {
  return {
    fr: PROJECTS_FR,
    en: PROJECTS_EN,
  };
}
