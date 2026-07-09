# Website Traffic & Domain-Move Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the static site fully ready to (a) drive blog traffic that converts to Play Store installs, (b) measure that funnel, and (c) migrate to a custom domain later with zero SEO loss — all with **no backend**, using only static files + embedded third-party widgets.

**Architecture:** The site stays 100% static on GitHub Pages. Every capability is either a static file edit, a copy-pasted hosted-widget snippet (analytics, newsletter), or an external dashboard (Search Console, Bing, Play Store). No database, no server, no API we maintain.

**Tech Stack:** HTML/CSS/vanilla JS (existing), GoatCounter (privacy-first hosted analytics, one script tag), Google Play install `referrer` params for attribution, GitHub Pages custom-domain via `CNAME`. Existing tooling: `node scripts/audit.mjs <file>` and `npm test` (`scripts/test-site.mjs`).

---

## Decisions & Assumptions

These are the choices baked into this plan. Change them here first if you disagree, then the tasks follow.

1. **Analytics = GoatCounter** (free, open-source, cookie-less, no consent banner needed — matches the "privacy-first" brand). Swappable for Plausible/Umami by replacing one snippet. Assumed account subdomain: `purposelab.goatcounter.com` (create at goatcounter.com; update the URL if different).
2. **Final custom domain = `purposelab.studio`** (TLD matches the brand). **This is a placeholder** — if you buy a different domain, do a global find-replace of `purposelab.studio` in the migration tasks before executing them. The domain is NOT purchased yet; Phase 5 is written so it can be executed later in one pass.
3. **Newsletter = keep the existing `mailto:` fallback for now.** Phase 4 documents the exact swap to a hosted MailerLite/Buttondown embed for when you're ready; it is optional and needs no backend.
4. **No shared templating exists** (plain hand-maintained HTML). Snippets below must be applied to **every** page; each task ends with a `grep` count to verify no page was missed.
5. **Play Store package IDs** (confirmed from the codebase):
   - Crumbs → `com.purposelab.crumbs` *(app "coming soon" — no live Play link yet; skip its CTA until live)*
   - Folio → `com.purposelab.folio` (also iOS: `id6781551692`)
   - WaterWise → `com.purposelab.waterwise`
   - BP Log → `com.purposelab.bplog`
   - Hushly → `com.purposelab.hushly`

---

## File Structure (what gets created / modified)

**Created:**
- `CNAME` — GitHub Pages custom domain (Phase 5, at move time only)
- `scripts/check-analytics.mjs` — verifies every HTML page has the analytics snippet
- `scripts/migrate-domain.sh` — one-shot domain find-replace (Phase 5)

**Modified (site-wide snippet insertions):**
- `index.html`, `about/index.html`, `support/index.html`, `blog/index.html`
- App pages: `crumbs/index.html`, `folio/index.html`, `folio/diary/index.html`, `waterwise/index.html`, `bplog/index.html`, `hushly/index.html`
- Blog posts (11): `blog/*/index.html`
- `sitemap.xml`, `robots.txt`, `blog/rss.xml`, `llms.txt` (domain + Bing verification)
- `404.html` (nav check)

**Page inventory (single source of truth for "all pages"):** 4 top-level + 6 app pages + 11 blog posts + `404.html` = **22 HTML files**.

---

## Phase 1 — Measurement (do first; everything else needs it)

### Task 1: Add GoatCounter analytics to every page

**Files:**
- Modify: all 22 HTML files — insert before `</head>` (or immediately before `</body>`)
- Create: `scripts/check-analytics.mjs`

- [ ] **Step 1: Create the GoatCounter account**

Sign up at https://www.goatcounter.com/ and note your subdomain (e.g. `purposelab`). Site code = `purposelab.goatcounter.com`.

- [ ] **Step 2: Add this exact snippet before `</head>` on all 22 pages**

```html
    <!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
    <script data-goatcounter="https://purposelab.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
```

- [ ] **Step 3: Create the verification script**

Create `scripts/check-analytics.mjs`:

