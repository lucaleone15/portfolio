/**
 * Easter egg (⌘K → "lights out"): a Formula 1 start. Five red lights come on one by one,
 * hold for a random moment, go out together, and the page races to the projects.
 * Plain DOM, loaded on demand. Escape or a click cancels; reduced motion skips straight
 * to the projects.
 */

const LIGHT_EVERY_MS = 650;

export function lightsOut(lang: 'fr' | 'en', go: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    go();
    return;
  }

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;' +
    'background:rgba(6,6,8,0.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity 200ms ease-out;cursor:pointer';

  // Five pods, two lamps each, like the real gantry
  const gantry = document.createElement('div');
  gantry.style.cssText = 'display:flex;gap:clamp(8px,2.2vw,18px)';
  const lamps: HTMLElement[] = [];
  for (let i = 0; i < 5; i++) {
    const pod = document.createElement('div');
    pod.style.cssText =
      'display:flex;flex-direction:column;gap:clamp(6px,1.4vw,12px);padding:clamp(8px,1.6vw,14px);border-radius:clamp(10px,2vw,18px);background:#111114;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06)';
    for (let j = 0; j < 2; j++) {
      const lamp = document.createElement('div');
      lamp.style.cssText =
        'width:clamp(30px,8vw,64px);height:clamp(30px,8vw,64px);border-radius:50%;background:#2a1013;transition:background 60ms linear,box-shadow 60ms linear';
      pod.appendChild(lamp);
      lamps.push(lamp);
    }
    gantry.appendChild(pod);
  }

  const caption = document.createElement('p');
  caption.style.cssText =
    "font-family:'Syne Variable',Syne,sans-serif;font-weight:800;font-size:clamp(14px,2.4vw,20px);letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.75);margin:0";
  caption.textContent = lang === 'fr' ? 'Départ arrêté…' : 'Standing start…';

  overlay.append(gantry, caption);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => (overlay.style.opacity = '1'));

  const timers: number[] = [];
  let done = false;
  const close = (thenGo: boolean) => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    window.removeEventListener('keydown', onKey);
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 220);
    if (thenGo) go();
  };
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
  window.addEventListener('keydown', onKey);
  overlay.addEventListener('click', () => close(false));

  const on = (lamp: HTMLElement) => {
    lamp.style.background = 'radial-gradient(circle at 40% 35%, #ff6b6b, #e10600 55%, #8a0400)';
    lamp.style.boxShadow = '0 0 24px 6px rgba(225,6,0,0.55)';
  };
  for (let i = 0; i < 5; i++) {
    timers.push(window.setTimeout(() => {
      on(lamps[i * 2]);
      on(lamps[i * 2 + 1]);
    }, (i + 1) * LIGHT_EVERY_MS));
  }
  // As in F1: the lights go out after a random hold
  const out = 5 * LIGHT_EVERY_MS + 500 + Math.random() * 1500;
  timers.push(window.setTimeout(() => {
    lamps.forEach((l) => {
      l.style.background = '#2a1013';
      l.style.boxShadow = 'none';
    });
    caption.textContent = lang === 'fr' ? 'Extinction des feux, c’est parti !' : 'Lights out and away we go!';
  }, out));
  timers.push(window.setTimeout(() => close(true), out + 650));
}
