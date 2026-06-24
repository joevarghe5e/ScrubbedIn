const CACHE = 'scrubbedin-v2'
const PRECACHE = ['/']

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
  // Network-first for navigations and HTML so stale index.html never
  // points to JS/CSS bundle hashes a new deploy has already removed.
  if (e.request.mode === 'navigate' || e.request.url.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res })
        .catch(() => caches.match(e.request))
    )
    return
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached ?? fetch(e.request))
  )
})
