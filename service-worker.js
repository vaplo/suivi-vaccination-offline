const CACHE_NAME = 'vsmart-monitoring-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/infirmiere.html',
  '/superviseur.html',
  '/styles.css',
  '/script.js',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// 🔃 Installation du SW
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// ✅ Interception des requêtes
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match("/index.html");
    })
  );
});

// 🧹 Mise à jour du cache
self.addEventListener("activate", function (event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
