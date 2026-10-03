import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight01Icon, Cancel01Icon, Linkedin02Icon, Menu01Icon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CommandPaletteHint } from './CommandPalette';
import { alternatePath, homePath, Link, SectionId, sectionPath, useRouter } from '../router';

interface HeaderProps {
  activeSection: string;
}

function ThemeToggle() {
  const { lang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const label =
    theme === 'dark'
      ? (lang === 'fr' ? 'Passer en mode clair' : 'Switch to light mode')
      : (lang === 'fr' ? 'Passer en mode sombre' : 'Switch to dark mode');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 inline-flex items-center justify-center rounded-full text-neutral-600 hover:text-black dark:text-[#A1A1AA] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition cursor-pointer active:scale-[0.97]"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <Icon icon={Sun03Icon} className="w-4 h-4" /> : <Icon icon={Moon02Icon} className="w-4 h-4" />}
    </button>
  );
}

export function Header({ activeSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, t } = useLanguage();
  const { route } = useRouter();
  const closeMenu = () => setIsMenuOpen(false);
  // Drives the progress line through a transform, without re-rendering on every scroll event
  const { scrollYProgress } = useScroll();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Open drawer: Escape closes it, the page behind can't scroll, focus moves inside
  useEffect(() => {
    if (!isMenuOpen) return;
    const menuButton = menuButtonRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      menuButton?.focus({ preventScroll: true });
    };
  }, [isMenuOpen]);

  const navItems: { id: SectionId; label: string; index: string }[] = [
    { id: 'projets', label: t('nav.projects'), index: t('projects.index') || '01' },
    { id: 'a-propos', label: t('nav.about'), index: t('about.index') || '02' },
    { id: 'contact', label: t('nav.contact'), index: t('contact.index') || '03' },
  ];

  return (
    <>
      {/* Floating liquid-glass bar: the page scrolls underneath it */}
      <header className="[view-transition-name:site-header] fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <div className="glass-bar pointer-events-auto relative max-w-7xl mx-auto rounded-full pl-5 pr-2 sm:pl-7 sm:pr-2.5 h-14 sm:h-16 flex items-center justify-between overflow-hidden">
          {/* Sleek scroll line along the bottom edge */}
          <motion.div
            className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-[var(--accent)] origin-left"
            style={{ scaleX: scrollYProgress }}
            aria-hidden="true"
          />

          {/* Logo with baseline dot */}
          <Link
            href={homePath(lang)}
            aria-label={lang === 'fr' ? 'Luca Leone, accueil' : 'Luca Leone, home'}
            className="text-left group cursor-pointer inline-flex items-baseline"
          >
            <span className="font-syne text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors">
              Luca Leone<span className="text-[var(--accent)] font-bold drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]">.</span>
            </span>
          </Link>

          {/* Right side: sections, then one compact group for site preferences */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Nav displayed on desktop (md+) */}
            <nav className="hidden md:flex items-center gap-1 text-xs" aria-label="Navigation">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={sectionPath(lang, item.id)}
                  aria-current={activeSection === item.id ? 'location' : undefined}
                  className={`font-syne cursor-pointer transition px-4 py-2 rounded-full text-xs active:scale-[0.97] ${
                    activeSection === item.id
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast-text)] font-bold shadow-[0_4px_14px_-4px_rgba(var(--accent-rgb),0.6)]'
                      : 'text-neutral-600 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] font-semibold'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Preferences (desktop): language + theme share one pill; on mobile they live in the menu */}
            <span className="hidden md:block w-px h-5 mx-2 bg-black/10 dark:bg-white/15" aria-hidden="true" />
            <div className="hidden md:flex items-center gap-0.5 text-xs font-semibold">
                <Link
                  href={alternatePath(route, 'fr')}
                  keepScroll
                  hrefLang="fr"
                  aria-current={lang === 'fr' ? 'true' : undefined}
                  className={`font-syne px-2.5 py-1 rounded-full text-xs transition cursor-pointer ${
                    lang === 'fr'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                      : 'text-neutral-500 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white font-medium'
                  }`}
                  title="Passer en français"
                  aria-label="Passer en français"
                >
                  FR
                </Link>
                <Link
                  href={alternatePath(route, 'en')}
                  keepScroll
                  hrefLang="en"
                  aria-current={lang === 'en' ? 'true' : undefined}
                  className={`font-syne px-2.5 py-1 rounded-full text-xs transition cursor-pointer ${
                    lang === 'en'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-xs'
                      : 'text-neutral-500 dark:text-[#A1A1AA] hover:text-black dark:hover:text-white font-medium'
                  }`}
                  title="Switch to English"
                  aria-label="Switch to English"
                >
                  EN
                </Link>
                <span className="w-px h-4 mx-1 bg-black/10 dark:bg-white/15" aria-hidden="true" />
                <ThemeToggle />
                <CommandPaletteHint className="w-8 h-8" />
            </div>

            <CommandPaletteHint className="md:hidden w-10 h-10" />
            {/* Menu button ONLY shown on mobile/small screens (hidden on md+) */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="font-syne md:hidden flex items-center gap-2 h-10 px-4 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-bold cursor-pointer transition active:scale-[0.97]"
              aria-label={isMenuOpen ? t('nav.close') : t('nav.menu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <Icon icon={Cancel01Icon} className="w-4 h-4" /> : <Icon icon={Menu01Icon} className="w-4 h-4" />}
              <span>{isMenuOpen ? t('nav.close') : t('nav.menu')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            onClick={closeMenu}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />
        )}
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            // Same path in and out (spatial consistency); leaving is faster than arriving
            exit={{ x: '100%', transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="glass-bar fixed inset-y-2 right-2 z-[60] w-[calc(100%-1rem)] sm:w-[380px] rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 text-xs text-neutral-500 dark:text-[#A1A1AA]">
              <span className="uppercase tracking-wider font-semibold">{t('nav.menu')}</span>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center p-0.5 bg-black/5 dark:bg-white/[0.06] rounded-full text-xs font-semibold">
                  <Link
                    href={alternatePath(route, 'fr')}
                    keepScroll
                    hrefLang="fr"
                    aria-current={lang === 'fr' ? 'true' : undefined}
                    onClick={closeMenu}
                    className={`font-syne px-2.5 py-1 rounded-full cursor-pointer transition-colors ${lang === 'fr' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                  >
                    FR
                  </Link>
                  <Link
                    href={alternatePath(route, 'en')}
                    keepScroll
                    hrefLang="en"
                    aria-current={lang === 'en' ? 'true' : undefined}
                    onClick={closeMenu}
                    className={`font-syne px-2.5 py-1 rounded-full cursor-pointer transition-colors ${lang === 'en' ? 'bg-black text-white dark:bg-white dark:text-black font-bold' : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
                  >
                    EN
                  </Link>
                </div>
                <ThemeToggle />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-900 dark:text-white cursor-pointer transition-colors"
                  aria-label={t('nav.close')}
                >
                  <Icon icon={Cancel01Icon} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 my-auto">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={sectionPath(lang, item.id)}
                  onClick={closeMenu}
                  className="w-full text-left group flex items-baseline gap-4 cursor-pointer p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="font-serif italic text-2xl sm:text-3xl text-neutral-500 dark:text-white/40 group-hover:text-[var(--accent)] font-normal select-none transition-colors shrink-0">
                    {item.index}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">
                    {item.label}
                  </span>
                </Link>
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
                  className="flex-1 py-2.5 rounded-full bg-black/[0.05] hover:bg-black hover:text-white dark:bg-white/[0.08] dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-white font-bold inline-flex items-center justify-center gap-1.5 transition-colors text-xs cursor-pointer"
                >
                  <Icon icon={Linkedin02Icon} className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <Icon icon={ArrowUpRight01Icon} className="w-3 h-3" />
                </a>

                <a
                  href={`mailto:${USER_INFO.email}`}
                  className="flex-1 py-2.5 rounded-full bg-neutral-900 text-white hover:bg-[var(--accent)] hover:text-[var(--accent-contrast-text)] dark:bg-white dark:text-black dark:hover:bg-[var(--accent)] dark:hover:text-[var(--accent-contrast-text)] font-bold inline-flex items-center justify-center gap-1 shadow-xs transition-colors text-xs cursor-pointer"
                >
                  <span>Email</span>
                  <Icon icon={ArrowUpRight01Icon} className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
