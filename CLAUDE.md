# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing site for Sriparna Infotech, a local computer/laptop/CCTV/printer/mobile hardware service business in Barasat, West Bengal, India. It's a static site with no build step, deployed via GitHub Pages (Jekyll) to the custom domain in `CNAME` (sriparnainfotech.com).

## Commands

There is no build tool, package manager, linter, or test suite in this repo (no `package.json`). To preview locally:

```
bundle exec jekyll serve
```

(requires Jekyll/Bundler installed separately — there's no `Gemfile` checked in). Otherwise, just open the `.html` files directly in a browser, keeping in mind that `{% include %}` tags — used by every page, including `index.html`, `thank-you.html` and `info.html` — only render through Jekyll/GitHub Pages, not as raw files.

Changes go live by pushing to `main` — GitHub Pages rebuilds automatically. There is no CI/staging environment.

### Verifying a build before pushing

**`bundle exec jekyll serve` does not reproduce the real build.** GitHub Pages runs `github-pages build` (safe mode + the whitelisted plugin set), not plain `jekyll build`, and the two disagree in ways that pass locally and then fail to deploy. To run what Pages actually runs:

```bash
docker run --rm -v "$PWD:/src:ro" -e JEKYLL_ENV=production --entrypoint bash ghcr.io/actions/jekyll-build-pages:v1.0.13 -c 'cp -r /src /work && cd $BUNDLE_APP_CONFIG && $BUNDLE_APP_CONFIG/bin/github-pages build --source /work --destination /tmp/site'
```

The most important divergence: the Pages plugin set includes **`jekyll-optional-front-matter`**, which renders Markdown files *without* front matter as pages rather than copying them verbatim. Any `{% ... %}` or `{{ ... }}` written in prose in a committed `.md` file is therefore parsed as Liquid and will **fail the build**. `CLAUDE.md` is in `exclude` in `_config.yml` for exactly this reason — keep it there, and add any future `.md` files to `exclude` too (or wrap their Liquid examples in `{% raw %}`).

A failed Pages build is silent from the outside: the last good version keeps serving, so the site looks fine while changes never appear. Check the result at `https://api.github.com/repos/Raja2025-Tech/SRIPARNA-INFOTECH/actions/runs?per_page=5` (look for `pages build and deployment`) rather than assuming a push deployed.

## Architecture

Every public page shares **one** design system. There is no per-page styling left — do not reintroduce any.

**Shared files — change the design here, never in a page:**

| File | Role |
|---|---|
| `assets/css/theme.css` | The entire design system: tokens, components, responsive rules. Every page loads it. |
| `assets/js/site.js` | All shared behaviour. Every block is null-guarded so pages missing a component skip it. |
| `_includes/site-nav.html` | Fixed glass nav. |
| `_includes/site-footer.html` | Footer, legal links, OEM disclaimer, floating WhatsApp button. |
| `_includes/ambient.html` | The three drifting gradient orbs. |
| `_includes/analytics.html` | GA4 — see Analytics below. |

**Tokens** live in `:root` in `theme.css`: colours (`--bg-base`, `--bg-card`, accents `--sky`/`--vio`/`--em`/`--amb`, text ramp `--t100`→`--t700`), fonts (`--f-disp: Syne`, `--f-body: Inter`, `--f-mono: JetBrains Mono`), radii (`--r-s`→`--r-xl`) and easing (`--spring`, `--smooth`). Build new UI from these; never hard-code a hex, font or radius in a page.

**Core components:** `.glass` (card, with `.vio`/`.em`/`.amb` hover accents), `.btn` + `.btn-primary`/`.btn-whatsapp`/`.btn-ghost`, `.section` + `.section-alt`, `.section-header.centered`, `.section-title`, `.section-lede`, `.eyebrow`, `.c-tag`/`.c-icon`/`.c-title`/`.c-desc` for card internals, `.reveal` (+ `.d1`–`.d4` stagger) for scroll-in.

**Subpage components:** `.page-hero` (compact hero — the homepage's full-viewport `#hero` is homepage-only), `.prose` (long-form text on About and the legal pages), `.card-grid`, `.brand-badges`, `.highlight-box`, `.notice`, `.punchline-card`, `.timeline-list`, `.area-chips.static`, `.thanks-card`.

**Page-type notes:**

- **`index.html`** is the reference implementation and the only page with `#hero`, the bento grid, the marquee and the lead form. It is also the only page *without* the floating WhatsApp button (it already has three inline WhatsApp CTAs).
- **Service pages + About + legal pages + `404` + `thank-you`** all use `page-hero` and the shared shell. They carry Jekyll front matter (`title`/`description` via `{{ page.title }}`).
- **FAQ accordions differ by design.** The homepage uses JS-driven `div.faq-item`; every other page uses native `<details class="faq-item">`, which needs no JavaScript. Both are styled identically. Prefer `<details>` on new pages.
- **`info.html`** is a "digital business card" page — meant to be shared directly (QR code, WhatsApp, NFC), not browsed to via site navigation. It uses the shared `theme.css`/`site.js`/`site-footer.html` like every other page, but its own `<header>` comes from `_includes/info-nav.html`, not the shared `site-nav.html`: the real logo image plus direct links to the four service pages, since the shared nav's homepage-section anchors (`#services` etc.) wouldn't resolve to anything here. It is deliberately unreachable by internal links from any other page — no page links to it, on purpose — but it *is* `index, follow` and listed in `sitemap.xml`, so Google can still discover and index it. If you ever want it discoverable by browsing instead of only by direct link/QR, add it to `site-footer.html` and reconsider whether `info-nav.html` is still needed.

**`.reveal` sets `opacity:0` until JavaScript adds `.in`.** Never put it on an LCP element — no page hero uses it, deliberately.

### Lead form

The homepage contact form (`#leadForm` in `index.html`) submits via `fetch` (JSON POST) to a Cloudflare Worker at `https://sriparna-infotech-lead-form.thetechachiever.workers.dev`, not a Jekyll/GitHub-hosted endpoint. On success it redirects to `/thank-you.html`; on failure it shows an inline error telling the user to call/WhatsApp instead. The worker itself is not part of this repo.

### Analytics

GA4 lives in **one place**: `_includes/analytics.html`. Every page, with no exceptions, pulls it into `<head>` with `{% include analytics.html %}`. Never paste the snippet inline as well; a second `function gtag()` definition re-binds the `dataLayer` push target and double-counts pageviews.

Pages also fire conversion events via inline `onclick="gtag('event', 'generate_lead', ...)"` on the Call and WhatsApp buttons. These depend on the include being present in `<head>`; without it they throw `ReferenceError: gtag is not defined` and silently record nothing. Any new page carrying those buttons must carry the include too.

The `*-repair` redirect stubs generated by `jekyll-redirect-from` deliberately have no tracking — they are `noindex` bounce pages that redirect before a pageview would be meaningful.

### SEO / structured data

The `LocalBusiness`/`Organization` entity (`@id` `https://sriparnainfotech.com/#business`) is defined **once**, in `_includes/schema-business.html`, and every page that needs it pulls it in with `{% include schema-business.html %}` (homepage also passes `with_rating=true` to add `aggregateRating` — kept on the homepage only, not duplicated site-wide). Never hand-write a second copy of this node; that's exactly the duplicate-entity problem this include exists to prevent. Extend it in one place if a field needs to change.

`_includes/schema-website.html` (the `WebSite` entity, `@id` `.../#website`) is emitted on the homepage only, via `{% include schema-website.html %}`. Other pages may reference it by `@id` (e.g. `"isPartOf": {"@id": "https://sriparnainfotech.com/#website"}`) without redeclaring it.

Everything else in each page's JSON-LD graph — `Service`, `FAQPage`, `BreadcrumbList`, `AboutPage`, `WebPage` — is page-specific and correctly hand-written per page, each with its own `@id` scoped to that page's URL (e.g. `.../cctv-installation#service`). Open Graph / Twitter meta tags are also still hand-duplicated per page, not generated. When copying a page as a template for a new one: swap in the shared includes rather than copying the business node inline, update the canonical URL, OG tags, and the page-specific JSON-LD `@id`/breadcrumb entries, and add the new URL to `sitemap.xml`.

### Renaming a page (redirects)

Never rename a page without leaving a redirect behind — the old URL is likely indexed. Add the old slug to the new page's `redirect_from:` front matter (extensionless, e.g. `- /printer-repair`); `jekyll-redirect-from` is enabled in `_config.yml` and is whitelisted on GitHub Pages, so no `Gemfile` is needed. One extensionless entry covers both `/slug` and `/slug.html`, because Pages serves `slug.html` at both.

`_config.yml` pins `url: "https://sriparnainfotech.com"`. Do not remove it — `jekyll-redirect-from` writes *absolute* targets, and without `url` it falls back to a `github.com/pages/...` address inferred by `jekyll-github-metadata`, which would bounce live visitors off the domain.

Note this is a **meta-refresh + `rel=canonical`** redirect, not an HTTP 301 — GitHub Pages serves static files and cannot emit a 3xx status. Google treats an instant meta refresh as a permanent redirect for indexing, so it consolidates ranking signals, but automated tools checking for a literal `301` will see `200`. A true 301 would require a proxy (e.g. Cloudflare) in front of the domain; DNS currently points straight at the Pages IPs.

The `/*-repair` -> `/*-service` rename is the existing example.

### Business identity constants

Reused verbatim across pages — keep consistent if changed. Everything except the two Google Business Profile links (address, phone, geo) originates in `_includes/schema-business.html`, so update it there and every page inherits the change automatically:
- Phone: `+917003872122` (displayed `+91 70038 72122`)
- WhatsApp: `https://wa.me/917003872122`
- Address: 05 No. Suryasenpally, Shastriji Road, Nabapally, Barasat, West Bengal 700126, IN
- Geo: `22.7253453, 88.4560981` — the real coordinates from the business's own Google Business Profile (resolved from the `hasMap` / footer `maps.app.goo.gl` link), not an approximation
- GA4 measurement ID: `G-LKGQF83WF9`
- Google review link (used for the homepage rating pill and footer social icon): `https://g.page/r/CV5im1gWlR9eEBM/review` — note this differs by path segment from the *bare* profile link used as `sameAs` in schema (`https://g.page/r/CV5im1gWlR9eEBM`, no `/review`); both are the same Business Profile and both are intentional, not a typo
- Legal entity: "Sriparna Infotech, a unit of Shreya Trading" (MSME Udyam registered)
- Service area: Barasat, Nabapally, Madhyamgram, New Barrackpore, North Kolkata — the business explicitly does **not** offer remote technical support (see disclaimer in `_includes/site-footer.html`) and is not affiliated with Microsoft/Apple/Dell/HP/Lenovo or other OEMs.

### Caching

**There is no custom cache policy, and none can be set from this repo.** GitHub Pages serves everything — HTML, CSS, JS, images alike — with a fixed `Cache-Control: max-age=600` (10 minutes) and does not read any cache directive from `_config.yml`.

`_config.yml` previously carried a `defaults` block setting `cache_control: max-age=31536000` for `images`/`assets` scopes. It never did anything: `cache_control` is not a key Jekyll or Pages acts on, and those `type:` values only match Jekyll collections, which this site does not define. Verified against the live site — every asset returns `max-age=600`. Do not re-add it.

The practical upshot is the opposite of what that block implied: returning visitors pick up changed images within about 10 minutes, so **cache-busting renames are not needed**. If a long-lived asset cache is ever genuinely wanted, it requires a CDN/proxy in front of the domain (e.g. Cloudflare), not a Jekyll setting.
