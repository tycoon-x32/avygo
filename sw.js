const CACHE_NAME = 'avygo-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './flights.html',
  './hotels.html',
  './private.html',
  './cargo.html',
  './transfers.html',
  './lounge.html',
  './insurance.html',
  './ai.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './avygo logo1.jpg',
  './avygo logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
