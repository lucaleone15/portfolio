import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { NeonBackdrop } from './NeonBackdrop';

/** How long the curtain stays down before lifting (seconds) */
export const INTRO_HOLD = 1.7;

// The curtain plays once per page load. Components that mount later (e.g. the Hero when
// coming back from a project page) must not wait for it: they ask introPending().
let lifted = false;
const liftListeners = new Set<() => void>();

/** True while the intro curtain still covers the page (client side). */
export function introPending(): boolean {
  return typeof document !== 'undefined' && !lifted;
}

/** Calls `cb` when the curtain lifts (at once if it already has). Returns an unsubscribe. */
export function onIntroLifted(cb: () => void): () => void {
  if (lifted) {
    cb();
    return () => {};
  }
  liftListeners.add(cb);
  return () => liftListeners.delete(cb);
}

/** The curtain won't play on this visit (e.g. landing on a project page): release waiters. */
export function skipIntro() {
  markLifted();
}

function markLifted() {
  if (lifted) return;
  lifted = true;
  liftListeners.forEach((cb) => cb());
  liftListeners.clear();
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const WORDS = ['Luca', 'Leone'];
const LETTER_STAGGER = 0.055;
const LETTERS_START = 0.2;
const LETTER_DURATION = 0.75;

interface IntroCurtainProps {
  onDone?: () => void;
}

export function IntroCurtain({ onDone }: IntroCurtainProps) {
  const { lang } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const lift = () => {
      setVisible(false);
      markLifted();
    };
    const t = setTimeout(lift, INTRO_HOLD * 1000);
    // Never hold people hostage: any intent to interact lifts the curtain right away
    const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;
    events.forEach((name) => window.addEventListener(name, lift, { once: true, passive: true }));
    return () => {
      clearTimeout(t);
      events.forEach((name) => window.removeEventListener(name, lift));
    };
  }, [visible]);

  let letterIndex = 0;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="intro-curtain"
          // The curtain lifts from the bottom edge, uncovering the page underneath
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.3 } }
              : { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.9, ease: EASE_IN_OUT } }
          }
          // Follows the theme so light-mode visitors don't get a dark flash
          className="intro-curtain fixed inset-0 z-[100] flex flex-col justify-between p-8 sm:p-14 bg-[#F9F9FB] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Gradient + grain; the hero carries the same texture, so it continues seamlessly
              when the curtain lifts */}
          <NeonBackdrop fadeBottom={false} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 flex justify-between items-center text-xs text-neutral-500 dark:text-[#71717A] tracking-wider uppercase font-semibold"
          >
            <span>Portfolio</span>
            <span>{new Date().getFullYear()}</span>
          </motion.div>

          {/* Name: each letter rises out of a mask; on exit the name leaves slightly ahead
              of the curtain edge, which reads as depth */}
          <motion.div
            exit={reduceMotion ? undefined : { y: '-40%', opacity: 0, transition: { duration: 0.65, ease: EASE_IN_OUT } }}
            className="relative z-10 text-center"
          >
            <p className="font-serif inline-flex flex-wrap justify-center gap-x-[0.25em] text-6xl sm:text-8xl md:text-9xl font-black tracking-[-0.04em] leading-none">
              {WORDS.map((word, wordIdx) => (
                <span key={word} className="inline-flex overflow-hidden pb-[0.08em]">
                  {word.split('').map((char) => {
                    const delay = LETTERS_START + letterIndex++ * LETTER_STAGGER;
                    return (
                      <motion.span
                        key={`${word}-${char}-${delay}`}
                        initial={{ y: '110%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: LETTER_DURATION, delay, ease: EASE_OUT }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                  {wordIdx === WORDS.length - 1 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: LETTERS_START + letterIndex * LETTER_STAGGER + 0.35, ease: EASE_OUT }}
                      className="inline-block text-[var(--accent)] origin-bottom"
                    >
                      .
                    </motion.span>
                  )}
                </span>
              ))}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 space-y-4"
          >
            {/* Time indicator: draws across while the curtain holds */}
            <div className="h-px w-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: INTRO_HOLD, ease: 'linear' }}
                className="h-full bg-[var(--accent)] origin-left"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-[#71717A]">
              <span>{lang === 'fr' ? 'Ingénierie des médias' : 'Media Engineering'}</span>
              <span>HEIG-VD</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
