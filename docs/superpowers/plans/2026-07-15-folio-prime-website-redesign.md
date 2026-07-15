# Folio-Prime Website Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition `purposelabstudio.com` so Folio is the prime product and the other four apps become secondary, add a dedicated Folio journaling content hub, and strengthen Folio install conversion — with zero existing-URL changes.

**Architecture:** Hand-authored static HTML/CSS on GitHub Pages. No build step. The test harness is `npm test` (`scripts/test-site.mjs` + `scripts/test-tools.mjs`) plus `node scripts/audit.mjs` (per-page on-page-SEO linter) and `npm run check:analytics`. These scripts ARE the tests — every task ends by running them. New pages must be registered in `test-site.mjs`'s `allPages` and in `sitemap.xml`.

**Tech Stack:** Static HTML5, `style.css` (Warm Editorial CSS custom properties), existing per-page inline `<style>` theme overrides, GoatCounter + Clarity analytics, existing `referrer`/`utm` + `data-goatcounter-click` CTA convention.

**Spec:** `docs/superpowers/specs/2026-07-15-folio-prime-website-redesign-design.md`

---

## Critical ordering constraint

`test-site.mjs` check #3 asserts every root-relative `href` resolves to a real file. The new nav links `/apps/` and `/folio/journal/`. Therefore **new pages MUST be created before the nav is updated**, or the nav update breaks all 41 pages' tests. Task order below respects this.

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `apps/index.html` | Side-products index (Crumbs, WaterWise, BP Log, Hushly) | Create |
| `folio/journal/index.html` | Curated journaling content hub (pillar) | Create |
| `sitemap.xml` | Add the 2 new URLs | Modify |
| `scripts/test-site.mjs` | Register 2 new pages in `allPages`; assert new-nav invariants | Modify |
| `index.html` | Rebuild homepage Folio-forward | Modify |
| `folio/index.html` | Upgrade: above-fold screenshots, sticky CTA, comparison table, GEO intro, QR bridge | Modify |
| `llms.txt` | Extended Folio entity block | Modify |
| All 41 `*.html` with nav | Swap global nav to `Folio · Journal · Blog · More apps · About · Support` | Modify |
| `assets/qr-folio.svg` (or `.png`) | Static QR to tagged Play link for desktop→phone bridge | Create |

Reused existing CSS classes (already in `style.css`): `.nav`, `.nav-links`, `.hero`, `.badges`, `.badge*`, `.app-card`, `.app-icon`, `.app-info`, `.app-badges`, `.app-links`, `.section`, `.section-title`, `.blog-list`, `.blog-item`, `.philosophy`, `.footer`, `.btn`, `.btn-primary`. New small CSS blocks are added inline per-page (matching the site's existing inline-`<style>` pattern) for: comparison table, QR bridge, "Also from PurposeLab" strip.

---

## Task 1: Create `/apps/` side-products index

**Files:**
- Create: `apps/index.html`

- [ ] **Step 1: Create the page**

Create `apps/index.html`. Copy the exact `<head>` analytics/nav/footer patterns from `index.html`. Use the NEW nav (defined once here; Task 6 propagates the same block everywhere). Move the four non-Folio app cards (verbatim markup from current `index.html` lines ~171–260: WaterWise, BP Log, Hushly, and Crumbs) into this page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="PurposeLab Studio">
    <link rel="alternate" type="application/rss+xml" title="PurposeLab Blog" href="/blog/rss.xml">
    <title>More Apps from PurposeLab Studio — Free, Ad-Free Android Apps</title>
    <meta name="description" content="More simple, free, ad-free Android apps from PurposeLab Studio: Crumbs, WaterWise, BP Log, and Hushly. Privacy-first tools that each do one thing well.">
    <link rel="canonical" href="https://purposelabstudio.com/apps/">
    <meta property="og:title" content="More Apps from PurposeLab Studio">
    <meta property="og:description" content="Simple, free, ad-free Android apps. Crumbs, WaterWise, BP Log, and Hushly.">
    <meta property="og:url" content="https://purposelabstudio.com/apps/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="PurposeLab Studio">
    <meta property="og:image" content="https://purposelabstudio.com/og-default.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://purposelabstudio.com/og-default.png">
    <meta name="twitter:title" content="More Apps from PurposeLab Studio">
    <meta name="twitter:description" content="Simple, free, ad-free Android apps that respect you.">
    <link rel="stylesheet" href="../style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧪</text></svg>">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "More Apps from PurposeLab Studio",
      "url": "https://purposelabstudio.com/apps/",
      "description": "Simple, free, ad-free Android apps from PurposeLab Studio."
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://purposelabstudio.com/" },
        { "@type": "ListItem", "position": 2, "name": "More apps", "item": "https://purposelabstudio.com/apps/" }
      ]
    }
    </script>
    <!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
    <script data-goatcounter="https://purposelabstudio.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "xjkggf7dd9");
    </script>
