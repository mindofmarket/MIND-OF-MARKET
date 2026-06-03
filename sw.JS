// MIND OF MARKET X — Service Worker
// Caches static assets for offline/fast loading

const CACHE = 'momx-v1';
const STATIC = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch live: API calls + GitHub data
  if (
    url.hostname.includes('binance') ||
    url.hostname.includes('arkm') ||
    url.hostname.includes('alternative') ||
    url.hostname.includes('coingecko') ||
    url.hostname.includes('github') ||
    url.hostname.includes('rss2json') ||
    url.hostname.includes('anthropic')
  ) {
    return; // Let browser handle — no caching for live data
  }

  // Cache-first for static assets (fonts, icons, HTML)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Push notification support (future)
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  self.registration.showNotification(data.title || 'عقل السوق', {
    body: data.body || 'تنبيه جديد من عقل السوق',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    tag: 'momx-alert',
    renotify: true
  });
});
