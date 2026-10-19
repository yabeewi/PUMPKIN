const CACHE_NAME = 'pumpkin-hunt-offline-v5-0-en-30';
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
    await cache.addAll(APP_SHELL.map(path => new Request(path, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();

    // Force one clean navigation after the new worker becomes active so updated assets are used.
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map(async (client) => {
      try {
        const url = new URL(client.url);
        if (url.origin === self.location.origin && !url.searchParams.has('__swv5')) {
          url.searchParams.set('__swv5', '1');
          await client.navigate(url.toString());
        }
      } catch (_) {}
    }));
  })());
});

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isPage = request.mode === 'navigate';
    const isAsset = ['script', 'style'].includes(request.destination);

    if (isPage || isAsset) {
      try {
        return await networkFirst(request, cache);
      } catch (error) {
        if (isPage) return (await cache.match('./index.html')) || Response.error();
        return Response.error();
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
  if (!event.data) return;

  if (event.data.type === 'CHECK_OFFLINE_CACHE') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      let cached = 0;
      for (const path of APP_SHELL) {
        const absoluteUrl = new URL(path, self.registration.scope).toString();
        if (await cache.match(absoluteUrl, { ignoreSearch: true })) cached += 1;
      }
      const payload = {
        complete: cached === APP_SHELL.length,
        cached,
        total: APP_SHELL.length,
        version: CACHE_NAME
      };
      if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
    })());
  }
});