</head>
<body>
    <div class="container">
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/folio/journal/">Journal</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/apps/" class="active">More apps</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>

        <section class="hero">
            <div class="eyebrow">~/ apps</div>
            <h1>More apps from PurposeLab</h1>
            <p class="subtitle">Looking for our journal? That's <a href="/folio/">Folio</a>. Here's the rest of what we make — each one free, ad-free, and focused on doing a single thing well.</p>
        </section>

        <section class="section">
            <h2 class="visually-hidden">All apps</h2>
            <!-- PASTE the four <div class="app-card">…</div> blocks for WaterWise, BP Log,
                 Hushly, and Crumbs here, VERBATIM from the current index.html. Keep each
                 app's --app-accent inline style, icons, badges, and links unchanged. -->
        </section>

        <footer class="footer">
            <p>&copy; 2025–2026 PurposeLab Studio. All rights reserved.</p>
            <div class="footer-links">
                <a href="https://purposelabstudio.com/privacy-policies/">Privacy Policies</a>
                <a href="/tools/">Free Tools</a>
                <a href="/support/">Support</a>
                <a href="/about/">About</a>
                <a href="/blog/rss.xml">RSS</a>
            </div>
        </footer>
    </div>
</body>
</html>
```

- [ ] **Step 2: Copy the four app cards in**

Open the current `index.html`, copy the four `<div class="app-card" …>` blocks for WaterWise, BP Log, Hushly, and Crumbs (NOT Folio) exactly as they are, and paste them into the marked section. Do not alter their icons, `--app-accent`, badges, or links.

- [ ] **Step 3: Audit the new page**

Run: `node scripts/audit.mjs apps/index.html`
Expected: no `FAIL` lines (WARN is acceptable). Confirm "exactly one `<h1>`", "has canonical", "has og:title", "JSON-LD parses".

- [ ] **Step 4: Commit**

```bash
git add apps/index.html
git commit -m "feat(site): add /apps/ side-products index"
```

---

## Task 2: Create `/folio/journal/` curated hub

**Files:**
- Create: `folio/journal/index.html`

- [ ] **Step 1: Create the pillar page**

Create `folio/journal/index.html` using the Folio palette override (copy the `<style>:root{…}</style>` block from `folio/index.html`). Curate the six existing journaling posts — they stay at their `/blog/...` URLs.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="PurposeLab Studio">
    <link rel="alternate" type="application/rss+xml" title="PurposeLab Blog" href="/blog/rss.xml">
    <title>The Calm Guide to Daily Journaling — Folio</title>
    <meta name="description" content="A calm, practical guide to daily journaling: how to start, prompts for anxiety and overthinking, journaling vs mood tracking, and why streaks make you quit.">
    <link rel="canonical" href="https://purposelabstudio.com/folio/journal/">
    <meta property="og:title" content="The Calm Guide to Daily Journaling — Folio">
    <meta property="og:description" content="How to start journaling and stick with it — prompts, guides, and a gentler approach. From the makers of Folio.">
    <meta property="og:url" content="https://purposelabstudio.com/folio/journal/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="PurposeLab Studio">
    <meta property="og:image" content="https://purposelabstudio.com/folio/icon.png?v=2">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="The Calm Guide to Daily Journaling — Folio">
    <meta name="twitter:description" content="How to start journaling and stick with it — prompts, guides, and a gentler approach.">
    <meta name="twitter:image" content="https://purposelabstudio.com/folio/icon.png?v=2">
    <link rel="stylesheet" href="../../style.css">
    <style>
      :root{ --paper:#F3ECDD; --paper-2:#E9DEC6; --ink:#4A3520; --accent:#9C7A3C; --accent-dark:#7A5E2C; --accent-ink:#F3ECDD; --gold:#B8892B; }
    </style>
    <link rel="icon" href="../icon.png?v=2" type="image/png">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "The Calm Guide to Daily Journaling",
      "url": "https://purposelabstudio.com/folio/journal/",
      "description": "A curated guide to daily journaling from the makers of Folio.",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "url": "https://purposelabstudio.com/blog/why-journaling-apps-make-you-feel-guilty/", "name": "Why Journaling Apps Make You Feel Guilty" },
          { "@type": "ListItem", "position": 2, "url": "https://purposelabstudio.com/blog/why-journaling-fails-and-how-to-stick-with-it/", "name": "Why Journaling Fails (And How to Stick With It)" },
          { "@type": "ListItem", "position": 3, "url": "https://purposelabstudio.com/blog/daily-journal-vs-mood-tracker-why-you-need-both/", "name": "Daily Journal vs Mood Tracker" },
          { "@type": "ListItem", "position": 4, "url": "https://purposelabstudio.com/blog/journaling-prompts-for-anxiety/", "name": "30 Journaling Prompts for Anxiety" },
          { "@type": "ListItem", "position": 5, "url": "https://purposelabstudio.com/blog/journaling-prompts-for-overthinking/", "name": "28 Journaling Prompts for Overthinking" },
          { "@type": "ListItem", "position": 6, "url": "https://purposelabstudio.com/blog/journaling-prompts-for-self-discovery/", "name": "35 Journaling Prompts for Self-Discovery" }
        ]
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://purposelabstudio.com/" },
        { "@type": "ListItem", "position": 2, "name": "Folio", "item": "https://purposelabstudio.com/folio/" },
        { "@type": "ListItem", "position": 3, "name": "Journal", "item": "https://purposelabstudio.com/folio/journal/" }
      ]
    }
    </script>
    <!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
    <script data-goatcounter="https://purposelabstudio.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "xjkggf7dd9");
    </script>
</head>
<body>
    <div class="container">
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/folio/journal/" class="active">Journal</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/apps/">More apps</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>

        <section class="hero">
            <div class="eyebrow">~/ folio / journal</div>
            <h1>The calm guide to daily journaling</h1>
            <p class="subtitle">Everything we've written about starting a journal and actually keeping it — without streaks, pressure, or guilt. Curated by the team behind <a href="/folio/">Folio</a>.</p>
        </section>

        <section class="section">
            <h2 class="section-title">Start here</h2>
            <ul class="blog-list">
                <li class="blog-item">
                    <h3><a href="/blog/why-journaling-fails-and-how-to-stick-with-it/">Why Journaling Fails (And How to Stick With It)</a></h3>
                    <p>The real reasons a journaling habit collapses in a week — and a gentler system that survives real life.</p>
                </li>
                <li class="blog-item">
                    <h3><a href="/blog/why-journaling-apps-make-you-feel-guilty/">Why Journaling Apps Make You Feel Guilty</a></h3>
                    <p>Usually it's the streak, not you. How retention mechanics turn a missed day into guilt — and what to look for instead.</p>
                </li>
                <li class="blog-item">
                    <h3><a href="/blog/daily-journal-vs-mood-tracker-why-you-need-both/">Daily Journal vs Mood Tracker: Why You Need Both</a></h3>
                    <p>How writing and mood tracking work together, and why the combination reveals patterns neither shows alone.</p>
                </li>
            </ul>

            <h2 class="section-title">Prompts for when the page is blank</h2>
            <ul class="blog-list">
                <li class="blog-item">
                    <h3><a href="/blog/journaling-prompts-for-anxiety/">30 Journaling Prompts for Anxiety</a></h3>
                    <p>Grounding, untangling worries, and reframing anxious thoughts — prompts you can use tonight.</p>
                </li>
                <li class="blog-item">
                    <h3><a href="/blog/journaling-prompts-for-overthinking/">28 Journaling Prompts for Overthinking</a></h3>
                    <p>Break the rumination loop, separate what you can control, and get to a decision.</p>
                </li>
                <li class="blog-item">
                    <h3><a href="/blog/journaling-prompts-for-self-discovery/">35 Journaling Prompts for Self-Discovery</a></h3>
                    <p>Explore your values, patterns, and what you actually want — honest prompts to understand yourself.</p>
                </li>
            </ul>
            <p style="margin-top:16px;">Need a prompt right now? Try the free <a href="/tools/journal-prompt-generator/">journaling prompt generator</a>.</p>
        </section>

        <section class="section" style="text-align:center;">
            <h2 class="section-title">A quiet place to keep it all</h2>
            <p style="color: var(--text-secondary); max-width:560px; margin:0 auto 20px;">Folio is a free, private, offline daily journal and mood tracker — no ads, no account, no streaks. Just a calm notebook for closing the day.</p>
            <a class="btn btn-primary" href="https://play.google.com/store/apps/details?id=com.purposelab.folio&amp;referrer=utm_source%3Dwebsite%26utm_medium%3Dcontenthub%26utm_campaign%3Dfolio-journal-hub" data-goatcounter-click="ps-folio-journal-hub" data-goatcounter-title="Download Folio (journal hub)">Get Folio on Google Play →</a>
            <p style="margin-top:12px;"><a href="/folio/">See everything Folio does →</a></p>
        </section>

        <footer class="footer">
            <p>&copy; 2025–2026 PurposeLab Studio. All rights reserved.</p>
            <div class="footer-links">
                <a href="https://purposelabstudio.com/privacy-policies/">Privacy Policies</a>
                <a href="/tools/">Free Tools</a>
                <a href="/support/">Support</a>
                <a href="/about/">About</a>
                <a href="/blog/rss.xml">RSS</a>
            </div>
        </footer>
    </div>
</body>
</html>
```

