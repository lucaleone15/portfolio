import React, { useEffect } from 'react';

/**
 * Applies the accent palette chosen in src/theme/colors.ts (ACTIVE_ACCENT_ID) as CSS variables.
 * The active palette's values are also the defaults in index.css, so the first paint is
 * already right; the 40-palette catalogue is loaded afterwards in its own chunk (it isn't
 * needed to render the page) and only matters if ACTIVE_ACCENT_ID is changed.
 */
export function AccentProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    import('../theme/colors').then(({ ACCENT_PALETTES, ACTIVE_ACCENT_ID }) => {
      if (cancelled) return;
      const accent = ACCENT_PALETTES.find((p) => p.id === ACTIVE_ACCENT_ID) || ACCENT_PALETTES[0];
      const root = document.documentElement;
      root.style.setProperty('--accent-primary', accent.hexDark);
      root.style.setProperty('--accent-text', accent.contrastTextDark);
      root.style.setProperty('--accent-rgb-dark', accent.rgbDark);
      root.style.setProperty('--accent-glow-dark', accent.glowDark);
      root.style.setProperty('--accent-light', accent.hexLight);
      root.style.setProperty('--accent-light-text', accent.contrastTextLight);
      root.style.setProperty('--accent-rgb-light', accent.rgbLight);
      root.style.setProperty('--accent-glow-light', accent.glowLight);
      root.setAttribute('data-accent', accent.id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
