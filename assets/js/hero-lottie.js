/* =========================================================
   SRIPARNA INFOTECH — HERO LOTTIE CHARACTER
   =========================================================
   Loads the animated IT-technician character into #heroLottie using
   lottie-web only (no framework). Null-guarded like site.js -- pages
   without #heroLottie skip this entirely.

   The only reference to the animation file lives in LOTTIE_SRC below;
   swapping assets/lottie/it-technician.json for a final export needs
   no other code change.

   Loading strategy: lottie-web (~250KB library) and the animation JSON
   are not requested until after window "load" fires, deferred one more
   tick via requestIdleCallback -- so the character never competes with
   the page's own LCP/critical-path resources. The container's size is
   fixed by CSS (.hero-lottie-wrap uses aspect-ratio) before any of this
   runs, so nothing shifts when the SVG appears (CLS = 0 by construction).
========================================================= */
(function () {
    'use strict';

    var container = document.getElementById('heroLottie');
    if (!container) return;

    var LOTTIE_SRC = '/assets/lottie/it-technician.json';
    var LOTTIE_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var anim = null;

    function init() {
        if (!window.lottie) return;
        anim = window.lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: !reduceMotion,
            path: LOTTIE_SRC,
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
        });

        /* Reduced motion: show the character on a single still frame
           instead of not loading it at all -- still friendly, no motion. */
        if (reduceMotion) {
            anim.addEventListener('DOMLoaded', function () { anim.goToAndStop(0, true); });
        }
    }

    function loadLottieLib() {
        if (window.lottie) { init(); return; }
        var script = document.createElement('script');
        script.src = LOTTIE_LIB;
        script.defer = true;
        script.onload = init;
        document.body.appendChild(script);
    }

    function deferredStart() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadLottieLib, { timeout: 2000 });
        } else {
            setTimeout(loadLottieLib, 200);
        }
    }

    if (document.readyState === 'complete') {
        deferredStart();
    } else {
        window.addEventListener('load', deferredStart);
    }

    /* Pause off-screen tabs -- no point animating what nobody sees. */
    document.addEventListener('visibilitychange', function () {
        if (!anim) return;
        if (document.hidden) {
            anim.pause();
        } else if (!reduceMotion) {
            anim.play();
        }
    });
})();
