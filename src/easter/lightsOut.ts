/**
 * Easter egg (⌘K → "lights out"): a Formula 1 start to win. Five pairs of red lights come
 * on one by one, hold for a random moment and go out; the visitor clicks (or presses
 * Space) as soon as they do. Result: the reaction time, a verdict and the best start so far
 * (kept in this browser). Too early is a jump start. A real start can go on the podium
 * (/podium, server/podium.ts) under a pseudo. Then: race again, the podium, or the
 * projects. Plain DOM, loaded on demand. Escape closes.
 */

type Lang = 'fr' | 'en';

const LIGHT_EVERY_MS = 800; // F1: one pair a second; a little quicker here
const HOLD_MIN_MS = 400;
const HOLD_MAX_MS = 2600;
const TOO_SLOW_MS = 4000;
const BEST_KEY = 'lights-out-best';
const NAME_KEY = 'lights-out-name';

const COPY = {
  fr: {
    ready: 'Clique ou appuie sur Espace dès que les feux s’éteignent.',
    wait: 'Attends l’extinction…',
    jump: 'Faux départ !',
    jumpNote: 'Tu es parti avant l’extinction des feux.',
    slow: 'Encore au stand ?',
    slowNote: 'Plus de 4 secondes : le peloton est déjà loin.',
    best: 'Meilleur départ',
    colon: ' : ',
    record: 'Nouveau record !',
    again: 'Rejouer',
    projects: 'Voir les projets',
    podium: 'Voir le podium',
    pseudo: 'Ton pseudo',
    submit: 'Inscrire au podium',
    rank: (r: number) => (r === 1 ? 'Tu es 1er au podium !' : `Tu es ${r}e au podium.`),
    badName: 'Pseudo refusé : 2 à 16 lettres ou chiffres, sans lien ni insulte.',
    badTime: 'Ce temps ne peut pas aller au podium (moins de 0,1 s, c’est de l’anticipation).',
    offline: 'Le podium est indisponible pour le moment.',
    verdict: (ms: number) =>
      ms < 200 ? 'Réflexes de pilote de F1.' : ms < 280 ? 'Excellent départ.' : ms < 400 ? 'Bon départ.' : 'Départ un peu lent.',
    format: (ms: number) => `${(ms / 1000).toFixed(3).replace('.', ',')} s`,
  },
  en: {
    ready: 'Click or press Space as soon as the lights go out.',
    wait: 'Wait for lights out…',
    jump: 'Jump start!',
    jumpNote: 'You went before the lights went out.',
    slow: 'Still in the pits?',
    slowNote: 'Over 4 seconds: the pack is long gone.',
    best: 'Best start',
    colon: ': ',
    record: 'New record!',
    again: 'Race again',
    projects: 'See the projects',
    podium: 'See the podium',
    pseudo: 'Your nickname',
    submit: 'Put me on the podium',
    rank: (r: number) => (r === 1 ? 'You’re first on the podium!' : `You’re number ${r} on the podium.`),
    badName: 'Nickname refused: 2 to 16 letters or digits, no link, no insult.',
    badTime: 'This time can’t go on the podium (under 0.1 s is anticipation).',
    offline: 'The podium is unavailable right now.',
    verdict: (ms: number) =>
      ms < 200 ? 'Formula 1 reflexes.' : ms < 280 ? 'Excellent start.' : ms < 400 ? 'Good start.' : 'A slow getaway.',
    format: (ms: number) => `${(ms / 1000).toFixed(3)} s`,
  },
};

const readBest = () => {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
};
const saveBest = (ms: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(Math.round(ms)));
  } catch {
    /* private mode: the record just isn't kept */
  }
};

