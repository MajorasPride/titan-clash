/* Titan Clash offline helper (service worker), added in v8.2.1.
   Only runs when the game is opened from the website (GitHub Pages), never when
   titan-clash.html is double-clicked.
   - Game files: always try the internet first so new versions show up right away,
     and fall back to the saved copy when offline.
   - Fonts and three.js from other sites: saved the first time, then used offline.
   Bump CACHE when the list of core files changes. */
const CACHE = 'titan-clash-v8.4.4';
const CORE = [
  './titan-clash.html',
  './three.min.js',
  './models/kenney-models.js',
  './fonts/bangers-font.js',
  './fonts/ui-fonts.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('titan-clash-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameSite = new URL(req.url).origin === location.origin;

  if (sameSite) {
    // Network first: updates arrive right away, saved copy when offline.
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
  } else {
    // Other sites (Google Fonts, three.js CDN): saved copy first, then the internet.
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
