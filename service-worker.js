const CACHE_NAME = "flowlab-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/infirmiere.html",
  "/superviseur.html",
  "/styles.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

// 🔃 Installation : mise en cache
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ✅ Interception des requêtes
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match("/index.html"))
  );
});

// 🧹 Nettoyage anciens caches
self.addEventListener("activate", function (event) {
  const keep = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (!keep.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
