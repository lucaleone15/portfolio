// Browser APIs jsdom lacks, used by the site's components (scroll reveals, media queries)
if (typeof window !== 'undefined') {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= IO;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= IO;
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Node 26 defines its own (empty) global localStorage, which hides jsdom's: use jsdom's
const jsdomWindow = (globalThis as unknown as { jsdom?: { window: Window } }).jsdom?.window;
if (jsdomWindow && !globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', { value: jsdomWindow.localStorage, configurable: true });
}
