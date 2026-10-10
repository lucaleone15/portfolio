import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { homePath, Link, sectionPath } from '../router';
import { NeonBackdrop } from './NeonBackdrop';

/**
 * 404 (served with a real 404 status by server/index.ts): "off track". A kart has left the
 * circuit and stopped in the gravel trap; the buttons put the visitor back on track.
 */

// The circuit: one bend, drawn three times (kerbs white, then red dashes, then asphalt)
const TRACK = 'M -20 70 C 140 60 220 90 250 170 S 220 330 90 400';

function OffTrack() {
  return (
    <svg viewBox="0 0 480 380" className="w-full h-auto" role="img" aria-hidden="true">
      <defs>
        <pattern id="gravel" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.6" className="fill-[#C9B994] dark:fill-[#5a5040]" />
          <circle cx="10" cy="10" r="1.3" className="fill-[#C9B994] dark:fill-[#5a5040]" />
          <circle cx="11" cy="3" r="0.9" className="fill-[#B8A57C] dark:fill-[#6b604c]" />
        </pattern>
      </defs>

      {/* Gravel trap on the outside of the bend */}
      <path d="M 300 60 C 420 70 470 160 470 250 C 470 330 420 370 330 372 C 300 300 330 220 300 60 Z" className="fill-[#EADFC6] dark:fill-[#3a3329]" />
      <path d="M 300 60 C 420 70 470 160 470 250 C 470 330 420 370 330 372 C 300 300 330 220 300 60 Z" fill="url(#gravel)" />

      {/* Circuit */}
      <path d={TRACK} fill="none" stroke="#fff" strokeWidth="104" />
      <path d={TRACK} fill="none" stroke="#E10600" strokeWidth="104" strokeDasharray="16 16" />
      <path d={TRACK} fill="none" className="stroke-[#2C2C31]" strokeWidth="88" />
      <path d={TRACK} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="18 22" />

      {/* Tyre marks: off the asphalt and into the gravel */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        fill="none"
        className="stroke-[#2C2C31]/50 dark:stroke-black/60"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M 262 128 C 310 150 350 190 380 230" />
        <path d="M 250 146 C 298 168 338 208 366 248" />
      </motion.g>

      {/* The kart, slid into the gravel, a little crooked */}
      <motion.g
        initial={{ x: -90, y: -100, rotate: -10, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <g transform="translate(392 262) rotate(58) scale(2.4) translate(-22 -14)">
          <rect x="3" y="1" width="10" height="6" rx="2" fill="#111" />
          <rect x="3" y="21" width="10" height="6" rx="2" fill="#111" />
          <rect x="29" y="2" width="8" height="5" rx="2" fill="#111" />
          <rect x="29" y="21" width="8" height="5" rx="2" fill="#111" />
          <path d="M6 9h24l8 3v4l-8 3H6a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" style={{ fill: 'var(--accent)' }} />
          <rect x="39" y="9" width="4" height="10" rx="1.5" fill="#111" />
          <circle cx="17" cy="14" r="4.2" fill="#fff" stroke="#111" strokeWidth="1.2" />
          <rect x="17.5" y="12.6" width="3.4" height="2.8" rx="1" fill="#111" />
        </g>
        {/* A little gravel thrown up */}
        <g className="fill-[#C9B994] dark:fill-[#6b604c]">
          <circle cx="432" cy="300" r="3" />
          <circle cx="442" cy="284" r="2" />
          <circle cx="422" cy="312" r="2.2" />
        </g>
      </motion.g>
    </svg>
  );
}

export function NotFound() {
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  return (
    <main id="main-content" className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden">
      <NeonBackdrop fadeBottom={false} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full py-32 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="eyebrow sm:text-sm text-[var(--accent)] mb-6">{fr ? 'Erreur 404 · Sortie de piste' : 'Error 404 · Off track'}</p>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] leading-[1.02] text-neutral-900 dark:text-white mb-6">
            {fr ? 'Sortie de piste' : 'Off track'}
            <span className="text-[var(--accent)]">.</span>
          </h1>
          <p className="max-w-xl text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-10">
            {fr
              ? 'Cette adresse n’existe pas, ou plus. Pas de dégâts : le tracé est juste à côté.'
              : 'This address doesn’t exist, or no longer does. No harm done: the track is right there.'}
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href={homePath(lang)}
              className="font-syne py-4 px-8 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 text-sm sm:text-base font-bold transition active:scale-[0.97]"
            >
              {fr ? 'Retour sur le tracé' : 'Back on track'}
            </Link>
            <Link
              href={sectionPath(lang, 'projets')}
              className="glass font-syne py-4 px-8 rounded-full text-neutral-900 dark:text-white text-sm sm:text-base font-bold active:scale-[0.97]"
            >
              {fr ? 'Voir les projets' : 'See the projects'}
            </Link>
          </div>
        </div>
        <div className="max-w-md lg:max-w-none w-full mx-auto">
          <OffTrack />
        </div>
      </div>
    </main>
  );
}
