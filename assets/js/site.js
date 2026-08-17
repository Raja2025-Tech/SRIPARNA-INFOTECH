/* =========================================================
   SRIPARNA INFOTECH — SHARED UI BEHAVIOUR
   =========================================================
   Loaded by every page. Each block is guarded so a page that
   does not contain a given component simply skips it -- the
   homepage-only lead form and marquee must not throw on the
   service or legal pages.
========================================================= */
(function () {
    'use strict';

    /* ── Mobile nav ──
       Hamburger is three <span class="ham-bar"> elements; the bar-to-X
       morph is a pure CSS transform driven by the .open class on the
       button itself (see .nav-hamburger.open in theme.css) -- no icon
       class-swapping needed here any more. */
    const ham  = document.getElementById('hamburger');
    const menu = document.getElementById('navMenu');
    if (ham && menu) {
        const closeMenu = () => {
            menu.classList.remove('open');
            ham.classList.remove('open');
            ham.setAttribute('aria-expanded', 'false');
        };
        ham.addEventListener('click', () => {
            const open = menu.classList.toggle('open');
            ham.classList.toggle('open', open);
            ham.setAttribute('aria-expanded', open);
        });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    }

    /* ── Google reviews: single source of truth ──
       assets/js/reviews-config.js sets window.SI_REVIEWS = {rating, count,
       url}. Any element tagged data-review="rating"|"count"|"stars"|"url"
       is populated here, so every visible review badge site-wide updates
       from one place when the real rating/count changes. Structured data
       (JSON-LD aggregateRating in schema-business.html) is left untouched
       -- crawlers need that static in the HTML source, this only drives
       the visible badge text. */
    if (window.SI_REVIEWS) {
        const { rating, count, url } = window.SI_REVIEWS;
        document.querySelectorAll('[data-review="rating"]').forEach(el => { el.textContent = rating.toFixed(1); });
        document.querySelectorAll('[data-review="count"]').forEach(el => { el.textContent = count; });
        document.querySelectorAll('[data-review="stars"]').forEach(el => { el.textContent = '★★★★★'.slice(0, Math.round(rating)); });
        document.querySelectorAll('[data-review="url"]').forEach(el => { if (el.tagName === 'A') el.href = url; });
    }

    /* ── Sticky nav style ── */
    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 24);
        }, { passive: true });
    }

    /* ── Scroll reveal ── */
    const revealObs = new IntersectionObserver(
        entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
        }),
        { threshold: 0.1, rootMargin: '0px 0px -44px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    /* ── FAQ accordion ── */
    document.querySelectorAll('.faq-q').forEach(q => {
        const open = () => {
            const item   = q.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                q.setAttribute('aria-expanded', 'true');
            }
        };
        q.addEventListener('click',   open);
        q.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    /* ── Lead form submission (homepage only) ── */
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', async e => {
            e.preventDefault();
            const btn  = document.getElementById('fSubmit');
            const errD = document.getElementById('fErr');
            const orig = btn.textContent;

            btn.textContent = 'Sending…';
            btn.disabled    = true;
            errD.style.display = 'none';

            const payload = {
                name:    document.getElementById('f-name').value.trim(),
                phone:   document.getElementById('f-phone').value.trim(),
                service: document.getElementById('f-service').value,
                message: document.getElementById('f-msg').value.trim()
            };

            try {
                const res    = await fetch('https://sriparna-infotech-lead-form.thetechachiever.workers.dev', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.error || 'Submission failed');
                e.target.reset();
                window.location.href = '/thank-you.html';
            } catch {
                errD.textContent   = 'Unable to send right now. Please call or WhatsApp +91 70038 72122.';
                errD.style.display = 'block';
            } finally {
                btn.textContent = orig;
                btn.disabled    = false;
            }
        });
    }

})();
