/* Arabic Scrabble PWA service worker — versioned cache with graceful offline fallback. */
const CACHE_VERSION = 'axegavonly-shell-v1';
const RUNTIME_CACHE = 'axegavonly-runtime-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.all(APP_SHELL.map(async url => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (error) { console.warn('[PWA] Could not pre-cache:', url, error); }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => ![CACHE_VERSION, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

const isCacheableStaticRequest = request => {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) return true;
  return ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'].includes(url.hostname);
};

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!isCacheableStaticRequest(request)) return;
  const url = new URL(request.url);

  // HTML navigation: use the freshest copy online, and the last cached copy offline.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put('./index.html', response.clone()).catch(() => {});
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Static assets and public CDN dependencies are cache-first, then refreshed in the background.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    const refresh = fetch(request).then(async response => {
      if (response && (response.ok || response.type === 'opaque')) {
        const cache = await caches.open(url.origin === self.location.origin ? CACHE_VERSION : RUNTIME_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    if (cached) { event.waitUntil(refresh); return cached; }
    const network = await refresh;
    if (network) return network;
    return Response.error();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
