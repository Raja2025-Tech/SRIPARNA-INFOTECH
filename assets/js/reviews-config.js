/* =========================================================
   SRIPARNA INFOTECH — GOOGLE REVIEWS CONFIG
   =========================================================
   Single source of truth for the visible review rating/count shown
   in badges across the site (hero, trust sections, reviews showcase).
   No official Google Places API key exists in this repo, so this is
   the "keep one configurable value in one file" fallback: update the
   three values below and every page's badge updates automatically via
   the data-review="rating|count|stars|url" wiring in assets/js/site.js.

   This file does NOT touch structured data. The JSON-LD aggregateRating
   in _includes/schema-business.html is intentionally separate and must
   be updated by hand alongside this file if the real rating changes --
   crawlers need JSON-LD static in the HTML source, not filled in by JS
   after the page loads.
========================================================= */
window.SI_REVIEWS = {
    rating: 5.0,
    count: 19,
    url: 'https://g.page/r/CV5im1gWlR9eEBM/review'
};
