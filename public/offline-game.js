/*
 * "Red flag": the game of the offline page (public/offline.html, served by public/sw.js).
 * A Formula 1 car seen from above (public/images/f1-car.svg) on a track that scrolls by,
 * faster and faster; dodge the cones. Rows of cones leave one gap, which wanders across the
 * track: always reachable, never for long in the same place.
 * Arrow keys (or A/D), a finger or the mouse steer; Space or a tap starts. Best distance
 * kept in this browser. When the connection comes back, a banner offers to resume.
 * Plain script, no dependency: there is no network.
 */
(function () {
  var en = location.pathname === '/en' || location.pathname.indexOf('/en/') === 0;
  var T = en
    ? {
        lang: 'en', flag: 'Red flag', title: 'Race neutralised', lead: 'No connection right now. While the network comes back, fancy a lap? Dodge the cones.',
        back: 'The connection is back.', resume: 'Resume the race', best: 'Best', hint: '← → or drag your finger · Space or tap to start',
        start: 'Tap or press Space', crash: 'Into the cones!', again: 'Tap or Space to go again', record: 'New record!', aria: 'Racing mini-game', page: 'Red flag · Luca Leone',
      }
    : {
        lang: 'fr', flag: 'Drapeau rouge', title: 'Course neutralisée', lead: 'Pas de connexion pour le moment. En attendant le retour du réseau, un petit tour de piste ? Évitez les cônes.',
        back: 'La connexion est revenue.', resume: 'Reprendre la course', best: 'Record', hint: '← → ou glisser le doigt · Espace ou toucher pour démarrer',
        start: 'Touchez ou appuyez sur Espace', crash: 'Dans les cônes !', again: 'Touchez ou Espace pour repartir', record: 'Nouveau record !', aria: 'Mini-jeu de course', page: 'Drapeau rouge · Luca Leone',
      };
  var $ = function (id) { return document.getElementById(id); };
  document.documentElement.lang = T.lang;
  document.title = T.page;
  $('flag').textContent = T.flag;
  $('title').firstChild.textContent = T.title;
  $('lead').textContent = T.lead;
  $('backText').textContent = T.back;
  $('resume').textContent = T.resume;
  $('bestLabel').textContent = T.best;
  $('hint').textContent = T.hint;

  // Back online: offer to reload the page the visitor wanted
  var back = $('back');
  var showBack = function () { back.classList.toggle('show', navigator.onLine); };
  window.addEventListener('online', showBack);
  window.addEventListener('offline', showBack);
  showBack();
  $('resume').addEventListener('click', function () { location.reload(); });

  var canvas = $('track');
  canvas.setAttribute('aria-label', T.aria);
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  var ROAD_L = 58, ROAD_R = W - 58; // asphalt between the kerbs (grass wide enough to show its mown stripes)
  var KART_W = 27, KART_H = 76, KART_Y = H - 96; // the car's size on the track (its drawing is 200 × 560)
  var HIT_W = 22, HIT_H = 62; // a little forgiving: wheels brushing a cone don't count

  // The car (kept by the service worker); until it loads, a simple shape stands in
  var car = new Image();
  car.src = '/images/f1-car.svg';

  // Same materials as the 404 scene (src/components/NotFound.tsx): mown grass in diagonal
  // stripes, asphalt, a fine dark grain over both, kerbs, white edge lines, rubbered line
  var GRASS = '#3f7d3a', GRASS_MOWN = '#478a41', ASPHALT = '#2b2b30';
  var KERB_RED = '#d7141a', KERB_WHITE = '#f2f2f2', KERB = 16;

  // Grain: dark specks with varying opacity, tiled (like the 404's fractal noise)
  var grain = document.createElement('canvas');
  grain.width = 160; grain.height = 160;
  (function () {
    var g = grain.getContext('2d');
    var data = g.createImageData(160, 160);
    for (var i = 0; i < data.data.length; i += 4) {
      data.data[i + 3] = Math.random() < 0.5 ? Math.round(Math.random() * 34) : 0;
    }
    g.putImageData(data, 0, 0);
  })();
  var grainPattern = ctx.createPattern(grain, 'repeat');

  // Light over the whole scene, as on the 404: brighter top-left, darker bottom-right
  var light = ctx.createRadialGradient(W * 0.25, H * 0.15, 0, W * 0.25, H * 0.15, Math.hypot(W, H) * 0.95);
  light.addColorStop(0, 'rgba(255,255,255,0.12)');
  light.addColorStop(1, 'rgba(0,0,0,0.2)');
  var BEST_KEY = 'offline-kart-best';

  var readBest = function () { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { return 0; } };
  var saveBest = function (v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* private mode */ } };
  var best = readBest();
  var fmt = function (m) { return Math.floor(m).toLocaleString(T.lang === 'fr' ? 'fr-CH' : 'en-GB') + ' m'; };
  $('best').textContent = best ? fmt(best) : '–';

  var state = 'idle'; // idle → racing → crashed
  var x, speed, distance, cones, travel, spawnIn, steer, target, newRecord, gap;

  function reset() {
    x = W / 2; target = null; steer = 0;
    speed = 320; distance = 0; cones = []; travel = 0; spawnIn = 0.5; newRecord = false; gap = 2;
  }
  reset();

  function start() {
    if (state === 'racing') return;
    reset();
    state = 'racing';
  }

  // Controls
  var keys = {};
  window.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); start(); }
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  var pointerX = function (e) { var r = canvas.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
  canvas.addEventListener('pointerdown', function (e) { start(); target = pointerX(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') target = pointerX(e); });
  canvas.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') target = null; });

  function update(dt) {
    if (state !== 'racing') return;
    speed = Math.min(920, speed + 16 * dt); // faster every second
    distance += speed * dt * 0.1; // 10 px = 1 m
    travel += speed * dt; // px the ground has moved: grass, grain and kerbs all follow it

    // Steering: keys, or toward the finger / mouse
    var dir = (keys.arrowleft || keys.a ? -1 : 0) + (keys.arrowright || keys.d ? 1 : 0);
    if (dir) target = null;
    if (target !== null) dir = Math.max(-1, Math.min(1, (target - x) / 40));
    steer += (dir - steer) * Math.min(1, dt * 10);
    x = Math.max(ROAD_L + KART_W / 2 + 4, Math.min(ROAD_R - KART_W / 2 - 4, x + steer * 400 * dt));

    // Rows of cones with one gap; the gap moves one or two lanes from row to row (reachable
    // in time even at full speed), and rows get fuller and closer as the distance grows
    spawnIn -= dt;
    if (spawnIn <= 0) {
      var shift = Math.random() < 0.5 ? 1 : 2;
      gap = Math.max(0, Math.min(4, gap + (Math.random() < 0.5 ? -shift : shift)));
      var full = Math.random() < Math.min(0.85, 0.25 + distance / 1500); // every lane but the gap
      for (var lane = 0; lane < 5; lane++) {
        if (lane === gap) continue;
        if (!full && Math.random() < 0.45) continue;
        cones.push({ x: ROAD_L + 30 + lane * ((ROAD_R - ROAD_L - 60) / 4), y: -30 });
      }
      spawnIn = Math.max(0.36, 0.85 - distance / 3000);
    }
    for (var j = cones.length - 1; j >= 0; j--) {
      var c = cones[j];
      c.y += speed * dt;
      if (c.y > H + 30) { cones.splice(j, 1); continue; }
      if (Math.abs(c.x - x) < HIT_W / 2 + 8 && Math.abs(c.y - KART_Y) < HIT_H / 2 + 8) crash();
    }
    $('distance').textContent = fmt(distance);
  }

  function crash() {
    state = 'crashed';
    if (distance > best) { best = Math.floor(distance); saveBest(best); newRecord = true; $('best').textContent = fmt(best); }
  }

  function drawTrack() {
    // Each texture shifts by the distance travelled, modulo its own period: no jump when it
    // wraps, and the ground moves exactly as fast as the cones
    var STRIPE_PERIOD = 90 / Math.sin((35 * Math.PI) / 180); // vertical repeat of the mown stripes

    // Grass with mown stripes (90 px apart, rotated like the 404's pattern)
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2 + (travel % STRIPE_PERIOD));
    ctx.rotate((-35 * Math.PI) / 180);
    ctx.fillStyle = GRASS_MOWN;
    for (var sx = -H * 1.5; sx < H * 1.5; sx += 90) ctx.fillRect(sx, -H * 1.5, 45, H * 3);
    ctx.restore();

    // Asphalt, its white edge lines, the rubbered racing line
    ctx.fillStyle = KERB_WHITE;
    ctx.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);
    ctx.fillStyle = ASPHALT;
    ctx.fillRect(ROAD_L + 4, 0, ROAD_R - ROAD_L - 8, H);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(W / 2 - 40, 0, 80, H);

    // Grain over grass and asphalt
    ctx.save();
    ctx.translate(0, (travel % 160) - 160);
    ctx.fillStyle = grainPattern;
    ctx.fillRect(0, 0, W, H + 160);
    ctx.restore();

    // Kerbs: 16 px red and white blocks, outside the white lines
    for (var k = -KERB * 2 + (travel % (KERB * 2)); k < H; k += KERB * 2) {
      for (var side = 0; side < 2; side++) {
        var kx = side ? ROAD_R : ROAD_L - 14;
        ctx.fillStyle = KERB_RED;
        ctx.fillRect(kx, k, 14, KERB);
        ctx.fillStyle = KERB_WHITE;
        ctx.fillRect(kx, k + KERB, 14, KERB);
      }
    }
  }

  function drawCone(c) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(c.x + 3, c.y + 12, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a00';
    ctx.beginPath(); ctx.moveTo(c.x, c.y - 14); ctx.lineTo(c.x + 10, c.y + 11); ctx.lineTo(c.x - 10, c.y + 11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(c.x - 6, c.y - 1, 12, 4);
  }

  function drawKart() {
    ctx.save();
    ctx.translate(x, KART_Y);
    ctx.rotate(steer * 0.14);
    if (car.complete && car.naturalWidth) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 6;
      ctx.drawImage(car, -KART_W / 2, -KART_H / 2, KART_W, KART_H);
    } else {
      ctx.fillStyle = '#c50e36';
      ctx.fillRect(-KART_W / 4, -KART_H / 2, KART_W / 2, KART_H);
    }
    ctx.restore();
  }

  function banner(text, sub) {
    ctx.fillStyle = 'rgba(10,10,12,0.72)';
    ctx.fillRect(0, H / 2 - 56, W, 112);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '800 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(text, W / 2, H / 2 - 6);
    ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(sub, W / 2, H / 2 + 26);
  }

  function draw() {
    drawTrack();
    cones.forEach(drawCone);
    drawKart();
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, W, H);
    if (state === 'idle') banner('🏁', T.start);
    if (state === 'crashed') banner(newRecord ? T.record : T.crash, fmt(distance) + ' · ' + T.again);
  }

  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
