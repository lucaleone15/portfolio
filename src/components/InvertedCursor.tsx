import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

/**
 * Round cursor in inverted colours (mix-blend-difference): white on dark, black on light,
 * and it inverts whatever it passes over. It grows over links and buttons, where
 * PointerHighlight also outlines the element.
 *
 * The native cursor is hidden by ONE inherited rule (html.has-custom-cursor in index.css).
 * Earlier versions flickered because elements re-declared their own cursor (`html *`,
 * cursor-default/pointer utilities), which made the native cursor flash back at every
 * element boundary.
 */

const INTERACTIVE = 'a, button, [role="button"], summary, label[for], .cursor-pointer';
const FIELD = 'input, textarea, select';
// Areas drawing their own pointer (project images): the dot hides there
const HIDDEN = '[data-cursor-hidden]';

export function InvertedCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [overField, setOverField] = useState(false);
  const visibleRef = useRef(false);

  // Position follows the pointer 1:1 (no spring): a replacement cursor must never lag
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let shrinkTimer: number | undefined;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      setOverField(!!target.closest(FIELD) || !!target.closest(HIDDEN));
      window.clearTimeout(shrinkTimer);
      if (target.closest(INTERACTIVE)) {
        setHovering(true);
      } else {
        // Small delay: moving between adjacent links shouldn't shrink then regrow the dot
        shrinkTimer = window.setTimeout(() => setHovering(false), 80);
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        visibleRef.current = false;
        setVisible(false);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    return () => {
      window.clearTimeout(shrinkTimer);
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerout', onOut);
    };
  }, [x, y]);

  if (!enabled) return null;

  const scale = pressed ? (hovering ? 2 : 0.75) : hovering ? 2.6 : 1;

  return (
    // Outer element: position only. Inner element: scale. Kept separate so the size spring
    // never fights the 1:1 position updates.
    <motion.div
      aria-hidden="true"
      style={{ x, y }}
      className="[view-transition-name:cursor] pointer-events-none fixed left-0 top-0 z-[99999] mix-blend-difference will-change-transform"
    >
      <motion.div
        initial={false}
        animate={{ scale, opacity: visible && !overField ? 1 : 0 }}
        transition={{
          // Critically damped: hover isn't a momentum gesture, so no overshoot
          scale: { type: 'spring', bounce: 0, duration: 0.25 },
          opacity: { duration: 0.15 },
        }}
        className="-translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white"
      />
    </motion.div>
  );
}
