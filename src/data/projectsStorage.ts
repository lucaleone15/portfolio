import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from '../data/portfolioData';

const STORAGE_KEY = 'custom_portfolio_projects';

export interface StoredProjectsData {
  fr: Project[];
  en: Project[];
}

export function getCustomProjects(): StoredProjectsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { fr: PROJECTS_FR, en: PROJECTS_EN };
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.fr) && Array.isArray(parsed.en)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse custom projects from storage', err);
  }
  return { fr: PROJECTS_FR, en: PROJECTS_EN };
}

export function saveCustomProjects(data: StoredProjectsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('portfolio_projects_updated'));
  } catch (err) {
    console.error('Failed to save custom projects', err);
  }
}

export function resetCustomProjects(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('portfolio_projects_updated'));
}
