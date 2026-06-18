const CACHE = 'scrubbedin-v1'
const PRECACHE = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for assets
  if (e.request.url.includes('supabase.co') || e.request.url.includes('anthropic')) {
    return // Don't intercept API calls
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached ?? fetch(e.request))
  )
})
