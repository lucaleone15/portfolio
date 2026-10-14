import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// The curtain plays once per page load. Components that mount later (e.g. the Hero when
// coming back from a project page) must not wait for it: they ask introPending().
let lifted = false;
const liftListeners = new Set<() => void>();

/** True while the intro curtain still covers the page (client side). */
export function introPending(): boolean {
  // Server (prerender): the hero is only rendered on the home page, which always opens with
  // the curtain — rendering it "pending" keeps the HTML identical to the first client render
  if (typeof document === 'undefined') return true;
  return !lifted;
}

/** Calls `cb` when the curtain lifts (at once if it already has). Returns an unsubscribe. */
export function onIntroLifted(cb: () => void): () => void {
  if (lifted) {
    cb();
    return () => {};
  }
  liftListeners.add(cb);
  return () => liftListeners.delete(cb);
}

/** The curtain won't play on this visit (e.g. landing on a project page): release waiters. */
export function skipIntro() {
  markLifted();
}

function markLifted() {
  if (lifted) return;
  lifted = true;
  liftListeners.forEach((cb) => cb());
  liftListeners.clear();
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/* The monogram, on the same 64-unit grid as the favicon (scripts/make-icons.py): two reds split
   by a line through the centre, a white L on each side (the right one turned 180°). */
const RED = '#C50E36';
const HOT = '#FF2E55';
const HALF_RED = 'M0 0H20L44 64H0Z';
// The bright half folds onto the line, like a shutter closing (same commands, so it morphs)
const HALF_HOT_OPEN = 'M20 0L64 0L64 64L44 64Z';
const HALF_HOT_FOLDED = 'M20 0L20 0L44 64L44 64Z';
const L_LEFT = 'M10 10H19V45H33V54H10Z';
const L_RIGHT = 'M54 54H45V19H31V10H54Z';
// Each L's box on the grid; the right one is the same L drawn upside down
const MONO = { left: { x: 10, y: 10 }, right: { x: 31, y: 10 }, w: 23, h: 44, t: 9 };

/* Timeline (s), one thing at a time: the tile comes in, its bright half folds away, the two
   white Ls travel into the name, the letters rise and the dot appears, then the name flies onto
   the header's and the curtain fades out over it. */
const FOLD_AT = 0.4;
const FOLD = 0.3;
const MORPH_AT = 0.72;
const MORPH = 0.6;
const NAME_HOLD = 0.3;
const FLY = 0.55;
const FADE_AFTER_FLY_START = 0.45;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  stem: number;
  foot: number;
}
interface Geometry {
  from: [Box, Box];
  to: [Box, Box];
}

