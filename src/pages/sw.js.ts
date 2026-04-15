const CACHE_NAME = 'gradegoblin-v3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon-64.png',
  '/apple-touch-icon.png',
  '/pwa-192.png',
  '/pwa-512.png',
  '/app-logo.png',
  '/font/font.css',
  '/font/geist-latin-wght-normal.woff2',
  '/font/geist-mono-latin-wght-normal.woff2',
  '/font/jetbrains-mono-latin-400-normal.woff2',
  '/font/jetbrains-mono-latin-500-normal.woff2',
  '/font/jetbrains-mono-latin-600-normal.woff2',
  '/font/jetbrains-mono-latin-700-normal.woff2'
];

const serviceWorkerCode = `
const CACHE_NAME = '${CACHE_NAME}';
const STATIC_ASSETS = ${JSON.stringify(STATIC_ASSETS)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') return;

  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/font/');

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
`;

export function GET() {
  return new Response(serviceWorkerCode, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
