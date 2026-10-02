import { useId } from 'react';

/**
 * Background texture shared by the intro curtain and the hero: animated film grain plus a few
 * neon lines in the accent colour. Each line has a soft glow and streaks of light travelling
 * along it. With `draw`, the lines draw themselves in (intro). Pure SVG + CSS animations
 * (transform / stroke-dashoffset), static under reduced motion. Decorative only.
 */

// Long, gentle curves crossing the whole width (viewBox 1440 × 900, sliced to cover)
const LINES = [
  'M-120 640 C 260 470, 620 840, 940 600 S 1380 360, 1580 500',
  'M-120 260 C 230 400, 560 140, 880 290 S 1300 540, 1580 250',
  'M-120 820 C 380 740, 720 920, 1040 760 S 1420 680, 1580 800',
];

export function NeonBackdrop({ draw = false, className = '' }: { draw?: boolean; className?: string }) {
  // Intro and hero can be on screen together: each needs its own filter id
  const glowId = `neon-glow-${useId().replace(/:/g, '')}`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Soft accent glow in a corner, so the lines feel lit rather than drawn */}
      <div className="absolute -top-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.22),transparent)]" />

      <svg
        className="neon-lines absolute inset-0 w-full h-full opacity-60 dark:opacity-100"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <filter id={glowId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {LINES.map((d, i) => (
          <g key={i} style={{ ['--line-delay' as string]: `${i * 0.25}s`, ['--pulse-delay' as string]: `${-i * 2.7}s` }}>
            {/* Glow */}
            <path d={d} stroke="var(--accent)" strokeWidth="6" strokeOpacity="0.35" filter={`url(#${glowId})`} pathLength={1} className={draw ? 'neon-draw' : ''} />
            {/* Core line */}
            <path d={d} stroke="var(--accent)" strokeWidth="1.25" strokeOpacity="0.55" pathLength={1} className={draw ? 'neon-draw' : ''} />
            {/* Light streak travelling along the line */}
            <path d={d} stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" pathLength={1} className="neon-pulse" filter={`url(#${glowId})`} />
            <path d={d} stroke="#fff" strokeOpacity="0.85" strokeWidth="1.25" strokeLinecap="round" pathLength={1} className="neon-pulse" />
          </g>
        ))}
      </svg>

      {/* Film grain */}
      <div className="film-grain absolute -inset-1/2 opacity-[0.07] dark:opacity-[0.09] mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
