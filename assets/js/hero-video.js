/* =========================================================
   SRIPARNA INFOTECH — HERO CHARACTER VIDEO
   =========================================================
   Plays the animated IT-technician clip in #heroVideo. Null-guarded
   like site.js -- pages without #heroVideo skip this entirely.

   The only reference to the video file lives in VIDEO_SRC below;
   swapping assets/it-technician.mp4 for a new export needs no other
   code change.

   Loading strategy: the <video> ships with no src and preload="none",
   so nothing downloads on page load. The real src is only set after
   window "load" fires, deferred one more tick via requestIdleCallback --
   so the ~640KB clip never competes with the page's own LCP/critical-
   path resources. The container's size is fixed by CSS (.hero-video-wrap
   uses aspect-ratio:16/9, matching the source exactly) before any of
   this runs, so nothing shifts when the video appears (CLS = 0 by
   construction).

   The source clip has an audio track, so `muted` is required both for
   UX (a hero background video should never autoplay sound) and for
   autoplay to be permitted at all under browser autoplay policy.
========================================================= */
(function () {
    'use strict';

    var video = document.getElementById('heroVideo');
    if (!video) return;

    var VIDEO_SRC = '/assets/it-technician.mp4';
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function start() {
        video.src = VIDEO_SRC;
        video.load();

        if (reduceMotion) {
            /* Show the character without motion: land on a representative
               frame partway through the clip and stay paused there. */
            video.loop = false;
            video.addEventListener('loadedmetadata', function once() {
                video.currentTime = video.duration ? video.duration / 2 : 0;
                video.removeEventListener('loadedmetadata', once);
            });
            return;
        }

        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () { /* autoplay blocked; leave paused, no-op */ });
        }
    }

    function deferredStart() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(start, { timeout: 2000 });
        } else {
            setTimeout(start, 200);
        }
    }

    if (document.readyState === 'complete') {
        deferredStart();
    } else {
        window.addEventListener('load', deferredStart);
    }

    /* Pause off-screen tabs -- no point playing what nobody sees. */
    document.addEventListener('visibilitychange', function () {
        if (!video.src) return;
        if (document.hidden) {
            video.pause();
        } else if (!reduceMotion) {
            video.play().catch(function () {});
        }
    });
})();
