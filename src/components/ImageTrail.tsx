import { RefObject, useEffect, useRef } from 'react';

/**
 * Image trail: as the pointer moves over the hero, project visuals pop out under it and
 * fade away, leaving a trail — the projects are on show from the first second.
 * When the mouse rests (or on touch screens) an autopilot draws a slow Lissajous path so the
 * trail keeps living without input. Stops when the hero is off-screen or the tab hidden.
 *
 * A fixed pool of DOM nodes is recycled (no React re-render per spawn) and every animation
 * is a WAAPI transform/opacity animation, so it stays on the compositor.
 */

const POOL_SIZE = 10;
const SPAWN_DISTANCE = 90; // px between two images when following the pointer
const AUTO_SPAWN_DISTANCE = 140; // sparser when on autopilot
const IDLE_BEFORE_AUTOPILOT = 2500; // ms without mouse movement

interface ImageTrailProps {
  images: string[];
  /** Element listening to pointer moves (the hero section) */
  areaRef: RefObject<HTMLElement | null>;
  /** Start only once the intro has lifted */
  active: boolean;
}

export function ImageTrail({ images, areaRef, active }: ImageTrailProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const layer = layerRef.current;
    if (!active || !area || !layer || images.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Warm the cache so no tile pops in empty
    images.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const nodes = Array.from(layer.children) as HTMLDivElement[];
    let nodeIndex = 0;
    let imageIndex = 0;
    let zIndex = 1;
    let last: { x: number; y: number } | null = null;
    let lastMouseMove = 0;
    let inView = true;
    let raf = 0;
    let autoT = Math.random() * 10;
    let autoLast: { x: number; y: number } | null = null;
    let prevFrame = performance.now();

    const spawn = (x: number, y: number, dx: number, dy: number) => {
      const node = nodes[nodeIndex++ % nodes.length];
      const img = node.firstElementChild as HTMLImageElement;
      img.src = images[imageIndex++ % images.length];
      node.style.zIndex = String(zIndex++);
      node.getAnimations().forEach((a) => a.cancel());

      const rotate = (Math.random() - 0.5) * 10;
      // Keep drifting a little in the direction of travel while fading out
      const len = Math.hypot(dx, dy) || 1;
      const driftX = (dx / len) * 40;
      const driftY = (dy / len) * 40;
      const at = (ox: number, oy: number, scale: number) =>
        `translate(${x + ox}px, ${y + oy}px) translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;

      node.animate(
        [
          { opacity: 0, transform: at(0, 0, 0.6) },
          { opacity: 1, transform: at(driftX * 0.2, driftY * 0.2, 1), offset: 0.2 },
          { opacity: 1, transform: at(driftX * 0.6, driftY * 0.6, 1), offset: 0.6 },
          { opacity: 0, transform: at(driftX, driftY, 0.85) },
        ],
        { duration: 1200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' },
      );
    };

    const local = (clientX: number, clientY: number) => {
      const rect = area.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lastMouseMove = performance.now();
      autoLast = null;
      const p = local(e.clientX, e.clientY);
      if (!last) {
        last = p;
        return;
      }
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      if (Math.hypot(dx, dy) >= SPAWN_DISTANCE) {
        spawn(p.x, p.y, dx, dy);
        last = p;
      }
    };
    const onPointerLeave = () => {
      last = null;
    };

    // Autopilot: a slow figure-eight across the hero
    const tick = (now: number) => {
      const dt = Math.min(now - prevFrame, 64) / 1000;
      prevFrame = now;
      const idle = !finePointer || now - lastMouseMove > IDLE_BEFORE_AUTOPILOT;
      if (inView && idle && document.visibilityState === 'visible') {
        autoT += dt * 0.55;
        const { width, height } = area.getBoundingClientRect();
        const p = {
          x: width * (0.5 + 0.38 * Math.sin(autoT * 0.9)),
          y: height * (0.55 + 0.3 * Math.sin(autoT * 1.7 + 1)),
        };
        if (!autoLast) autoLast = p;
        const dx = p.x - autoLast.x;
        const dy = p.y - autoLast.y;
        if (Math.hypot(dx, dy) >= AUTO_SPAWN_DISTANCE) {
          spawn(p.x, p.y, dx, dy);
          autoLast = p;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(area);
    area.addEventListener('pointermove', onPointerMove, { passive: true });
    area.addEventListener('pointerleave', onPointerLeave, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      area.removeEventListener('pointermove', onPointerMove);
      area.removeEventListener('pointerleave', onPointerLeave);
      nodes.forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    };
  }, [active, images, areaRef]);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: POOL_SIZE }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 top-0 w-[150px] sm:w-[220px] lg:w-[260px] aspect-[4/3] rounded-xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/10 dark:ring-white/10 bg-neutral-800"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          <img alt="" decoding="async" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
