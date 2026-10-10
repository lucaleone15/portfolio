import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { homePath, Link, sectionPath } from '../router';
import { NeonBackdrop } from './NeonBackdrop';

/**
 * 404 (served with a real 404 status by server/index.ts): "off track". An aerial view of a
 * bend: a Formula 1 car has gone straight on and stopped in the gravel trap; the buttons
 * put the visitor back on track. The car is a real photo, cut out: Ferrari 641 (1990) at
 * MoMA, by Tony Hisgett, CC BY 2.0 (sponsor logos removed), credited under the picture.
 */

// The bend, drawn as kerbs (white, then red dashes), asphalt, and the white edge lines
const TRACK = 'M -60 110 C 170 90 320 150 350 270 S 320 490 150 580';

function OffTrack({ fr }: { fr: boolean }) {
  return (
    <figure className="m-0">
      <svg viewBox="0 0 640 460" className="w-full h-auto rounded-[28px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)]" role="img" aria-label={fr ? 'Vue aérienne d’une Formule 1 sortie de piste, arrêtée dans le bac à gravier' : 'Aerial view of a Formula 1 car gone off track, stopped in the gravel trap'}>
        <defs>
          <clipPath id="frame">
            <rect width="640" height="460" rx="28" />
          </clipPath>
          {/* Grass, asphalt and gravel grain */}
          <filter id="grain" filterUnits="userSpaceOnUse" x="0" y="0" width="640" height="460">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
          <filter id="stones" filterUnits="userSpaceOnUse" x="0" y="0" width="640" height="460">
            <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="9" />
            <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 1.4 -0.55" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode />
            </feMerge>
          </filter>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="8" dy="10" stdDeviation="7" floodColor="#000" floodOpacity="0.45" />
          </filter>
          <radialGradient id="light" cx="30%" cy="20%" r="90%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="1" stopColor="#000" stopOpacity="0.22" />
          </radialGradient>
        </defs>

        <g clipPath="url(#frame)">
          {/* Grass */}
          <rect width="640" height="460" fill="#3E7A3A" filter="url(#grain)" />

          {/* Gravel trap on the outside of the bend */}
          <path
            d="M 360 40 C 520 40 640 120 660 250 C 680 380 600 480 420 500 C 380 420 420 330 410 250 C 400 170 420 110 360 40 Z"
            fill="#D8C9A3"
            filter="url(#stones)"
          />

          {/* Track */}
          <path d={TRACK} fill="none" stroke="#fff" strokeWidth="138" />
          <path d={TRACK} fill="none" stroke="#D7141A" strokeWidth="138" strokeDasharray="18 18" />
          <path d={TRACK} fill="none" stroke="#2B2B30" strokeWidth="120" filter="url(#grain)" />
          {/* Racing line rubbered in */}
          <path d="M -60 125 C 170 105 300 165 325 270 S 300 470 140 570" fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="26" strokeLinecap="round" />

          {/* Tyre marks: straight on, off the asphalt and into the gravel */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            fill="none"
            stroke="#1a1a1a"
            strokeOpacity="0.55"
            strokeWidth="9"
            strokeLinecap="round"
          >
            <path d="M 300 150 C 362 172 425 212 478 256" />
            <path d="M 284 178 C 345 202 400 240 446 290" />
          </motion.g>

          {/* The car, slid into the gravel and stopped a little sideways */}
          <motion.g
            initial={{ x: -150, y: -130, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <g transform="translate(522 312) rotate(128)">
              <image href="/images/f1-ferrari-641.webp" x="-54" y="-115" width="108" height="230" filter="url(#shadow)" />
            </g>
            {/* Gravel thrown up */}
            <g fill="#BFAE85">
              <circle cx="574" cy="372" r="3.2" />
              <circle cx="588" cy="356" r="2.2" />
              <circle cx="562" cy="388" r="2.6" />
              <circle cx="592" cy="380" r="1.8" />
            </g>
          </motion.g>

          {/* Soft light over the whole scene */}
          <rect width="640" height="460" fill="url(#light)" />
        </g>
      </svg>
      <figcaption className="mt-3 text-[11px] text-neutral-500 dark:text-[#71717A]">
        Ferrari 641 (1990) · {fr ? 'photo' : 'photo by'} Tony Hisgett,{' '}
        <a href="https://creativecommons.org/licenses/by/2.0/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          CC BY 2.0
        </a>
        , {fr ? 'détourée' : 'cut out'}
      </figcaption>
    </figure>
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
          <OffTrack fr={fr} />
        </div>
      </div>
    </main>
  );
}
