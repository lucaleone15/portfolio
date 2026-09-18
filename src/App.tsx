import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ProjectModal } from './components/ProjectModal';
import { MagneticCursor } from './components/MagneticCursor';
import { IntroCurtain } from './components/IntroCurtain';
import { Project } from './types';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Ensure clean default font preset is applied
  useEffect(() => {
    document.documentElement.removeAttribute('data-font-preset');
    localStorage.removeItem('portfolio-font-preset');
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
        {/* Subtle ambient lighting - dark glass atmosphere with neon green tint */}
        <div className="fixed top-20 left-[10%] w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed top-[45%] right-[5%] w-[450px] h-[450px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-[15%] left-[5%] w-[550px] h-[550px] bg-[#CCFF00]/4 rounded-full blur-[150px] pointer-events-none -z-10" />

        {/* Pattern #4: Typographic Intro Curtain */}
        <IntroCurtain />

        {/* Pattern #1: Magnetic Custom Cursor */}
        <MagneticCursor />

        {/* Editorial Navigation Masthead */}
        <Header activeSection={activeSection} />

        {/* Main Content Sections */}
        <main id="main-content">
          <Hero />
          <ProjectsSection onSelectProject={(project) => setSelectedProject(project)} />
          <AboutSection />
          <ContactSection />
        </main>

        {/* Detailed Project Case Study Modal */}
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </LanguageProvider>
  );
}
