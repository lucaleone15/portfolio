import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from './portfolioData';

// Clear legacy cached storage so code files are always the single source of truth
if (typeof window !== 'undefined') {
  try {
    const keysToRemove = [
      'custom_portfolio_projects',
      'custom_portfolio_projects_v2',
      'custom_portfolio_projects_v3',
      'custom_portfolio_projects_v4',
      'custom_portfolio_projects_v5',
      'custom_portfolio_projects_v6',
      'custom_portfolio_projects_v7',
      'custom_portfolio_projects_v8',
      'custom_portfolio_projects_v9',
      'custom_portfolio_projects_v10',
      'custom_portfolio_projects_v11',
      'custom_portfolio_projects_v12',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage errors
  }
}

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
