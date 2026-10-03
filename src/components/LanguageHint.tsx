import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { alternatePath, Link, useRouter } from '../router';
import { onIntroLifted } from './IntroCurtain';
import { Language } from '../types';

/**
 * Discreet suggestion of the other language, for visitors whose browser doesn't ask for
 * the one they landed on (an English-speaking recruiter opening luca-leone.ch, a French
 * speaker following an /en/ link). Never redirects: one small pill, once the intro has
 * lifted. Closing it, following it or switching language hides it for good (localStorage).
 */

const STORAGE_KEY = 'language-hint-dismissed';

const COPY: Record<Language, { text: string; close: string }> = {
  // Shown in the *suggested* language, so the visitor can read it
  en: { text: 'English version available', close: 'Dismiss' },
  fr: { text: 'Version française disponible', close: 'Fermer' },
};

/** The language this browser would rather read, if it isn't the page's */
function preferredOther(lang: Language): Language | null {
  const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => l.toLowerCase());
  const speaksFrench = langs.some((l) => l.startsWith('fr'));
  if (lang === 'fr') return speaksFrench ? null : 'en';
  return langs[0]?.startsWith('fr') ? 'fr' : null;
}

const isDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const dismiss = () => {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // storage blocked: the hint simply comes back next visit
  }
};

export function LanguageHint() {
  const { lang } = useLanguage();
  const { route } = useRouter();
  // Client-only decision (the prerendered HTML never contains the hint)
  const [suggested, setSuggested] = useState<Language | null>(null);
  const [open, setOpen] = useState(false);
  const firstLang = useRef(lang);

  useEffect(() => {
    if (isDismissed()) return;
    const other = preferredOther(firstLang.current);
    if (!other) return;
    setSuggested(other);
    let timer = 0;
    const stop = onIntroLifted(() => {
      timer = window.setTimeout(() => setOpen(true), 900);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

  // Switching language by any means answers the question
  useEffect(() => {
    if (lang !== firstLang.current) {
      setOpen(false);
      dismiss();
    }
  }, [lang]);

  if (!suggested) return null;
  const copy = COPY[suggested];
  const close = () => {
    setOpen(false);
    dismiss();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="region"
          aria-label={copy.text}
          lang={suggested}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: 10, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
          className="glass-bar fixed z-50 bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-1 pl-4 pr-1.5 py-1.5 rounded-full text-neutral-900 dark:text-white"
        >
          <Link
            href={alternatePath(route, suggested)}
            keepScroll
            hrefLang={suggested}
            onClick={dismiss}
            className="font-syne group inline-flex items-center gap-1.5 min-h-8 text-xs sm:text-sm font-bold"
          >
            {copy.text}
            <span aria-hidden="true" className="text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label={copy.close}
            className="ml-1 inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.06] dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <Icon icon={Cancel01Icon} className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
