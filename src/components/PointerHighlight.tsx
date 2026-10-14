import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

/**
 * Pointer highlight, in the spirit of the iPadOS pointer: when the pointer rests on a link
 * or button, a thin accent outline wraps that element, keeps its corner radius, glides from
 * one element to the next and leans slightly toward the pointer (magnetic feel).
 * Works with the system pointer.
 */

const INTERACTIVE = 'a, button, [role="button"]';
const PAD = 6; // space between the element and its outline (px)
const MAGNET = 0.08; // how much the outline leans toward the pointer
const SPRING = { stiffness: 520, damping: 46, mass: 0.6 }; // critically damped, no overshoot

export function PointerHighlight() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  // On an accent background (contact sheet) the accent outline would vanish: switch to white
  const [onAccent, setOnAccent] = useState(false);

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
    let recheckTimer: number | undefined;

    // The element to outline under a given node: links and buttons, except where a component
    // draws its own pointer (project images)
    const resolve = (over: Element | null) =>
      over?.closest('[data-cursor-hidden]') ? null : (over?.closest<HTMLElement>(INTERACTIVE) ?? null);

    // The outlined element can change size (a label that changes) without the pointer moving
    const resizeObserver = new ResizeObserver(() => target && place(target, false));

    const place = (el: HTMLElement, instant: boolean) => {
      // Removed from the page (filtered card, closed menu): its box would be 0,0 → hide instead
      if (!el.isConnected) {
        update(null);
        return;
      }
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

    const update = (el: HTMLElement | null) => {
      if (el === target) return;
      resizeObserver.disconnect();
      if (el) {
        // Glide between neighbours; snap if the outline has been hidden for a while
        const instant = !target && performance.now() - hiddenAt > 120;
        target = el;
        resizeObserver.observe(el);
        setOnAccent(!!el.closest('[data-on-accent]'));
        place(el, instant);
        animate(opacity, 1, { duration: 0.18, ease: 'easeOut' });
      } else {
        target = null;
        hiddenAt = performance.now();
        animate(opacity, 0, { duration: 0.15, ease: 'easeOut' });
      }
    };

    // What is under the pointer now: after a click the page often changes under a still
    // pointer (filters, menus, cards that leave), and no pointerover event says so
    const recheck = () => {
      const el = resolve(document.elementFromPoint(pointer.x, pointer.y));
      if (el !== target) update(el);
      else if (target) place(target, false);
    };

    const onPointerOver = (e: PointerEvent) => update(resolve(e.target as Element | null));

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      const el = resolve(e.target as Element | null);
      if (el !== target) update(el);
      else if (target) place(target, false);
    };

    // Elements move under a still pointer while scrolling: follow them
    const onScroll = () => {
      if (target) place(target, true);
    };

    const onPointerDown = () => target && animate(scale, 0.96, { duration: 0.1, ease: 'easeOut' });
    const onPointerUp = () => {
      animate(scale, 1, { duration: 0.2, ease: 'easeOut' });
      // Once right after the click, once the layout animations have settled
      requestAnimationFrame(() => requestAnimationFrame(recheck));
      window.clearTimeout(recheckTimer);
      recheckTimer = window.setTimeout(recheck, 400);
    };
    const onLeaveWindow = (e: PointerEvent) => {
      if (!e.relatedTarget) update(null);
    };

    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointerout', onLeaveWindow, { passive: true });
    return () => {
      window.clearTimeout(recheckTimer);
      resizeObserver.disconnect();
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
      data-pointer-ui
      style={{
        x: reduceMotion ? x : springX,
        y: reduceMotion ? y : springY,
        width: reduceMotion ? width : springW,
        height: reduceMotion ? height : springH,
        borderRadius: reduceMotion ? radius : springR,
        opacity,
        scale,
      }}
      className={`[view-transition-name:pointer-outline] pointer-events-none fixed left-0 top-0 z-[9999] border-[1.5px] ${onAccent ? 'border-white shadow-[0_0_0_4px_rgba(255,255,255,0.12)]' : 'border-[var(--accent)] shadow-[0_0_0_4px_rgba(var(--accent-rgb),0.08)]'}`}
    />
  );
}
