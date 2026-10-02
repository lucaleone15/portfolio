import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

/**
 * Pointer highlight, in the spirit of the iPadOS pointer: when the pointer rests on a link
 * or button, a thin accent outline wraps that element, keeps its corner radius, glides from
 * one element to the next and leans slightly toward the pointer (magnetic feel).
 * Works alongside InvertedCursor.
 */

const INTERACTIVE = 'a, button, [role="button"]';
const PAD = 6; // space between the element and its outline (px)
const MAGNET = 0.08; // how much the outline leans toward the pointer
const SPRING = { stiffness: 520, damping: 46, mass: 0.6 }; // critically damped, no overshoot

export function PointerHighlight() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const radius = useMotionValue(0);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(1);

  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);
  const springW = useSpring(width, SPRING);
  const springH = useSpring(height, SPRING);
  const springR = useSpring(radius, SPRING);

  useEffect(() => {
    // Mouse/trackpad only: on touch screens there is no hover to highlight
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);

    let target: HTMLElement | null = null;
    let hiddenAt = 0;
    let pointer = { x: 0, y: 0 };

    const place = (el: HTMLElement, instant: boolean) => {
      const rect = el.getBoundingClientRect();
      const cornerRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 6;
      const dx = (pointer.x - (rect.left + rect.width / 2)) * MAGNET;
      const dy = (pointer.y - (rect.top + rect.height / 2)) * MAGNET;
      const next = {
        x: rect.left - PAD + dx,
        y: rect.top - PAD + dy,
        w: rect.width + PAD * 2,
        h: rect.height + PAD * 2,
        r: Math.min(cornerRadius + PAD, (rect.height + PAD * 2) / 2),
      };
      if (instant) {
        // Appearing from nothing: snap into place instead of flying across the page
        springX.jump(next.x);
        springY.jump(next.y);
        springW.jump(next.w);
        springH.jump(next.h);
        springR.jump(next.r);
      }
      x.set(next.x);
      y.set(next.y);
      width.set(next.w);
      height.set(next.h);
      radius.set(next.r);
    };

    const onPointerOver = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE) ?? null;
      if (el === target) return;
      if (el) {
        // Glide between neighbours; snap if the outline has been hidden for a while
        const instant = !target && performance.now() - hiddenAt > 120;
        target = el;
        place(el, instant);
        animate(opacity, 1, { duration: 0.18, ease: 'easeOut' });
      } else {
        target = null;
        hiddenAt = performance.now();
        animate(opacity, 0, { duration: 0.15, ease: 'easeOut' });
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (target) place(target, false);
    };

    // Elements move under a still pointer while scrolling: follow them
    const onScroll = () => {
      if (target) place(target, true);
    };

    const onPointerDown = () => target && animate(scale, 0.96, { duration: 0.1, ease: 'easeOut' });
    const onPointerUp = () => animate(scale, 1, { duration: 0.2, ease: 'easeOut' });
    const onLeaveWindow = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        target = null;
        animate(opacity, 0, { duration: 0.15 });
      }
    };

    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointerout', onLeaveWindow, { passive: true });
    return () => {
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerout', onLeaveWindow);
    };
  }, [x, y, width, height, radius, opacity, scale, springX, springY, springW, springH, springR]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: reduceMotion ? x : springX,
        y: reduceMotion ? y : springY,
        width: reduceMotion ? width : springW,
        height: reduceMotion ? height : springH,
        borderRadius: reduceMotion ? radius : springR,
        opacity,
        scale,
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] border-[1.5px] border-[var(--accent)] shadow-[0_0_0_4px_rgba(var(--accent-rgb),0.08)]"
    />
  );
}
