/*
 * Service worker, with one job: when a page can't load because there's no connection, show
 * the offline page (public/offline.html, "Red flag", with its little game and its car) instead of the
 * browser's error. Nothing else is cached here, so the site itself is always fresh from the
 * server (no stale version after a deploy). Registered in src/main.tsx (production only).
 * Change VERSION when one of FILES changes.
 */
const VERSION = 'offline-v3';
const OFFLINE_URL = '/offline';
const FILES = [OFFLINE_URL, '/offline-game.js', '/images/f1-car.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // cache: 'reload' skips the browser's HTTP cache: always the files on the server
      .then((cache) => cache.addAll(FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Pages: the network as usual; the offline page only if the network fails
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // The offline page's own script: network first, kept copy when offline
  const url = new URL(request.url);
  if (url.origin === location.origin && FILES.includes(url.pathname)) {
    event.respondWith(fetch(request).catch(() => caches.match(url.pathname)));
  }
});