export function lightsOut(lang: Lang, go: { goToProjects: () => void; goToPodium: () => void }) {
  const t = COPY[lang];

  const overlay = document.createElement('div');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Lights out');
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:24px;text-align:center;' +
    'background:rgba(6,6,8,0.86);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity 200ms ease-out;user-select:none;-webkit-user-select:none;touch-action:manipulation';

  const gantry = document.createElement('div');
  gantry.style.cssText = 'display:flex;gap:clamp(8px,2.2vw,18px)';
  const pairs: HTMLElement[][] = [];
  for (let i = 0; i < 5; i++) {
    const pod = document.createElement('div');
    pod.style.cssText =
      'display:flex;flex-direction:column;gap:clamp(6px,1.4vw,12px);padding:clamp(8px,1.6vw,14px);border-radius:clamp(10px,2vw,18px);background:#111114;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06)';
    const pair: HTMLElement[] = [];
    for (let j = 0; j < 2; j++) {
      const lamp = document.createElement('div');
      lamp.style.cssText = 'width:clamp(30px,8vw,64px);height:clamp(30px,8vw,64px);border-radius:50%';
      pod.appendChild(lamp);
      pair.push(lamp);
    }
    pairs.push(pair);
    gantry.appendChild(pod);
  }
  const light = (lamp: HTMLElement, on: boolean) => {
    lamp.style.background = on ? 'radial-gradient(circle at 40% 35%, #ff6b6b, #e10600 55%, #8a0400)' : '#2a1013';
    lamp.style.boxShadow = on ? '0 0 24px 6px rgba(225,6,0,0.55)' : 'none';
  };

  const font = "font-family:'Plus Jakarta Sans Variable',system-ui,sans-serif;margin:0";
  const title = document.createElement('p');
  title.style.cssText = `${font};font-weight:800;font-size:clamp(28px,6vw,56px);letter-spacing:-0.02em;color:#fff;font-variant-numeric:tabular-nums;min-height:1.1em`;
  const note = document.createElement('p');
  note.style.cssText = `${font};font-weight:500;font-size:clamp(14px,2vw,17px);color:rgba(255,255,255,0.75);max-width:34em;min-height:1.45em`;
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;min-height:48px';
  const button = (label: string, primary: boolean, onClick: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText =
      `font-family:'Syne Variable',Syne,sans-serif;font-weight:700;font-size:15px;padding:13px 24px;border-radius:999px;border:0;cursor:pointer;` +
      (primary ? 'background:#e10600;color:#fff' : 'background:rgba(255,255,255,0.12);color:#fff');
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  };

  overlay.append(gantry, title, note, actions);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => (overlay.style.opacity = '1'));

  // One race: idle → lights coming on (a press here is a jump start) → out (timing) → result
  let phase: 'lights' | 'out' | 'result' = 'lights';
  let outAt = 0;
  let timers: number[] = [];
  const clear = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const endButtons = () => [button(t.again, true, race), button(t.podium, false, () => close('podium')), button(t.projects, false, () => close('projects'))];

  const showResult = (heading: string, text: string, ms?: number) => {
    phase = 'result';
    clear();
    title.textContent = heading;
    note.textContent = text;
    actions.replaceChildren(...(ms === undefined ? [] : [podiumForm(ms)]), ...endButtons());
    (actions.querySelector('input, button') as HTMLElement | null)?.focus();
  };

  // A real start can go on the podium under a pseudo (remembered for next time)
  const podiumForm = (ms: number) => {
    const form = document.createElement('form');
    form.style.cssText = 'display:flex;gap:8px;flex-basis:100%;justify-content:center;margin-bottom:6px';
    const input = document.createElement('input');
    input.maxLength = 16;
    input.placeholder = t.pseudo;
    input.setAttribute('aria-label', t.pseudo);
    try {
      input.value = localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      /* storage blocked */
    }
    input.style.cssText =
      "font-family:'Plus Jakarta Sans Variable',system-ui,sans-serif;font-size:15px;padding:12px 18px;border-radius:999px;border:0;outline:none;width:min(220px,50vw);background:rgba(255,255,255,0.12);color:#fff";
    const send = button(t.submit, true, () => form.requestSubmit());
    send.type = 'submit';
    form.append(input, send);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      send.disabled = true;
      try {
        const r = await fetch('/api/podium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: input.value, ms: Math.round(ms) }),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.rank) {
          try {
            localStorage.setItem(NAME_KEY, input.value.trim());
          } catch {
            /* storage blocked */
          }
          note.textContent = t.rank(data.rank);
          actions.replaceChildren(...endButtons());
          return;
        }
        note.textContent = data.error === 'invalid_name' ? t.badName : data.error === 'invalid_time' ? t.badTime : t.offline;
      } catch {
        note.textContent = t.offline;
      }
      send.disabled = false;
    });
    return form;
  };

  function race() {
    clear();
    phase = 'lights';
    pairs.flat().forEach((l) => light(l, false));
    const best = readBest();
    title.textContent = '';
    note.textContent = best ? `${t.ready} ${t.best}${t.colon}${t.format(best)}` : t.ready;
    actions.replaceChildren();
    for (let i = 0; i < 5; i++) {
      timers.push(window.setTimeout(() => pairs[i].forEach((l) => light(l, true)), (i + 1) * LIGHT_EVERY_MS));
    }
    const hold = HOLD_MIN_MS + Math.random() * (HOLD_MAX_MS - HOLD_MIN_MS);
    timers.push(window.setTimeout(() => {
      pairs.flat().forEach((l) => light(l, false));
      phase = 'out';
      outAt = performance.now();
      timers.push(window.setTimeout(() => phase === 'out' && showResult(t.slow, t.slowNote), TOO_SLOW_MS));
    }, 5 * LIGHT_EVERY_MS + hold));
  }

  // The reaction: click/tap anywhere, or Space
  const react = () => {
    if (phase === 'lights') {
      showResult(t.jump, t.jumpNote);
    } else if (phase === 'out') {
      const ms = performance.now() - outAt;
      const best = readBest();
      const record = best === null || ms < best;
      if (record) saveBest(ms);
      const bestNow = record ? ms : best!;
      showResult(t.format(ms), `${t.verdict(ms)} ${record ? t.record : `${t.best}${t.colon}${t.format(bestNow)}`}`, ms);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close(false);
    else if (e.key === ' ' && phase !== 'result' && !(e.target as HTMLElement).closest?.('input')) {
      e.preventDefault();
      react();
    }
  };
  // pointerdown, not click: a click only fires on release, which would add to the reaction time
  overlay.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('button, input, form')) return;
    react();
  });
  window.addEventListener('keydown', onKey);

  let closed = false;
  function close(then: 'projects' | 'podium' | false) {
    if (closed) return;
    closed = true;
    clear();
    window.removeEventListener('keydown', onKey);
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 220);
    if (then === 'projects') go.goToProjects();
    if (then === 'podium') go.goToPodium();
  }

  race();
}