```javascript
// scripts/check-analytics.mjs — fails if any HTML page is missing the analytics snippet.
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const files = globSync('**/*.html', { exclude: (p) => p.includes('node_modules') });
const NEEDLE = 'data-goatcounter=';
let missing = [];
for (const f of files) {
  if (!readFileSync(f, 'utf8').includes(NEEDLE)) missing.push(f);
}
if (missing.length) {
  console.error('MISSING analytics on:\n' + missing.map((m) => '  - ' + m).join('\n'));
  process.exit(1);
}
console.log(`PASS  analytics present on all ${files.length} HTML pages`);
```

> Note: `globSync` with `exclude` requires Node 22+. If on older Node, replace with a manual file list or `fast-glob`.

- [ ] **Step 4: Run the check**

Run: `node scripts/check-analytics.mjs`
Expected: `PASS  analytics present on all 22 HTML pages`

- [ ] **Step 5: Add npm script + commit**

In `package.json` `scripts`, add: `"check:analytics": "node scripts/check-analytics.mjs"`

```bash
git add -A
git commit -m "feat(analytics): add GoatCounter to all pages + verification script"
```

---

### Task 2: Track Play Store clicks + tag them with install referrer

Turns every "Download" link into a measurable conversion event AND lets Play Console attribute installs to the website.

**Files:**
- Modify: every HTML file containing a `play.google.com/store/apps/details` link (app pages + blog posts)

- [ ] **Step 1: Build the tagged URL for each app**

Append an install `referrer` (URL-encoded UTM) to every Play Store link. Pattern:

```
https://play.google.com/store/apps/details?id=<PKG>&referrer=utm_source%3Dwebsite%26utm_medium%3D<medium>%26utm_campaign%3D<campaign>
```

- `<medium>` = `blog` on blog posts, `apppage` on app pages, `home` on the homepage.
- `<campaign>` = the page slug (e.g. `how-to-track-bp-at-home`).

- [ ] **Step 2: Add GoatCounter click tracking to each CTA**

`count.js` auto-binds to elements with `data-goatcounter-click`. Update each CTA, e.g. BP Log in the blog post:

```html
            <a href="https://play.google.com/store/apps/details?id=com.purposelab.bplog&referrer=utm_source%3Dwebsite%26utm_medium%3Dblog%26utm_campaign%3Dtrack-bp-at-home"
               data-goatcounter-click="ps-bplog-blog-track-at-home"
               data-goatcounter-title="Download BP Log (blog: track-bp-at-home)"
               class="btn btn-primary">▶ Download BP Log</a>
```

Apply the same shape to the Hushly, WaterWise, Folio CTAs on their posts and app pages. **Skip Crumbs** (no live Play link).

- [ ] **Step 3: Verify no untagged Play links remain**

Run: `grep -rEn 'play\.google\.com/store/apps/details\?id=[a-z.]+"' --include=*.html .`
Expected: no matches (every live link should now carry `&referrer=`). Matches indicate an untagged link to fix. (Ignore `docs/`.)

- [ ] **Step 4: Run existing site tests + commit**

Run: `npm test`
Expected: PASS

```bash
git add -A
git commit -m "feat(analytics): track + referrer-tag all Play Store CTAs"
```

---

### Task 3: Fill in Bing verification + register webmaster tools

**Files:**
- Modify: `index.html` (Bing meta), external dashboards

- [ ] **Step 1: Replace the Bing placeholder**

In `index.html`, replace:

```html
    <meta name="msvalidate.01" content="BING_VERIFICATION_CODE_HERE" />
```

with the real code from https://www.bing.com/webmasters (add site → get meta tag).

- [ ] **Step 2: External registration (no code)**

