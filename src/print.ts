import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

/**
 * Print mode, between the browser's beforeprint and afterprint. The whole site prints with
 * everything visible: components that keep content behind an interaction (the skills'
 * details, shown on hover) read usePrinting() and show it all. The re-render is flushed
 * synchronously, before the browser lays the page out for paper. Paper is white, so the
 * page prints in the light theme and the visitor's theme comes back afterwards.
 */

let printing = false;
const listeners = new Set<() => void>();

const set = (value: boolean) => {
  printing = value;
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function usePrinting() {
  return useSyncExternalStore(subscribe, () => printing, () => false);
}

/** Called once by App */
export function watchPrinting() {
  let wasDark = false;
  const before = () => {
    wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    // Images below the fold are lazy: load them all for paper
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    flushSync(() => set(true));
  };
  const after = () => {
    if (wasDark) document.documentElement.classList.add('dark');
    set(false);
  };
  window.addEventListener('beforeprint', before);
  window.addEventListener('afterprint', after);
  return () => {
    window.removeEventListener('beforeprint', before);
    window.removeEventListener('afterprint', after);
  };
}
