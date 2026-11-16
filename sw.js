---
---
/* Sriparna Infotech service worker.
   - Pages: network-first (always fresh when online), cached copy or
     /offline when there is no connection.
   - Same-origin static assets: stale-while-revalidate.
   - Cross-origin requests (fonts, icons, GA, the lead-form worker) are
     never touched. The version below changes on every Jekyll build, so
     each deploy clears old caches. */
const VERSION = 'si-{{ site.time | date: "%Y%m%d%H%M%S" }}';
const PRECACHE = ['/', '/offline', '/assets/css/theme.css', '/assets/js/site.js', '/assets/js/reviews-config.js',
                  '/sriparna_infotech_logo.webp', '/favicon.webp'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
        .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== location.origin) return;

    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req).then(res => {
                if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
                return res;
            }).catch(() => caches.match(req).then(hit => hit || caches.match('/offline')))
        );
        return;
    }
    e.respondWith(
        caches.match(req).then(hit => {
            const net = fetch(req).then(res => {
                if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
                return res;
            }).catch(() => hit);
            return hit || net;
        })
    );
});