/** Ink box of a character in a given font, in em (canvas scan: works with any fallback font) */
function measureInk(font: string, char: string) {
  const size = 200;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * 2;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = font.replace(/\d+(\.\d+)?px/, `${size}px`);
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(char, size / 2, size * 1.5);
  const { data } = ctx.getImageData(0, 0, size * 2, size * 2);
  const ink = (x: number, y: number) => data[(y * size * 2 + x) * 4 + 3] > 127;
  let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
  for (let y = 0; y < size * 2; y++)
    for (let x = 0; x < size * 2; x++)
      if (ink(x, y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  if (maxX < 0) return null;
  let stemRight = minX;
  while (stemRight < maxX && ink(stemRight, Math.round((minY + maxY) / 2))) stemRight++;
  let footTop = maxY;
  while (footTop > minY && ink(Math.round(maxX - (maxX - minX) * 0.15), footTop)) footTop--;
  return {
    left: (minX - size / 2) / size,
    width: (maxX - minX + 1) / size,
    top: (size * 1.5 - minY) / size,
    height: (maxY - minY + 1) / size,
    stem: (stemRight - minX) / size,
    foot: (maxY - footTop) / size,
  };
}

/** One L, drawn as two bars so it can reshape from the monogram's L into the font's L */
function MorphL({ from, to, turned, onDone }: { from: Box; to: Box; turned?: boolean; onDone?: () => void }) {
  const transition = { duration: MORPH, ease: EASE_IN_OUT };
  return (
    <motion.div
      className="absolute"
      initial={{ left: from.left, top: from.top, width: from.width, height: from.height, rotate: turned ? 180 : 0 }}
      animate={{ left: to.left, top: to.top, width: to.width, height: to.height, rotate: 0 }}
      transition={transition}
      onAnimationComplete={onDone}
    >
      <motion.span className="absolute left-0 top-0 bottom-0 bg-white" initial={{ width: from.stem }} animate={{ width: to.stem }} transition={transition} />
      <motion.span className="absolute left-0 right-0 bottom-0 bg-white" initial={{ height: from.foot }} animate={{ height: to.foot }} transition={transition} />
    </motion.div>
  );
}

/** Letters rising out of a mask, from a given delay */
function Rise({ text, delay, play }: { text: string; delay: number; play: boolean }) {
  return (
    <span className="inline-flex overflow-hidden pb-[0.1em] -mb-[0.1em]">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          // Starts fully below the mask (its bottom padding included), so nothing peeks out
          initial={{ y: '130%' }}
          animate={play ? { y: '0%' } : undefined}
          transition={{ duration: 0.55, delay: delay + i * 0.035, ease: EASE_OUT }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

interface IntroCurtainProps {
  onDone?: () => void;
}

/**
 * Intro, on the site's red (like the contact sheet), in both themes. The LL monogram comes in,
 * its bright half folds onto the line, then its two white Ls travel and reshape into the Ls of
 * "Luca" and "Leone" (the right one turning upright) while the other letters rise. The name then
 * flies onto the header's own and the curtain fades out, leaving the real one in the same place.
 */
export function IntroCurtain({ onDone }: IntroCurtainProps) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [landed, setLanded] = useState(false);
  const [fly, setFly] = useState<{ x: number; y: number; scale: number; origin: string } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const lRefs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];
  const baseRefs = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)];

  const lift = () => {
    setVisible(false);
    markLifted();
  };

  // Never hold people hostage: any intent to interact lifts the curtain right away
  useEffect(() => {
    if (!visible) return;
    const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;
    events.forEach((name) => window.addEventListener(name, lift, { once: true, passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, lift));
  }, [visible]);

  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(lift, 1200);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    const timers: number[] = [];
    const after = (s: number, fn: () => void) => timers.push(window.setTimeout(() => !cancelled && fn(), s * 1000));
    const started = performance.now();
    const fontReady = document.fonts?.load('700 1em "Syne Variable"', 'L').catch(() => undefined) ?? Promise.resolve();

    Promise.race([fontReady, new Promise((r) => setTimeout(r, 900))]).then(() => {
      after(Math.max(0, MORPH_AT - (performance.now() - started) / 1000), () => {
        // Where the monogram's pieces are, and where the name's Ls and dot will be
        const stage = stageRef.current?.getBoundingClientRect();
        const tile = tileRef.current?.getBoundingClientRect();
        const name = nameRef.current;
        if (!stage || !tile || !name) return lift();
        const style = getComputedStyle(name);
        const size = parseFloat(style.fontSize);
        const L = measureInk(style.font, 'L');
        if (!L) return lift();
        const u = tile.width / 64;
        const fromBox = (x: number, y: number): Box => ({
          left: tile.left - stage.left + x * u,
          top: tile.top - stage.top + y * u,
          width: MONO.w * u,
          height: MONO.h * u,
          stem: MONO.t * u,
          foot: MONO.t * u,
        });
        const toBox = (i: number): Box => {
          const letter = lRefs[i].current!.getBoundingClientRect();
          const baseline = baseRefs[i].current!.getBoundingClientRect().top;
          return {
            left: letter.left - stage.left + L.left * size,
            top: baseline - stage.top - L.top * size,
            width: L.width * size,
            height: L.height * size,
            stem: L.stem * size,
            foot: L.foot * size,
          };
        };
        setGeo({
          from: [fromBox(MONO.left.x, MONO.left.y), fromBox(MONO.right.x, MONO.right.y)],
          to: [toBox(0), toBox(1)],
        });

        // Then onto the header's name: same font, so one scale + one move lines them up
        after(MORPH + NAME_HOLD, () => {
          const target = document.querySelector<HTMLElement>('[data-brand-wordmark]');
          const targetBase = document.querySelector<HTMLElement>('[data-brand-baseline]');
          const start = lRefs[0].current?.getBoundingClientRect();
          const startBase = baseRefs[0].current?.getBoundingClientRect().top;
          const box = stageRef.current?.getBoundingClientRect();
          if (!target || !targetBase || !start || startBase === undefined || !box || !target.getClientRects().length) {
            return after(0.3, lift);
          }
          const scale = parseFloat(getComputedStyle(target).fontSize) / size;
          const end = targetBase.getBoundingClientRect();
          setFly({
            x: end.left - start.left,
            y: end.top - startBase,
            scale,
            origin: `${start.left - box.left}px ${startBase - box.top}px`,
          });
          after(FADE_AFTER_FLY_START, lift);
        });
      });
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  const play = !!geo || !!reduceMotion;
  // The rest of the name rises as the Ls arrive; the dot comes last
  const lettersAt = reduceMotion ? 0 : MORPH * 0.7;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="intro-curtain"
          // Fades out over the page once the name sits on the header's
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.3 : 0.45, ease: 'easeOut' } }}
          className="intro-curtain fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#C50E36] text-white pointer-events-none select-none"
          aria-hidden="true"
        >

          <motion.div
            ref={stageRef}
            className="relative z-10 flex items-center justify-center"
            style={{ transformOrigin: fly?.origin }}
            animate={fly ? { x: fly.x, y: fly.y, scale: fly.scale } : undefined}
            transition={{ duration: FLY, ease: EASE_IN_OUT }}
          >
            <p
              ref={nameRef}
              className="font-syne font-bold whitespace-nowrap text-[clamp(2.5rem,11.5vw,8.5rem)] tracking-tight leading-none"
            >
              {['Luca', 'Leone'].map((word, i) => (
                <span key={word}>
                  {i > 0 && ' '}
                  <span ref={lRefs[i]} className="inline-block" style={{ opacity: landed || reduceMotion ? 1 : 0 }}>
                    L
                  </span>
                  <span ref={baseRefs[i]} className="inline-block w-0 h-0" />
                  <Rise text={word.slice(1)} delay={lettersAt + i * 0.08} play={play} />
                </span>
              ))}
              <motion.span
                className="inline-block text-[#FF2E55] origin-bottom"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={play ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : MORPH, ease: EASE_OUT }}
              >
                .
              </motion.span>
            </p>

            {/* The monogram, centred over the name; a soft shadow sets it apart from the red */}
            {!reduceMotion && (
              <div
                ref={tileRef}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(5.5rem,22vw,9rem)] aspect-square"
              >
                <motion.svg
                  viewBox="0 0 64 64"
                  className="absolute inset-0 w-full h-full overflow-visible"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={geo ? { opacity: 0, scale: 1 } : { opacity: 1, scale: 1 }}
                  transition={geo ? { duration: 0.35, ease: EASE_OUT } : { duration: 0.4, ease: EASE_OUT }}
                  style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.16))' }}
                >
                  <defs>
                    <clipPath id="intro-tile">
                      <rect width="64" height="64" rx="14" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#intro-tile)">
                    <path fill={RED} d={HALF_RED} />
                    <motion.path
                      fill={HOT}
                      initial={{ d: HALF_HOT_OPEN }}
                      animate={{ d: HALF_HOT_FOLDED }}
                      transition={{ duration: FOLD, delay: FOLD_AT, ease: EASE_IN_OUT }}
                    />
                    {/* From the morph on, the Ls are drawn by the pieces below */}
                    {!geo && (
                      <>
                        <path fill="#FFFFFF" d={L_LEFT} />
                        <path fill="#FFFFFF" d={L_RIGHT} />
                      </>
                    )}
                  </g>
                </motion.svg>
              </div>
            )}

            {/* The two Ls on their way into the name, handed over to the text once they land */}
            {geo && !landed && (
              <div className="absolute inset-0">
                <MorphL from={geo.from[0]} to={geo.to[0]} onDone={() => setLanded(true)} />
                <MorphL from={geo.from[1]} to={geo.to[1]} turned />
              </div>
            )}
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
