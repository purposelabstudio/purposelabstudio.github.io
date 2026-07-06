# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign purposelabstudio.github.io into a crafted, developer-forward home with a shared "Warm Editorial" design system, per-app themed pages, a reader-friendly blog, and a MailerLite newsletter — without breaking SEO or adding a backend.

**Architecture:** Static HTML + a refactored `style.css` (base layer + CSS custom-property theme tokens). Each page sets its theme by overriding tokens, making app folders self-contained/liftable. Progressive-enhancement JS only (page works without it). Newsletter is a third-party embed; RSS is a hand-maintained XML file.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (tiny), self-hosted OFL serif (Fraunces) with Georgia fallback, MailerLite embed, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-07-06-website-redesign-design.md`

---

## Verification model (this is a static site, not a unit-tested app)

Traditional TDD does not apply. Each task's "test" is a concrete, checkable verification:
- **Grep checks** that preserved SEO blocks still exist (JSON-LD, canonical, OG).
- **Visual checks** by opening the file in a browser at mobile + desktop widths.
- **Link checks** for internal/external links.
- A tiny **Node link-audit script** (Task 1) is reused across tasks.

Commit after every task.

---

## Phase 1 — Foundation

### Task 1: Add a reusable link/SEO audit script

**Files:**
- Create: `scripts/audit.mjs`

- [ ] **Step 1: Create the audit script**

```js
// scripts/audit.mjs — usage: node scripts/audit.mjs <file.html> [--jsonld]
import { readFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/audit.mjs <file.html>'); process.exit(2); }
const html = readFileSync(file, 'utf8');
const checks = [
  ['canonical', /<link[^>]+rel="canonical"/i],
  ['og:title', /property="og:title"/i],
  ['viewport', /name="viewport"/i],
  ['stylesheet', /rel="stylesheet"/i],
];
let ok = true;
for (const [name, re] of checks) {
  const pass = re.test(html);
  if (!pass) ok = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
}
if (process.argv.includes('--jsonld')) {
  const count = (html.match(/application\/ld\+json/g) || []).length;
  console.log(`INFO  json-ld blocks: ${count}`);
}
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Run it against the current homepage to confirm baseline**

Run: `node scripts/audit.mjs index.html --jsonld`
Expected: all PASS, `json-ld blocks: 2`

- [ ] **Step 3: Commit**

```bash
git add scripts/audit.mjs
git commit -m "chore: add static-site SEO/link audit script"
```

---

### Task 2: Self-host the display serif (Fraunces) with Georgia fallback

**Files:**
- Create: `assets/fonts/fraunces-600.woff2`, `assets/fonts/fraunces-700.woff2`
- Create: `assets/fonts/README.md`

- [ ] **Step 1: Download Fraunces woff2 from Fontsource CDN (OFL licensed)**

Run:
```bash
mkdir -p assets/fonts
curl -fsSL -o assets/fonts/fraunces-600.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-600-normal.woff2"
curl -fsSL -o assets/fonts/fraunces-700.woff2 "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-700-normal.woff2"
```
Expected: two files, each > 10 KB.

- [ ] **Step 2: Verify the files downloaded and are real fonts**

Run: `ls -l assets/fonts/*.woff2 && file assets/fonts/fraunces-700.woff2`
Expected: both files present, non-trivial size, `Web Open Font Format`.
**If download fails:** skip self-hosting; the CSS in Task 3 already falls back to Georgia. Note it in `assets/fonts/README.md` and continue.

- [ ] **Step 3: Record provenance/license**

```markdown
<!-- assets/fonts/README.md -->
# Fonts
Fraunces (OFL 1.1) — https://github.com/undercasetype/Fraunces
Downloaded via Fontsource CDN. Used for display headings; Georgia is the fallback.
```

- [ ] **Step 4: Commit**

```bash
git add assets/fonts
git commit -m "chore: self-host Fraunces display serif (OFL)"
```

---

### Task 3: Refactor `style.css` into base layer + Warm Editorial theme tokens

**Files:**
- Modify: `style.css` (full replacement of `:root` + additions; keep filename/path)

- [ ] **Step 1: Replace the `:root` block and add `@font-face` + shared components**

Replace the top of `style.css` (the `:root {...}` block) with:

```css
/* PurposeLab Studio — Base + Theme Tokens (Warm Editorial) */
@font-face {
  font-family: 'Fraunces'; font-style: normal; font-weight: 600;
  src: url('/assets/fonts/fraunces-600.woff2') format('woff2'); font-display: swap;
}
@font-face {
  font-family: 'Fraunces'; font-style: normal; font-weight: 700;
  src: url('/assets/fonts/fraunces-700.woff2') format('woff2'); font-display: swap;
}
:root {
  /* Theme tokens — overridden per app page */
  --paper: #F7F3EA;
  --paper-2: #F1EADB;
  --ink: #2B2A26;
  --ink-soft: #5A574E;
  --accent: #2C5556;
  --accent-dark: #21403F;
  --accent-ink: #F7F3EA;
  --gold: #9A7B45;
  --border: rgba(0,0,0,.10);
  --radius: 14px;
  --max-width: 860px;
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
}
```

- [ ] **Step 2: Update base element styles to use tokens**

In `style.css`, change `body`, `.container`, `a`, `.nav*`, `.hero`, `.btn*` to consume the new tokens. Concretely:

```css
body { font-family: var(--font-body); line-height: 1.7; color: var(--ink); background: var(--paper); }
a { color: var(--accent); text-decoration: none; font-weight: 500; }
.container { max-width: var(--max-width); margin: 0 auto; padding: 0 24px; }
.hero h1 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.5px; color: var(--ink); }
.btn-primary { background: var(--accent); color: var(--accent-ink); }
.btn-primary:hover { background: var(--accent-dark); }
.eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); }
.section-title { font-family: var(--font-display); }
```

- [ ] **Step 3: Add shared newsletter block + philosophy band + reading components to `style.css`**

Append:

```css
/* Newsletter block */
.newsletter { background: var(--paper-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin: 40px 0; }
.newsletter h3 { font-family: var(--font-display); margin-bottom: 6px; }
.newsletter p { color: var(--ink-soft); font-size: 15px; }
.newsletter form, .newsletter .ml-embedded { margin-top: 14px; }
.newsletter .fallback-input { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
.newsletter .fallback-input input { flex:1; min-width:200px; padding:12px 14px; border:1px solid var(--border); border-radius:8px; font-size:15px; }
/* Philosophy band */
.philosophy { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin:40px 0; }
.philosophy .p-item h4 { font-family: var(--font-display); font-size:17px; margin-bottom:4px; }
.philosophy .p-item p { color: var(--ink-soft); font-size:14px; }
@media (max-width:640px){ .philosophy { grid-template-columns:1fr; } }
/* Article reading */
.article { max-width: 680px; margin: 0 auto; }
.article h1 { font-family: var(--font-display); font-size: 34px; line-height:1.2; }
.article h2 { font-family: var(--font-display); margin-top:1.6em; }
.article p, .article li { font-size: 18px; line-height: 1.78; }
.article blockquote { border-left:3px solid var(--accent); padding-left:16px; color:var(--ink-soft); font-style:italic; margin:1.2em 0; }
.article .meta { color: var(--ink-soft); font-family: var(--font-mono); font-size:13px; }
/* Reading progress bar */
.progress-bar { position:fixed; top:0; left:0; height:3px; width:0; background:var(--accent); z-index:100; }
/* TOC */
.toc { background:var(--paper-2); border:1px solid var(--border); border-radius:var(--radius); padding:16px 20px; margin:24px 0; }
.toc strong { font-family:var(--font-mono); font-size:12px; text-transform:uppercase; letter-spacing:.1em; color:var(--gold); }
.toc ul { list-style:none; margin-top:8px; }
.toc a { font-size:15px; }
/* Related / app CTA */
.app-cta { display:flex; align-items:center; gap:16px; background:var(--paper-2); border:1px solid var(--border); border-radius:var(--radius); padding:20px; margin:32px 0; }
.app-cta img { width:48px; height:48px; border-radius:10px; }
```

- [ ] **Step 4: Verify homepage still renders and passes audit**

Run: `node scripts/audit.mjs index.html --jsonld`
Expected: all PASS. Then open `index.html` in a browser — layout intact with new paper/serif look (cards restyled in later tasks).

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: refactor style.css into base + Warm Editorial theme tokens"
```

---

## Phase 2 — Parallel fan-out (independent; safe for concurrent subagents)

> Tasks 4–10 each touch a different file and only depend on Phase 1. They can run in parallel. Preserve every existing `<script type="application/ld+json">`, `<link rel="canonical">`, and OG/Twitter meta on each page — restyle and add only.

### Task 4: Rebuild the homepage (`index.html`)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the inline `<style>` app-card block with token-aware styles**

In the `<head>` inline `<style>`, update `.app-card` to use tokens and add a themed accent bar:

```css
.app-card { background: var(--paper-2); border:1px solid var(--border); border-radius:var(--radius); padding:24px; margin-bottom:18px; display:flex; gap:20px; border-left:4px solid var(--app-accent, var(--accent)); }
.app-name { font-family: var(--font-display); font-size:20px; font-weight:600; }
.app-card.featured { border-left-width:6px; }
```

- [ ] **Step 2: Replace hero + intro with the maker voice**

Replace the `.hero` and the following intro `<section>` with:

```html
<section class="hero">
  <div class="eyebrow">~/ purposelab</div>
  <h1>I build calm Android apps that respect you.</h1>
  <p class="subtitle">No ads. No tracking. No dark patterns. Just simple tools that do one thing well — and respect your time, money, and privacy.</p>
  <a class="btn btn-primary" href="#say-hi">Say hi &rarr;</a>
</section>
```

- [ ] **Step 3: Set per-card accent via inline style on each existing app card**

Add `style="--app-accent:#2C5556"` (Crumbs), `#C9A876` (Folio), `#29B6C8` (WaterWise), `#0D2E5C` (BP Log), `#F5B942` (Hushly) to each `.app-card`. Keep all existing links/badges/copy.

- [ ] **Step 4: Add philosophy band after the apps section**

```html
<section class="philosophy">
  <div class="p-item"><h4>One thing well</h4><p>Each app has a single clear job and does it without clutter.</p></div>
  <div class="p-item"><h4>Your data stays yours</h4><p>Offline-first. No accounts, no harvesting, no selling.</p></div>
  <div class="p-item"><h4>No dark patterns</h4><p>No nags, no fake urgency, no traps. Free means free.</p></div>
</section>
```

- [ ] **Step 5: Add newsletter block before Contact, and give Contact an id**

```html
<section class="newsletter">
  <h3>Get occasional app news</h3>
  <p>New apps and the best posts, a few times a year. No spam, unsubscribe anytime.</p>
  <!-- MAILERLITE FORM: paste embed <div class="ml-embedded" data-form="..."></div> here -->
  <div class="fallback-input"><input type="email" placeholder="you@email.com" aria-label="Email"><a class="btn btn-primary" href="mailto:purposelab.studio@gmail.com?subject=Subscribe">Subscribe</a></div>
</section>
```
Change the Contact section opening tag to `<section id="say-hi" ...>`.

- [ ] **Step 6: Verify**

Run: `node scripts/audit.mjs index.html --jsonld`
Expected: all PASS, `json-ld blocks: 2`. Open in browser: hero voice, themed cards, philosophy, newsletter render at mobile + desktop.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: rebuild homepage with maker voice, themed cards, philosophy, newsletter"
```

---

### Task 5: Theme the Crumbs page (`crumbs/index.html`)

**Files:**
- Modify: `crumbs/index.html`

- [ ] **Step 1: Add a scoped theme override block in `<head>` (after the stylesheet link)**

```html
<style>
:root{
  --paper:#F5F1E8; --paper-2:#ECE5D6; --ink:#243534;
  --accent:#2C5556; --accent-dark:#21403F; --accent-ink:#F5F1E8; --gold:#B8892B;
}
</style>
```

- [ ] **Step 2: Ensure hero uses `.eyebrow` + serif and keep all existing content/JSON-LD**

Confirm the page's H1 sits inside the shared structure and add an `.eyebrow` kicker (`~/ crumbs`) above it. Do not remove any existing SoftwareApplication/FAQ/Breadcrumb JSON-LD, canonical, OG, or Play/WhatsApp links.

- [ ] **Step 3: Verify**

Run: `node scripts/audit.mjs crumbs/index.html --jsonld`
Expected: all PASS; json-ld count unchanged from before edit. Open in browser: cozy teal/cream skin.

- [ ] **Step 4: Commit**

```bash
git add crumbs/index.html
git commit -m "feat: theme Crumbs page (cozy teal/cream)"
```

---

### Task 6: Theme the Folio page (`folio/index.html`)

**Files:**
- Modify: `folio/index.html`

- [ ] **Step 1: Add scoped theme override**

```html
<style>
:root{
  --paper:#F3ECDD; --paper-2:#E9DEC6; --ink:#4A3520;
  --accent:#9C7A3C; --accent-dark:#7A5E2C; --accent-ink:#F3ECDD; --gold:#B8892B;
}
</style>
```

- [ ] **Step 2:** Add `~/ folio` eyebrow; preserve all existing content, JSON-LD, meta, links.
- [ ] **Step 3: Verify** — `node scripts/audit.mjs folio/index.html --jsonld` → all PASS; browser shows kraft-paper skin.
- [ ] **Step 4: Commit** — `git add folio/index.html && git commit -m "feat: theme Folio page (kraft stationery)"`

---

### Task 7: Theme the WaterWise page (`waterwise/index.html`)

**Files:**
- Modify: `waterwise/index.html`

- [ ] **Step 1: Add scoped theme override**

```html
<style>
:root{
  --paper:#F2FBFC; --paper-2:#DFF4F7; --ink:#0E3A42;
  --accent:#1799AC; --accent-dark:#127484; --accent-ink:#F2FBFC; --gold:#E8804F;
}
</style>
```

- [ ] **Step 2:** Add `~/ waterwise` eyebrow; preserve content/JSON-LD/meta/links.
- [ ] **Step 3: Verify** — audit PASS; browser shows fresh cyan skin.
- [ ] **Step 4: Commit** — `git add waterwise/index.html && git commit -m "feat: theme WaterWise page (fresh cyan)"`

---

### Task 8: Theme the BP Log page (`bplog/index.html`)

**Files:**
- Modify: `bplog/index.html`

- [ ] **Step 1: Add scoped theme override**

```html
<style>
:root{
  --paper:#F4F7FB; --paper-2:#E5EDF5; --ink:#0D2E5C;
  --accent:#134A87; --accent-dark:#0D2E5C; --accent-ink:#F4F7FB; --gold:#5F9E96;
}
</style>
```

- [ ] **Step 2:** Add `~/ bplog` eyebrow; preserve content/JSON-LD/meta/links.
- [ ] **Step 3: Verify** — audit PASS; browser shows clinical navy skin, AA contrast.
- [ ] **Step 4: Commit** — `git add bplog/index.html && git commit -m "feat: theme BP Log page (clinical navy)"`

---

### Task 9: Theme the Hushly page (`hushly/index.html`) — DARK

**Files:**
- Modify: `hushly/index.html`

- [ ] **Step 1: Add scoped DARK theme override**

```html
<style>
:root{
  --paper:#211C33; --paper-2:#2A2440; --ink:#EDE7F2; --ink-soft:#B7AECB;
  --accent:#F5B942; --accent-dark:#D89E2E; --accent-ink:#211C33; --gold:#F5B942;
  --border:rgba(255,255,255,.12);
}
</style>
```

- [ ] **Step 2:** Add `~/ hushly` eyebrow; preserve content/JSON-LD/meta/links. Verify text meets WCAG AA on the indigo background (amber accent on dark, light ink text).
- [ ] **Step 3: Verify** — audit PASS; browser shows night-indigo/amber dark skin; check contrast at mobile + desktop.
- [ ] **Step 4: Commit** — `git add hushly/index.html && git commit -m "feat: theme Hushly page (dark night-indigo/amber)"`

---

### Task 10: Blog reading experience — shared JS + apply to all posts

**Files:**
- Create: `assets/blog.js`
- Modify: every `blog/*/index.html` post page

- [ ] **Step 1: Create the progressive-enhancement blog script**

```js
// assets/blog.js — reading progress + auto TOC. No-op if elements absent.
(function(){
  var bar=document.querySelector('.progress-bar');
  if(bar){ window.addEventListener('scroll',function(){
    var h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';
  },{passive:true}); }
  var toc=document.querySelector('.toc ul');
  if(toc){ var hs=document.querySelectorAll('.article h2');
    hs.forEach(function(h,i){ if(!h.id) h.id='s'+i;
      var li=document.createElement('li'); var a=document.createElement('a');
      a.href='#'+h.id; a.textContent=h.textContent; li.appendChild(a); toc.appendChild(li);
    });
    if(!hs.length) toc.closest('.toc').style.display='none';
  }
})();
```

- [ ] **Step 2: In each `blog/*/index.html`, add progress bar, TOC, script, and end-of-post app CTA**

Immediately after `<body>`, add `<div class="progress-bar"></div>`.
Directly after the post `.meta`, add:
```html
<div class="toc"><strong>On this page</strong><ul></ul></div>
```
Before `</article>` (or before footer), add the app CTA matching the post topic, e.g. for a Crumbs post:
```html
<div class="app-cta">
  <img src="/crumbs/icon.png" alt="Crumbs">
  <div><strong>Crumbs</strong> — capture on WhatsApp, recall in plain language. <a href="/crumbs/">Learn more &rarr;</a></div>
</div>
```
Topic→app map: WhatsApp/second-brain → Crumbs; journaling/mood → Folio; water/hydration → WaterWise; blood-pressure → BP Log; baby-sleep/white-noise → Hushly.
Before `</body>`, add `<script src="/assets/blog.js" defer></script>`.

- [ ] **Step 3: Verify one representative post per app-topic**

Run: `node scripts/audit.mjs blog/stop-messaging-yourself-on-whatsapp/index.html --jsonld`
Expected: all PASS; Article JSON-LD preserved. Open in browser: narrow measure, serif headings, working progress bar + TOC, correct app CTA. Disable JS → content still fully readable.

- [ ] **Step 4: Commit**

```bash
git add assets/blog.js blog/*/index.html
git commit -m "feat: reader-friendly blog posts (progress bar, TOC, app CTAs)"
```

---

## Phase 3 — Integration (serial)

### Task 11: Redesign the blog index (`blog/index.html`)

**Files:**
- Modify: `blog/index.html`

- [ ] **Step 1:** Restyle the post list into clean cards using `.blog-item` + tokens; ensure newest-first order. Add the shared newsletter block below the list and an RSS link (`<a href="/blog/rss.xml">RSS</a>`).
- [ ] **Step 2: Verify** — `node scripts/audit.mjs blog/index.html` → PASS; browser shows browsable list + newsletter + RSS link.
- [ ] **Step 3: Commit** — `git add blog/index.html && git commit -m "feat: redesign blog index with newsletter + RSS link"`

---

### Task 12: Add the RSS feed

**Files:**
- Create: `blog/rss.xml`
- Modify: `blog/index.html` and post pages `<head>` (add `<link rel="alternate" type="application/rss+xml" title="PurposeLab Blog" href="/blog/rss.xml">`)

- [ ] **Step 1: Create `blog/rss.xml`** with `<rss version="2.0">` → `<channel>` containing title, link `https://purposelabstudio.github.io/blog/`, description, and one `<item>` per existing post (title, link, `pubDate`, description) using the dates already shown on the homepage/blog index.
- [ ] **Step 2: Add the `<link rel="alternate">` head tag** to blog index + each post.
- [ ] **Step 3: Verify** — `xmllint --noout blog/rss.xml && echo OK` (or open in browser; must be well-formed XML). Expected: `OK`.
- [ ] **Step 4: Commit** — `git add blog/rss.xml blog/index.html blog/*/index.html && git commit -m "feat: add RSS feed and alternate links"`

---

### Task 13: Unify navigation + footer across all pages

**Files:**
- Modify: `index.html`, `about/index.html`, `support/index.html`, `blog/index.html`, all app pages, all blog posts

- [ ] **Step 1:** Ensure every page's `<nav class="nav">` is identical (same links/order) and the footer includes the RSS link. Set `class="active"` on the current section per page.
- [ ] **Step 2: Verify** — grep that nav link count is consistent:
Run: `grep -rl 'class="nav"' --include=index.html . | wc -l` and spot-check 3 pages in the browser.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "chore: unify nav and footer across all pages"`

---

### Task 14: Update sitemap + final audit pass

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1:** Confirm `sitemap.xml` lists `/`, all five app pages, `/blog/` + every post, `/about/`, `/support/`. Add any missing entries; update `<lastmod>` to `2026-07-06`.
- [ ] **Step 2: Full audit sweep**

Run:
```bash
for f in index.html about/index.html support/index.html blog/index.html crumbs/index.html folio/index.html waterwise/index.html bplog/index.html hushly/index.html; do echo "== $f =="; node scripts/audit.mjs "$f" --jsonld; done
```
Expected: every file all PASS; app pages retain their JSON-LD counts.

- [ ] **Step 3: Visual sweep** — open homepage, each app page, blog index, and one post at 375px and 1280px widths; confirm themes, contrast (Hushly dark), newsletter placeholder, progress bar/TOC.

- [ ] **Step 4: Commit**

```bash
git add sitemap.xml
git commit -m "chore: update sitemap and finalize redesign"
```

---

## Self-Review Notes (coverage vs. spec)

- Design system → Tasks 2–3. Homepage → Task 4. Per-app themes → Tasks 5–9.
  Blog readability → Task 10; index → 11; RSS → 12. Newsletter → shared CSS (T3) +
  blocks (T4, T11) with clearly-marked MailerLite placeholder. Nav/sitemap/SEO
  preservation → Tasks 13–14 + per-task audit steps. Subagent fan-out → Phase 2.
- No-JS degradation covered in Task 10 verification. Self-contained app folders:
  each app page loads only base `style.css` + its own `<style>` override (Tasks 5–9).
- MailerLite account creation + embed paste is an explicit owner task (out of scope).
