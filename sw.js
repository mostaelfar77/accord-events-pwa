const CACHE_NAME = 'accord-events-v1';
const urlsToCache = [
  '/accord-events-pwa/',
  '/accord-events-pwa/index.html',
  '/accord-events-pwa/app.js',
  '/accord-events-pwa/styles.css',
  '/accord-events-pwa/accord-logo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle navigation requests
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/accord-events-pwa/index.html')
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
}); 