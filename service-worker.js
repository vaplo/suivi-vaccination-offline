const CACHE_NAME = "flowlab-cache-v2";

// Static files used by the PWA shell. Each file is cached independently so one
// missing optional asset does not break the whole service worker installation.
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/infirmiere.html",
  "/superviseur.html",
  "/operation.html",
  "/dashboard.html",
  "/systeme.html",
  "/avis.html",
  "/styles.css",
  "/script.js",
  "/manifest.webmanifest",
  "/images/logo.png",
  "/images/enfants.png",
  "/images/grossesses.png",
  "/images/surveillancesoin.png",
  "/images/exportdesretards.png",
  "/images/suiviequitable.png",
  "/images/statistique.png",
  "/images/espacesuperviseur.png",
  "/images/espacemedical.png",
  "/images/operations.jpg",
  "/images/tableaubord2.jpg",
  "/images/audit.jpg",
  "/images/parents.jpeg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url))))
      .then(results => {
        const failedAssets = results
          .map((result, index) => ({ result, url: STATIC_ASSETS[index] }))
          .filter(entry => entry.result.status === "rejected")
          .map(entry => entry.url);

        if (failedAssets.length > 0) {
          console.warn("FlowLab PWA: assets non mis en cache", failedAssets);
        }

        return self.skipWaiting();
      })
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // Never intercept POST/PUT/PATCH/DELETE requests. FlowLab API calls to n8n must
  // keep their normal network behaviour, especially for form submissions.
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || !response.ok) return response;

        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
        return Promise.resolve();
      })))
      .then(() => self.clients.claim())
  );
});
