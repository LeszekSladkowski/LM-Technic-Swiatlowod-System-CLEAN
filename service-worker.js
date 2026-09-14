const CACHE_NAME = 'lm-technic-swiatlowod-layer-test-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './01_TLO_MASTER/file_000000004d58820a9934e2922ddfe8f9.png',
  './02_MEDIA_URZADZENIA/file_00000000ae4c81f4918eaa88f349d772.png',
  './03_RAMKI_IKONY_UI/file_000000003b8c821098315f883ad0a33b.png',
  './03_RAMKI_IKONY_UI/00_MASTER_IKONA_GLOWNA_LM_TECHNIC_SWIATLOWOD_SYSTEM.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
