import { useEffect, useState } from 'react';

/** The atelier's light / dark choice: follows the device unless set, remembered on this device */
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

/** The current choice and a function to switch to the next one */
export function useTheme(): [ThemeChoice, () => void] {
  const [theme, setTheme] = useState<ThemeChoice>(readTheme);
  useEffect(() => {
    const mq = media();
    const apply = () => applyTheme(theme, mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  return [
    theme,
    () => {
      const next = nextTheme(theme);
      saveTheme(next);
      setTheme(next);
    },
  ];
}

/** Before the first render, so the page doesn't flash in the wrong theme */
export const applySavedTheme = () => applyTheme(readTheme(), media().matches);
