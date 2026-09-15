const CACHE_NAME = 'lm-technic-swiatlowod-settings-v5-fit-xy';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './04_MASTER_REFERENCJA/01_MASTER_MENU_GLOWNE_PANEL_STEROWANIA.png',
  './04_MASTER_REFERENCJA/file_00000000b26481f49d957400d3301b15.png',
  './01_TLO_MASTER/file_00000000c2d48243933d59ddcac018bb.png',
  './02_MEDIA_URZADZENIA/file_00000000d4d882439386825effb50188.png',
  './03_RAMKI_IKONY_UI/file_000000008024821096fcb2a1203368d6.png',
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

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
