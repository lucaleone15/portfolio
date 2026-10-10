/**
 * Easter egg (Konami code: ↑ ↑ ↓ ↓ ← → ← → B A): karting mode. The pointer becomes a kart
 * seen from above, turned toward where it goes, leaving tyre marks that fade. Driving one
 * full loop around the middle of the screen is a lap: the chrono shows the last and best
 * laps. Escape (or the code again) ends it. Plain DOM + one canvas, loaded on demand.
 */

const KART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 28" width="44" height="28" aria-hidden="true">
  <rect x="3" y="1" width="10" height="6" rx="2" fill="#111"/>
  <rect x="3" y="21" width="10" height="6" rx="2" fill="#111"/>
  <rect x="29" y="2" width="8" height="5" rx="2" fill="#111"/>
  <rect x="29" y="21" width="8" height="5" rx="2" fill="#111"/>
  <path d="M6 9h24l8 3v4l-8 3H6a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" style="fill:var(--accent, #e4012d)"/>
  <rect x="39" y="9" width="4" height="10" rx="1.5" fill="#111"/>
  <circle cx="17" cy="14" r="4.2" fill="#fff"/>
  <circle cx="17" cy="14" r="4.2" fill="none" stroke="#111" stroke-width="1.2"/>
  <rect x="17.5" y="12.6" width="3.4" height="2.8" rx="1" fill="#111"/>
</svg>`;

type Lang = 'fr' | 'en';
let stop: (() => void) | null = null;

export function toggleKart(lang: Lang) {
  if (stop) {
    stop();
    return;
  }
  stop = start(lang);
}

function start(lang: Lang) {
  const root = document.documentElement;
  root.classList.add('kart-mode');

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9997;pointer-events:none';
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const kart = document.createElement('div');
  kart.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;pointer-events:none;width:44px;height:28px;margin:-14px 0 0 -22px;will-change:transform';
  kart.innerHTML = KART_SVG;

  const hud = document.createElement('div');
  hud.style.cssText =
    "position:fixed;left:16px;bottom:16px;z-index:9999;pointer-events:none;padding:10px 14px;border-radius:14px;color:#fff;background:rgba(16,16,20,0.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:600 12px/1.45 'Plus Jakarta Sans Variable',system-ui,sans-serif;font-variant-numeric:tabular-nums;box-shadow:0 10px 30px -10px rgba(0,0,0,0.5)";
  const t = lang === 'fr'
    ? { title: 'Mode karting', hint: 'Fais le tour de l’écran · Échap pour quitter', lap: 'Tour', best: 'Meilleur' }
    : { title: 'Karting mode', hint: 'Drive around the screen · Esc to quit', lap: 'Lap', best: 'Best' };

  document.body.append(canvas, kart, hud);

  // Kart state: follows the pointer with a little inertia, turned toward its motion
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  let angle = 0;
  // Laps: total angle swept around the screen centre; every full turn is a lap
  let swept = 0;
  let lastPolar: number | null = null;
  let lapStart = performance.now();
  let lapCount = 0;
  let lastLap: number | null = null;
  let bestLap: number | null = null;

  const fmt = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
  const renderHud = (now: number) => {
    hud.innerHTML =
      `<div style="font-family:'Syne Variable',Syne,sans-serif;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;font-size:13px">🏁 ${t.title}</div>` +
      `<div>${t.lap} ${lapCount + 1} · ${fmt(now - lapStart)}${lastLap !== null ? ` · ${t.lap.toLowerCase()} ${lapCount}: ${fmt(lastLap)}` : ''}</div>` +
      (bestLap !== null ? `<div style="color:#ffd166">${t.best}: ${fmt(bestLap)}</div>` : '') +
      `<div style="opacity:0.65;font-weight:500">${t.hint}</div>`;
  };

  const onMove = (e: PointerEvent) => {
    tx = e.clientX;
    ty = e.clientY;
  };

  let frame = 0;
  let last = performance.now();
  let hudAt = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Ease toward the pointer (a kart doesn't teleport)
    const nx = x + (tx - x) * Math.min(1, dt * 14);
    const ny = y + (ty - y) * Math.min(1, dt * 14);
    const vx = (nx - x) / Math.max(dt, 0.001);
    const vy = (ny - y) / Math.max(dt, 0.001);
    const speed = Math.hypot(vx, vy);
    if (speed > 40) {
      const target = Math.atan2(vy, vx);
      let d = target - angle;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      angle += d * Math.min(1, dt * 12);
    }

    // Fade the old marks, then lay the new ones under the rear wheels
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, dt * 0.9)})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'source-over';
    if (speed > 60) {
      const cos = Math.cos(angle), sin = Math.sin(angle);
      ctx.strokeStyle = `rgba(20,20,22,${Math.min(0.55, speed / 2500)})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        // Rear wheel position relative to the kart centre (-14 px back, ±10 px sideways)
        const ox = -14 * cos - side * 10 * sin;
        const oy = -14 * sin + side * 10 * cos;
        ctx.beginPath();
        ctx.moveTo(x + ox, y + oy);
        ctx.lineTo(nx + ox, ny + oy);
        ctx.stroke();
      }
    }
    x = nx;
    y = ny;
    kart.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;

    // Lap counting around the screen centre (only once the kart is out of the middle)
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    if (Math.hypot(x - cx, y - cy) > Math.min(cx, cy) * 0.35) {
      const polar = Math.atan2(y - cy, x - cx);
      if (lastPolar !== null) {
        let d = polar - lastPolar;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        swept += d;
      }
      lastPolar = polar;
      if (Math.abs(swept) >= Math.PI * 2) {
        swept = 0;
        lastLap = now - lapStart;
        bestLap = bestLap === null ? lastLap : Math.min(bestLap, lastLap);
        lapCount += 1;
        lapStart = now;
      }
    }

    if (now - hudAt > 100) {
      renderHud(now);
      hudAt = now;
    }
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') toggleKart(lang);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', onKey);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
    canvas.remove();
    kart.remove();
    hud.remove();
    root.classList.remove('kart-mode');
    stop = null;
  };
}
