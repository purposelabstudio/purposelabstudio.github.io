# Folio-Prime Website Redesign

**Date:** 2026-07-15
**Status:** Draft for review
**Builds on:** `2026-07-06-website-redesign-design.md` (Warm Editorial design system, static GitHub Pages, first-person studio voice). This spec **supersedes that spec's homepage positioning only** — homepage shifts from "developer-forward, apps as proof-of-work" to "Folio-forward, studio as trust." All other conventions from that spec still hold.

## Overview

Reposition `purposelabstudio.com` so **Folio is the prime product** and the other four apps (Crumbs, WaterWise, BP Log, Hushly) become clearly secondary "side products," and give Folio its own **dedicated journaling content hub**. The goal is a more appealing, more discoverable site that converts more article/landing traffic into Folio installs — without sacrificing the studio's existing domain authority or any current traffic.

This is a **re-prioritization + additive-content** change, not a migration. Every existing URL stays live, indexed, and internally linked. There are **no page moves and no redirects**, so there is no SEO/ranking risk to existing pages.

## Why now (validated by analytics)

GoatCounter, last 7 days (2026-07-08 → 2026-07-15), 136 visits — supports the pivot:

- **Folio is already the most-visited product**: `/folio` (16) + `/folio/diary` (15) = **31**, far ahead of Crumbs (10), BP Log (6), Hushly (3), WaterWise (3). Elevating Folio matches real behavior.
- **Homepage is the top entry point** (47 visits) — the Folio-forward rebuild reaches the largest audience.
- **A Folio blog post is already a top page** (`why-journaling-apps-make-you-feel-guilty`, 5) and appears as an internal referrer — the journaling cluster already pulls.
- **India-first confirmed** (India 74%, US 24%).
- **65% of visitors are on desktop/monitors**, but Folio is a phone app → people *research on desktop, install on phone*. Current install buttons cannot convert a desktop visitor. This justifies a **desktop→phone bridge** (see §2.6).

## Goals

1. **Folio is unmistakably the prime product** on the homepage and in navigation.
2. **The other four apps recede to "side product" status** — present and indexed, but visually and navigationally secondary.
3. **Folio gets a dedicated content section** (`/folio/journal/`) that concentrates topical authority and funnels to install, without moving any post.
4. **Higher article/landing → install conversion**, measurable via existing tagged CTAs + GoatCounter events, including for desktop researchers.
5. **No loss of current traffic or domain authority** — all existing URLs preserved.

## Non-Goals

- No page moves, no URL changes, no redirects. (Rules out physically relocating blog posts.)
- No new keyword sub-pages this pass (`/folio/features/`, `/folio/mood-tracker/`, `/folio/habit-tracker/`) — deliberate fast-follow after the core proves out.
- No framework/build tooling; site stays hand-authored HTML + CSS.
- No backend; no change to the newsletter mechanism.
- No rewrite of the other apps' pages beyond nav + moving their cards to `/apps/`.

## Constraints & Context

- **Static GitHub Pages**, no server-side redirects. Any future move would need meta-refresh + `rel=canonical` stubs — avoided here by design.
- **Nav is duplicated per-file** across every `.html`. The nav change must be applied consistently to every page template/header.
- **Preserve all existing** JSON-LD, canonical URLs, Open Graph tags, and the Google verification meta.
- **Reuse the existing Warm Editorial CSS tokens** and the Folio page's own palette overrides. No wholesale CSS replacement.
- **Existing attribution convention** (`?...&referrer=utm_source%3Dwebsite%26utm_medium%3D...%26utm_campaign%3D...` + `data-goatcounter-click`) is the standard for every new install CTA.

## Protected URLs (must stay live + indexed + linked)

All 20 blog posts, the 4 `best-free-*` pages, `/bplog/ /waterwise/ /hushly/ /crumbs/`, all `/tools/*`, `/folio/diary/`, `/about/`, `/support/`, `/blog/`. These get **re-linked, never removed**.

## Design

### 1. Information architecture

| Action | Pages |
|---|---|
| **Rebuilt** | `/` (Folio-forward homepage) |
| **New** | `/apps/` (side-products index), `/folio/journal/` (curated journaling hub) |
| **Upgraded** | `/folio/` (stronger conversion + GEO) |
| **Nav-updated** | every existing page (header nav) |
| **Untouched (protected)** | see "Protected URLs" above |

### 2. Homepage (`/`) — Model B: Folio-forward, studio as trust

Top-to-bottom structure:

