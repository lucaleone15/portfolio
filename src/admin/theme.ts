import { useSyncExternalStore } from 'react';

/**
 * The atelier's light / dark choice: follows the device unless set, remembered on this device.
 * One shared state for every theme button, and one listener on the device's appearance.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'atelier:theme';
const ORDER: ThemeChoice[] = ['system', 'light', 'dark'];
export const THEME_LABEL: Record<ThemeChoice, string> = { system: 'Thème : système', light: 'Thème : clair', dark: 'Thème : sombre' };

export const nextTheme = (t: ThemeChoice): ThemeChoice => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length];

export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(t: ThemeChoice) {
  try {
    if (t === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {
    // private mode: the choice lasts until the page is closed
  }
}

export function applyTheme(t: ThemeChoice, deviceDark: boolean) {
  const dark = t === 'dark' || (t === 'system' && deviceDark);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

let current: ThemeChoice | null = null;
const listeners = new Set<() => void>();
let watching = false;

function choice(): ThemeChoice {
  if (current === null) current = readTheme();
  return current;
}

function setChoice(t: ThemeChoice) {
  current = t;
  saveTheme(t);
  applyTheme(t, media().matches);
  listeners.forEach((fn) => fn());
}

/** Applies the saved choice and follows the device's appearance from then on (once) */
export function applySavedTheme() {
  applyTheme(choice(), media().matches);
  if (watching) return;
  watching = true;
  media().addEventListener('change', (e) => applyTheme(choice(), e.matches));
}

/** The current choice and a function to switch to the next one */
export function useTheme(): [ThemeChoice, () => void] {
  const theme = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    choice,
  );
  return [theme, () => setChoice(nextTheme(theme))];
}
