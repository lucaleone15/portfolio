import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
  ACCENT_PALETTES,
  ACTIVE_ACCENT_ID,
  AccentColorDefinition
} from '../theme/colors';

export type AccentColorOption = AccentColorDefinition;

interface AccentContextType {
  currentAccent: AccentColorDefinition;
  presets: AccentColorDefinition[];
}

const AccentContext = createContext<AccentContextType | undefined>(undefined);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  // Always use the configured ACTIVE_ACCENT_ID from src/theme/colors.ts directly
  const currentAccent = useMemo(() => {
    return (
      ACCENT_PALETTES.find((p) => p.id === ACTIVE_ACCENT_ID) ||
      ACCENT_PALETTES[0]
    );
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Dark mode variables (electric, vibrant)
    root.style.setProperty('--accent-primary', currentAccent.hexDark);
    root.style.setProperty('--accent-text', currentAccent.contrastTextDark);
    root.style.setProperty('--accent-rgb-dark', currentAccent.rgbDark);
    root.style.setProperty('--accent-glow-dark', currentAccent.glowDark);

    // Light mode variables (high contrast on white / light paper backgrounds)
    root.style.setProperty('--accent-light', currentAccent.hexLight);
    root.style.setProperty('--accent-light-text', currentAccent.contrastTextLight);
    root.style.setProperty('--accent-rgb-light', currentAccent.rgbLight);
    root.style.setProperty('--accent-glow-light', currentAccent.glowLight);

    root.setAttribute('data-accent', currentAccent.id);
  }, [currentAccent]);

  return (
    <AccentContext.Provider
      value={{
        currentAccent,
        presets: ACCENT_PALETTES,
      }}
    >
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  const context = useContext(AccentContext);
  if (!context) {
    throw new Error('useAccent must be used within an AccentProvider');
  }
  return context;
}
