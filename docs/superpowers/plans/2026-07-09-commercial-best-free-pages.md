# Commercial "Best Free App" Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 4 honest, install-intent "best free [category] app" landing pages — one each for BP Log, WaterWise, Hushly, Folio — that capture commercial-intent search ("best free blood pressure app", "free baby sleep sounds app no ads") and convert to Play Store installs.

**Architecture:** 100% static GitHub Pages, no backend. Each page is a static commercial landing page at a top-level slug, wired into its topic cluster (app page + blog posts + tools), the sitemap, IndexNow, `llms.txt`, and the `scripts/test-site.mjs` invariants.

**Tech Stack:** HTML5, existing `style.css`, JSON-LD (`FAQPage` + `BreadcrumbList` + `ItemList`), Node test suite.

**Source spec:** `docs/superpowers/plans/2026-07-09-agentic-seo-growth.md` Phase B (B1). Foundations + tools plans are already implemented and merged.

---

## Guardrails (READ FIRST — this is YMYL/commercial content)

1. **No fabricated competitor claims.** Do NOT invent that a named app "has ads", "sells data", or "costs money" from memory. Any statement about a *named* competitor must be verified against its live Play Store listing on the day of writing, and phrased as attribute-only + dated (e.g. "As of July 2026, per its Play Store listing, …"). If you can't verify, don't name — compare against the neutral column instead.
2. **Honest positioning only.** Our apps are free, ad-free, offline, no-account — those are true and verifiable. Sell on those, not by disparaging others.
3. **BP Log is health (YMYL).** Keep medical framing conservative, cite AHA where relevant, and keep the existing "not medical advice" disclaimer.
4. **Crumbs is excluded** — it has no live Play link ("coming soon"), so there is no install to drive yet. Add its commercial page in a later pass once it launches.
5. **Cannibalization check.** These target *category* queries ("best free blood pressure app"), distinct from the app pages (brand: "BP Log") and existing blog posts (informational). Before publishing, confirm in each page's `<title>`/H1 that the primary keyword differs from the app page and cluster posts.

## Pages & targets

| Slug | Primary query | App (CTA) | Cluster posts to link |
|---|---|---|---|
| `/best-free-blood-pressure-app/` | best free blood pressure app (no ads) | BP Log `com.purposelab.bplog` | how-to-track-blood-pressure-at-home, normal-blood-pressure-by-age |
| `/best-free-water-reminder-app/` | best free water reminder app | WaterWise `com.purposelab.waterwise` | how-much-water-should-i-drink-daily, why-water-apps-are-full-of-ads |
| `/best-free-baby-sleep-app/` | best free baby sleep sounds app | Hushly `com.purposelab.hushly` | white-noise-baby-sleep-science, baby-wont-sleep-through-night |
| `/best-free-journal-app/` | best free journal app with lock | Folio `com.purposelab.folio` | why-journaling-fails-and-how-to-stick-with-it, daily-journal-vs-mood-tracker-why-you-need-both |

## File Structure

**Created:** `best-free-blood-pressure-app/index.html`, `best-free-water-reminder-app/index.html`, `best-free-baby-sleep-app/index.html`, `best-free-journal-app/index.html`

**Modified:** `scripts/test-site.mjs` (discovery + invariant), `sitemap.xml`, `submit-indexnow.sh`, `llms.txt`, the 4 app pages + 8 cluster posts (backlinks).

---

## Task 1: Build the exemplar page (BP Log) with the honest comparison table

**Files:**
- Create: `best-free-blood-pressure-app/index.html`