- [ ] **Step 2: Audit**

Run: `node scripts/audit.mjs folio/journal/index.html`
Expected: no `FAIL`. Confirm single `<h1>`, canonical, og:title, JSON-LD parses (2 blocks).

- [ ] **Step 3: Commit**

```bash
git add folio/journal/index.html
git commit -m "feat(site): add /folio/journal/ curated journaling hub"
```

---

## Task 3: Register new pages in tests + sitemap

**Files:**
- Modify: `scripts/test-site.mjs` (the `corePages` array)
- Modify: `sitemap.xml`

- [ ] **Step 1: Add pages to the test suite's page list**

In `scripts/test-site.mjs`, extend `corePages` so the new pages get SEO-invariant + JSON-LD + internal-link validation:

```javascript
const corePages = ['index.html', 'about/index.html', 'support/index.html', 'blog/index.html', '404.html', 'apps/index.html', 'folio/journal/index.html'];
```

- [ ] **Step 2: Add the two URLs to sitemap.xml**

Before the closing `</urlset>`, add:

```xml
  <url>
    <loc>https://purposelabstudio.com/apps/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.com/folio/journal/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
```

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS (0 failed). The two new pages now pass SEO invariants; their internal links resolve.

- [ ] **Step 4: Commit**

```bash
git add scripts/test-site.mjs sitemap.xml
git commit -m "test(site): register /apps/ and /folio/journal/ in suite + sitemap"
```

