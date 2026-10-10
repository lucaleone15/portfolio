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
 * a fade of the page colour on the left, over the exit of the corner. Phones: the scene runs the full width under the
 * text, fading in and out at the top and bottom.
 */

// Drawn to scale, as on a real circuit (1 m ≈ 8 units): a 13 m wide straight comes up the
// right of the scene and turns left; the car went straight on at the turn-in, across the grass
// verge and into the gravel trap, and stopped short of the tyre barrier.
const TRACK = 'M 470 620 L 470 360 C 470 260 400 210 300 210 L -120 210';
// Kerbs only where real circuits have them: inside at the apex, outside at the exit, just
// beyond the white line (track limit)
const APEX_KERB = 'M 410 420 L 410 360 C 410 302 366 270 300 270 L 240 270';
const EXIT_KERB = 'M 318 150 C 280 150 240 150 150 150';
// Racing line, rubbered in: outside on entry, apex, outside on exit
const RACING_LINE = 'M 506 620 L 506 390 C 504 312 452 272 372 258 C 300 246 262 184 160 172 L -120 168';

// Tyre barrier: stacks three tyres deep (tyres 0.6 m across), along the top and the right
// edge of the gravel trap, faced with a conveyor belt on the side cars hit
const TYRE_R = 2.6;
const BARRIER_TOP = Array.from({ length: 3 }, (_, row) =>
  Array.from({ length: 82 }, (_, i) => ({ x: 170 + i * 5.3 + (row % 2) * 2.65, y: 74 + row * 4.6 })),
).flat();
const BARRIER_RIGHT = Array.from({ length: 3 }, (_, col) =>
  Array.from({ length: 100 }, (_, i) => ({ x: 618 + col * 4.6, y: 88 + i * 5.3 + (col % 2) * 2.65 })),
).flat();

/**
 * `fill`: covers its box (page background); otherwise its natural size with soft top and
 * bottom edges. `id` prefixes the SVG ids: both versions are in the page (one per screen
 * size) and their gradients must not collide.
 */
function OffTrack({ fr, fill, id }: { fr: boolean; fill: boolean; id: string }) {
  const ref = (name: string) => `url(#${id}-${name})`;
  // Phones: closer on the corner and the gravel trap, so the car reads at that size
  const view = fill ? { x: 0, y: 0, w: 640, h: 460 } : { x: 280, y: 40, w: 360, h: 330 };
  return (
    <svg
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
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
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={view.x} y={view.y} width={view.w} height={view.h}>
          <rect x={view.x} y={view.y} width={view.w} height={view.h} fill={ref('fade-y')} />
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
        <filter id={`${id}-shadow`} x="-60%" y="-30%" width="220%" height="160%">
          <feDropShadow dx="1.6" dy="2.4" stdDeviation="1.4" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <filter id={`${id}-dust`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <radialGradient id={`${id}-light`} cx="80%" cy="20%" r="95%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      <g mask={fill ? undefined : ref('mask')}>
        <g>
          {/* Grass, mown in stripes */}
          <rect x="-200" y="-200" width="1040" height="860" fill={ref('mown')} filter={ref('grain')} />

          {/* Service road and catch fence behind the barrier */}
          <path d="M -200 40 H 662 V 660" fill="none" stroke="#6b6b70" strokeWidth="14" />
          <path d="M 156 60 H 638 V 660" fill="none" stroke="#9a9aa0" strokeWidth="1.2" strokeDasharray="1 7" />
          <path d="M 156 60 H 638 V 660" fill="none" stroke="#9a9aa0" strokeOpacity="0.6" strokeWidth="0.6" />

          {/* Gravel trap, behind a grass verge on the outside of the corner */}
          <path d="M 552 660 L 552 360 C 552 222 440 128 300 128 L 156 128 L 156 66 L 612 66 L 612 660 Z" fill="#d9caa4" filter={ref('stones')} />

          {/* Tyre barrier and its conveyor belt facing the gravel */}
          <g fill="#17171a">
            {[...BARRIER_TOP, ...BARRIER_RIGHT].map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={TYRE_R} />
            ))}
          </g>
          <g fill="#2f2f34">
            {[...BARRIER_TOP, ...BARRIER_RIGHT].map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={TYRE_R * 0.42} />
            ))}
          </g>
          <path d="M 168 87.5 H 613.5 V 660" fill="none" stroke="#c8102e" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M 168 86.2 H 612.2 V 660" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.7" />

          {/* Track: white lines (track limits), asphalt, rubbered racing line */}
          <path d={TRACK} fill="none" stroke="#f2f2f2" strokeWidth="108" />
          <path d={TRACK} fill="none" stroke="#2b2b30" strokeWidth="104" filter={ref('grain')} />
          <path d={RACING_LINE} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="22" strokeLinecap="round" />

          {/* Kerbs: red and white blocks about 1 m long */}
          {[APEX_KERB, EXIT_KERB].map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke="#f2f2f2" strokeWidth="11" />
              <path d={d} fill="none" stroke="#d7141a" strokeWidth="11" strokeDasharray="8 8" />
            </g>
          ))}

          {/* Straight on at the turn-in: rubber on the asphalt, earth on the verge, ruts in the gravel */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} fill="none" strokeLinecap="round">
            <g stroke="#0d0d0f" strokeOpacity="0.5" strokeWidth="2.4">
              <path d="M 489 430 C 489 330 490 260 492 212" />
              <path d="M 502 430 C 502 330 503 258 505 208" />
            </g>
            <g stroke="#5b4a2e" strokeOpacity="0.55" strokeWidth="3">
              <path d="M 492 208 C 493 190 494 176 495 162" />
              <path d="M 505 204 C 506 188 507 174 508 160" />
            </g>
            <g stroke="#9c8a62" strokeOpacity="0.75" strokeWidth="3.4">
              <path d="M 495 160 C 496 148 497 140 498 134" />
              <path d="M 508 158 C 509 146 510 138 511 132" />
            </g>
          </motion.g>

          {/* The car (5.6 m by 2 m), stopped in the gravel, and the dust it raised */}
          <motion.g
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <ellipse cx="506" cy="116" rx="26" ry="12" fill="#efe4c6" opacity="0.85" filter={ref('dust')} />
            <g transform="translate(504 112) rotate(6)">
              <image href="/images/f1-car.svg" x="-8" y="-22.4" width="16" height="44.8" filter={ref('shadow')} />
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
          the text reads on it (the action is on the right) */}
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