- [ ] **Step 1: Create the page.** Full content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Best Free Blood Pressure App (No Ads, Offline) — 2026</title>
    <meta name="description" content="Looking for the best free blood pressure app with no ads? Here's what to look for in a BP tracker, and why an offline, ad-free, privacy-first app beats bloated alternatives.">
    <meta name="keywords" content="best free blood pressure app, blood pressure app no ads, free bp tracker, offline blood pressure app, best bp app india">
    <link rel="canonical" href="https://purposelabstudio.github.io/best-free-blood-pressure-app/">
    <meta name="author" content="PurposeLab Studio">
    <meta property="og:title" content="The Best Free Blood Pressure App (No Ads, Offline)">
    <meta property="og:description" content="What to look for in a free BP tracker — and why offline, ad-free, and private wins.">
    <meta property="og:url" content="https://purposelabstudio.github.io/best-free-blood-pressure-app/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="PurposeLab Studio">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="The Best Free Blood Pressure App (No Ads, Offline)">
    <meta name="twitter:description" content="What to look for in a free BP tracker — and why offline, ad-free, and private wins.">
    <link rel="stylesheet" href="../style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️‍🩹</text></svg>">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://purposelabstudio.github.io/" },
        { "@type": "ListItem", "position": 2, "name": "Best Free Blood Pressure App", "item": "https://purposelabstudio.github.io/best-free-blood-pressure-app/" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best free blood pressure app?", "acceptedAnswer": { "@type": "Answer", "text": "The best free blood pressure app logs readings quickly, classifies them by AHA categories, works offline, keeps your data private, and shows no ads. BP Log is built to do exactly that — free, offline, and ad-free." } },
        { "@type": "Question", "name": "Are free blood pressure apps safe for my data?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on the app. Prefer an offline, no-account app that stores readings only on your device, so your health data is never uploaded. BP Log is offline-first with no account and no cloud sync." } },
        { "@type": "Question", "name": "Can a blood pressure app replace my doctor?", "acceptedAnswer": { "@type": "Answer", "text": "No. A BP app helps you track readings and spot trends, but classifications are for reference only and are not a diagnosis. Always consult your doctor for medical decisions." } }
      ]
    }
    </script>
    <!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
    <script data-goatcounter="https://purposelabstudio.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
</head>
<body>
    <div class="container">
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/crumbs/">Crumbs</a></li>
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>

        <section class="hero">
            <div class="eyebrow">~/ best free blood pressure app</div>
            <h1>The Best Free Blood Pressure App (No Ads, Offline)</h1>
            <p class="subtitle">Most free BP apps bury a simple job — logging a reading — under ads, sign-ups, and cloud accounts. Here's what actually matters, and the honest case for a calmer pick.</p>
        </section>

        <section class="section">
            <h2 class="section-title">What to look for in a free BP app</h2>
            <ul>
                <li><strong>Fast logging</strong> — adding a reading should take seconds, not taps through menus.</li>
                <li><strong>AHA classification</strong> — each reading labelled Normal / Elevated / Stage 1 / Stage 2 so the number means something.</li>
                <li><strong>Works offline</strong> — your health history shouldn't depend on a connection or an account.</li>
                <li><strong>Private by default</strong> — data stored on your device, not uploaded to a server.</li>
                <li><strong>No ads</strong> — nothing between you and your own readings.</li>
                <li><strong>Doctor-ready export</strong> — a clean PDF you can share at an appointment.</li>
            </ul>
        </section>

        <section class="section">
            <h2 class="section-title">How BP Log compares</h2>
            <p>This table compares BP Log against what's typical of free BP apps. (Attributes for any specific named app should be verified against its current Play Store listing before you rely on them.)</p>
            <table class="compare">
                <thead><tr><th>Attribute</th><th>BP Log</th><th>Typical free BP app</th></tr></thead>
                <tbody>
                    <tr><td>Price</td><td>Free, no IAP</td><td>Free with upsells common</td></tr>
                    <tr><td>Ads</td><td>None</td><td>Often ad-supported</td></tr>
                    <tr><td>Works offline</td><td>Yes</td><td>Varies</td></tr>
                    <tr><td>Account required</td><td>No</td><td>Frequently yes</td></tr>
                    <tr><td>Data location</td><td>On device only</td><td>Often cloud-synced</td></tr>
                    <tr><td>AHA classification</td><td>Automatic</td><td>Varies</td></tr>
                    <tr><td>PDF report for doctor</td><td>Yes</td><td>Varies</td></tr>
                </tbody>
            </table>
            <p style="font-size:13px;color:var(--text-secondary);">Educational reference. AHA classification is not a medical diagnosis — always consult your doctor.</p>
        </section>

        <div class="cta">
            <h2>Try BP Log — Free, Offline, No Ads</h2>
            <p>Log readings, see AHA-classified trends, and export a clean PDF for your doctor. No account, no ads, data stays on your phone.</p>
            <a href="https://play.google.com/store/apps/details?id=com.purposelab.bplog&amp;referrer=utm_source%3Dwebsite%26utm_medium%3Dcommercial%26utm_campaign%3Dbest-free-bp-app"
               data-goatcounter-click="ps-bplog-commercial-best-free"
               data-goatcounter-title="Download BP Log (commercial: best-free-bp-app)"
               class="btn btn-primary">▶ Get BP Log on Google Play</a>
        </div>

        <section class="section">
            <h2 class="section-title">Frequently Asked Questions</h2>
            <div class="card"><h3 style="margin-bottom:8px;">What is the best free blood pressure app?</h3><p style="color:var(--text-secondary);">One that logs readings fast, classifies them by AHA categories, works offline, keeps data private, and shows no ads. BP Log is built to do exactly that.</p></div>
            <div class="card"><h3 style="margin-bottom:8px;">Are free blood pressure apps safe for my data?</h3><p style="color:var(--text-secondary);">Prefer an offline, no-account app that stores readings only on your device. BP Log is offline-first with no cloud sync.</p></div>
            <div class="card"><h3 style="margin-bottom:8px;">Can a blood pressure app replace my doctor?</h3><p style="color:var(--text-secondary);">No. Classifications are reference only, not a diagnosis. Always consult your doctor for medical decisions.</p></div>
        </section>

        <aside class="related-guides">
            <h2>Related guides</h2>
            <ul>
                <li><a href="/blog/how-to-track-blood-pressure-at-home/">How to Track Blood Pressure at Home: A Complete Guide</a></li>
                <li><a href="/blog/normal-blood-pressure-by-age/">Normal Blood Pressure by Age: Chart and What Your Numbers Mean</a></li>
                <li><a href="/tools/blood-pressure-checker/">Free Blood Pressure Category Checker →</a></li>
                <li><a href="/bplog/">BP Log — free, offline blood pressure tracker →</a></li>
            </ul>
        </aside>

        <footer class="footer">
            <p>&copy; 2025–2026 PurposeLab Studio. All rights reserved.</p>
            <div class="footer-links">
                <a href="https://purposelabstudio.github.io/privacy-policies/">Privacy Policies</a>
                <a href="/support/">Support</a>
                <a href="/about/">About</a>
                <a href="/blog/rss.xml">RSS</a>
            </div>
        </footer>
    </div>
