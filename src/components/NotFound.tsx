import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { homePath, Link, sectionPath } from '../router';
import { NeonBackdrop } from './NeonBackdrop';

/**
 * 404 (served with a real 404 status by server/index.ts): "off track". Aerial view of a
 * straight and a right-hand bend: a Formula 1 car went straight on and stopped in the gravel
 * trap, short of the tyre wall. The car is public/images/f1-car.svg (also in the offline game).
 */

// Centre line of the circuit: up the straight, then right
const TRACK = 'M 175 540 L 175 300 C 175 195 255 150 365 150 L 700 150';
// Kerbs only where the bend is, as on a real circuit
const BEND = 'M 175 336 C 175 205 252 150 392 150';

// Tyre wall around the gravel trap: two staggered rows along its outer edges
const TYRES = [
  ...Array.from({ length: 17 }, (_, i) => ({ x: 20 + (i % 2) * 7, y: 390 - i * 21 })),
  ...Array.from({ length: 22 }, (_, i) => ({ x: 44 + i * 21, y: 20 + (i % 2) * 7 })),
];

function OffTrack({ fr }: { fr: boolean }) {
  return (
    <svg
      viewBox="0 0 640 460"
      className="block w-full h-auto"
      role="img"
      aria-label={fr ? 'Vue aérienne d’une Formule 1 sortie de piste, arrêtée dans le bac à gravier' : 'Aerial view of a Formula 1 car gone off track, stopped in the gravel trap'}
    >
      <defs>
        {/* Soft edges on every side: two masks, one fading left and right, one top and bottom,
            nested, so the scene dissolves into the page while the middle, car included,
            stays fully visible */}
        <linearGradient id="ot-fade-x" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.22" stopColor="#fff" />
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ot-fade-y" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.24" stopColor="#fff" />
          <stop offset="0.78" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ot-mask-x" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="460">
          <rect width="640" height="460" fill="url(#ot-fade-x)" />
        </mask>
        <mask id="ot-mask-y" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="460">
          <rect width="640" height="460" fill="url(#ot-fade-y)" />
        </mask>
        {/* Mown grass: wide diagonal stripes */}
        <pattern id="ot-mown" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="90" height="90" fill="#3f7d3a" />
          <rect width="45" height="90" fill="#478a41" />
        </pattern>
        {/* Fine grain on grass and asphalt; small stones on the gravel */}
        <filter id="ot-grain" filterUnits="userSpaceOnUse" x="-160" y="-160" width="960" height="760">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
        <filter id="ot-stones" filterUnits="userSpaceOnUse" x="-160" y="-160" width="960" height="760">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="11" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 2.2 -1.1" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" result="stones" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="stones" />
          </feMerge>
        </filter>
        <filter id="ot-shadow" x="-40%" y="-20%" width="180%" height="140%">
          <feDropShadow dx="6" dy="9" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id="ot-dust" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <radialGradient id="ot-light" cx="25%" cy="15%" r="95%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      <g mask="url(#ot-mask-y)">
      <g mask="url(#ot-mask-x)">
      {/* The whole ground, shifted so the car sits away from the faded edges */}
      <g transform="translate(80 70)">
        {/* Grass */}
        <rect x="-160" y="-160" width="960" height="760" fill="url(#ot-mown)" filter="url(#ot-grain)" />

        {/* Gravel trap on the outside of the bend */}
        <path d="M -160 -160 H 520 C 522 40 470 72 365 74 C 232 76 98 160 98 300 C 98 352 72 398 -160 440 Z" fill="#d9caa4" filter="url(#ot-stones)" />

        {/* Tyre wall */}
        <g>
          {TYRES.map((t, i) => (
            <g key={i}>
              <circle cx={t.x} cy={t.y} r="10.5" fill="#151517" />
              <circle cx={t.x} cy={t.y} r="4.5" fill="#2e2e33" />
            </g>
          ))}
        </g>

        {/* Circuit: kerbs in the bend, white edge lines, asphalt */}
        <path d={BEND} fill="none" stroke="#f2f2f2" strokeWidth="132" />
        <path d={BEND} fill="none" stroke="#d7141a" strokeWidth="132" strokeDasharray="16 16" />
        <path d={TRACK} fill="none" stroke="#f2f2f2" strokeWidth="118" />
        <path d={TRACK} fill="none" stroke="#2b2b30" strokeWidth="110" filter="url(#ot-grain)" />
        {/* Racing line, rubbered in */}
        <path d="M 160 540 L 160 310 C 160 200 245 165 365 168 L 700 172" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="30" />

        {/* Straight on: black marks on the asphalt, then ruts in the gravel */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} fill="none" strokeLinecap="round">
          <g stroke="#0d0d0f" strokeOpacity="0.45" strokeWidth="8">
            <path d="M 160 330 C 160 250 159 200 157 174" />
            <path d="M 186 330 C 186 240 184 186 181 156" />
          </g>
          <g stroke="#8c7a55" strokeOpacity="0.7" strokeWidth="9">
            <path d="M 157 176 C 150 166 140 158 129 152" />
            <path d="M 181 158 C 175 150 167 144 158 140" />
          </g>
        </motion.g>

        {/* The car, stopped in the gravel a little sideways, and its dust */}
        <motion.g
          initial={{ x: 40, y: 200, rotate: 22, opacity: 0 }}
          animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '126px 104px' }}
        >
          <ellipse cx="104" cy="62" rx="50" ry="22" fill="#efe4c6" opacity="0.8" filter="url(#ot-dust)" />
          <g transform="translate(126 104) rotate(-22)">
            <image href="/images/f1-car.svg" x="-20" y="-56" width="40" height="112" filter="url(#ot-shadow)" />
          </g>
        </motion.g>

      </g>
        <rect width="640" height="460" fill="url(#ot-light)" />
      </g>
      </g>
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
        {/* No card: the scene fades into the page on every side, and bleeds off the right edge
            on large screens, like a view through the page rather than a pasted picture */}
        <div
          className="-mx-6 sm:-mx-10 lg:mx-0 lg:-mr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:scale-110 lg:origin-left"
        >
          <OffTrack fr={fr} />
        </div>
      </div>
    </main>
  );
}
