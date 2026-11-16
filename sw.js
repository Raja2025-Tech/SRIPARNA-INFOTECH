---
---
/* Sriparna Infotech service worker.
   - Pages, CSS and JS: network-first, so a deploy is visible on the very
     next load; the cached copy (or /offline for pages) is used only when
     there is no connection. CSS/JS were stale-while-revalidate at first,
     which paired fresh HTML with the previous deploy's stylesheet for one
     visit and broke the layout. Do not go back to that.
   - Other same-origin assets (images, video, icons): stale-while-revalidate.
   - Cross-origin requests (fonts, icons, GA, the lead-form worker) are
     never touched. The version below changes on every Jekyll build, so
     each deploy clears old caches. */
const VERSION = 'si-{{ site.time | date: "%Y%m%d%H%M%S" }}';
const PRECACHE = ['/', '/offline', '/assets/css/theme.css', '/assets/css/icons.css', '/assets/js/site.js',
                  '/assets/js/reviews-config.js', '/assets/fonts/inter-latin-var.woff2',
                  '/assets/fonts/plus-jakarta-sans-latin-var.woff2',
                  '/assets/img/logo-full.webp', '/assets/img/technician-poster.webp'];

self.addEventListener('install', e => {
    // cache:'reload' bypasses the 10-minute HTTP cache so the precache is this deploy's files.
    e.waitUntil(caches.open(VERSION)
        .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
        .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
        .then(() => self.clients.claim()));
});

const put = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };

self.addEventListener('fetch', e => {
    const req = e.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== location.origin) return;
    if (req.headers.has('range')) return;   // let the browser handle video range requests itself

    if (req.mode === 'navigate') {
        e.respondWith(fetch(req).then(res => put(req, res))
            .catch(() => caches.match(req).then(hit => hit || caches.match('/offline'))));
        return;
    }
    if (/\.(css|js)$/.test(url.pathname)) {
        // ignoreSearch: pages request these with a ?v=<build> cache-buster.
        e.respondWith(fetch(req).then(res => put(req, res))
            .catch(() => caches.match(req, { ignoreSearch: true })));
        return;
    }
    e.respondWith(
        caches.match(req).then(hit => {
            const net = fetch(req).then(res => put(req, res)).catch(() => hit);
            return hit || net;
        })
    );
});
