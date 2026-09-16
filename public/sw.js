// CO-ENGINEER Service Worker for Offline Roadmap & Asset Caching
const CACHE_NAME = 'coengineer-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache failed for some assets, continuing:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or Firebase/WebSocket/Chrome-Extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol.startsWith('chrome-extension')) return;
  if (url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('firebaseio.com')) {
    // Let Firebase handle its own network logic/offline cache
    return;
  }

  // Handle navigation (HTML page requests)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html') || await cache.match('/');
        if (cachedIndex) return cachedIndex;
        return new Response('Offline - Roadmap available from cached storage', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // Network-First with Cache Fallback for scripts, styles, fonts, and images
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network failed and we have a cached response, use it
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
