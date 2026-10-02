import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { HeroBandeau } from './HeroBandeau';
import { Link, sectionPath } from '../router';
import { INTRO_HOLD, introWillPlay } from './IntroCurtain';

export function Hero() {
  const { lang, t } = useLanguage();
  // Reveal the hero as the intro curtain lifts, not hidden behind it
  const [introDelay] = useState(() => (introWillPlay() ? INTRO_HOLD : 0));

  return (
    <section className="relative min-h-[90dvh] pt-24 sm:pt-32 pb-10 sm:pb-14 border-b border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex flex-col justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      {/* Main Content Area - Clean, airy, zero clutter */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: introDelay, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl space-y-6 sm:space-y-8"
        >
          {/* The page's single <h1>: identity label (same style as the section labels, e.g. "Compétences")
              + positioning statement. The name is visible in the logo, so it's only repeated for
              screen readers and search engines (which read the h1 out of context). */}
          <h1 className="font-normal">
            <span className="sr-only">Luca Leone, </span>
            <span className="block mb-5 sm:mb-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
              {lang === 'fr' ? 'Étudiant en ingénierie des médias · HEIG-VD' : 'Media Engineering student · HEIG-VD'}
            </span>
            {/* From the pitch ("transformer des idées en projets concrets"), sharpened to "expériences digitales": verb-led, one idea,
                set large on two lines, the two key notions in accent */}
            <span className="block font-serif text-[2.1rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.6rem] tracking-[-0.035em] text-neutral-900 dark:text-white">
              {lang === 'fr' ? (
                <>
                  <span className="block">Je transforme des <span className="font-extrabold text-[var(--accent)]">idées</span></span>
                  <span className="block">en <span className="font-extrabold text-[var(--accent)]">expériences digitales</span>.</span>
                </>
              ) : (
                <>
                  <span className="block">I turn <span className="font-extrabold text-[var(--accent)]">ideas</span></span>
                  <span className="block">into <span className="font-extrabold text-[var(--accent)]">digital experiences</span>.</span>
                </>
              )}
            </span>
          </h1>

          {/* Subtitle with increased desktop presence and comfort */}
          <p className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr' ? (
              "De A à Z, avec une approche qui allie créativité et technique : contenus, réseaux sociaux, identité visuelle, UI/UX et développement web."
            ) : (
              "End to end, with an approach that blends creativity and technique: content, social media, visual identity, UI/UX and web development."
            )}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              href={sectionPath(lang, 'projets')}
              className="font-syne py-4 px-8 sm:px-9 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 text-sm sm:text-base font-bold transition duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.97]"
            >
              <span>{t('hero.ctaProjects')}</span>
            </Link>

            <Link
              href={sectionPath(lang, 'contact')}
              className="font-syne py-4 px-8 sm:px-9 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-neutral-900 border border-black/15 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-white dark:border-white/20 text-sm sm:text-base font-bold backdrop-blur-xl transition duration-200 cursor-pointer active:scale-[0.97] inline-flex items-center justify-center shadow-xs"
            >
              <span>{t('hero.ctaContact')}</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scrolling competencies & tools logos marquee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: introDelay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full mt-6"
      >
        <HeroBandeau />
      </motion.div>
    </section>
  );
}

