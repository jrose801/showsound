// ShowSound service worker.
//
// Deliberately has NO version number to bump. Earlier versions used a
// cache-first strategy keyed to a version string, which meant every code
// change required hand-editing this file — and a missed edit silently
// shipped nothing. This version updates itself.
//
// Navigation: try the network first (so a fresh deploy lands immediately),
// fall back to cache if the network is slow or gone. That keeps iteration
// instant at home and keeps the app launching at a venue with no signal.
//
// REDIRECT GUARD: vercel.json sets "cleanUrls": true, so Vercel 308-redirects
// /index.html -> /. Safari refuses any response a service worker returns that
// came from a redirect ("response served by service worker has redirection")
// and the PWA fails to launch. Every network response below is rebuilt to
// drop that flag, and the shell is cached under './' so a redirected
// response never enters the cache.

const CACHE = 'showsound';
const SHELL = './';
const NET_TIMEOUT_MS = 3000;

const ASSETS = [
  './',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // allSettled so one missing asset can't fail the whole install
      .then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Rebuild a response so `redirected` is false. Safari rejects redirected
// responses served from a service worker.
function stripRedirect(res) {
  if (!res || !res.redirected) return Promise.resolve(res);
  return res.blob().then((body) => new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  }));
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('net timeout')), ms));
}

// Network first, cache as the safety net.
function navigate(req) {
  const fromNetwork = fetch(req)
    .then(stripRedirect)
    .then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(SHELL, copy)).catch(() => {});
      }
      return res;
    });

  return Promise.race([fromNetwork, timeout(NET_TIMEOUT_MS)])
    .catch(() => caches.match(SHELL))
    .then((res) => res || caches.match(SHELL))
    .then((res) => res || fetch(req).then(stripRedirect));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;

  if (req.mode === 'navigate') {
    e.respondWith(navigate(req));
    return;
  }

  // Assets: serve from cache immediately, refresh in the background so the
  // next launch has the newer copy.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});