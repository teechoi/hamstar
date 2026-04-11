// Hamstar Service Worker
// Caches the app shell for offline support and enables Android PWA install prompt.

const CACHE_NAME = 'hamstar-v1'

// App shell — pages and assets to cache on install
const SHELL = [
  '/',
  '/arena',
  '/manifest.json',
  '/images/app-icon-192.png',
  '/images/app-icon-512.png',
]

// ─── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch: network-first for API/Supabase, cache-first for shell ─────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Always bypass SW for: API routes, admin, auth, Supabase, Helius, external
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.hostname !== self.location.hostname
  ) {
    return // let the browser handle normally
  }

  // Navigation requests (page loads): network-first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache a fresh copy of navigated pages
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/arena')))
    )
    return
  }

  // Static assets: cache-first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        // Only cache same-origin successful responses
        if (response.ok && url.hostname === self.location.hostname) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
