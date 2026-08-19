const CACHE_NAME = "miraj-of-icarus-pwa-v2";
const PRECACHE_URLS = [
  "/pt/offline",
  "/en/offline",
  "/es/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/media/branding/miraj-mj-mark-jade.png",
  "/fonts/marcellus-regular.ttf",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    const locale = new URL(request.url).pathname.split("/")[1];
    const offlineUrl = ["pt", "en", "es"].includes(locale) ? `/${locale}/offline` : "/pt/offline";
    event.respondWith(fetch(request).catch(() => caches.match(offlineUrl)));
    return;
  }

  const url = new URL(request.url);
  const isCacheableAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/fonts/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/media/"));

  if (!isCacheableAsset) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
