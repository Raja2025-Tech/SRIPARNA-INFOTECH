# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing site for Sriparna Infotech, a local computer/laptop/CCTV/printer/mobile hardware service business in Barasat, West Bengal, India. It's a static site with no build step, deployed via GitHub Pages (Jekyll) to the custom domain in `CNAME` (sriparnainfotech.com).

## Commands

There is no build tool, package manager, linter, or test suite in this repo (no `package.json`). To preview locally:

```
bundle exec jekyll serve
```

(requires Jekyll/Bundler installed separately — there's no `Gemfile` checked in). Otherwise, just open the `.html` files directly in a browser, keeping in mind that `{% include %}` tags (used by every page except `index.html`, `thank-you.html`, `info.html`) only render through Jekyll/GitHub Pages, not as raw files.

Changes go live by pushing to `main` — GitHub Pages rebuilds automatically. There is no CI/staging environment.

### Verifying a build before pushing

**`bundle exec jekyll serve` does not reproduce the real build.** GitHub Pages runs `github-pages build` (safe mode + the whitelisted plugin set), not plain `jekyll build`, and the two disagree in ways that pass locally and then fail to deploy. To run what Pages actually runs:

```bash
docker run --rm -v "$PWD:/src:ro" -e JEKYLL_ENV=production --entrypoint bash ghcr.io/actions/jekyll-build-pages:v1.0.13 -c 'cp -r /src /work && cd $BUNDLE_APP_CONFIG && $BUNDLE_APP_CONFIG/bin/github-pages build --source /work --destination /tmp/site'
```

The most important divergence: the Pages plugin set includes **`jekyll-optional-front-matter`**, which renders Markdown files *without* front matter as pages rather than copying them verbatim. Any `{% ... %}` or `{{ ... }}` written in prose in a committed `.md` file is therefore parsed as Liquid and will **fail the build**. `CLAUDE.md` is in `exclude` in `_config.yml` for exactly this reason — keep it there, and add any future `.md` files to `exclude` too (or wrap their Liquid examples in `{% raw %}`).

A failed Pages build is silent from the outside: the last good version keeps serving, so the site looks fine while changes never appear. Check the result at `https://api.github.com/repos/Raja2025-Tech/SRIPARNA-INFOTECH/actions/runs?per_page=5` (look for `pages build and deployment`) rather than assuming a push deployed.

## Architecture

This is **not one consistent template** — it's several independently-styled pages that evolved separately. Know which "system" a page belongs to before editing it:

1. **Jekyll-templated pages** (`about.html`, `computer-laptop-service.html`, `printer-service.html`, `mobile-service.html`, `cctv-installation.html`, `terms-and-conditions.html`, `privacy-policy.html`, `refund-policy.html`): these use Jekyll front matter (`title`/`description` variables via `{{ page.title }}`) and pull in shared `{% include header.html %}` / `{% include footer.html %}` from `_includes/`. They share `styles.css` (the "service ticket" design system — see below).

2. **`index.html` (homepage)**: fully self-contained. It does NOT use `_includes/header.html` or `_includes/footer.html` — it has its own inline `<header id="nav">` / `<footer>` and its own `<style>` block with a completely different design system (dark theme, "Syne"/"Inter"/"JetBrains Mono" fonts, CSS custom properties like `--sky`/`--vio`/`--em`/`--amb`, glass-morphism cards, animated gradient orbs). If you change site-wide nav/footer content, you must update it in **two places**: `_includes/header.html` + `_includes/footer.html` for the templated pages, AND the inline markup in `index.html`.

3. **`info.html`**: a standalone one-off page with yet another unrelated inline design (cyberpunk/"Digital Matrix" theme, Orbitron font, neon cyan/purple palette). Not linked from shared nav; treat as isolated.

4. **`thank-you.html`**: standalone lead-form confirmation page (`noindex, nofollow`), using its own inline `<style>` on top of `styles.css`.

Shared design tokens for the `styles.css` system (`about.html` and the four service pages) are CSS custom properties defined in `styles.css` `:root` — colors (`--ink`, `--paper`, `--blue-*`, `--amber`, `--whatsapp`), fonts (`--font-display: Space Grotesk`, `--font-body: IBM Plex Sans`, `--font-mono: IBM Plex Mono`), and radii/shadows. The visual motif is a "service ticket" (diagnostic tag) — monospace ticket numbers, status-stamp styling, perforated-edge aesthetics.

`script.js` is shared across pages and is defensive about missing elements (`if (el) ...` guards throughout), since not every page has every component (e.g. `#main-header` only exists on Jekyll-templated pages, not `index.html`, which has its own scroll-shadow/hamburger logic inlined instead).

### Lead form

The homepage contact form (`#leadForm` in `index.html`) submits via `fetch` (JSON POST) to a Cloudflare Worker at `https://sriparna-infotech-lead-form.thetechachiever.workers.dev`, not a Jekyll/GitHub-hosted endpoint. On success it redirects to `/thank-you.html`; on failure it shows an inline error telling the user to call/WhatsApp instead. The worker itself is not part of this repo.

### Analytics

GA4 lives in **one place**: `_includes/analytics.html`. Every Jekyll-processed page pulls it into `<head>` with `{% include analytics.html %}` — including `index.html`, which otherwise shares no includes with the rest of the site. Never paste the snippet inline as well; a second `function gtag()` definition re-binds the `dataLayer` push target and double-counts pageviews.

`info.html` is the one exception. It has no front matter, so Jekyll treats it as a static file and never expands Liquid there — its copy of the snippet stays inline. If you add front matter to it, switch it to the include at the same time.

Pages also fire conversion events via inline `onclick="gtag('event', 'generate_lead', ...)"` on the Call and WhatsApp buttons. These depend on the include being present in `<head>`; without it they throw `ReferenceError: gtag is not defined` and silently record nothing. Any new page carrying those buttons must carry the include too.

The `*-repair` redirect stubs generated by `jekyll-redirect-from` deliberately have no tracking — they are `noindex` bounce pages that redirect before a pageview would be meaningful.

### SEO / structured data

Every page carries its own `<script type="application/ld+json">` with schema.org markup (`LocalBusiness`, `BreadcrumbList`, `FAQPage`, etc.) and its own Open Graph / Twitter meta tags — these are hand-duplicated per page, not generated, so when copying a page as a template for a new one, update the canonical URL, OG tags, and JSON-LD `@id`/breadcrumb entries to match, and add the new URL to `sitemap.xml`.

### Renaming a page (redirects)

Never rename a page without leaving a redirect behind — the old URL is likely indexed. Add the old slug to the new page's `redirect_from:` front matter (extensionless, e.g. `- /printer-repair`); `jekyll-redirect-from` is enabled in `_config.yml` and is whitelisted on GitHub Pages, so no `Gemfile` is needed. One extensionless entry covers both `/slug` and `/slug.html`, because Pages serves `slug.html` at both.

`_config.yml` pins `url: "https://sriparnainfotech.com"`. Do not remove it — `jekyll-redirect-from` writes *absolute* targets, and without `url` it falls back to a `github.com/pages/...` address inferred by `jekyll-github-metadata`, which would bounce live visitors off the domain.

Note this is a **meta-refresh + `rel=canonical`** redirect, not an HTTP 301 — GitHub Pages serves static files and cannot emit a 3xx status. Google treats an instant meta refresh as a permanent redirect for indexing, so it consolidates ranking signals, but automated tools checking for a literal `301` will see `200`. A true 301 would require a proxy (e.g. Cloudflare) in front of the domain; DNS currently points straight at the Pages IPs.

The `/*-repair` -> `/*-service` rename is the existing example.

### Business identity constants

Reused verbatim across pages — keep consistent if changed:
- Phone: `+917003872122` (displayed `+91 70038 72122`)
- WhatsApp: `https://wa.me/917003872122`
- GA4 measurement ID: `G-LKGQF83WF9`
- Google review link: `https://g.page/r/CV5im1gWlR9eEBM/review`
- Legal entity: "Sriparna Infotech, a unit of Shreya Trading" (MSME Udyam registered)
- Service area: Barasat, Nabapally, Madhyamgram, New Barrackpore, North Kolkata — the business explicitly does **not** offer remote technical support (see disclaimer in `_includes/footer.html`) and is not affiliated with Microsoft/Apple/Dell/HP/Lenovo or other OEMs.

### Caching

`_config.yml` sets `cache_control: max-age=31536000` (1 year) for `images` and `assets` scoped content — be aware that image changes may need cache-busting (renamed file) to show up promptly for returning visitors.
