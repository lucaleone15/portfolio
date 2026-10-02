import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { HeroBandeau } from './HeroBandeau';
import { ImageTrail } from './ImageTrail';
import { NeonBackdrop } from './NeonBackdrop';
import { Link, sectionPath } from '../router';
import { BACHELOR_TOPIC_INDEX, PRESELECT_TOPIC_EVENT } from './ContactSection';
import { introPending, onIntroLifted } from './IntroCurtain';
import { UNIFIED_PROJECTS } from '../data/portfolioData';

// What the ideas become. The longest line ("en contenus engageants.") is 11.6× the font size
// (measured in the page), so the headline size is derived from the available width ÷ 11.8:
// every outcome stays on one line, from a 360px phone to a wide screen.
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
      {/* popLayout: the outgoing word leaves the layout while it exits, so the line is always
          as wide as the current word (the full stop stays right after it, no reflow) */}
      <AnimatePresence initial={false} mode="popLayout">
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
      className="relative min-h-[90dvh] pt-24 sm:pt-32 pb-10 sm:pb-14 overflow-hidden flex flex-col justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300"
    >
      {/* Accent gradient + grain (same texture as the intro curtain) */}
      <NeonBackdrop />

      {/* Project visuals trailing the pointer (autopilot on touch / when idle) */}
      <ImageTrail images={trailImages} areaRef={sectionRef} active={ready} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 sm:py-12 pointer-events-none">
        <motion.div {...reveal()} className="max-w-5xl space-y-6 sm:space-y-8">
          {/* The page's single <h1>: identity label + positioning statement. The name is visible
              in the logo, so it's only repeated for screen readers and search engines. */}
          {/* Identity line + availability, typographic (same style as the section labels, e.g.
              "Compétences"): the first thing read on arrival. The availability links to the form
              with the "Bachelor thesis" topic preselected. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm font-bold uppercase tracking-widest">
            <span className="text-neutral-900 dark:text-white" aria-hidden="true">
              {lang === 'fr' ? 'Étudiant en ingénierie des médias · HEIG-VD' : 'Media Engineering student · HEIG-VD'}
            </span>
            <span className="hidden sm:inline text-neutral-400 dark:text-white/30" aria-hidden="true">·</span>
            <Link
              href={sectionPath(lang, 'contact')}
              onClick={() => window.dispatchEvent(new CustomEvent(PRESELECT_TOPIC_EVENT, { detail: BACHELOR_TOPIC_INDEX }))}
              className="pointer-events-auto group text-[var(--accent)] hover:underline underline-offset-4 decoration-2"
            >
              {/* Inline (not flex) so the arrow stays glued to the last word when the line wraps */}
              <span className="relative inline-flex w-2 h-2 mr-2 align-middle -translate-y-px" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60 animate-ping motion-reduce:animate-none" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--accent)]" />
              </span>
              {lang === 'fr' ? 'En recherche d’un travail de Bachelor' : 'Looking for a Bachelor thesis'}
              <span className="inline-block ml-1.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </Link>
          </div>

          <h1 className="font-normal">
            {/* Name, field and school stay in the h1 for search engines and screen readers */}
            <span className="sr-only">
              {lang === 'fr'
                ? 'Luca Leone, étudiant en ingénierie des médias à la HEIG-VD — '
                : 'Luca Leone, Media Engineering student at HEIG-VD — '}
            </span>
            <span className="block font-serif leading-[1.05] tracking-[-0.035em] text-[min(2rem,calc((100vw-3rem)/11.8))] sm:text-[min(3rem,calc((100vw-5rem)/11.8))] md:text-[min(3.75rem,calc((100vw-5rem)/11.8))] lg:text-[min(4.5rem,calc((100vw-5rem)/11.8))] xl:text-[min(5.6rem,calc(64rem/11.8))] text-neutral-900 dark:text-white">
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
