import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from './portfolioData';

const STORAGE_KEY = 'custom_portfolio_projects_v11';

// Remove legacy storage caches so files take precedence
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('custom_portfolio_projects');
    localStorage.removeItem('custom_portfolio_projects_v2');
    localStorage.removeItem('custom_portfolio_projects_v3');
    localStorage.removeItem('custom_portfolio_projects_v4');
    localStorage.removeItem('custom_portfolio_projects_v5');
    localStorage.removeItem('custom_portfolio_projects_v6');
    localStorage.removeItem('custom_portfolio_projects_v7');
    localStorage.removeItem('custom_portfolio_projects_v8');
    localStorage.removeItem('custom_portfolio_projects_v9');
    localStorage.removeItem('custom_portfolio_projects_v10');
  } catch (err) {
    // Ignore storage errors
  }
}

export interface StoredProjectsData {
  fr: Project[];
  en: Project[];
}

const defaultData: StoredProjectsData = {
  fr: PROJECTS_FR,
  en: PROJECTS_EN,
};

export function getCustomProjects(): StoredProjectsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.fr) && Array.isArray(parsed.en)) {
      // Invalidate if old placeholder image strings remain from past iterations
      const hasOldPlaceholders = parsed.fr.some((p: Project) => p.imageUrl && p.imageUrl.includes('TON_IMAGE_'));
      if (hasOldPlaceholders) {
        localStorage.removeItem(STORAGE_KEY);
        return defaultData;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse custom projects from storage', err);
  }
  return defaultData;
}

export async function saveCustomProjects(data: StoredProjectsData): Promise<boolean> {
  let fileSaved = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('portfolio_projects_updated'));
  } catch (err) {
    console.error('Failed to save custom projects to localStorage', err);
  }

  // Persist directly to source code on disk (src/data/projectsData.json)
  try {
    const res = await fetch('/api/save-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      fileSaved = true;
    }
  } catch (err) {
    // Graceful fallback if static host
    console.warn('API save-projects unavailable (normal on static host)', err);
  }

  return fileSaved;
}

export function resetCustomProjects(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('portfolio_projects_updated'));
}

export function downloadProjectsJson(data: StoredProjectsData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'projectsData.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

