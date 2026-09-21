import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeSection: string;
  onNavigateHome?: (sectionId?: string) => void;
}

export function Header({ activeSection, onNavigateHome }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome(id);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'projets', label: t('nav.projects'), index: t('projects.index') || '01' },
    { id: 'a-propos', label: t('nav.about'), index: t('about.index') || '02' },
    { id: 'contact', label: t('nav.contact'), index: t('contact.index') || '03' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0A0A0C]/85 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-colors duration-300">
        {/* Sleek scroll line */}
        <div 
          className="h-[2px] bg-neutral-900 dark:bg-[#CCFF00] transition-all duration-75 origin-left"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo with baseline dot */}
          <button 
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-left group cursor-pointer inline-flex items-baseline"
          >
            <span className="font-syne text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors">
              Luca Leone<span className="text-[#CCFF00] font-bold drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]">.</span>
            </span>
          </button>

          {/* Right Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher (FR / EN) */}
            <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-full text-xs font-semibold backdrop-blur-md">
              <button
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-full font-syne text-xs transition-all cursor-pointer ${
                  lang === 'fr'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-500 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white font-medium'
                }`}
                title="Passer en français"
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full font-syne text-xs transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'text-neutral-500 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white font-medium'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Nav displayed on desktop (md+) */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-full text-xs font-syne shadow-2xs backdrop-blur-md" aria-label="Navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`cursor-pointer transition-all px-4 py-2 rounded-full font-syne text-xs ${
                    activeSection === item.id
                      ? 'bg-neutral-900 text-white dark:bg-[#CCFF00] dark:text-black font-bold shadow-xs'
                      : 'text-neutral-600 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] font-semibold'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* LinkedIn direct button on desktop */}
            <a
              href={USER_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] hover:bg-black dark:bg-white/[0.04] dark:hover:bg-white text-neutral-900 hover:text-white dark:text-white dark:hover:text-black text-xs font-syne font-bold border border-black/10 dark:border-white/10 transition-all shadow-2xs group"
              title="Profil LinkedIn de Luca Leone"
            >
              <Linkedin className="w-3.5 h-3.5 text-neutral-800 dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" />
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-neutral-500 dark:text-[#A1A1AA] group-hover:text-white dark:group-hover:text-black transition-colors" />
            </a>

            {/* Menu button ONLY shown on mobile/small screens (hidden on md+) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/10 text-neutral-900 dark:text-white text-xs font-syne font-bold cursor-pointer transition-all shadow-xs"
              aria-label={t('nav.menu')}
            >
              {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span>{isMenuOpen ? t('nav.close') : t('nav.menu')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-white dark:bg-[#0E0E12] border-l border-black/10 dark:border-white/10 shadow-2xl p-8 sm:p-10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 text-xs text-neutral-500 dark:text-[#A1A1AA]">
              <span className="uppercase tracking-wider font-semibold">{t('nav.menu')}</span>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center p-0.5 bg-black/5 dark:bg-white/[0.06] rounded-full text-xs font-semibold">
                  <button
                    onClick={() => setLang('fr')}
                    className={`px-2.5 py-1 rounded-full ${lang === 'fr' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-neutral-500 dark:text-zinc-400'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-full ${lang === 'en' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-neutral-500 dark:text-zinc-400'}`}
                  >
                    EN
                  </button>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-900 dark:text-white cursor-pointer transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 my-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="w-full text-left group flex items-baseline gap-4 cursor-pointer p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all"
                >
                  <span className="font-serif italic text-2xl sm:text-3xl text-neutral-400 dark:text-white/40 group-hover:text-black dark:group-hover:text-[#CCFF00] font-normal select-none transition-colors shrink-0">
                    {item.index}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-black/10 dark:border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-[#A1A1AA]">
                <span className="font-medium">{lang === 'fr' ? 'Ingénierie des médias' : 'Media Engineering'}</span>
                <span className="font-medium">HEIG-VD</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={USER_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-full bg-black/5 hover:bg-black hover:text-white dark:bg-white/5 dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-white border border-black/10 dark:border-white/10 font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors text-xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href={`mailto:${USER_INFO.email}`}
                  className="flex-1 py-2.5 rounded-full bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-[#CCFF00] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition-colors text-xs"
                >
                  <span>Email</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