- Google Search Console: confirm the existing `google-site-verification` property is verified; submit `sitemap.xml`.
- Bing Webmaster Tools: verify with the meta above; submit `sitemap.xml`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "chore(seo): add real Bing site verification code"
```

---

## Phase 2 — Conversion Funnel (stop leaking the traffic you already get)

### Task 4: Ensure every blog post funnels to its MATCHING app, above and below the fold

**Files:**
- Modify: all 11 `blog/*/index.html`

Correct post→app mapping:

| Post slug | App | Package |
|---|---|---|
| how-to-track-blood-pressure-at-home | BP Log | bplog |
| normal-blood-pressure-by-age | BP Log | bplog |
| how-to-lower-blood-pressure-naturally | BP Log | bplog |
| white-noise-baby-sleep-science | Hushly | hushly |
| baby-wont-sleep-through-night | Hushly | hushly |
| how-much-water-should-i-drink-daily | WaterWise | waterwise |
| why-water-apps-are-full-of-ads | WaterWise | waterwise |
| why-journaling-fails-and-how-to-stick-with-it | Folio | folio |
| daily-journal-vs-mood-tracker-why-you-need-both | Folio | folio |
| stop-messaging-yourself-on-whatsapp | Crumbs | crumbs (coming soon) |
| build-a-second-brain-on-whatsapp | Crumbs | crumbs (coming soon) |

- [ ] **Step 1: Add a top-of-article callout** (after the intro paragraph, before the first `<h2>`) linking to the app page (not Play Store — soft intro):

```html
            <p class="post-app-hint">💡 This is the exact problem <a href="/bplog/">BP Log</a> was built to solve — free, offline, no ads.</p>
```

For Crumbs posts, link `/crumbs/` and say "mobile apps coming soon — read how it works".

- [ ] **Step 2: Confirm the bottom `.app-cta` + Play button exist and point to the correct app** (Task 2 already tagged them). Fix any post pointing at the wrong app.

- [ ] **Step 3: Add minimal CSS for `.post-app-hint`** in `style.css`:

```css
.post-app-hint { background: var(--paper-2); border-left: 4px solid var(--accent); padding: 12px 16px; border-radius: var(--radius); margin: 20px 0; font-size: 15px; }
```

- [ ] **Step 4: Verify + commit**

Run: `for f in blog/*/index.html; do node scripts/audit.mjs "$f" || echo "AUDIT FAIL $f"; done`
Expected: all PASS

```bash
git add -A
git commit -m "feat(blog): add top-of-article app callouts, verify correct app funnel per post"
```

---

### Task 5: Add an internal-linking mesh (topical authority + longer sessions)

**Files:**
- Modify: 11 `blog/*/index.html` (Related Reading), app pages (link to relevant posts)

- [ ] **Step 1:** Ensure every post's "Related Reading" links **2 sibling posts + its app page** (BP post already does this — replicate the pattern to all posts using the mapping table above).

- [ ] **Step 2:** On each app page, add a small "From the blog" section linking its 1–2 matching posts. Example for `bplog/index.html`:

```html
        <section class="section">
            <h2 class="section-title">From the blog</h2>
            <ul class="blog-list">
                <li class="blog-item"><h3><a href="/blog/how-to-track-blood-pressure-at-home/">How to Track Blood Pressure at Home</a></h3></li>
                <li class="blog-item"><h3><a href="/blog/normal-blood-pressure-by-age/">Normal Blood Pressure by Age</a></h3></li>
            </ul>
        </section>
```

- [ ] **Step 3:** Commit

```bash
git add -A
git commit -m "feat(seo): internal-linking mesh between posts and app pages"
```

---

### Task 6: Wire up email capture on blog posts (keep mailto backend-free)

**Files:**
- Modify: 11 `blog/*/index.html`

- [ ] **Step 1:** Add the existing `form.js-subscribe` block near the end of each post (before the footer), with a launch-hook subject:

```html
        <section class="section">
            <h2 class="section-title">Get notified when new apps launch</h2>
            <form class="js-subscribe" data-subject="Blog subscribe" data-body-lead="Please subscribe this address to PurposeLab Studio app news: ">
                <input type="email" placeholder="you@example.com" required>
                <button type="submit" class="btn btn-primary">Notify me</button>
            </form>
        </section>
