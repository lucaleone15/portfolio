import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { homePath, Link, sectionPath } from '../router';
import { NeonBackdrop } from './NeonBackdrop';

/**
 * 404 (served with a real 404 status by server/index.ts): "off track". Aerial view of a
 * straight and a bend: a Formula 1 car went straight on and stopped in the gravel trap,
 * short of the tyre wall. The car is public/images/f1-car.svg (also in the offline game).
 *
 * Large screens: the circuit is the page's background, edge to edge, and the text sits on
 * a fade of the page colour on the left. Phones: the scene runs the full width under the
 * text, fading in and out at the top and bottom.
 */

// Centre line of the circuit: up the straight, then into the bend
const TRACK = 'M 175 540 L 175 300 C 175 195 255 150 365 150 L 760 150';
// Kerbs only where the bend is, as on a real circuit
const BEND = 'M 175 336 C 175 205 252 150 392 150';

// Tyre wall around the gravel trap: two staggered rows along its outer edges
const TYRES = [
  ...Array.from({ length: 17 }, (_, i) => ({ x: 20 + (i % 2) * 7, y: 390 - i * 21 })),
  ...Array.from({ length: 22 }, (_, i) => ({ x: 44 + i * 21, y: 20 + (i % 2) * 7 })),
];

/**
 * `fill`: covers its box (page background); otherwise its natural size with soft top and
 * bottom edges. `id` prefixes the SVG ids: both versions are in the page (one per screen
 * size) and their gradients must not collide.
 */
function OffTrack({ fr, fill, id }: { fr: boolean; fill: boolean; id: string }) {
  const ref = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      viewBox="0 0 640 460"
      preserveAspectRatio={fill ? 'xMidYMid slice' : 'xMidYMid meet'}
      className={fill ? 'absolute inset-0 w-full h-full' : 'block w-full h-auto'}
      role="img"
      aria-label={fr ? 'Vue aérienne d’une Formule 1 sortie de piste, arrêtée dans le bac à gravier' : 'Aerial view of a Formula 1 car gone off track, stopped in the gravel trap'}
    >
      <defs>
        <linearGradient id={`${id}-fade-y`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.18" stopColor="#fff" />
          <stop offset="0.82" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="460">
          <rect width="640" height="460" fill={ref('fade-y')} />
        </mask>
        {/* Mown grass: wide diagonal stripes */}
        <pattern id={`${id}-mown`} width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="90" height="90" fill="#3f7d3a" />
          <rect width="45" height="90" fill="#478a41" />
        </pattern>
        {/* Fine grain on grass and asphalt; small stones on the gravel */}
        <filter id={`${id}-grain`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1040" height="860">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>
        <filter id={`${id}-stones`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="1040" height="860">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="11" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 2.2 -1.1" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" result="stones" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="stones" />
          </feMerge>
        </filter>
        <filter id={`${id}-shadow`} x="-40%" y="-20%" width="180%" height="140%">
          <feDropShadow dx="-6" dy="9" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id={`${id}-dust`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <radialGradient id={`${id}-light`} cx="78%" cy="15%" r="95%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      <g mask={fill ? undefined : ref('mask')}>
        {/* Mirrored so the car stops on the right, away from the text; shifted so it sits
            clear of the edges */}
        <g transform="translate(640 0) scale(-1 1) translate(80 70)">
          <rect x="-200" y="-200" width="1040" height="860" fill={ref('mown')} filter={ref('grain')} />

          {/* Gravel trap on the outside of the bend */}
          <path d="M -200 -200 H 560 C 562 40 470 72 365 74 C 232 76 98 160 98 300 C 98 352 72 398 -200 460 Z" fill="#d9caa4" filter={ref('stones')} />

          {/* Tyre wall */}
          {TYRES.map((t, i) => (
            <g key={i}>
              <circle cx={t.x} cy={t.y} r="10.5" fill="#151517" />
              <circle cx={t.x} cy={t.y} r="4.5" fill="#2e2e33" />
            </g>
          ))}

          {/* Circuit: kerbs in the bend, white edge lines, asphalt, racing line */}
          <path d={BEND} fill="none" stroke="#f2f2f2" strokeWidth="132" />
          <path d={BEND} fill="none" stroke="#d7141a" strokeWidth="132" strokeDasharray="16 16" />
          <path d={TRACK} fill="none" stroke="#f2f2f2" strokeWidth="118" />
          <path d={TRACK} fill="none" stroke="#2b2b30" strokeWidth="110" filter={ref('grain')} />
          <path d="M 160 540 L 160 310 C 160 200 245 165 365 168 L 760 172" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="30" />

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
            <ellipse cx="104" cy="62" rx="50" ry="22" fill="#efe4c6" opacity="0.8" filter={ref('dust')} />
            <g transform="translate(126 104) rotate(-22)">
              <image href="/images/f1-car.svg" x="-20" y="-56" width="40" height="112" filter={ref('shadow')} />
            </g>
          </motion.g>
        </g>

        <rect width="640" height="460" fill={ref('light')} />
      </g>
    </svg>
  );
}

export function NotFound() {
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  return (
    <main id="main-content" className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden">
      {/* Large screens: the circuit fills the page; the page colour fades in on the left so
          the text reads on it */}
      <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
        <OffTrack fr={fr} fill id="ot-bg" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#F9F9FB_0%,rgba(249,249,251,0.94)_34%,rgba(249,249,251,0)_64%)] dark:bg-[linear-gradient(90deg,#0A0A0C_0%,rgba(10,10,12,0.94)_34%,rgba(10,10,12,0)_64%)]" />
      </div>
      <div className="lg:hidden">
        <NeonBackdrop fadeBottom={false} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full pt-32 pb-0 lg:py-32">
        <div className="max-w-xl">
          <p className="eyebrow sm:text-sm text-[var(--accent)] mb-6">{fr ? 'Erreur 404 · Sortie de piste' : 'Error 404 · Off track'}</p>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] leading-[1.02] text-neutral-900 dark:text-white mb-6">
            {fr ? 'Sortie de piste' : 'Off track'}
            <span className="text-[var(--accent)]">.</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-10">
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

        {/* Phones and tablets: the scene under the text, the full width of the screen */}
        <div className="lg:hidden -mx-6 sm:-mx-10 mt-8">
          <OffTrack fr={fr} fill={false} id="ot-inline" />
        </div>
      </div>
    </main>
  );
}
