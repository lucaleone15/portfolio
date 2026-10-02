import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowDown } from 'lucide-react';

/** Live local time in Yverdon-les-Bains (Europe/Zurich), updated every 20 s. Client only. */
export function LocalTime({ lang }: { lang: 'fr' | 'en' }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CH' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Zurich',
      }).format(new Date());
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 20_000);
    return () => window.clearInterval(id);
  }, [lang]);
  if (!time) return null;
  return (
    <span className="tabular-nums">
      Yverdon-les-Bains · {time}
    </span>
  );
}

/** Words rise one by one out of their own mask when the heading enters the viewport. */
export function RevealWords({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
            className={`inline-block ${className}`}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

/**
 * Round "write to me" badge: text running around a circle (slow rotation) with an arrow in
 * the middle. It leans toward the pointer (magnetic, spring, no overshoot) and takes the
 * visitor to the form. Rotation stops under reduced motion.
 */
export function MagneticBadge({ label, onActivate }: { label: string; onActivate: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });

  const onMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const ring = `${label} • ${label} • `;

  return (
    // Larger invisible hit area so the pull starts before the pointer reaches the badge
    <div className="p-6 -m-6" onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.button
        ref={ref}
        type="button"
        onClick={onActivate}
        style={{ x: springX, y: springY }}
        aria-label={label}
        className="group relative w-36 h-36 rounded-full cursor-pointer active:scale-[0.97] transition-transform"
      >
        <svg viewBox="0 0 100 100" className="badge-spin absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-neutral-900 dark:fill-white" style={{ fontSize: 9.2, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <textPath href="#badge-circle">{ring}</textPath>
          </text>
        </svg>
        <span className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <ArrowDown className="w-5 h-5" />
        </span>
      </motion.button>
    </div>
  );
}

/** Oversized signature closing the page; rises into place as it scrolls in. */
export function Signature() {
  return (
    <div className="overflow-hidden select-none" aria-hidden="true">
      <motion.p
        initial={{ y: '45%', opacity: 0 }}
        whileInView={{ y: '12%', opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="font-serif whitespace-nowrap font-black leading-[0.8] tracking-[-0.05em] text-[min(15.5vw,12.5rem)] bg-gradient-to-b from-neutral-900 to-neutral-900/0 dark:from-white dark:to-white/0 bg-clip-text text-transparent"
      >
        Luca Leone<span className="text-[var(--accent)]">.</span>
      </motion.p>
    </div>
  );
}
