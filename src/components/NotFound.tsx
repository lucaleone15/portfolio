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

// Gravel trap, on the outside of the corner behind the grass verge
const GRAVEL = 'M 552 660 L 552 360 C 552 222 440 128 300 128 L 156 128 L 156 66 L 612 66 L 612 660 Z';
// Outline of the asphalt (track centre line offset by its half-width, 54 units with the lines)
const ASPHALT = 'M 416.0 620.0 L 416.0 610.0 L 416.0 600.0 L 416.0 590.0 L 416.0 580.0 L 416.0 570.0 L 416.0 560.0 L 416.0 550.0 L 416.0 540.0 L 416.0 530.0 L 416.0 520.0 L 416.0 510.0 L 416.0 500.0 L 416.0 490.0 L 416.0 480.0 L 416.0 470.0 L 416.0 460.0 L 416.0 450.0 L 416.0 440.0 L 416.0 430.0 L 416.0 420.0 L 416.0 410.0 L 416.0 400.0 L 416.0 390.0 L 416.0 380.0 L 416.0 370.0 L 416.0 360.4 L 415.9 354.5 L 415.6 349.3 L 415.2 344.3 L 414.5 339.6 L 413.8 335.1 L 412.9 330.8 L 411.8 326.8 L 410.6 322.9 L 409.3 319.3 L 407.9 315.8 L 406.4 312.6 L 404.8 309.5 L 403.1 306.5 L 401.3 303.7 L 399.4 301.0 L 397.3 298.4 L 395.2 295.9 L 392.9 293.5 L 390.5 291.2 L 387.9 289.0 L 385.2 286.8 L 382.4 284.7 L 379.3 282.7 L 376.1 280.8 L 372.8 279.0 L 369.2 277.2 L 365.5 275.5 L 361.5 273.9 L 357.4 272.4 L 353.1 271.1 L 348.6 269.8 L 343.9 268.6 L 339.0 267.6 L 334.0 266.6 L 328.7 265.9 L 323.3 265.2 L 317.7 264.7 L 312.0 264.3 L 306.1 264.1 L 299.7 264.0 L 290.0 264.0 L 280.0 264.0 L 270.0 264.0 L 260.0 264.0 L 250.0 264.0 L 240.0 264.0 L 230.0 264.0 L 220.0 264.0 L 210.0 264.0 L 200.0 264.0 L 190.0 264.0 L 180.0 264.0 L 170.0 264.0 L 160.0 264.0 L 150.0 264.0 L 140.0 264.0 L 130.0 264.0 L 120.0 264.0 L 110.0 264.0 L 100.0 264.0 L 90.0 264.0 L 80.0 264.0 L 70.0 264.0 L 60.0 264.0 L 50.0 264.0 L 40.0 264.0 L 30.0 264.0 L 20.0 264.0 L 10.0 264.0 L 0.0 264.0 L -10.0 264.0 L -20.0 264.0 L -30.0 264.0 L -40.0 264.0 L -50.0 264.0 L -60.0 264.0 L -70.0 264.0 L -80.0 264.0 L -90.0 264.0 L -100.0 264.0 L -110.0 264.0 L -120.0 264.0 L -120.0 156.0 L -110.0 156.0 L -100.0 156.0 L -90.0 156.0 L -80.0 156.0 L -70.0 156.0 L -60.0 156.0 L -50.0 156.0 L -40.0 156.0 L -30.0 156.0 L -20.0 156.0 L -10.0 156.0 L 0.0 156.0 L 10.0 156.0 L 20.0 156.0 L 30.0 156.0 L 40.0 156.0 L 50.0 156.0 L 60.0 156.0 L 70.0 156.0 L 80.0 156.0 L 90.0 156.0 L 100.0 156.0 L 110.0 156.0 L 120.0 156.0 L 130.0 156.0 L 140.0 156.0 L 150.0 156.0 L 160.0 156.0 L 170.0 156.0 L 180.0 156.0 L 190.0 156.0 L 200.0 156.0 L 210.0 156.0 L 220.0 156.0 L 230.0 156.0 L 240.0 156.0 L 250.0 156.0 L 260.0 156.0 L 270.0 156.0 L 280.0 156.0 L 290.0 156.0 L 300.3 156.0 L 308.8 156.1 L 317.6 156.4 L 326.2 157.0 L 334.8 157.8 L 343.3 158.8 L 351.7 160.1 L 360.0 161.6 L 368.3 163.4 L 376.4 165.4 L 384.4 167.7 L 392.3 170.2 L 400.1 173.1 L 407.8 176.2 L 415.3 179.5 L 422.7 183.2 L 429.9 187.2 L 437.0 191.4 L 443.9 196.0 L 450.6 200.9 L 457.1 206.0 L 463.3 211.5 L 469.3 217.2 L 475.1 223.3 L 480.6 229.6 L 485.8 236.2 L 490.7 243.1 L 495.3 250.2 L 499.5 257.5 L 503.5 265.1 L 507.1 272.9 L 510.3 280.9 L 513.2 289.1 L 515.8 297.4 L 518.0 306.0 L 519.8 314.6 L 521.3 323.4 L 522.5 332.4 L 523.3 341.5 L 523.8 350.7 L 524.0 359.6 L 524.0 370.0 L 524.0 380.0 L 524.0 390.0 L 524.0 400.0 L 524.0 410.0 L 524.0 420.0 L 524.0 430.0 L 524.0 440.0 L 524.0 450.0 L 524.0 460.0 L 524.0 470.0 L 524.0 480.0 L 524.0 490.0 L 524.0 500.0 L 524.0 510.0 L 524.0 520.0 L 524.0 530.0 L 524.0 540.0 L 524.0 550.0 L 524.0 560.0 L 524.0 570.0 L 524.0 580.0 L 524.0 590.0 L 524.0 600.0 L 524.0 610.0 L 524.0 620.0 Z';

