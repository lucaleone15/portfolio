/**
 * Easter egg (click the full stop of the big "Luca Leone." signature): the dot comes loose
 * and becomes a little block that falls, bounces off the edges of the screen and can be
 * grabbed and thrown. Escape, or a click on its empty spot, sends it home. Plain DOM,
 * loaded on demand; nothing happens with reduced motion.
 */

const GRAVITY = 2400; // px/s²
const BOUNCE = 0.62; // energy kept on each bounce
const AIR = 0.999; // per frame
const FLOOR_FRICTION = 0.9; // horizontal speed kept per floor bounce

let active = false;

export function launchDot(home: HTMLElement) {
  if (active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  active = true;

  const start = home.getBoundingClientRect();
  const size = start.width;
  const ball = document.createElement('div');
  ball.style.cssText = `position:fixed;left:0;top:0;z-index:9998;width:${size}px;height:${size}px;background:${getComputedStyle(home).backgroundColor};touch-action:none;cursor:grab;will-change:transform`;
  document.body.appendChild(ball);
  home.style.opacity = '0';

  let x = start.left, y = start.top;
  // Pops up and slightly sideways, like it was flicked
  let vx = (Math.random() < 0.5 ? -1 : 1) * (250 + Math.random() * 250);
  let vy = -900 - Math.random() * 300;
  let spin = 0, spinV = vx * 0.6;
  let dragging = false;
  let resting = false;
  let samples: { x: number; y: number; t: number }[] = [];
  let grab = { dx: 0, dy: 0 };
  let frame = 0;
  let last = performance.now();

  const place = () => (ball.style.transform = `translate(${x}px, ${y}px) rotate(${spin}deg)`);

  const step = (now: number) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (!dragging && !resting) {
      const w = window.innerWidth - size, h = window.innerHeight - size;
      vy += GRAVITY * dt;
      vx *= AIR;
      x += vx * dt;
      y += vy * dt;
      spin += spinV * dt;
      if (x < 0) { x = 0; vx = -vx * BOUNCE; spinV = -spinV * BOUNCE; }
      if (x > w) { x = w; vx = -vx * BOUNCE; spinV = -spinV * BOUNCE; }
      if (y < 0) { y = 0; vy = -vy * BOUNCE; }
      if (y > h) {
        y = h;
        vy = -vy * BOUNCE;
        vx *= FLOOR_FRICTION;
        spinV = vx * 0.6;
        // Settled on the floor: stop computing until it's thrown again
        if (Math.abs(vy) < 60 && Math.abs(vx) < 15) {
          vy = 0;
          vx = 0;
          spinV = 0;
          spin = Math.round(spin / 90) * 90;
          resting = true;
        }
      }
      place();
    }
    frame = requestAnimationFrame(step);
  };
  place();
  frame = requestAnimationFrame(step);

  // Grab and throw: the release speed comes from the last few pointer moves
  const onDown = (e: PointerEvent) => {
    dragging = true;
    resting = false;
    ball.setPointerCapture(e.pointerId);
    ball.style.cursor = 'grabbing';
    grab = { dx: e.clientX - x, dy: e.clientY - y };
    samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
  };
  const onMoveBall = (e: PointerEvent) => {
    if (!dragging) return;
    x = e.clientX - grab.dx;
    y = e.clientY - grab.dy;
    samples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (samples.length > 5) samples.shift();
    place();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    ball.style.cursor = 'grab';
    const a = samples[0], b = samples[samples.length - 1];
    const dt = Math.max(16, b.t - a.t) / 1000;
    vx = Math.max(-3000, Math.min(3000, (b.x - a.x) / dt));
    vy = Math.max(-3000, Math.min(3000, (b.y - a.y) / dt));
    spinV = vx * 0.6;
    last = performance.now();
  };
  ball.addEventListener('pointerdown', onDown);
  ball.addEventListener('pointermove', onMoveBall);
  ball.addEventListener('pointerup', onUp);
  ball.addEventListener('pointercancel', onUp);

  // Back home: a short flight to wherever the full stop is now (the page may have scrolled)
  const goHome = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('keydown', onKey);
    home.removeEventListener('click', goHome);
    const to = home.getBoundingClientRect();
    ball.style.transition = 'transform 550ms cubic-bezier(0.22, 1, 0.36, 1)';
    ball.style.transform = `translate(${to.left}px, ${to.top}px) rotate(0deg)`;
    setTimeout(() => {
      ball.remove();
      home.style.opacity = '';
      active = false;
    }, 560);
  };
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && goHome();
  window.addEventListener('keydown', onKey);
  // The empty spot (still there, just transparent) calls it back
  setTimeout(() => home.addEventListener('click', goHome), 0);
}
