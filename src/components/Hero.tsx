import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { HeroBandeau } from './HeroBandeau';
import { NeonBackdrop } from './NeonBackdrop';
import { Link, sectionPath } from '../router';
import { BACHELOR_TOPIC_INDEX, PRESELECT_TOPIC_EVENT } from './ContactSection';
import { introPending, onIntroLifted } from './IntroCurtain';
import { useSite } from '../content/ContentContext';
import { useEditAttrs, useEditing } from '../content/edit';

// What the ideas become. The longest line ("en contenus engageants.") is 11.6× the font size
// (measured in the page), so the headline size is derived from the available width ÷ 11.8:
// every outcome stays on one line, from a 360px phone to a wide screen. The words themselves
// are content (content/site.json → hero.outcomes); the admin warns past that length.
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
  const { hero } = useSite();
  // Admin preview only: what can be edited in place
  const edit = useEditAttrs();
  const editing = useEditing();
  // Hidden while the intro curtain covers the page, revealed the moment it lifts (or at once
  // when the hero mounts later, e.g. coming back from a project page)
  const [ready, setReady] = useState(() => !introPending());
  useEffect(() => onIntroLifted(() => setReady(true)), []);

  const reveal = (delay = 0) => ({
    initial: ready ? false : ({ opacity: 0, y: 30 } as const),
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      className="relative md:min-h-[90dvh] print:min-h-0 print:pt-6 print:gap-10 pt-28 sm:pt-32 pb-12 sm:pb-14 overflow-hidden flex flex-col justify-center md:justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300"
    >
      {/* Accent gradient + grain (same texture as the intro curtain) */}
      <NeonBackdrop />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 sm:py-12 pointer-events-none">
        <motion.div {...reveal()} className="max-w-5xl space-y-6 sm:space-y-8">
          {/* The page's single <h1>: identity label + positioning statement. The name is visible
              in the logo, so it's only repeated for screen readers and search engines. */}
          {/* Optional line above the title (left out when empty; the atelier shows where it goes) */}
          {(hero.eyebrow || editing) && (
            <p {...edit('hero.eyebrow')} className="eyebrow sm:text-base text-[var(--accent)]" aria-hidden="true">
              {hero.eyebrow || '(ligne au-dessus du titre)'}
            </p>
          )}

          <h1 className="font-normal">
            {/* Name, field and school stay in the h1 for search engines and screen readers */}
            <span className="sr-only">
              {lang === 'fr'
                ? 'Luca Leone, étudiant en ingénierie des médias à la HEIG-VD — '
                : 'Luca Leone, Media Engineering student at HEIG-VD — '}
            </span>
            <span className="block font-serif leading-[1.05] tracking-[-0.035em] text-[min(2rem,calc((100vw-3rem)/11.8))] sm:text-[min(3rem,calc((100vw-5rem)/11.8))] md:text-[min(3.75rem,calc((100vw-5rem)/11.8))] lg:text-[min(4.5rem,calc((100vw-5rem)/11.8))] xl:text-[min(5.6rem,calc(64rem/11.8))] text-neutral-900 dark:text-white">
              <span {...edit('hero.headline')} className="block">
                {`${hero.headline.before} `}
                <span {...edit('hero.headline.accent')} className="font-extrabold text-[var(--accent)]">{hero.headline.accent}</span>
              </span>
              <span {...edit('hero.outcomes')} className="block">
                {`${hero.headline.joiner} `}
                <RotatingWords key={lang} words={hero.outcomes} running={ready} />.
              </span>
            </span>
          </h1>

          <div className="max-w-3xl space-y-3 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-normal">
            <p {...edit('hero.lead')} className="text-neutral-600 dark:text-[#A1A1AA]">
              {hero.lead}
            </p>
            {/* Availability, written as a plain sentence; the key words link to the form with the
                "Bachelor thesis" topic preselected. Left out when its link text is empty. */}
            {(hero.availability.link || editing) && (
              <p {...edit('hero.availability')} className="text-neutral-900 dark:text-white">
                {hero.availability.before}
                <Link
                  {...edit('hero.availability.link')}
                  href={sectionPath(lang, 'contact')}
                  onClick={() => window.dispatchEvent(new CustomEvent(PRESELECT_TOPIC_EVENT, { detail: BACHELOR_TOPIC_INDEX }))}
                  className="pointer-events-auto whitespace-nowrap font-semibold underline decoration-[var(--accent)] decoration-2 underline-offset-[0.2em] hover:text-[var(--accent)] transition-colors"
                >
                  {hero.availability.link || '(lien)'}
                </Link>
                {hero.availability.after}
              </p>
            )}
          </div>

          {/* CTAs (the content layer lets the pointer through to the backdrop; buttons opt back in) */}
          <div className="pt-2 sm:pt-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 pointer-events-auto">
            <Link
              href={sectionPath(lang, 'projets')}
              className="font-syne py-4 px-8 sm:px-9 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 text-sm sm:text-base font-bold transition duration-200 inline-flex items-center justify-center cursor-pointer shadow-[0_10px_30px_-10px_rgba(var(--accent-rgb),0.7)] active:scale-[0.97]"
            >
              <span>{t('hero.ctaProjects')}</span>
            </Link>
            <Link
              href={sectionPath(lang, 'contact')}
              className="glass font-syne py-4 px-8 sm:px-9 rounded-full text-neutral-900 dark:text-white text-sm sm:text-base font-bold cursor-pointer active:scale-[0.97] inline-flex items-center justify-center"
            >
              <span>{t('hero.ctaContact')}</span>
            </Link>
          </div>

        </motion.div>
      </div>

      {/* Scrolling tools logos marquee. Phones: the text and the band sit together, centred in
          the screen, instead of the text at the top and the band at the bottom. */}
      <motion.div {...reveal(0.15)} className="relative z-10 w-full mt-6">
        <HeroBandeau />
      </motion.div>
    </section>
  );
}