---

## Task 4: Create the desktop→phone QR asset

**Files:**
- Create: `assets/qr-folio.svg` (or `assets/qr-folio.png`)

- [ ] **Step 1: Generate the QR**

Generate a QR encoding the tagged Play URL and save it to `assets/qr-folio.svg`. Use the `qrcode` CLI (no repo dependency added — one-off):

Run:
```bash
npx --yes qrcode -o assets/qr-folio.svg -t svg "https://play.google.com/store/apps/details?id=com.purposelab.folio&referrer=utm_source%3Dwebsite%26utm_medium%3Dqr%26utm_campaign%3Dfolio-qr"
```
Expected: `assets/qr-folio.svg` created. If `npx qrcode` is unavailable offline, generate a 240×240 PNG via any QR tool with the same URL and save as `assets/qr-folio.png` (update the `<img src>` in Tasks 5 & 6 accordingly).

- [ ] **Step 2: Commit**

```bash
git add assets/qr-folio.svg
git commit -m "feat(site): add Folio desktop->phone QR asset"
```

---

## Task 5: Rebuild the homepage Folio-forward

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add inline styles for the new components**

Inside the existing `<style>` block in `index.html`'s head, append the QR-bridge and apps-strip styles:

```css
.qr-bridge { display:flex; align-items:center; gap:14px; margin-top:18px; padding:14px 16px;
    background: var(--paper-2); border:1px solid var(--border); border-radius: var(--radius); max-width:420px; }
.qr-bridge img { width:84px; height:84px; border-radius:8px; background:#fff; padding:4px; }
.qr-bridge .qr-copy { font-size:14px; color: var(--text-secondary); }
@media (max-width:600px){ .qr-bridge{ display:none; } }
.apps-strip { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap:12px; }
.apps-strip a { display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--border);
    border-radius: var(--radius); background: var(--paper-2); text-decoration:none; color: var(--text); }
.apps-strip img { width:32px; height:32px; border-radius:8px; }
.apps-strip .s-name { font-weight:600; font-size:14px; }
.apps-strip .s-desc { font-size:12px; color: var(--text-secondary); }
```