1. **Nav** (new global nav — §6).
2. **Folio hero** — headline + subcopy focused on Folio; Folio screenshots (from `folio/screenshots/`); primary install buttons (Play + App Store) tagged `campaign=home-hero`; a proof line (rating / "private, offline"). Brand link in the nav stays `PurposeLab Studio` (preserves studio equity; the hero carries the Folio-forward message).
3. **Trust strip** — the existing `Free · No Ads · Offline-first · Privacy-first` badges, reframed as Folio's promise (they already are Folio's selling points).
4. **Folio depth** — 3 short value blocks (e.g. calm/no-streaks, private & offline + app lock, reflect monthly), each linking into `/folio/` and `/folio/journal/`. Surface **`/folio/diary/`** here explicitly (it's a top page — §"Why now").
5. **From the Folio journal** — a small teaser row of 2–3 journaling posts linking into `/folio/journal/`.
6. **Desktop→phone bridge** (§2.6).
7. **"Also from PurposeLab"** — one compact strip (icon + one line + link) for Crumbs, WaterWise, BP Log, Hushly, linking to `/apps/` and each app page. This is where the four apps become side products.
8. **Keep**: free tools section, newsletter opt-in, "say hi" contact, footer.

#### 2.6 Desktop→phone bridge (new, data-justified)
Next to the primary Folio install CTAs (homepage hero + `/folio/`), add a lightweight "Get it on your phone" affordance for desktop visitors: a small QR code (encoding the tagged Play link, `campaign=home-qr` / `folio-qr`) with copy like "Scan to install on your phone." Pure static (a pre-generated QR image or an inline SVG); no JS dependency required. On mobile viewports it can hide (install buttons already work there). Rationale: 65% of visitors are on monitors and cannot install directly.

### 3. `/apps/` — side-products index (new)

A simple studio index page holding the four non-Folio app cards (the ones removed from the homepage's prominent list), in the existing card style. Folio may appear as a small "looking for our journal? → Folio" link at the top, but the page's job is the other four. Linked from nav "More apps," the homepage strip, and the footer. Full head (title/description/canonical/OG), added to `sitemap.xml`. This page is what lets the homepage go Folio-first without orphaning the other apps' internal links.

### 4. `/folio/` landing upgrade

- **Screenshots above the fold**; a repeated/sticky install CTA so the button is always reachable on long scroll.
- **Desktop→phone bridge** (§2.6) beside the hero CTA.
- **"Folio vs other journal apps" comparison table** — Folio vs typical journal apps on: price (free vs freemium), ads, account required, offline, streak pressure, app lock, data ownership. This is both a conversion asset and GEO gold (AI engines preferentially cite tables).
- **GEO polish**: a 2–3 sentence quotable answer near the top ("Folio is a free, offline, private daily journal and mood tracker with no ads, no account, and no streak pressure…"), and an extended Folio entity block in `llms.txt` (what it is, who it's for, key facts, links).
- Prominent link down into `/folio/journal/` and to `/folio/diary/`.
- Preserve existing `SoftwareApplication` / `FAQPage` / `BreadcrumbList` JSON-LD; extend, don't replace.

### 5. `/folio/journal/` — curated content hub (new)

A pillar page — working title "The calm guide to daily journaling" — that curates the existing journaling posts **which stay at their current `/blog/...` URLs**:

- `why-journaling-apps-make-you-feel-guilty`
- `why-journaling-fails-and-how-to-stick-with-it`
- `daily-journal-vs-mood-tracker-why-you-need-both`
- `journaling-prompts-for-anxiety`
- `journaling-prompts-for-overthinking`
- `journaling-prompts-for-self-discovery`

Structure: a short intro framing the topic, then grouped links to each post with 1–2 lines of context, plus a Folio install CTA (`campaign=folio-journal-hub`) and links to the journaling prompt tool. This is the "Folio-specific blog section," delivered as a hub-and-spoke pillar that concentrates topical authority and points at install — without moving a single post. Add to `sitemap.xml`; full head + `CollectionPage`/`ItemList` JSON-LD; link the six posts back up to the hub (add a "Part of: The calm guide to journaling" link in each — additive, no URL change).

### 6. Navigation + internal linking

- **New global nav:** `Folio · Journal · Blog · More apps · About · Support`.
  - `Folio` → `/folio/`; `Journal` → `/folio/journal/`; `More apps` → `/apps/`.
- Applied to **every** page's header (nav is per-file in this static site) for consistency; the current page keeps its `class="active"` treatment.
- Homepage + `/folio/` + `/folio/journal/` cross-link tightly (the Folio cluster).
- `/apps/` and the four app pages keep all their existing internal links so no page loses link equity. The four app pages' navs also update to the new global nav.

### 7. Measurement & success metrics

- Every new Folio install CTA carries `referrer`/`utm` + a `data-goatcounter-click` event, matching the existing convention (e.g. `home-hero`, `home-qr`, `folio-journal-hub`, `folio-qr`).
- Tag the one currently-untagged homepage Folio link as part of the rebuild.
- **Success = ** (measured in GoatCounter + Play Console referrer):
  - Increase in Folio install-CTA click events (`ps-folio-*`) as a share of homepage visits.
  - `/folio/journal/` entering top pages within ~4–6 weeks.
  - No drop in impressions/clicks for the protected BP/water/sleep URLs (watch Search Console).
  - Desktop→phone bridge events (`home-qr` / `folio-qr`) registering non-zero (proves the desktop path converts).

### 8. Guardrail / verification

- Run `node scripts/audit.mjs --all` after changes; resolve any new FAILs (each new page must pass: viewport, stylesheet, canonical, og:title, single `<h1>`, img alt, valid JSON-LD).
- Confirm every Protected URL still resolves and remains in `sitemap.xml`; add the two new pages (`/apps/`, `/folio/journal/`) to `sitemap.xml`.
- Confirm nav updated on every page (grep for the old nav list; none should remain).
- Visual check of the rebuilt homepage + `/folio/` on desktop and mobile widths.

## Out of scope (fast-follow)

- New keyword-targeted Folio sub-pages: `/folio/features/`, `/folio/mood-tracker/`, `/folio/habit-tracker/`.
- Physically relocating posts under `/folio/blog/` (explicitly rejected — migration risk with no upside given the hub approach).
- Backlink/DA campaign (external posts, outreach) — the biggest DA lever, but a separate content/marketing workstream.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Nav change misses a page → inconsistent header | Grep old nav across all `.html`; audit `--all` |
| Homepage de-emphasizes apps that still get traffic (Crumbs 10/wk) | Apps stay one click away via `/apps/` + footer + "Also from PurposeLab" strip; all internal links preserved |
| New pages ship with weak on-page SEO | Gate on `scripts/audit.mjs`; full head + JSON-LD required |
| QR/bridge adds clutter | Keep it small and secondary to the buttons; hide on mobile |
