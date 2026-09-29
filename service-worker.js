const CACHE_NAME = 'pumpkin-hunt-offline-v3-20260924';
const APP_SHELL = [
  './',
  './index.html',
  './pumpkin.html',
  './collection.html',
  './offline-test.html',
  './css/style.css',
  './js/config.js',
  './js/storage.js',
  './js/home.js',
  './js/collection.js',
  './js/pumpkin.js',
  './js/pumpkin3d.js',
  './js/offline.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (request.mode === 'navigate') {
      const cachedPage = await cache.match(request, { ignoreSearch: true });
      if (cachedPage) return cachedPage;

      try {
        const response = await fetch(request);
        if (response && response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        return (await cache.match('./index.html')) || Response.error();
      }
    }

    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      return Response.error();
    }
  })());
});

self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'CHECK_OFFLINE_CACHE') return;

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let cached = 0;
    for (const path of APP_SHELL) {
      const absoluteUrl = new URL(path, self.registration.scope).toString();
      if (await cache.match(absoluteUrl, { ignoreSearch: true })) cached += 1;
    }
    const payload = { complete: cached === APP_SHELL.length, cached, total: APP_SHELL.length };
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
  })());
});