- [ ] **Step 2: Replace the hero**

Replace the current `<section class="hero">…</section>` (the "I build calm Android apps…" block) with a Folio hero:

```html
        <section class="hero">
            <div class="eyebrow">~/ folio</div>
            <h1>A quiet notebook for closing the day.</h1>
            <p class="subtitle">Folio is a free, private, offline daily journal &amp; mood tracker. Write a little or a lot, track moods and habits gently, and reflect on your month — no ads, no account, no streaks.</p>
            <div style="margin-top: 24px; display:flex; gap:12px; flex-wrap:wrap;">
                <a class="btn btn-primary" href="https://play.google.com/store/apps/details?id=com.purposelab.folio&amp;referrer=utm_source%3Dwebsite%26utm_medium%3Dhome%26utm_campaign%3Dhome-hero" data-goatcounter-click="ps-folio-home-hero" data-goatcounter-title="Download Folio (home hero)">Get it on Google Play</a>
                <a class="btn" href="https://apps.apple.com/us/app/folio-daily-journal-diary/id6781551692" data-goatcounter-click="ps-folio-home-hero-ios" data-goatcounter-title="Download Folio iOS (home hero)">Download on the App Store</a>
            </div>
            <div class="qr-bridge">
                <img src="/assets/qr-folio.svg" alt="QR code to install Folio on your phone">
                <span class="qr-copy"><strong>On a computer?</strong><br>Scan to install Folio on your phone.</span>
            </div>
        </section>
```

- [ ] **Step 3: Reframe the badges section as Folio's promise**

Keep the existing badges section markup (`Free · No Ads · Offline-first · Privacy-first`) — no change needed; it now reads as Folio's promise directly under the Folio hero.

- [ ] **Step 4: Replace "Our Apps" with Folio depth + journal teaser + apps strip**

Replace the entire `<section class="section"><h2 class="section-title">Our Apps</h2> … </section>` block (all five app cards) with:

```html
        <section class="section">
            <h2 class="section-title">Why people keep Folio</h2>
            <div class="philosophy">
                <div class="p-item"><h3>No streaks, no guilt</h3><p>Miss a day and nothing breaks. Folio is a calm ritual, not another thing to keep a streak on.</p></div>
                <div class="p-item"><h3>Private &amp; offline</h3><p>Every entry stays on your device, with optional app lock. No cloud, no account, no data collection.</p></div>
                <div class="p-item"><h3>Reflect, don't grind</h3><p>Gentle mood &amp; habit tracking and a monthly reflection that shows your patterns without pressure.</p></div>
            </div>
            <p style="text-align:center; margin-top:20px;">
                <a class="btn btn-primary" href="/folio/">Explore Folio →</a>
                &nbsp;·&nbsp; <a href="/folio/diary/">The Folio paper diary</a>
                &nbsp;·&nbsp; <a href="/folio/journal/">The calm guide to journaling</a>
            </p>
        </section>

        <section class="section" style="padding-top:0;">
            <h2 class="section-title">Also from PurposeLab</h2>
            <div class="apps-strip">
                <a href="/crumbs/"><img src="crumbs/icon.png" alt="Crumbs"><span><span class="s-name">Crumbs</span><br><span class="s-desc">Second brain on WhatsApp</span></span></a>
                <a href="/waterwise/"><img src="waterwise/icon.png" alt="WaterWise"><span><span class="s-name">WaterWise</span><br><span class="s-desc">Water reminder, no ads</span></span></a>
                <a href="/bplog/"><img src="bplog/icon.png" alt="BP Log"><span><span class="s-name">BP Log</span><br><span class="s-desc">Blood pressure tracker</span></span></a>
                <a href="/hushly/"><img src="hushly/icon.png" alt="Hushly"><span><span class="s-name">Hushly</span><br><span class="s-desc">Baby sleep sounds</span></span></a>
            </div>
            <p style="text-align:center; margin-top:14px;"><a href="/apps/">See all apps →</a></p>
        </section>
```

- [ ] **Step 5: Update the nav in index.html to the new global nav**

Replace the `<ul class="nav-links">…</ul>` in `index.html` with:

```html
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/folio/journal/">Journal</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/apps/">More apps</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
```

- [ ] **Step 6: Update the homepage `<title>` + meta + Organization JSON-LD focus**

Change `<title>` to `Folio — Free Private Daily Journal & Mood Tracker (Offline)` and the meta description to `Folio is a free, private, offline daily journal and mood tracker. No ads, no account, no streaks. From PurposeLab Studio.` Leave the Organization + WebSite JSON-LD intact (studio identity is still valid).

- [ ] **Step 7: Test**

Run: `npm test && node scripts/audit.mjs index.html && npm run check:analytics`
Expected: `npm test` PASS; audit no FAIL; analytics check PASS (new CTAs carry `data-goatcounter-click`). Fix any failing internal-link or analytics assertion before continuing.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(site): rebuild homepage Folio-forward with QR bridge + apps strip"
```

---

## Task 6: Upgrade the Folio landing page

**Files:**
- Modify: `folio/index.html`

- [ ] **Step 1: Add a quotable GEO intro near the top of the body**

Immediately after the Folio hero on `folio/index.html`, ensure the first paragraph is a self-contained, quotable answer (add if missing):

```html
            <p class="lead"><strong>Folio is a free, offline, private daily journal and mood tracker for Android and iOS.</strong> It has no ads, no account, and no streak pressure — just a quiet notebook for writing a line or a page, tracking your mood and habits, and reflecting on your month. Everything stays on your device, with optional app lock.</p>
```

- [ ] **Step 2: Ensure screenshots are above the fold**

If `folio/screenshots/` images aren't already near the top, add a screenshot row directly under the hero:

```html
            <div class="shots" style="display:flex; gap:12px; overflow-x:auto; margin:20px 0;">
                <img src="screenshots/1.png" alt="Folio daily journal entry screen" style="height:420px; border-radius:18px;">
                <img src="screenshots/2.png" alt="Folio mood and habit tracking" style="height:420px; border-radius:18px;">
                <img src="screenshots/3.png" alt="Folio monthly reflection" style="height:420px; border-radius:18px;">
            </div>