```

- [ ] **Step 2:** Confirm `assets/newsletter.js` is loaded on blog posts (add `<script src="/assets/newsletter.js" defer></script>` before `</body>` if missing).

- [ ] **Step 3:** Verify + commit

Run: `npm test`

```bash
git add -A
git commit -m "feat(blog): add backend-free email capture to all posts"
```

---

## Phase 3 — SEO & Content Quality

> **Two practices borrowed from the "agentic SEO" playbook (r/Agentic_SEO AMA), minus the risky parts.** We adopt the *discipline* — (1) reverse-engineer the top-ranking SERP pages before writing, and (2) a pillar+cluster internal-link structure — but NOT full auto-publishing at volume (scaled-content-abuse risk, especially for our YMYL health posts on a low-authority `github.io` subdomain) and NOT link-exchange schemes. Quality over quantity: ~20–40 genuinely useful, human-reviewed posts, not 365 auto-generated ones.

### Task 7: Retarget titles/meta toward winnable long-tail keywords

**Files:**
- Modify: `<title>`, `<meta name="description">`, `og:title`, H1 on blog posts + app pages

- [ ] **Step 1:** For each app page and post, rewrite the title to lead with a **low-competition, product-adjacent** phrase emphasizing the differentiator ("no ads / offline / free / India"). Examples:

| Page | New `<title>` direction |
|---|---|
| bplog | `Free Offline Blood Pressure Tracker (No Ads) — BP Log` |
| hushly | `Baby Sleep Sounds App With No Ads — Hushly` |
| waterwise | `Water Reminder App With No Subscription — WaterWise` |
| folio | `Offline Journal App With App Lock — Folio` |
| how-to-track-blood-pressure-at-home | keep informational head + add "with a free offline app" |

Do NOT chase pure head terms ("normal blood pressure") for ranking — keep them as informational content, but win on the long-tail modifiers.

- [ ] **Step 2:** Keep each `<title>` ≤ ~60 chars and `description` ≤ ~155 chars.

- [ ] **Step 3:** Run audit on changed files + commit

Run: `for f in bplog/index.html hushly/index.html waterwise/index.html folio/index.html; do node scripts/audit.mjs "$f"; done`

```bash
git add -A
git commit -m "feat(seo): retarget titles/meta to winnable long-tail keywords"
```

---

### Task 8: Add FAQPage schema to blog posts + E-E-A-T note to health posts

**Files:**
- Modify: blog posts (esp. the 3 BP posts + water posts)

- [ ] **Step 1:** Add a visible FAQ section + matching `FAQPage` JSON-LD (mirror the pattern already used in `hushly/index.html`). Example block:

```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "How often should I check my blood pressure at home?",
          "acceptedAnswer": { "@type": "Answer", "text": "The AHA suggests morning and evening, 2–3 readings a minute apart." } }
      ]
    }
    </script>
```

- [ ] **Step 2:** On the 3 BP posts (YMYL health), add an author/review line under the H1:

```html
            <p class="post-meta">Written by PurposeLab Studio · Figures follow American Heart Association (AHA) guidelines.</p>
