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
 * Tiny history-API router. The site only has a few kinds of pages, so a library
 * would be overkill:
 *   /                    FR home        /en/                   EN home
 *   /projets/:slug       FR project     /en/projects/:slug     EN project
 *   /confidentialite     FR privacy     /en/privacy            EN privacy
 *
 * The home page is one long scrolling page, but each of its sections has its own URL:
 *   /projets  /a-propos  /contact        /en/projects  /en/about  /en/contact
 * They all render the home page and land on that section. Moving between them never
 * reloads: menu links scroll smoothly, and the URL follows the scroll (see syncPath).
 */

/** DOM ids of the home page sections */
export type SectionId = 'projets' | 'a-propos' | 'contact';
export const SECTION_IDS: SectionId[] = ['projets', 'a-propos', 'contact'];

const SECTION_SLUGS: Record<Language, Record<SectionId, string>> = {
  fr: { projets: 'projets', 'a-propos': 'a-propos', contact: 'contact' },
  en: { projets: 'projects', 'a-propos': 'about', contact: 'contact' },
};

export type Route =
  | { name: 'home'; lang: Language; section?: SectionId }
  | { name: 'project'; lang: Language; slug: string }
  | { name: 'privacy'; lang: Language }
  | { name: 'notFound'; lang: Language };

export function homePath(lang: Language): string {
  return lang === 'fr' ? '/' : '/en/';
}

export function projectPath(lang: Language, slug: string): string {
  return lang === 'fr' ? `/projets/${slug}` : `/en/projects/${slug}`;
}

export function privacyPath(lang: Language): string {
  return lang === 'fr' ? '/confidentialite' : '/en/privacy';
}

/** A section of the home page, e.g. sectionPath('en', 'a-propos') -> /en/about */
export function sectionPath(lang: Language, section: SectionId): string {
  return `${lang === 'fr' ? '' : '/en'}/${SECTION_SLUGS[lang][section]}`;
}

export function pathFor(route: Route): string {
  if (route.name === 'project') return projectPath(route.lang, route.slug);
  if (route.name === 'privacy') return privacyPath(route.lang);
  if (route.name === 'home' && route.section) return sectionPath(route.lang, route.section);
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
  const section = SECTION_IDS.find((id) => rest === `/${SECTION_SLUGS[lang][id]}`);
  if (section) return { name: 'home', lang, section };
  if (rest === (isEn ? '/privacy' : '/confidentialite')) return { name: 'privacy', lang };

  const match = rest.match(isEn ? /^\/projects\/([a-z0-9-]+)$/ : /^\/projets\/([a-z0-9-]+)$/);
  if (match) return { name: 'project', lang, slug: match[1] };

  return { name: 'notFound', lang };
}

/**
 * What's on screen for a path: every section URL of the same home page is one view, so
 * moving between them scrolls instead of swapping the page.
 */
function viewOf(pathname: string): string {
  const route = parsePath(pathname);
  if (route.name === 'home') return `home:${route.lang}`;
  return pathname.replace(/\/+$/, '') || '/';
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
  /** false when only the URL followed the scroll (syncPath): nothing to scroll */
  scroll: boolean;
}

interface NavigateOptions {
  replace?: boolean;
  keepScroll?: boolean;
}

interface RouterContextValue {
  route: Route;
  hash: string;
  navigate: (to: string, options?: NavigateOptions) => void;
  /** Swap the URL for another one of the same view (no history entry, no scroll) */
  syncPath: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

// useLayoutEffect warns during SSR; scrolling only matters in the browser anyway
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function initialLocation(initialUrl?: string): Location {
  const base = { restoreY: null, keepScroll: false, smooth: false, key: 0, scroll: true };
  if (initialUrl !== undefined) {
    const url = new URL(initialUrl, 'https://luca-leone.ch');
    return { ...base, pathname: url.pathname, hash: url.hash };
  }

  // Legacy ?lang=en links (old hreflang) now live under /en/
  const params = new URLSearchParams(window.location.search);
  if (params.get('lang') === 'en' && window.location.pathname === '/') {
    window.history.replaceState(null, '', '/en/' + window.location.hash);
  }
  // Old section anchors (/#contact, /en/#a-propos) now have their own URL
  const route = parsePath(window.location.pathname);
  const legacySection = SECTION_IDS.find((id) => window.location.hash === `#${id}`);
  if (route.name === 'home' && !route.section && legacySection) {
    window.history.replaceState(null, '', sectionPath(route.lang, legacySection));
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
      const pageChanged = viewOf(window.location.pathname) !== viewOf(currentPathRef.current);
      const apply = () => setLocation({
        pathname: window.location.pathname,
        hash: window.location.hash,
        restoreY,
        keepScroll: false,
        smooth: false,
        key: ++keyRef.current,
        scroll: true,
      });
      if (pageChanged) withViewTransition(apply);
      else apply();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const url = new URL(to, window.location.href);
    const samePage = viewOf(url.pathname) === viewOf(window.location.pathname);
    // Moving within the home page (a section, or back to the top) is a scroll, not a page
    const inPage = samePage && (!!url.hash || parsePath(url.pathname).name === 'home');

    // Remember where we were, so Back lands on the same spot
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '');

    const state = { scrollY: options.keepScroll ? window.scrollY : 0 };
    const href = url.pathname + url.search + url.hash;
    // In-page jumps don't deserve their own history entry
    if (options.replace || inPage) {
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
        smooth: inPage,
        key: ++keyRef.current,
        scroll: true,
      });
    // Only real page changes morph; in-page jumps just scroll
    if (samePage) apply();
    else withViewTransition(apply);
  }, []);

  const syncPath = useCallback((to: string) => {
    if (to === window.location.pathname) return;
    window.history.replaceState(window.history.state, '', to + window.location.search);
    setLocation((current) => ({ ...current, pathname: to, hash: '', scroll: false }));
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!location.scroll || location.keepScroll) return;
    if (location.restoreY !== null) {
      window.scrollTo({ top: location.restoreY, behavior: 'instant' });
      return;
    }
    const target = parsePath(location.pathname);
    const anchor =
      target.name === 'home' && target.section ? target.section : decodeURIComponent(location.hash.slice(1));
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: location.smooth && !prefersReducedMotion() ? 'smooth' : 'instant' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: location.smooth && !prefersReducedMotion() ? 'smooth' : 'instant' });
  }, [location.key, location.pathname]);

  const route = useMemo(() => parsePath(location.pathname), [location.pathname]);

  const value = useMemo(
    () => ({ route, hash: location.hash, navigate, syncPath }),
    [route, location.hash, navigate, syncPath],
  );

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
