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
import { IntroCurtain, skipIntro } from './components/IntroCurtain';
import { NotFound } from './components/NotFound';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccentProvider } from './context/AccentContext';
import { getCustomProjects } from './data/projectsStorage';
import { RouterProvider, sectionPath, useRouter } from './router';
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
  const [activeSection, setActiveSection] = useState<string>('hero');
  const projectsData = getCustomProjects();
  const { lang } = useLanguage();
  const { route } = useRouter();

  const allProjects = lang === 'fr' ? projectsData.fr : projectsData.en;
  const selectedProject =
    route.name === 'project' ? allProjects.find((p) => p.id === route.slug) ?? null : null;

  useDocumentHead();

  // First-party page view (server/analytics.ts): path + referrer only, no cookie, no IP.
  // Skipped for visitors with Do Not Track.
  useEffect(() => {
    if (navigator.doNotTrack === '1' || !navigator.sendBeacon) return;
    navigator.sendBeacon('/api/hit', JSON.stringify({ p: window.location.pathname, r: document.referrer }));
  }, [route]);

  // Unknown URLs (or a removed project slug) get a real 404 page
  const notFound = route.name === 'notFound' || (route.name === 'project' && !selectedProject);

  // The intro curtain only plays when the visit starts on the home page: someone opening a
  // shared project link shouldn't wait for it. Decided once, on first render.
  const [playIntro] = useState(() => {
    const isHome = route.name === 'home';
    if (!isHome) skipIntro();
    return isHome;
  });

  // Intersection Observer for scroll spy (when not viewing a project detail page)
  useEffect(() => {
    if (selectedProject) return;

    const sectionIds = ['projets', 'a-propos', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            return;
          }
        }
      }

      if (window.scrollY < 300) {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white font-sans antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-[var(--accent-primary)] dark:selection:text-[var(--accent-text)] relative overflow-x-clip transition-colors duration-300">
      {/* Typographic intro curtain (home page landings only) */}
      {playIntro && <IntroCurtain />}

      {/* Inverted round cursor + accent outline that glides onto links and buttons */}
      <InvertedCursor />
      <PointerHighlight />

      {/* ⌘K / Ctrl+K */}
      <CommandPalette />

      {/* Editorial Navigation Masthead */}
      <Header activeSection={selectedProject ? 'projets' : activeSection} />

      {/* Main Content Area: home, project page, or 404 */}
      {notFound ? (
        <NotFound />
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