</body>
</html>
```

- [ ] **Step 2: Add the comparison-table CSS** to `style.css`:

```css
/* Comparison table (commercial pages) */
.compare { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 15px; }
.compare th, .compare td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.compare thead th { background: var(--paper-2); }
.compare td:nth-child(2) { font-weight: 600; color: var(--ink); }
```

- [ ] **Step 3: Validate JSON-LD.**

Run: `node -e 'const fs=require("fs");const h=fs.readFileSync("best-free-blood-pressure-app/index.html","utf8");[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach((b,i)=>{JSON.parse(b[1]);console.log("block",i,"ok")})'`
Expected: `block 0 ok` / `block 1 ok`.

- [ ] **Step 4: Commit.**

```bash
git add best-free-blood-pressure-app/index.html style.css
git commit -m "feat(commercial): best free blood pressure app landing page"
```

---

## Task 2: Build the other 3 pages from the same template

Reuse the Task 1 structure exactly, changing only the enumerated values. **No named-competitor claims** — keep the "Typical free app" neutral column.

**Files:** Create `best-free-water-reminder-app/index.html`, `best-free-baby-sleep-app/index.html`, `best-free-journal-app/index.html`

- [ ] **Step 1: Water reminder page.** Slug `/best-free-water-reminder-app/`; emoji `💧`; title `The Best Free Water Reminder App (No Ads) — 2026`; app CTA → `com.purposelab.waterwise` (campaign `best-free-water-app`); "what to look for" = one-tap logging, smart reminders, streaks, offline, no ads, no paywall; compare rows = Price / Ads / Reminders / Offline / Account / Paywall; FAQ = "What is the best free water reminder app?", "Do water apps work without internet?", "Are water reminder apps free without ads?"; related-guides → `/blog/how-much-water-should-i-drink-daily/`, `/blog/why-water-apps-are-full-of-ads/`, `/tools/water-intake-calculator/`, `/waterwise/`.

- [ ] **Step 2: Baby sleep page.** Slug `/best-free-baby-sleep-app/`; emoji `🌙`; title `The Best Free Baby Sleep Sounds App (No Ads) — 2026`; app CTA → `com.purposelab.hushly` (campaign `best-free-baby-sleep-app`); criteria = curated soothing sounds, simple one-handed controls, timer, plays in background, offline, no ads; compare rows = Price / Ads / Offline / Account / One-handed use / Timer; FAQ = "What is the best free baby sleep sounds app?", "Is it safe to play sleep sounds all night?", "Do baby sleep apps work offline?" (reuse the safe-volume guidance from the white-noise post); related-guides → `/blog/white-noise-baby-sleep-science/`, `/blog/baby-wont-sleep-through-night/`, `/hushly/`.

- [ ] **Step 3: Journal page.** Slug `/best-free-journal-app/`; emoji `📓`; title `The Best Free Journal App With Lock (Private, Offline) — 2026`; app CTA → `com.purposelab.folio` (campaign `best-free-journal-app`); criteria = app lock, offline, mood + habit tracking, private (on-device), no ads, quick daily entry; compare rows = Price / Ads / App lock / Offline / Account / Mood tracking; FAQ = "What is the best free journal app?", "Which journal apps have an app lock?", "Do journaling apps work offline?"; related-guides → `/blog/why-journaling-fails-and-how-to-stick-with-it/`, `/blog/daily-journal-vs-mood-tracker-why-you-need-both/`, `/tools/journal-prompt-generator/`, `/folio/`.

- [ ] **Step 4: Validate JSON-LD for all 3** (same node command as Task 1, Step 3, per file).

- [ ] **Step 5: Commit.**

```bash
git add best-free-water-reminder-app/index.html best-free-baby-sleep-app/index.html best-free-journal-app/index.html
git commit -m "feat(commercial): best free water/baby-sleep/journal app landing pages"
```

---

## Task 3: Register pages in discovery + invariants (TDD)

**Files:** Modify `scripts/test-site.mjs`

- [ ] **Step 1: Add discovery + a failing invariant.** After the `toolPages` line add:

```js
const commercialPages = ['best-free-blood-pressure-app/index.html', 'best-free-water-reminder-app/index.html', 'best-free-baby-sleep-app/index.html', 'best-free-journal-app/index.html'];
```

Add `...commercialPages` to `allPages`. Then before `// Summary`:

```js
// 14. Commercial pages link their app's Play Store listing + carry a comparison table & FAQ
const COMMERCIAL_APP = {
  'best-free-blood-pressure-app/index.html': 'com.purposelab.bplog',
  'best-free-water-reminder-app/index.html': 'com.purposelab.waterwise',
  'best-free-baby-sleep-app/index.html': 'com.purposelab.hushly',
  'best-free-journal-app/index.html': 'com.purposelab.folio',
};
for (const [p, pkg] of Object.entries(COMMERCIAL_APP)) {
  const html = read(p);
  check(`${p}: links Play Store ${pkg}`, html.includes(`id=${pkg}`), 'no Play link');
  check(`${p}: has comparison table`, /class="compare"/.test(html), 'no compare table');
  check(`${p}: has FAQ`, /Frequently Asked Questions/i.test(html) && /"@type":\s*"FAQPage"/.test(html), 'no FAQ');
}
```

- [ ] **Step 2: Run to verify it fails, then passes once pages exist.**

Run: `npm test`
Expected: with the pages from Tasks 1–2 present, PASS — the new pages also satisfy the existing nav/canonical/OG/JSON-LD invariants (they carry the standard 8-link nav). If any invariant fails, fix that page and re-run.

- [ ] **Step 3: Commit.**

```bash
git add scripts/test-site.mjs
git commit -m "test(commercial): cover commercial pages in site invariants"
```

---

## Task 4: Wire sitemap, IndexNow, llms.txt, and internal backlinks

**Files:** Modify `sitemap.xml`, `submit-indexnow.sh`, `llms.txt`, 4 app pages, 8 cluster posts

- [ ] **Step 1: Add the 4 URLs to `sitemap.xml`** before `</urlset>` (format matches existing blocks, `changefreq monthly`, `priority 0.8`, `lastmod 2026-07-09`):

```xml
  <url>
    <loc>https://purposelabstudio.github.io/best-free-blood-pressure-app/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/best-free-water-reminder-app/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/best-free-baby-sleep-app/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/best-free-journal-app/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 2: Add the 4 URLs to `submit-indexnow.sh`** `URLS` (after the tools block):

```bash
  "https://${HOST}/best-free-blood-pressure-app/"
  "https://${HOST}/best-free-water-reminder-app/"
  "https://${HOST}/best-free-baby-sleep-app/"
  "https://${HOST}/best-free-journal-app/"
```

- [ ] **Step 3: Add a `## Comparison Guides` section to `llms.txt`** (after `## Tools`):

