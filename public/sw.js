// ShowSound service worker — v3
// Fixed: no longer serves redirected responses from cache (caused Safari PWA blank screen)
const CACHE = 'showsound-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Never cache or intercept cross-origin requests (fonts, etc.)
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        // Only return cached response if it's not a redirect
        if (cached.redirected) {
          return fetch(e.request);
        }
        return cached;
      }
      // Not in cache — fetch from network
      return fetch(e.request).then((response) => {
        // Don't cache redirects or error responses
        if (!response || response.status !== 200 || response.redirected) {
          return response;
        }
        // Cache valid same-origin responses
        const toCache = response.clone();
        caches.open(CACHE).then((c) => c.put(e.request, toCache));
        return response;
      });
    })
  );
});
