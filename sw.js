const CACHE_NAME = 'suji-v1-24-0';
const PRECACHE = [
  "./index.html",
  "./README.md",
  "./app.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/suji-icon.svg",
  "./manifest.webmanifest",
  "./pattern_data/pattern_01.json",
  "./pattern_data/pattern_02.json",
  "./pattern_data/pattern_03.json",
  "./pattern_data/pattern_04.json",
  "./pattern_data/pattern_05.json",
  "./pattern_data/pattern_06.json",
  "./pattern_data/pattern_07.json",
  "./pattern_data/pattern_08.json",
  "./pattern_data/pattern_09.json",
  "./pattern_data/pattern_10.json",
  "./patterns.js",
  "./resources/Image_0001.png",
  "./resources/Image_0002.png",
  "./resources/Image_0003.png",
  "./resources/Image_0004.png",
  "./resources/Image_0005.png",
  "./styles.css"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('suji-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