```

- [ ] **Step 3:** Verify JSON-LD count + commit

Run: `for f in blog/how-to-track-blood-pressure-at-home/index.html blog/normal-blood-pressure-by-age/index.html blog/how-to-lower-blood-pressure-naturally/index.html; do node scripts/audit.mjs "$f" --jsonld; done`
Expected: PASS + `json-ld blocks: >= 2`

```bash
git add -A
git commit -m "feat(seo): FAQPage schema + E-E-A-T notes on health posts"
```

---

### Task 8A: SERP-informed outlines (do this per post BEFORE editing content)

A lightweight, manual research step so each post matches what Google already rewards. No paid tooling required — this is a checklist, not automation.

**Files:**
- Reference only (research) → then edit the relevant `blog/*/index.html`

- [ ] **Step 1: Pick the one target keyword** for the post (from the long-tail set in Task 7), e.g. `track blood pressure at home`.

- [ ] **Step 2: Fetch the current top 3–5 ranking pages** for that query and note, for each: the H2/H3 subtopics they cover, questions answered, tables/charts used, and word-count ballpark. (Manual Google search, or a free-tier SERP/scrape API like Firecrawl if you want to speed it up — optional, not required.)

- [ ] **Step 3: Build a coverage checklist** — list every subtopic the top pages cover that our post is missing, plus at least one angle they DON'T cover that we can own (our differentiator: free/offline/no-ads/India).

- [ ] **Step 4: Update the post** so it covers the must-have subtopics AND the unique angle. Keep it genuinely useful — do not stuff or template.

- [ ] **Step 5: Verify + commit** (per post)

Run: `node scripts/audit.mjs blog/<slug>/index.html`

```bash
git add blog/<slug>/index.html
git commit -m "content(seo): SERP-informed refresh of <slug>"
```

---

### Task 8B: Pillar + cluster internal-link structure (one pillar per app topic)

Group posts under a topical "pillar" page so authority concentrates and cannibalization is avoided. The app page acts as the pillar.

**Files:**
- Modify: app pages (pillar) + their cluster posts

Pillar → cluster mapping:

| Pillar (app page) | Cluster posts |
|---|---|
| `/bplog/` | how-to-track-blood-pressure-at-home, normal-blood-pressure-by-age, how-to-lower-blood-pressure-naturally |
| `/hushly/` | white-noise-baby-sleep-science, baby-wont-sleep-through-night |
| `/waterwise/` | how-much-water-should-i-drink-daily, why-water-apps-are-full-of-ads |
| `/folio/` | why-journaling-fails-and-how-to-stick-with-it, daily-journal-vs-mood-tracker-why-you-need-both |
| `/crumbs/` | stop-messaging-yourself-on-whatsapp, build-a-second-brain-on-whatsapp |

- [ ] **Step 1:** Ensure **every cluster post links UP to its pillar** (app page) in-body with descriptive anchor text (e.g. "a free offline [blood pressure tracker](/bplog/)"). Task 4 already added a top callout — confirm the anchor text is keyword-relevant, not "click here".

- [ ] **Step 2:** Ensure the **pillar (app page) links DOWN to each cluster post** (the "From the blog" section from Task 5 covers this — confirm all cluster posts are listed).

- [ ] **Step 3:** Ensure **cluster posts within the same pillar cross-link** each other via "Related Reading" (Task 5) — but do NOT cross-link posts from different pillars, to keep topical clusters clean.

- [ ] **Step 4:** Assign **one distinct target keyword per post** (no two posts targeting the same term) to prevent cannibalization — cross-check against Task 7.

- [ ] **Step 5:** Verify no orphan posts + commit

Run: `grep -rL 'From the blog' bplog/index.html hushly/index.html waterwise/index.html folio/index.html crumbs/index.html` (expected: no output — every pillar has the section)

```bash
git add -A
git commit -m "feat(seo): pillar+cluster internal-link structure per app topic"
```

---

## Phase 4 — Trust, Consistency & Housekeeping

### Task 9: Verify/repair privacy-policy links

**Files:**
- Investigate: `/privacy-policies/` (NOT present in this repo — links in `support/`, `hushly/`, blog footers point to it)

- [ ] **Step 1:** Load `https://purposelabstudio.github.io/privacy-policies/` and `.../privacy-policies/hushly.html` in a browser. If 404, either (a) create the pages here, or (b) point links to wherever the policies actually live. Play Store requires a working privacy URL, so this must resolve.

- [ ] **Step 2:** Commit any fix

```bash
git add -A
git commit -m "fix(legal): ensure privacy-policy links resolve"
```

---

### Task 10: Fix year/consistency + 404 nav

**Files:**
- Modify: footers (`© 2025` → current), `404.html`

- [ ] **Step 1:** Grep the stale year and update footers:

Run: `grep -rn "© 2025" --include=*.html .`
Update each to the current year (or `© 2025–2026`).

- [ ] **Step 2:** Confirm `404.html` includes the standard `.nav` block so lost visitors get back in. Add it if missing.

- [ ] **Step 3:** Commit

```bash
git add -A
git commit -m "chore: fix copyright year + ensure 404 has site nav"
```

---

### Task 11: Performance & IndexNow-on-publish

**Files:**
- Verify: Lighthouse; `submit-indexnow.sh`

- [ ] **Step 1:** Run Lighthouse (mobile) on home, one blog post, one app page. Target ≥ 90 Perf/SEO/Accessibility. Fix any flagged image sizing / alt text / contrast.

- [ ] **Step 2:** Confirm `submit-indexnow.sh` pings IndexNow with the current URLs and is run on each publish (document it in `package.json` scripts if useful).

- [ ] **Step 3:** Commit any fixes

```bash
git add -A
git commit -m "perf: Lighthouse fixes + confirm IndexNow submission"
```

---

## Phase 5 — Domain-Move Readiness (execute the switch LATER, in one pass)

Do NOT run this until the domain is purchased. Written so it's a single, lossless pass.

### Task 12: Pre-stage consistency (safe to do now)

- [ ] **Step 1:** Confirm every absolute URL uses exactly `https://purposelabstudio.github.io` (no trailing-slash / http variants) so a find-replace catches all. Verify:

Run: `grep -rn "purposelabstudio.github.io" --include=*.html --include=*.xml --include=*.txt . | grep -v "docs/" | wc -l`
Note the count as a baseline.

- [ ] **Step 2:** Create `scripts/migrate-domain.sh` (does NOT run automatically):

```bash
#!/usr/bin/env bash
# scripts/migrate-domain.sh <new-domain>  e.g. purposelab.studio
set -euo pipefail
NEW="${1:?usage: migrate-domain.sh <new-domain>}"
OLD="purposelabstudio.github.io"
# Update only site files, never docs/
grep -rl "$OLD" --include='*.html' --include='*.xml' --include='*.txt' . \
  | grep -v '/docs/' \
  | xargs sed -i '' "s#https://$OLD#https://$NEW#g"
echo "$NEW" > CNAME
echo "Rewrote $OLD -> $NEW and wrote CNAME. Review 'git diff' before committing."
```

- [ ] **Step 3:** Commit the script only

```bash
git add scripts/migrate-domain.sh
git commit -m "chore(domain): add domain-migration script (not yet run)"
```

### Task 13: Execute migration (LATER, when domain is bought)

- [ ] **Step 1:** Buy domain; point DNS to GitHub Pages (A/AAAA + `CNAME` per GitHub docs).
- [ ] **Step 2:** `bash scripts/migrate-domain.sh purposelab.studio` (use the real domain).
- [ ] **Step 3:** Review `git diff` — confirm canonicals, OG/Twitter URLs, `og:image`, JSON-LD, `sitemap.xml`, `robots.txt` Sitemap line, `blog/rss.xml`, `llms.txt` all updated; `docs/` untouched.
- [ ] **Step 4:** In GitHub repo settings → Pages → set custom domain + Enforce HTTPS. Keep the repo live (it serves the auto-301 from `*.github.io`).
- [ ] **Step 5:** Search Console: add the new domain property; run **Change of Address**; resubmit sitemap. Bing: same. Update Play Store website field + app privacy URLs + social bios.
- [ ] **Step 6:** Verify `curl -I https://purposelabstudio.github.io/` returns a 301 to the new domain.
- [ ] **Step 7:** Commit

```bash
git add -A
git commit -m "feat(domain): migrate to custom domain <domain>"
```

---

## Self-Review (checklist coverage)

- Measurement: Tasks 1–3 ✔ (analytics, Play-click tracking, webmaster tools)
- Conversion funnel: Tasks 4–6 ✔ (top callout, internal mesh, email capture)
- SEO/content: Tasks 7–8B ✔ (long-tail titles, FAQ schema, E-E-A-T, SERP-informed outlines, pillar+cluster structure)
- Trust/housekeeping: Tasks 9–11 ✔ (privacy links, year, 404, perf, IndexNow)
- Domain move: Tasks 12–13 ✔ (pre-stage now, execute later, 301 + Change of Address)
- **No backend introduced anywhere** ✔ — analytics/newsletter are hosted embeds; everything else is static files or external dashboards.

**Open inputs needed from you before/while executing:**
1. GoatCounter account subdomain (Task 1) — or pick a different analytics tool.
2. Bing verification code (Task 3).
3. Whether to keep `mailto:` or move to a hosted newsletter embed now (Task 6 / Phase 4).
4. Final domain name (Phase 5) — assumed `purposelab.studio`.