```
(Confirm actual filenames via `ls folio/screenshots/` and use those exact names + descriptive alt text.)

- [ ] **Step 3: Add the QR bridge next to the primary install button**

Reuse the `.qr-bridge` markup from Task 5 Step 2 (add the same CSS to this page's inline `<style>`), placing it beside the existing hero install button. Use campaign `folio-qr` (already encoded in the asset).

- [ ] **Step 4: Add the "Folio vs other journal apps" comparison table**

Add before the FAQ section:

```html
        <section class="section">
            <h2 class="section-title">Folio vs other journal apps</h2>
            <table class="compare" style="width:100%; border-collapse:collapse; font-size:14px;">
                <thead><tr>
                    <th style="text-align:left; padding:8px; border-bottom:2px solid var(--accent);">&nbsp;</th>
                    <th style="padding:8px; border-bottom:2px solid var(--accent);">Folio</th>
                    <th style="padding:8px; border-bottom:2px solid var(--accent);">Typical journal app</th>
                </tr></thead>
                <tbody>
                    <tr><td style="padding:8px;">Price</td><td style="padding:8px; text-align:center;">Free</td><td style="padding:8px; text-align:center;">Freemium / subscription</td></tr>
                    <tr><td style="padding:8px;">Ads</td><td style="padding:8px; text-align:center;">None</td><td style="padding:8px; text-align:center;">Often</td></tr>
                    <tr><td style="padding:8px;">Account required</td><td style="padding:8px; text-align:center;">No</td><td style="padding:8px; text-align:center;">Usually</td></tr>
                    <tr><td style="padding:8px;">Works offline</td><td style="padding:8px; text-align:center;">Yes</td><td style="padding:8px; text-align:center;">Sometimes</td></tr>
                    <tr><td style="padding:8px;">Streak pressure</td><td style="padding:8px; text-align:center;">None</td><td style="padding:8px; text-align:center;">Common</td></tr>
                    <tr><td style="padding:8px;">App lock</td><td style="padding:8px; text-align:center;">Yes</td><td style="padding:8px; text-align:center;">Rare</td></tr>
                    <tr><td style="padding:8px;">Your data</td><td style="padding:8px; text-align:center;">On your device</td><td style="padding:8px; text-align:center;">On their cloud</td></tr>
                </tbody>
            </table>
        </section>
