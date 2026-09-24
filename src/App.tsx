import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProjectDetailView } from './components/ProjectDetailView';
import { MagneticCursor } from './components/MagneticCursor';
import { IntroCurtain } from './components/IntroCurtain';
import { Project } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccentProvider } from './context/AccentContext';
import { getCustomProjects } from './data/projectsStorage';

function PortfolioApp() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const projectsData = getCustomProjects();
  const { lang } = useLanguage();

  const allProjects = lang === 'fr' ? projectsData.fr : projectsData.en;

  // Block any Ctrl+E or Meta+E shortcut to ensure on-site editing is disabled
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ensure clean default font preset is applied
  useEffect(() => {
    document.documentElement.removeAttribute('data-font-preset');
    localStorage.removeItem('portfolio-font-preset');
  }, []);

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

  const handleNavigateHome = (targetSectionId?: string) => {
    setSelectedProject(null);
    if (targetSectionId) {
      setTimeout(() => {
        const el = document.getElementById(targetSectionId);
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white font-sans antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-[var(--accent-primary)] dark:selection:text-[var(--accent-text)] relative overflow-hidden transition-colors duration-300">
      {/* Pattern #4: Typographic Intro Curtain */}
      <IntroCurtain />

      {/* Pattern #1: Magnetic Custom Cursor */}
      <MagneticCursor />

      {/* Editorial Navigation Masthead */}
      <Header 
        activeSection={selectedProject ? 'projets' : activeSection} 
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Area: switches seamlessly between Home and Full Project Page */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          projects={allProjects}
          onBack={() => {
            setSelectedProject(null);
            setTimeout(() => {
              const el = document.getElementById('projets');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          onNavigateProject={(proj) => setSelectedProject(proj)}
        />
      ) : (
        <main id="main-content" className="relative z-10">
          <Hero />
          <SkillsSection />
          <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />
          <AboutSection />
          <ContactSection />
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AccentProvider>
        <LanguageProvider>
          <PortfolioApp />
        </LanguageProvider>
      </AccentProvider>
    </ThemeProvider>
  );
}
