# Trackable short-link infrastructure (`/go/`)

**Date:** 2026-07-19
**Status:** Approved — implementing

## Problem

We share app store links on LinkedIn, WhatsApp, X, Instagram, email, etc. Raw
store URLs are (a) long and ugly, (b) split across two stores so a recipient on
the "wrong" platform is stranded, and (c) only trackable via each store's own
console — delayed 24–48h, split in two places, and blind to anyone who clicks
but doesn't install. We want short, branded, one-per-placement links whose
traction we can read quickly.

## Key enabler

The site already runs **GoatCounter** (privacy-first, no-cookie) on every page.
A redirect page under our own domain logs each click in that one dashboard, in
real time, unified across both stores and every placement, whether or not the
person installs. That becomes the primary "traction" signal; store consoles
remain the install-conversion signal.

## Solution

One smart redirect page per **app × placement**, served from our static site.

### Link shape
```
purposelabstudio.com/go/<app>-<placement>
```
e.g. `purposelabstudio.com/go/folio-li-dm`.

### Runtime behavior of each page
1. Fire a GoatCounter hit for its own path (`/go/<app>-<placement>`) via a
   tracking pixel that is dispatched **before** navigation, so the count is not
   lost to the redirect. GoatCounter's own `no_onload` flag prevents a double
   count.
2. Detect device:
   - **Android** → `location.replace` → Play Store with
     `referrer=utm_source=…&utm_medium=…&utm_campaign=<placement>`.
   - **iPhone** (app has an iOS build) → App Store with `ct=<placement>`.
   - **Desktop**, or **iPhone when the app is Android-only** → render an inline
     landing (app icon, name, tagline, both store buttons, and — when a QR
     encoder is available at build time — a QR that encodes the same short link
     so scanning re-runs the smart redirect on a phone).
3. `<noscript>` meta-refresh fallback → the app's default store.
4. `noindex, nofollow` + `robots.txt` `Disallow: /go/` (redirects must not be
   indexed).

### Three tracking layers per link
| Layer | Answers | Latency | Where |
|---|---|---|---|
| GoatCounter | clicks per placement/app | real-time | GC dashboard |
| Play referrer | Android installs | ~24–48h | Play Console |
| App Store `ct` | iOS installs | ~1 day | ASC Analytics |

## Components (all in the static site repo)

1. **`tools/link-config.json`** — single source of truth. `apps` (name,
   tagline, android package, ios id or `null`, icon path, accent, default
   store) + `placements` (code → utm_source/medium/campaign, ct, human label) +
   `baseUrl` + `goatcounter` endpoint.
2. **`tools/build-links.mjs`** — reads config, emits
   `go/<app>-<placement>/index.html` for every app × placement, plus a registry
   page `go/index.html`. Idempotent. Detects `qrencode` on PATH; inlines a
   correct QR SVG when present, omits QR (buttons only) otherwise.
3. **`go/index.html`** — private registry listing every live link with
   copy-to-clipboard, grouped by app. `noindex`.
4. **`tools/test-links.mjs`** — validates config and asserts every generated
   page carries the GoatCounter snippet, the tracking pixel, the noscript
   fallback, and correct store URLs. Wired into `npm test`.
5. **`robots.txt`** — add `Disallow: /go/`.

## Decisions

- **QR is pluggable, not vendored.** No reliable QR tool is installed and a
  hand-rolled encoder could ship unscannable codes we can't verify. Correctness
  over completeness: buttons always work; QR appears automatically once
  `qrencode` is installed and the generator is re-run.
- **Generate the full app × placement cartesian.** Pages are ~2KB each; every
  conceivable `/go/<app>-<placement>` link is therefore always live and needs no
  per-use build step.
- **Redirect uses `location.replace`** (no history entry) after a ~120ms beat so
  the tracking pixel is dispatched.

## Cleanup

Delete the interim `folio/get/android` and `folio/get/ios` pages; `/go/folio-*`
supersedes them.

## Team workflow after ship

- Share → paste `purposelabstudio.com/go/<app>-<placement>`.
- Next day → GoatCounter shows clicks by placement.
- Later in the week → Play Console / ASC show installs by placement.
- New placement or app → edit `link-config.json`, run `node tools/build-links.mjs`.
