/*
 * "Red flag": the game of the offline page (public/offline.html, served by public/sw.js).
 * A kart seen from above on a track that scrolls by, faster and faster; dodge the cones.
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
        start: 'Tap or press Space', crash: 'Into the cones!', again: 'Tap or Space to go again', record: 'New record!', aria: 'Karting mini-game', page: 'Red flag · Luca Leone',
      }
    : {
        lang: 'fr', flag: 'Drapeau rouge', title: 'Course neutralisée', lead: 'Pas de connexion pour le moment. En attendant le retour du réseau, un petit tour de piste ? Évitez les cônes.',
        back: 'La connexion est revenue.', resume: 'Reprendre la course', best: 'Record', hint: '← → ou glisser le doigt · Espace ou toucher pour démarrer',
        start: 'Touchez ou appuyez sur Espace', crash: 'Dans les cônes !', again: 'Touchez ou Espace pour repartir', record: 'Nouveau record !', aria: 'Mini-jeu de karting', page: 'Drapeau rouge · Luca Leone',
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

  var ROAD_L = 40, ROAD_R = W - 40; // asphalt between the kerbs
  var KART_W = 30, KART_H = 48, KART_Y = H - 90;
  var BEST_KEY = 'offline-kart-best';

  var readBest = function () { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { return 0; } };
  var saveBest = function (v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) { /* private mode */ } };
  var best = readBest();
  var fmt = function (m) { return Math.floor(m).toLocaleString(T.lang === 'fr' ? 'fr-CH' : 'en-GB') + ' m'; };
  $('best').textContent = best ? fmt(best) : '–';

  var state = 'idle'; // idle → racing → crashed
  var x, speed, distance, cones, scroll, spawnIn, steer, target, newRecord;

  function reset() {
    x = W / 2; target = null; steer = 0;
    speed = 220; distance = 0; cones = []; scroll = 0; spawnIn = 0.6; newRecord = false;
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
    speed = Math.min(620, speed + 9 * dt); // a little faster every second
    distance += speed * dt * 0.1; // 10 px = 1 m
    scroll = (scroll + speed * dt) % 40;

    // Steering: keys, or toward the finger / mouse
    var dir = (keys.arrowleft || keys.a ? -1 : 0) + (keys.arrowright || keys.d ? 1 : 0);
    if (dir) target = null;
    if (target !== null) dir = Math.max(-1, Math.min(1, (target - x) / 40));
    steer += (dir - steer) * Math.min(1, dt * 10);
    x = Math.max(ROAD_L + KART_W / 2 + 4, Math.min(ROAD_R - KART_W / 2 - 4, x + steer * 360 * dt));

    // Cones, in small groups; never a full wall
    spawnIn -= dt;
    if (spawnIn <= 0) {
      var lanes = [0, 1, 2, 3, 4];
      var gap = Math.floor(Math.random() * 5);
      var count = 1 + Math.floor(Math.random() * Math.min(3, 1 + distance / 400));
      for (var i = 0; i < count; i++) {
        var lane = lanes[Math.floor(Math.random() * lanes.length)];
        if (lane === gap) continue;
        lanes.splice(lanes.indexOf(lane), 1);
        cones.push({ x: ROAD_L + 22 + lane * ((ROAD_R - ROAD_L - 44) / 4), y: -30 });
      }
      spawnIn = Math.max(0.45, 1.1 - distance / 2500);
    }
    for (var j = cones.length - 1; j >= 0; j--) {
      var c = cones[j];
      c.y += speed * dt;
      if (c.y > H + 30) { cones.splice(j, 1); continue; }
      if (Math.abs(c.x - x) < KART_W / 2 + 9 && Math.abs(c.y - KART_Y) < KART_H / 2 + 8) crash();
    }
    $('distance').textContent = fmt(distance);
  }

  function crash() {
    state = 'crashed';
    if (distance > best) { best = Math.floor(distance); saveBest(best); newRecord = true; $('best').textContent = fmt(best); }
  }

  function drawTrack() {
    ctx.fillStyle = '#2c2c31';
    ctx.fillRect(0, 0, W, H);
    // Kerbs: red and white blocks scrolling down
    for (var y = -40 + scroll; y < H; y += 40) {
      for (var side = 0; side < 2; side++) {
        var kx = side ? ROAD_R : ROAD_L - 14;
        ctx.fillStyle = '#e10600';
        ctx.fillRect(kx, y, 14, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(kx, y + 20, 14, 20);
      }
    }
    // Grass beyond the kerbs
    ctx.fillStyle = '#2f6b3a';
    ctx.fillRect(0, 0, ROAD_L - 14, H);
    ctx.fillRect(ROAD_R + 14, 0, W - ROAD_R - 14, H);
    // Centre line
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (var yy = -40 + scroll; yy < H; yy += 40) ctx.fillRect(W / 2 - 2, yy, 4, 20);
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
    ctx.rotate(steer * 0.18);
    ctx.fillStyle = '#111';
    ctx.fillRect(-KART_W / 2 - 4, -KART_H / 2 + 4, 8, 12); // front tyres
    ctx.fillRect(KART_W / 2 - 4, -KART_H / 2 + 4, 8, 12);
    ctx.fillRect(-KART_W / 2 - 5, KART_H / 2 - 16, 10, 14); // rear tyres
    ctx.fillRect(KART_W / 2 - 5, KART_H / 2 - 16, 10, 14);
    ctx.fillStyle = '#c50e36';
    ctx.beginPath();
    ctx.moveTo(-KART_W / 2 + 4, KART_H / 2 - 4);
    ctx.lineTo(KART_W / 2 - 4, KART_H / 2 - 4);
    ctx.lineTo(KART_W / 2 - 6, -KART_H / 2 + 6);
    ctx.lineTo(0, -KART_H / 2);
    ctx.lineTo(-KART_W / 2 + 6, -KART_H / 2 + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 4, 7, 0, Math.PI * 2); ctx.fill(); // helmet
    ctx.fillStyle = '#111';
    ctx.fillRect(-5, -1, 10, 4); // visor
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