// The rear wheels' paths (track 1.6 m): straight on under braking, a slight twitch, into the gravel
const WHEELS = ['M 491 520 C 491.5 400 493 266 497.5 142', 'M 504 520 C 504.5 400 506 264 510.5 138'];
// Braking from the straight to a stop: one motion for the car and for the marks it lays
const DRIVE = { duration: 1.7, ease: [0.25, 0.46, 0.45, 0.94] as const };

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
        {/* Skid marks start faint where the wheels lock and darken under braking */}
        <linearGradient id={`${id}-skid`} gradientUnits="userSpaceOnUse" x1="0" y1="425" x2="0" y2="345">
          <stop offset="0" stopColor="#0b0b0c" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0b0c" stopOpacity="0.62" />
        </linearGradient>
        {/* Where each wheel runs: asphalt, then the grass verge, then the gravel */}
        <clipPath id={`${id}-on-asphalt`}>
          <path d={ASPHALT} />
        </clipPath>
        <clipPath id={`${id}-in-gravel`}>
          <path d={GRAVEL} />
        </clipPath>
        {/* The verge: everything that is neither asphalt nor gravel */}
        <mask id={`${id}-on-verge`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1040" height="860">
          <rect x="-200" y="-200" width="1040" height="860" fill="#fff" />
          <path d={ASPHALT} fill="#000" />
          <path d={GRAVEL} fill="#000" />
        </mask>
        {/* The marks appear behind the car: this mask's top edge travels with the car's rear */}
        <mask id={`${id}-laid`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="1040" height="860">
          <motion.rect x="400" y="140" width="200" height="500" fill="#fff" initial={{ y: 380 }} animate={{ y: 0 }} transition={DRIVE} />
        </mask>
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
          <path d={GRAVEL} fill="#d9caa4" filter={ref('stones')} />

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

          {/* Tyre marks, laid by the wheels as the car passes (the mask follows the car's rear):
              locked-wheel rubber on the asphalt, torn turf on the verge, furrows in the gravel */}
          <g mask={ref('laid')}>
            {WHEELS.map((d, w) => (
              <g key={w} fill="none" strokeLinecap="round">
                <g clipPath={ref('on-asphalt')}>
                  <path d={d} stroke={ref('skid')} strokeWidth="3.4" />
                  {/* Tread streaks */}
                  {[-1.1, 0, 1.1].map((dx) => (
                    <path key={dx} d={d} transform={`translate(${dx} 0)`} stroke="#050506" strokeOpacity="0.35" strokeWidth="0.45" strokeDasharray="22 3 9 2" />
                  ))}
                </g>
                <g mask={ref('on-verge')}>
                  <path d={d} stroke="#4a3a22" strokeOpacity="0.8" strokeWidth="4.2" strokeDasharray="7 2 4 3" />
                  <path d={d} stroke="#2f5a2b" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 4" />
                </g>
                <g clipPath={ref('in-gravel')}>
                  {/* Gravel pushed up on both sides, then the furrow */}
                  <path d={d} stroke="#e6dab8" strokeOpacity="0.85" strokeWidth="5.8" />
                  <path d={d} stroke="#8d7a52" strokeWidth="3.4" />
                  <path d={d} transform="translate(0.8 0)" stroke="#6f5f3f" strokeOpacity="0.6" strokeWidth="1.2" />
                </g>
              </g>
            ))}
          </g>

          {/* Dust and gravel thrown up as it stops, behind the car */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: DRIVE.duration * 0.55, duration: 0.8 }}>
            <ellipse cx="503" cy="132" rx="20" ry="16" fill="#efe4c6" opacity="0.7" filter={ref('dust')} />
            <g fill="#b9a67b">
              <circle cx="488" cy="128" r="0.9" />
              <circle cx="521" cy="122" r="1.1" />
              <circle cx="517" cy="146" r="0.7" />
              <circle cx="490" cy="150" r="0.8" />
              <circle cx="526" cy="134" r="0.8" />
            </g>
          </motion.g>

          {/* The car (5.6 m by 2 m): brakes from the straight, runs on into the gravel, stops */}
          <motion.g initial={{ y: 380 }} animate={{ y: 0 }} transition={DRIVE}>
            <g transform="translate(504 118) rotate(6)">
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
