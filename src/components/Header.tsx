import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  activeSection: string;
}

export function Header({ activeSection }: HeaderProps) {
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
    { id: 'projets', label: t('nav.projects') },
    { id: 'a-propos', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0C]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all">
        {/* Sleek scroll line with neon green */}
        <div 
          className="h-[2px] bg-[#CCFF00] transition-all duration-75 origin-left"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo with baseline green dot right after the 'e' */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left group cursor-pointer inline-flex items-baseline"
          >
            <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-white transition-colors">
              Luca Leone<span className="text-[#CCFF00] font-black">.</span>
            </span>
          </button>

          {/* Right Navigation */}
          <div className="flex items-center gap-3">
            {/* Language Switcher (FR / EN) - Clean neutral with green accent */}
            <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-semibold backdrop-blur-md">
              <button
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'fr'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
                title="Passer en français"
              >
                FR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Nav displayed on desktop (md+) */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-medium shadow-2xs backdrop-blur-md" aria-label="Navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`cursor-pointer transition-all px-4 py-2 rounded-full ${
                    activeSection === item.id
                      ? 'bg-[#CCFF00] text-black font-bold shadow-xs'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white text-white hover:text-black text-xs font-semibold border border-white/10 transition-all shadow-2xs group"
              title="Profil LinkedIn de Luca Leone"
            >
              <Linkedin className="w-3.5 h-3.5 text-white group-hover:text-black transition-colors" />
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-[#A1A1AA] group-hover:text-black transition-colors" />
            </a>

            {/* Menu button ONLY shown on mobile/small screens (hidden on md+) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
              aria-label={t('nav.menu')}
            >
              {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5 text-white" />}
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
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-[#0E0E12] border-l border-white/10 shadow-2xl p-8 sm:p-10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs text-[#A1A1AA]">
              <span className="uppercase tracking-wider font-semibold">{t('nav.menu')}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center p-0.5 bg-white/[0.06] rounded-full text-xs font-semibold">
                  <button
                    onClick={() => setLang('fr')}
                    className={`px-2.5 py-1 rounded-full ${lang === 'fr' ? 'bg-white text-black font-bold' : 'text-zinc-400'}`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-full ${lang === 'en' ? 'bg-white text-black font-bold' : 'text-zinc-400'}`}
                  >
                    EN
                  </button>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors"
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
                  className="w-full text-left group block cursor-pointer p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <span className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-[#CCFF00] transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#A1A1AA]">
                <span className="font-medium">{lang === 'fr' ? 'Ingénierie des médias' : 'Media Engineering'}</span>
                <span className="font-medium">HEIG-VD</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={USER_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white hover:text-black text-white border border-white/10 font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors text-xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>

                <a
                  href={`mailto:${USER_INFO.email}`}
                  className="flex-1 py-2.5 rounded-full bg-white text-black hover:bg-[#CCFF00] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition-colors text-xs"
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
