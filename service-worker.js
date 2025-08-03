const CACHE_NAME = "flowlab-cache-v1";

// 📦 Fichiers à mettre en cache (pages + assets + images)
const urlsToCache = [
  "/",
  "/index.html",
  "/infirmiere.html",
  "/superviseur.html",
  "/styles.css",
  "/script.js",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/images/logo.png",
  "/images/enfants.png",
  "/images/grossesses.png",
  "/images/surveillancesoin.png",
  "/images/exportdesretards.png",
  "/images/suiviequitable.png",
  "/images/statistique.png",
  "/images/espacesuperviseur.png"
];

// 🔃 Installation : cache tous les fichiers listés
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ✅ Interception des requêtes
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

// 🧹 Nettoyage des anciens caches
self.addEventListener("activate", event => {
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
    }).then(() => self.clients.claim())
  );
});

