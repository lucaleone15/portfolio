import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'portfolio_theme';
const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Theme = the visitor's explicit choice if they made one, otherwise the system setting
 * (followed live). The inline script in index.html applies the same rule before first paint.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // First render must match the prerendered HTML (hydration), which assumes 'dark'. The real
  // theme was already applied to <html> by the inline script in index.html; it's read here
  // before the first paint, so the toggle icon is right from the start.
  const [theme, setThemeState] = useState<Theme>('dark');

  useIsomorphicLayoutEffect(() => {
    setThemeState(document.documentElement.classList.contains('light') ? 'light' : 'dark');
  }, []);

  // <html> is only touched when the theme actually changes (toggle or system switch); on load
  // the inline script has already set it
  const applyToDocument = (next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.classList.toggle('light', next === 'light');
    root.setAttribute('data-theme', next);
    root.style.colorScheme = next;
  };

  // No explicit choice yet: follow the system when it switches (e.g. automatic dark mode at night)
  useEffect(() => {
    const query = systemQuery();
    const onChange = (e: MediaQueryListEvent) => {
      if (readSavedTheme()) return;
      const next: Theme = e.matches ? 'dark' : 'light';
      applyToDocument(next);
      setThemeState(next);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    applyToDocument(newTheme);
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable: the choice lasts for this page view only
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
