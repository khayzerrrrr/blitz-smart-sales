const CACHE_NAME = "blitz-crm-v2"
const STATIC_CACHE = "blitz-crm-static-v2"

const PRECACHE_URLS = [
  "/",
  "/login",
  "/manifest.json",
  "/icon-apps.png",
  "/logo-dashboard.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== STATIC_CACHE && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") return

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/"))
        )
    )
    return
  }

  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    /\.(js|css|woff2?|ttf|eot)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request).then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
          return response
        })
        return cached || fetched
      })
    )
    return
  }

  if (request.destination === "image" || /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request).then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
          return response
        })
        return cached || fetched
      })
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})
