import { RefObject, useEffect } from 'react';

/**
 * Pauses the CSS animations inside `ref` while it's off-screen (or the tab is hidden) by
 * toggling `data-offscreen`; pair with `[data-offscreen] … { animation-play-state: paused }`.
 * Saves battery: infinite background animations otherwise keep running all page long.
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.removeAttribute('data-offscreen');
      else el.setAttribute('data-offscreen', '');
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
