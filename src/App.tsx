import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProjectModal } from './components/ProjectModal';
import { AdminModal } from './components/AdminModal';
import { MagneticCursor } from './components/MagneticCursor';
import { IntroCurtain } from './components/IntroCurtain';
import { Project } from './types';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Ensure clean default font preset is applied
  useEffect(() => {
    document.documentElement.removeAttribute('data-font-preset');
    localStorage.removeItem('portfolio-font-preset');
  }, []);

  // Keyboard shortcut: Ctrl+E or Cmd+E to toggle hidden admin editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Intersection Observer for scroll spy
  useEffect(() => {
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
  }, []);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#0A0A0C] text-white font-sans antialiased selection:bg-[#CCFF00] selection:text-black relative overflow-hidden">
        {/* Pattern #4: Typographic Intro Curtain */}
        <IntroCurtain />

        {/* Pattern #1: Magnetic Custom Cursor */}
        <MagneticCursor />

        {/* Editorial Navigation Masthead */}
        <Header activeSection={activeSection} />

        {/* Main Content Sections */}
        <main id="main-content" className="relative z-10">
          <Hero />
          <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />
          <AboutSection />
          <ContactSection onOpenAdmin={() => setIsAdminOpen(true)} />
        </main>

        {/* Detailed Project Case Study Modal */}
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />

        {/* Hidden In-Browser Content & Project Editor (Ctrl+E or footer trigger) */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      </div>
    </LanguageProvider>
  );
}
