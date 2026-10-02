import {
  AnchorHTMLAttributes,
  createContext,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { Language } from './types';

/**
 * Tiny history-API router. The site only has two kinds of pages, so a library
 * would be overkill:
 *   /                    FR home        /en/                   EN home
 *   /projets/:slug       FR project     /en/projects/:slug     EN project
 * Sections of the home page (#projets, #a-propos, #contact) stay hash anchors.
 */

export type Route =
  | { name: 'home'; lang: Language }
  | { name: 'project'; lang: Language; slug: string }
  | { name: 'notFound'; lang: Language };

export function homePath(lang: Language): string {
  return lang === 'fr' ? '/' : '/en/';
}

export function projectPath(lang: Language, slug: string): string {
  return lang === 'fr' ? `/projets/${slug}` : `/en/projects/${slug}`;
}

/** Link to a section of the home page, e.g. sectionPath('en', 'contact') -> /en/#contact */
export function sectionPath(lang: Language, sectionId: string): string {
  return `${homePath(lang)}#${sectionId}`;
}

export function pathFor(route: Route): string {
  if (route.name === 'project') return projectPath(route.lang, route.slug);
  return homePath(route.lang);
}

/** Same page in the other language */
export function alternatePath(route: Route, lang: Language): string {
  return pathFor({ ...route, lang } as Route);
}

export function parsePath(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const isEn = clean === '/en' || clean.startsWith('/en/');
  const lang: Language = isEn ? 'en' : 'fr';
  const rest = isEn ? clean.slice(3) || '/' : clean;

  if (rest === '/') return { name: 'home', lang };

  const match = rest.match(isEn ? /^\/projects\/([a-z0-9-]+)$/ : /^\/projets\/([a-z0-9-]+)$/);
  if (match) return { name: 'project', lang, slug: match[1] };

  return { name: 'notFound', lang };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Page changes run inside a View Transition: elements sharing a `view-transition-name`
 * (a project card's image and the project page's main visual) morph into each other.
 * flushSync makes React commit (and the router restore scroll) inside the callback, so the
 * browser snapshots the finished new page. Unsupported browsers / reduced motion: instant.
 */
function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}

interface Location {
  pathname: string;
  hash: string;
  /** Scroll position to restore (back/forward), or null to apply hash/top logic */
  restoreY: number | null;
  /** Keep the current scroll position (e.g. switching language) */
  keepScroll: boolean;
  /** Smooth-scroll to the hash: only for same-page anchor jumps */
  smooth: boolean;
  /** Bumps on every navigation so re-clicking the same anchor scrolls again */
  key: number;
}

interface NavigateOptions {
  replace?: boolean;
  keepScroll?: boolean;
}

interface RouterContextValue {
  route: Route;
  hash: string;
  navigate: (to: string, options?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

// useLayoutEffect warns during SSR; scrolling only matters in the browser anyway
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function initialLocation(initialUrl?: string): Location {
  const base = { restoreY: null, keepScroll: false, smooth: false, key: 0 };
  if (initialUrl !== undefined) {
    const url = new URL(initialUrl, 'https://luca-leone.ch');
    return { ...base, pathname: url.pathname, hash: url.hash };
  }

  // Legacy ?lang=en links (old hreflang) now live under /en/
  const params = new URLSearchParams(window.location.search);
  if (params.get('lang') === 'en' && window.location.pathname === '/') {
    window.history.replaceState(null, '', '/en/' + window.location.hash);
  }
  return { ...base, pathname: window.location.pathname, hash: window.location.hash };
}

export function RouterProvider({ initialUrl, children }: { initialUrl?: string; children: ReactNode }) {
  const [location, setLocation] = useState<Location>(() => initialLocation(initialUrl));
  const keyRef = useRef(0);
  const currentPathRef = useRef(location.pathname);
  currentPathRef.current = location.pathname;

  useEffect(() => {
    // We restore scroll ourselves: the browser would restore it before React swaps the page
    window.history.scrollRestoration = 'manual';

    const onPopState = (e: PopStateEvent) => {
      const restoreY = typeof e.state?.scrollY === 'number' ? e.state.scrollY : null;
      const pageChanged = window.location.pathname !== currentPathRef.current;
      const apply = () => setLocation({
        pathname: window.location.pathname,
        hash: window.location.hash,
        restoreY,
        keepScroll: false,
        smooth: false,
        key: ++keyRef.current,
      });
      if (pageChanged) withViewTransition(apply);
      else apply();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const url = new URL(to, window.location.href);
    const samePage = url.pathname === window.location.pathname;

    // Remember where we were, so Back lands on the same spot
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '');

    const state = { scrollY: options.keepScroll ? window.scrollY : 0 };
    const href = url.pathname + url.search + url.hash;
    // In-page anchor jumps don't deserve their own history entry
    if (options.replace || (samePage && url.hash)) {
      window.history.replaceState(state, '', href);
    } else {
      window.history.pushState(state, '', href);
    }

    const apply = () =>
      setLocation({
        pathname: url.pathname,
        hash: url.hash,
        restoreY: null,
        keepScroll: !!options.keepScroll,
        smooth: samePage && !!url.hash,
        key: ++keyRef.current,
      });
    // Only real page changes morph; in-page anchor jumps just scroll
    if (samePage) apply();
    else withViewTransition(apply);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (location.keepScroll) return;
    if (location.restoreY !== null) {
      window.scrollTo({ top: location.restoreY, behavior: 'instant' });
      return;
    }
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior: location.smooth && !prefersReducedMotion() ? 'smooth' : 'instant' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.key, location.pathname]);

  const route = useMemo(() => parsePath(location.pathname), [location.pathname]);

  const value = useMemo(() => ({ route, hash: location.hash, navigate }), [route, location.hash, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within a RouterProvider');
  return ctx;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  replace?: boolean;
  keepScroll?: boolean;
};

/** A real, crawlable <a href> that navigates client-side on plain left clicks. */
export function Link({ href, replace, keepScroll, onClick, target, ...rest }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (target && target !== '_self')
    ) {
      return; // let the browser handle new tabs, downloads, etc.
    }
    e.preventDefault();
    navigate(href, { replace, keepScroll });
  };

  return <a href={href} target={target} onClick={handleClick} {...rest} />;
}
