import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { HeroBandeau } from './HeroBandeau';
import { ImageTrail } from './ImageTrail';
import { NeonBackdrop } from './NeonBackdrop';
import { Link, sectionPath } from '../router';
import { introPending, onIntroLifted } from './IntroCurtain';
import { UNIFIED_PROJECTS } from '../data/portfolioData';

// What the ideas become. Each fits on one line on a 360px phone (measured).
const OUTCOMES = {
  fr: ['expériences digitales', 'interfaces intuitives', 'contenus engageants', 'identités visuelles', 'sites web sur mesure'],
  en: ['digital experiences', 'intuitive interfaces', 'engaging content', 'visual identities', 'custom websites'],
};
const ROTATE_EVERY_MS = 2600;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/**
 * Rotating last words of the headline. Only the current word is in the DOM (the outgoing one
 * just while it leaves), so the h1 reads as one sentence for search engines and screen
 * readers. The incoming word rises from below its mask; the outgoing one exits upward.
 */
function RotatingWords({ words, running }: { words: string[]; running: boolean; key?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!running || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), ROTATE_EVERY_MS);
    return () => window.clearInterval(id);
  }, [running, words.length]);

  return (
    <span className="relative inline-grid align-bottom overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-105%', opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_IN_OUT }}
          className="col-start-1 row-start-1 whitespace-nowrap font-extrabold text-[var(--accent)]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const { lang, t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  // Hidden while the intro curtain covers the page, revealed the moment it lifts (or at once
  // when the hero mounts later, e.g. coming back from a project page)
  const [ready, setReady] = useState(() => !introPending());
  useEffect(() => onIntroLifted(() => setReady(true)), []);

  const trailImages = useMemo(() => UNIFIED_PROJECTS.flatMap((p) => p.images), []);

  const reveal = (delay = 0) => ({
    initial: ready ? false : ({ opacity: 0, y: 30 } as const),
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90dvh] pt-24 sm:pt-32 pb-10 sm:pb-14 border-b border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex flex-col justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300"
    >
      {/* Grain + neon accent lines (same texture as the intro curtain) */}
      <NeonBackdrop />

      {/* Project visuals trailing the pointer (autopilot on touch / when idle) */}
      <ImageTrail images={trailImages} areaRef={sectionRef} active={ready} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 sm:py-12 pointer-events-none">
        <motion.div {...reveal()} className="max-w-5xl space-y-6 sm:space-y-8">
          {/* The page's single <h1>: identity label + positioning statement. The name is visible
              in the logo, so it's only repeated for screen readers and search engines. */}
          <h1 className="font-normal">
            <span className="sr-only">Luca Leone, </span>
            <span className="block mb-5 sm:mb-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
              {lang === 'fr' ? 'Étudiant en ingénierie des médias · HEIG-VD' : 'Media Engineering student · HEIG-VD'}
            </span>
            <span className="block font-serif text-[2rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.6rem] tracking-[-0.035em] text-neutral-900 dark:text-white">
              {lang === 'fr' ? (
                <span className="block">
                  Je transforme des <span className="font-extrabold text-[var(--accent)]">idées</span>
                </span>
              ) : (
                <span className="block">
                  I turn <span className="font-extrabold text-[var(--accent)]">ideas</span>
                </span>
              )}
              <span className="block">
                {lang === 'fr' ? 'en ' : 'into '}
                <RotatingWords key={lang} words={OUTCOMES[lang]} running={ready} />.
              </span>
            </span>
          </h1>

          <p className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr'
              ? 'De A à Z, avec une approche qui allie créativité et technique : contenus, réseaux sociaux, identité visuelle, UI/UX et développement web.'
              : 'End to end, with an approach that blends creativity and technique: content, social media, visual identity, UI/UX and web development.'}
          </p>

          {/* CTAs (the content layer lets the pointer through to the trail; buttons opt back in) */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5 sm:gap-4 pointer-events-auto">
            <Link
              href={sectionPath(lang, 'projets')}
              className="font-syne py-4 px-8 sm:px-9 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 text-sm sm:text-base font-bold transition duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.97]"
            >
              <span>{t('hero.ctaProjects')}</span>
            </Link>
            <Link
              href={sectionPath(lang, 'contact')}
              className="font-syne py-4 px-8 sm:px-9 rounded-full bg-white/70 hover:bg-white text-neutral-900 border border-black/15 dark:bg-[#0A0A0C]/60 dark:hover:bg-[#0A0A0C]/80 dark:text-white dark:border-white/20 text-sm sm:text-base font-bold backdrop-blur-xl transition duration-200 cursor-pointer active:scale-[0.97] inline-flex items-center justify-center shadow-xs"
            >
              <span>{t('hero.ctaContact')}</span>
            </Link>
          </div>

        </motion.div>
      </div>

      {/* Scrolling tools logos marquee */}
      <motion.div {...reveal(0.15)} className="relative z-10 w-full mt-6">
        <HeroBandeau />
      </motion.div>
    </section>
  );
}
