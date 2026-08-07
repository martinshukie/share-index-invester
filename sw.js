// Network-first: always tries to fetch the latest version when online, and
// only falls back to the cached copy when there's no network (offline use).
// This means updates show up automatically next time the phone is online —
// no manual cache-busting needed on future deploys.
const CACHE_NAME = 'ndis-audit-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './utils.js',
  './data.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    // cache: 'no-store' forces a real network round-trip instead of letting
    // the browser's own HTTP cache silently serve a stale response.
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