```markdown
## Comparison Guides

- [Best Free Blood Pressure App](https://purposelabstudio.github.io/best-free-blood-pressure-app/): What to look for in a free BP tracker and how BP Log compares — free, offline, no ads.
- [Best Free Water Reminder App](https://purposelabstudio.github.io/best-free-water-reminder-app/): How to pick a water reminder and why WaterWise is ad-free with no paywall.
- [Best Free Baby Sleep Sounds App](https://purposelabstudio.github.io/best-free-baby-sleep-app/): What matters in a baby sleep app and how Hushly compares — curated sounds, no ads.
- [Best Free Journal App With Lock](https://purposelabstudio.github.io/best-free-journal-app/): Choosing a private journal app and how Folio compares — app lock, offline, no ads.
```

- [ ] **Step 4: Backlink from each app page + cluster posts (TDD).** In `scripts/test-site.mjs` before `// Summary`:

```js
// 15. Commercial pages are internally linked from their app page and cluster posts
const COMMERCIAL_BACKLINKS = {
  '/best-free-blood-pressure-app/': ['bplog/index.html', 'blog/how-to-track-blood-pressure-at-home/index.html'],
  '/best-free-water-reminder-app/': ['waterwise/index.html', 'blog/how-much-water-should-i-drink-daily/index.html'],
  '/best-free-baby-sleep-app/': ['hushly/index.html', 'blog/white-noise-baby-sleep-science/index.html'],
  '/best-free-journal-app/': ['folio/index.html', 'blog/why-journaling-fails-and-how-to-stick-with-it/index.html'],
};
for (const [pg, pages] of Object.entries(COMMERCIAL_BACKLINKS)) {
  for (const src of pages) check(`${src}: links ${pg}`, read(src).includes(`href="${pg}"`), 'commercial link missing');
}
```

- [ ] **Step 5: Run to verify it fails, add the links, re-run.** In each app page add a contextual link (e.g. in `bplog/index.html`, a `.post-app-hint` near Features): `📊 Comparing options? See <a href="/best-free-blood-pressure-app/">the best free blood pressure app guide</a>.` In each listed cluster post, add a `<li>` to its `.related-guides` pointing to the commercial page.

Run: `npm test`
Expected: PASS (both suites).

- [ ] **Step 6: Commit.**

```bash
git add sitemap.xml submit-indexnow.sh llms.txt scripts/test-site.mjs bplog/index.html waterwise/index.html hushly/index.html folio/index.html blog/
git commit -m "feat(commercial): wire commercial pages into sitemap, IndexNow, llms.txt, and internal links"
```

---

## Task 5: Deploy + submit

- [ ] **Step 1: Final full run.** `npm test` → PASS (both suites).
- [ ] **Step 2: Smoke test.** Serve locally (`python3 -m http.server 8000`), open each `/best-free-*/` page, confirm the comparison table renders and the Play CTA points to the right package.
- [ ] **Step 3: Push** (fetch first — a second agent may be committing): `git fetch origin && git merge --ff-only origin/main && git push origin main`.
- [ ] **Step 4: IndexNow.** `bash submit-indexnow.sh` → expect HTTP 200.

---

## Self-Review

- **Spec coverage:** Implements strategy B1 (4 "best free X" commercial pages) fully, with cluster wiring (internal links), sitemap/IndexNow/llms, and test coverage. Each page drives an install CTA (the conversion goal).
- **Placeholder scan:** Task 1 page is complete literal HTML+CSS. Tasks 2 pages are deltas with every changed value enumerated (slugs, titles, packages, criteria, compare rows, FAQ questions, related links). No TBDs. Named-competitor claims are explicitly excluded by the guardrails, so there is no unverifiable content to fill.
- **Type consistency:** Slugs match across pages, discovery array, sitemap, IndexNow, llms.txt, and both test maps (`COMMERCIAL_APP`, `COMMERCIAL_BACKLINKS`). CSS class `compare` matches the invariant regex.

## Follow-up (separate plans, need a research pass)

- **"X vs Y" and "[competitor] alternative" pages** (strategy B2/B3) — require a verified-facts research pass on named competitors before writing; do not fabricate.
- **Crumbs commercial page** — once Crumbs has a live Play listing.
- **GSC positions-11–20 loop** — once Search Console has ≥4 weeks of data.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-09-commercial-best-free-pages.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.

**2. Inline Execution** — batch execution in this session with checkpoints.

Which approach?