```

- [ ] **Step 5: Add a link to the journal hub + update nav**

Add a prominent link to `/folio/journal/` (e.g. in the intro or a "Learn to journal" callout), and replace the nav `<ul class="nav-links">` with the new global nav (same block as Task 5 Step 5, with `Folio` marked `class="active"`).

- [ ] **Step 6: Test**

Run: `npm test && node scripts/audit.mjs folio/index.html && npm run check:analytics`
Expected: PASS / no FAIL. The existing `test-site.mjs` diary assertion `homepage/folio links to diary` still passes (folio page keeps its `/folio/diary/` link).

- [ ] **Step 7: Commit**

```bash
git add folio/index.html
git commit -m "feat(site): upgrade Folio landing (screenshots, compare table, QR, GEO intro)"
```

---

## Task 7: Extend `llms.txt` with a Folio entity block

**Files:**
- Modify: `llms.txt`

- [ ] **Step 1: Add a dedicated Folio section**

Append (or expand the existing Folio mention into) a clear entity block:

```
## Folio — Daily Journal & Mood Tracker
Folio is a free, offline, private daily journal and mood tracker for Android and iOS by PurposeLab Studio.
Key facts: no ads, no account, no subscription for core use, no streaks/guilt mechanics; all data stored locally on device with optional app lock; gentle mood + habit tracking; monthly reflection.
Best for: people who want a calm, private journaling habit without pressure or cloud accounts. India-first, works fully offline.
Guide: https://purposelabstudio.com/folio/journal/
Get it: https://play.google.com/store/apps/details?id=com.purposelab.folio | https://apps.apple.com/us/app/folio-daily-journal-diary/id6781551692
```

- [ ] **Step 2: Commit**

```bash
git add llms.txt
git commit -m "feat(seo): extend llms.txt with Folio entity block"
```

---

## Task 8: Propagate the new nav to all remaining pages

**Files:**
- Modify: all remaining `*.html` still carrying the OLD nav (39 files: every page except `index.html` and the two new pages already using the new nav). Includes `folio/index.html` if not already done in Task 6.

- [ ] **Step 1: Find every file with the old nav**

Run: `grep -rl '<li><a href="/waterwise/">WaterWise</a></li>' --include='*.html' .`
Expected: the list of files still on the old nav.

- [ ] **Step 2: Replace the nav `<ul>` in each file**

In each listed file, replace the old `<ul class="nav-links">…</ul>` (the block containing Crumbs/Folio/WaterWise/BP Log/Hushly/Blog/About/Support) with the new global nav. Preserve each page's existing `class="active"` target where it maps (`/blog/` pages keep Blog active; app pages under `/apps/`'s four apps get `More apps` active; `/about/` keeps About active; `/support/` keeps Support active; Folio pages get Folio active). Where a page has no matching active item, add none.

New block:
```html
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/folio/journal/">Journal</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/apps/">More apps</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
```

Because the nav is byte-identical across files, you may script it, but VERIFY no file is left half-edited. Do NOT touch any body content, CTA, or per-app theme — nav only.

- [ ] **Step 3: Verify no old nav remains**

Run: `grep -rl '<li><a href="/waterwise/">WaterWise</a></li>' --include='*.html' . | grep -v '/apps/index.html'`
Expected: empty output (only `apps/index.html` legitimately lists WaterWise — inside an app card, not the nav; if it appears, confirm the match is the card link, not a nav `<li>`).

- [ ] **Step 4: Full test + audit-all**

Run: `npm test && node scripts/audit.mjs --all`
Expected: `npm test` PASS (0 failed) — this proves every nav link on every page still resolves. `audit.mjs --all` exits 0 (no hard FAILs).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(site): propagate Folio-first global nav across all pages"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run the whole harness**

Run: `npm test && node scripts/audit.mjs --all && npm run check:analytics`
Expected: all PASS / exit 0.

- [ ] **Step 2: Confirm protected URLs still resolve + are in sitemap**

Run: `for u in bplog waterwise hushly crumbs best-free-journal-app best-free-blood-pressure-app best-free-water-reminder-app best-free-baby-sleep-app folio/diary; do test -f "$u/index.html" && echo "OK $u" || echo "MISSING $u"; done`
Expected: all `OK`. Then confirm `/apps/` and `/folio/journal/` are present in `sitemap.xml` (grep).

- [ ] **Step 3: Visual check**

Open `index.html` and `folio/index.html` in a browser at desktop (~1280px) and mobile (~390px) widths. Confirm: Folio hero + install buttons above the fold, QR bridge visible on desktop / hidden on mobile, "Also from PurposeLab" strip renders, comparison table readable, nav shows `Folio · Journal · Blog · More apps · About · Support`.

- [ ] **Step 4: Final commit (if any tweaks)**

```bash
git add -A
git commit -m "chore(site): final verification tweaks for Folio-prime redesign"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** Homepage rebuild (T5), `/apps/` (T1), `/folio/journal/` hub (T2), `/folio/` upgrade incl. comparison table + GEO intro + screenshots + sticky/again CTA (T6), llms.txt (T7), nav across all pages (T5 for home, T8 for rest), desktop→phone QR bridge (T4/T5/T6), tagged CTAs + analytics (T5/T6), sitemap + test registration (T3), guardrail audit (T9). All spec sections mapped.
- **Ordering:** New pages (T1,T2) precede nav propagation (T8) so `test-site.mjs` link-resolution never breaks — the critical constraint is honored.
- **No placeholders:** every code step contains real markup/commands; the only intentional "paste verbatim" is moving existing app-card blocks (T1 S2), with an exact source reference.
- **Naming consistency:** campaign slugs (`home-hero`, `folio-qr`, `folio-journal-hub`), goatcounter click ids (`ps-folio-*`), and the new nav block are identical everywhere they appear.
