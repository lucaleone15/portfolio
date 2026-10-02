import { useRef } from 'react';
import { usePauseOffscreen } from '../hooks/usePauseOffscreen';

/**
 * Background shared by the intro curtain and the hero: a soft "aurora" — a few large,
 * heavily blurred colour fields in the accent family drifting very slowly — under a fine,
 * still grain. The layer fades out at the bottom so the hero melts into the next section.
 * Static under reduced motion. Decorative only.
 */
export function NeonBackdrop({ className = '', fadeBottom = true }: { className?: string; fadeBottom?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${fadeBottom ? 'backdrop-fade-bottom' : ''} ${className}`}
      aria-hidden="true"
    >
      <div className="aurora absolute inset-0 opacity-70 dark:opacity-100">
        <span className="aurora-blob aurora-a" />
        <span className="aurora-blob aurora-b" />
        <span className="aurora-blob aurora-c" />
      </div>
      <div className="paper-grain absolute inset-0 opacity-[0.05] dark:opacity-[0.07] mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
