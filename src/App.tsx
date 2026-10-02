import { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProjectDetailView } from './components/ProjectDetailView';
import { PointerHighlight } from './components/PointerHighlight';
import { InvertedCursor } from './components/InvertedCursor';
import { CommandPalette } from './components/CommandPalette';
import { LanguageHint } from './components/LanguageHint';
import { IntroCurtain, skipIntro } from './components/IntroCurtain';
import { NotFound } from './components/NotFound';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccentProvider } from './context/AccentContext';
import { getCustomProjects } from './data/projectsStorage';
import { homePath, RouterProvider, SECTION_IDS, sectionPath, useRouter } from './router';
import { getHeadData } from './seo';

/** Keeps <title>, description, canonical and <html lang> in sync on client-side navigation. */
function useDocumentHead() {
  const { route } = useRouter();

  useEffect(() => {
    const head = getHeadData(route);
    document.title = head.title;
    document.documentElement.lang = head.lang;
    document.querySelector('meta[name="description"]')?.setAttribute('content', head.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', head.canonical);
  }, [route]);
}

function PortfolioApp() {
  const projectsData = getCustomProjects();
  const { lang } = useLanguage();
  const { route, syncPath } = useRouter();

  const allProjects = lang === 'fr' ? projectsData.fr : projectsData.en;
  const selectedProject =
    route.name === 'project' ? allProjects.find((p) => p.id === route.slug) ?? null : null;

  useDocumentHead();

  // First-party page view (server/analytics.ts): path + referrer only, no cookie, no IP.
  // Skipped for visitors with Do Not Track. Scrolling between home sections isn't a new view.
  const view = route.name === 'project' ? `project:${route.lang}:${route.slug}` : `${route.name}:${route.lang}`;
  useEffect(() => {
    if (navigator.doNotTrack === '1' || !navigator.sendBeacon) return;
    navigator.sendBeacon('/api/hit', JSON.stringify({ p: window.location.pathname, r: document.referrer }));
  }, [view]);

  // Unknown URLs (or a removed project slug) get a real 404 page
  const notFound = route.name === 'notFound' || (route.name === 'project' && !selectedProject);

  // The intro curtain only plays when the visit starts on the home page: someone opening a
  // shared project link shouldn't wait for it. Decided once, on first render.
  // (A link straight to a section — /contact — skips it too.)
  const [playIntro] = useState(() => {
    const isHome = route.name === 'home' && !route.section;
    if (!isHome) skipIntro();
    return isHome;
  });

  // Scroll spy: on the home page the URL follows the section being read (/projets,
  // /a-propos, /contact, or / above them), without adding history entries. The header
  // highlights the section from the URL.
  const isHome = route.name === 'home';
  useEffect(() => {
    if (!isHome) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = window.scrollY + 250;
      const current = SECTION_IDS.find((id) => {
        const el = document.getElementById(id);
        return !!el && probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight;
      });
      syncPath(current ? sectionPath(lang, current) : homePath(lang));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [isHome, lang, syncPath]);

  const activeSection = selectedProject ? 'projets' : route.name === 'home' ? route.section ?? 'hero' : '';

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white font-sans antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-[var(--accent-primary)] dark:selection:text-[var(--accent-text)] relative overflow-x-clip transition-colors duration-300">
      {/* Skip link: first Tab stop, jumps over the header (keyboard / screen-reader users) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:px-4 focus:py-2.5 focus:rounded-full focus:bg-[var(--accent)] focus:text-[var(--accent-contrast-text)] focus:font-bold focus:text-sm"
      >
        {lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}
      </a>

      {/* Typographic intro curtain (home page landings only) */}
      {playIntro && <IntroCurtain />}

      {/* Inverted round cursor + accent outline that glides onto links and buttons */}
      <InvertedCursor />
      <PointerHighlight />

      {/* ⌘K / Ctrl+K */}
      <CommandPalette />

      {/* "English version available" for browsers that don't ask for French (and vice versa) */}
      <LanguageHint />

      {/* Editorial Navigation Masthead */}
      <Header activeSection={activeSection} />

      {/* Main Content Area: home, project page, or 404 */}
      {notFound ? (
        <NotFound />
      ) : route.name === 'privacy' ? (
        <PrivacyPolicy />
      ) : selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          projects={allProjects}
          backHref={sectionPath(lang, 'projets')}
        />
      ) : (
        <main id="main-content" className="relative z-10">
          <Hero />
          <SkillsSection />
          <ProjectsSection />
          <AboutSection />
          <ContactSection />
        </main>
      )}
    </div>
  );
}

/** `initialUrl` is only passed by the build-time prerender; the browser reads window.location. */
export default function App({ initialUrl }: { initialUrl?: string }) {
  return (
    <RouterProvider initialUrl={initialUrl}>
      {/* "user": honours prefers-reduced-motion (transforms are skipped, opacity kept) */}
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <AccentProvider>
            <LanguageProvider>
              <PortfolioApp />
            </LanguageProvider>
          </AccentProvider>
        </ThemeProvider>
      </MotionConfig>
    </RouterProvider>
  );
}
