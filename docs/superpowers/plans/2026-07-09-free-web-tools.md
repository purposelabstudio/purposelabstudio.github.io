# Free Web Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 3 genuinely useful, static, free web tools — a water-intake calculator, a blood-pressure category checker, and a journaling-prompt generator — each a backlink/AI-citation magnet that funnels to the matching app (WaterWise, BP Log, Folio).

**Architecture:** 100% static GitHub Pages, no backend. Each tool = a folder under `tools/<slug>/` with `index.html` + a small pure-function ES module `calc.js`. The page imports `calc.js` via `<script type="module">`; a new Node test suite imports the *same* module and asserts its outputs — so the calculation logic is TDD-tested even though it runs in the browser. A `/tools/` hub page lists them, and each tool is wired into nav-consistent pages, sitemap, IndexNow, `llms.txt`, and the existing `scripts/test-site.mjs` invariants.

**Tech Stack:** HTML5, existing `style.css`, vanilla ES modules, JSON-LD (`WebApplication` + `FAQPage` + `BreadcrumbList`), Node's built-in test via plain `.mjs` assert scripts.

**Source spec:** `docs/superpowers/plans/2026-07-09-agentic-seo-growth.md` Phase C. Foundations plan (`2026-07-09-seo-foundations-quickwins.md`) is already implemented and merged.

---

## Conventions (verified from the codebase — match exactly)

- **Analytics snippet** (before `</head>`):
  ```html
  <!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
  <script data-goatcounter="https://purposelabstudio.goatcounter.com/count"
          async src="//gc.zgo.at/count.js"></script>
  ```
- **Canonical + OG locale** `en_IN`; org name `PurposeLab Studio`; base URL `https://purposelabstudio.github.io`.
- **Standard nav** (all 8 links; `scripts/test-site.mjs` check #9 enforces this on every discovered page). Tool pages are 2 levels deep, so stylesheet = `../../style.css`.
- **Footer** (verified markup):
  ```html
  <footer class="footer">
      <p>&copy; 2025–2026 PurposeLab Studio. All rights reserved.</p>
      <div class="footer-links">
          <a href="https://purposelabstudio.github.io/privacy-policies/">Privacy Policies</a>
          <a href="/support/">Support</a>
          <a href="/about/">About</a>
          <a href="/blog/rss.xml">RSS</a>
      </div>
  </footer>
  ```
- **App package IDs / referrer CTA** pattern (from blog posts):
  `https://play.google.com/store/apps/details?id=<pkg>&amp;referrer=utm_source%3Dwebsite%26utm_medium%3Dtool%26utm_campaign%3D<slug>`
  - WaterWise `com.purposelab.waterwise`, BP Log `com.purposelab.bplog`, Folio `com.purposelab.folio`.
- **`scripts/test-site.mjs` page discovery is hardcoded** (`corePages`, `appPages`, `blogPosts`, `DIARY`). New tool pages MUST be added to discovery or the SEO invariants won't run on them (Task 5).

## File Structure

**Created:**
- `tools/index.html` — tools hub
- `tools/water-intake-calculator/index.html` + `tools/water-intake-calculator/calc.js`
- `tools/blood-pressure-checker/index.html` + `tools/blood-pressure-checker/calc.js`
- `tools/journal-prompt-generator/index.html` + `tools/journal-prompt-generator/prompts.js`
- `scripts/test-tools.mjs` — unit tests for the calc modules

**Modified:**
- `scripts/test-site.mjs` (discovery + tool invariants), `package.json` (test script)
- `sitemap.xml`, `submit-indexnow.sh`, `llms.txt`
- `blog/how-much-water-should-i-drink-daily/index.html`, `blog/normal-blood-pressure-by-age/index.html`, `blog/why-journaling-fails-and-how-to-stick-with-it/index.html` (contextual tool links)
- `waterwise/index.html`, `bplog/index.html`, `folio/index.html` (contextual tool links)

---

## Task 1: Water-Intake Calculator logic (TDD, pure module first)

**Files:**
- Create: `tools/water-intake-calculator/calc.js`
- Create: `scripts/test-tools.mjs`
- Modify: `package.json`

- [ ] **Step 1: Wire a tools test runner.** Edit `package.json` `scripts.test` to run both suites:

```json
  "scripts": {
    "test": "node scripts/test-site.mjs && node scripts/test-tools.mjs",
    "audit": "node scripts/audit.mjs",
    "check:analytics": "node scripts/check-analytics.mjs"
  }
```

- [ ] **Step 2: Write the failing test.** Create `scripts/test-tools.mjs`:

```js
// scripts/test-tools.mjs — unit tests for tool calc modules.
import assert from 'node:assert/strict';
import { waterIntakeMl } from '../tools/water-intake-calculator/calc.js';

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

// Base: 33 ml per kg. +350 moderate / +700 active. +500 hot climate.
t('70kg sedentary temperate = 2310', () => assert.equal(waterIntakeMl(70, 'sedentary', 'temperate'), 2310));
t('70kg moderate temperate = 2660', () => assert.equal(waterIntakeMl(70, 'moderate', 'temperate'), 2660));
t('70kg active hot = 3510', () => assert.equal(waterIntakeMl(70, 'active', 'hot'), 3510));
t('clamps weight <30 to 30', () => assert.equal(waterIntakeMl(10, 'sedentary', 'temperate'), 990));
t('clamps weight >200 to 200', () => assert.equal(waterIntakeMl(500, 'sedentary', 'temperate'), 6600));
t('unknown activity/climate treated as none', () => assert.equal(waterIntakeMl(60, 'x', 'y'), 1980));

console.log(`\n${passed} tool checks passed ✓`);
```

- [ ] **Step 3: Run it to verify it fails.**

Run: `node scripts/test-tools.mjs`
Expected: FAIL — `Cannot find module '.../tools/water-intake-calculator/calc.js'`.

- [ ] **Step 4: Implement the module.** Create `tools/water-intake-calculator/calc.js`:

```js
// Pure water-intake estimate in millilitres. Educational, not medical advice.
export function waterIntakeMl(weightKg, activity, climate) {
  const w = Math.min(200, Math.max(30, Number(weightKg) || 0));
  let ml = w * 33;
  if (activity === 'moderate') ml += 350;
  else if (activity === 'active') ml += 700;
  if (climate === 'hot') ml += 500;
  return Math.round(ml);
}
```

- [ ] **Step 5: Run it to verify it passes.**

Run: `node scripts/test-tools.mjs`
Expected: PASS — `6 tool checks passed ✓`.

- [ ] **Step 6: Commit.**

```bash
git add package.json scripts/test-tools.mjs tools/water-intake-calculator/calc.js
git commit -m "feat(tools): water-intake calculator logic + tool test runner"
```

---

## Task 2: Blood-Pressure category checker logic (TDD)

**Files:**
- Create: `tools/blood-pressure-checker/calc.js`
- Modify: `scripts/test-tools.mjs`

- [ ] **Step 1: Add failing tests.** In `scripts/test-tools.mjs`, add the import at the top and cases at the bottom (before the final `console.log`):

```js
import { bpCategory } from '../tools/blood-pressure-checker/calc.js';
```
```js
t('normal 118/78', () => assert.equal(bpCategory(118, 78).key, 'normal'));
t('elevated 125/78', () => assert.equal(bpCategory(125, 78).key, 'elevated'));
t('stage1 132/85', () => assert.equal(bpCategory(132, 85).key, 'stage1'));
t('stage2 145/95', () => assert.equal(bpCategory(145, 95).key, 'stage2'));
t('crisis 185/125', () => assert.equal(bpCategory(185, 125).key, 'crisis'));
t('higher-of-two wins: 122/82 = stage1', () => assert.equal(bpCategory(122, 82).key, 'stage1'));
t('returns a human label', () => assert.equal(typeof bpCategory(118, 78).label, 'string'));
```

- [ ] **Step 2: Run to verify it fails.**

Run: `node scripts/test-tools.mjs`
Expected: FAIL — cannot find `blood-pressure-checker/calc.js`.

- [ ] **Step 3: Implement (AHA rules; category = the higher/worse of systolic and diastolic).** Create `tools/blood-pressure-checker/calc.js`:

```js
// AHA blood-pressure classification. Educational reference only, not a diagnosis.
export function bpCategory(systolic, diastolic) {
  const s = Number(systolic) || 0;
  const d = Number(diastolic) || 0;
  const CATS = {
    crisis:   { key: 'crisis',   label: 'Hypertensive Crisis',        note: 'Seek emergency care if this reading repeats, especially with symptoms.' },
    stage2:   { key: 'stage2',   label: 'High Blood Pressure (Stage 2)', note: 'Talk to your doctor about treatment and lifestyle changes.' },
    stage1:   { key: 'stage1',   label: 'High Blood Pressure (Stage 1)', note: 'Consider lifestyle changes and follow up with your doctor.' },
    elevated: { key: 'elevated', label: 'Elevated',                    note: 'A good time to build healthier habits before it rises further.' },
    normal:   { key: 'normal',   label: 'Normal',                      note: 'Keep up the healthy habits and re-check periodically.' },
  };
  if (s >= 180 || d >= 120) return CATS.crisis;
  if (s >= 140 || d >= 90)  return CATS.stage2;
  if (s >= 130 || d >= 80)  return CATS.stage1;
  if (s >= 120 && d < 80)   return CATS.elevated;
  return CATS.normal;
}
```

- [ ] **Step 4: Run to verify it passes.**

Run: `node scripts/test-tools.mjs`
Expected: PASS — all checks, count increased.

- [ ] **Step 5: Commit.**

```bash
git add tools/blood-pressure-checker/calc.js scripts/test-tools.mjs
git commit -m "feat(tools): blood-pressure category checker logic"
```

---

## Task 3: Journaling-prompt generator logic (TDD)

**Files:**
- Create: `tools/journal-prompt-generator/prompts.js`
- Modify: `scripts/test-tools.mjs`

- [ ] **Step 1: Add failing tests.** Add import + cases to `scripts/test-tools.mjs`:

```js
import { PROMPTS, pickPrompt } from '../tools/journal-prompt-generator/prompts.js';
```
```js
t('has at least 20 prompts', () => assert.ok(PROMPTS.length >= 20));
t('all prompts are non-empty strings', () => assert.ok(PROMPTS.every(p => typeof p === 'string' && p.trim().length > 0)));
t('pickPrompt(0) is deterministic', () => assert.equal(pickPrompt(0), PROMPTS[0]));
t('pickPrompt wraps with modulo', () => assert.equal(pickPrompt(PROMPTS.length), PROMPTS[0]));
```

- [ ] **Step 2: Run to verify it fails.**

Run: `node scripts/test-tools.mjs`
Expected: FAIL — cannot find `journal-prompt-generator/prompts.js`.

- [ ] **Step 3: Implement.** Create `tools/journal-prompt-generator/prompts.js` with a real, curated list (≥20). Use this exact content:

```js
// Curated journaling prompts. pickPrompt is deterministic for testing;
// the page passes a random index at runtime.
export const PROMPTS = [
  'What is one thing that went well today, and why?',
  'What are you grateful for right now?',
  'Describe how you feel in three words, then explain the first one.',
  'What is taking up the most space in your mind today?',
  'What would make tomorrow feel like a good day?',
  'What is a small win you had this week?',
  'What is something you are looking forward to?',
  'Who made a positive difference in your day, and how?',
  'What drained your energy today, and what restored it?',
  'What is one thing you would do differently if you could redo today?',
  'What is a worry you can let go of tonight?',
  'What did you learn about yourself this week?',
  'Describe a moment today when you felt calm.',
  'What is one boundary you want to protect this week?',
  'What is a habit you want to build, and the next tiny step for it?',
  'What made you smile recently?',
  'What is something kind you can do for yourself tomorrow?',
  'What is a challenge you are facing, and one option you have not tried?',
  'What are you proud of right now?',
  'What would you tell a friend who had the day you just had?',
  'What is one thing you want to remember about today?',
  'How did you take care of your body today?',
];

export function pickPrompt(index) {
  return PROMPTS[((index % PROMPTS.length) + PROMPTS.length) % PROMPTS.length];
}
```

- [ ] **Step 4: Run to verify it passes.**

Run: `node scripts/test-tools.mjs`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add tools/journal-prompt-generator/prompts.js scripts/test-tools.mjs
git commit -m "feat(tools): journaling-prompt generator data + picker"
```

---

## Task 4: Build the tool pages (HTML) + tools hub

Each page: standard head (with `WebApplication` + `FAQPage` + `BreadcrumbList` JSON-LD), standard 8-link nav (Blog not active — none active), hero, the interactive widget wired to its module, an app CTA, a "Related guides" aside linking to the cluster, and the standard footer. Stylesheet path is `../../style.css`.

**Files:**
- Create: `tools/water-intake-calculator/index.html`, `tools/blood-pressure-checker/index.html`, `tools/journal-prompt-generator/index.html`, `tools/index.html`

- [ ] **Step 1: Water-intake calculator page.** Create `tools/water-intake-calculator/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Water Intake Calculator — How Much Water Should You Drink?</title>
    <meta name="description" content="Free daily water intake calculator. Enter your weight, activity level, and climate to get a personalised hydration target in litres and glasses. No ads, no sign-up.">
    <meta name="keywords" content="water intake calculator, how much water should i drink, daily water calculator, hydration calculator, water intake by weight">
    <link rel="canonical" href="https://purposelabstudio.github.io/tools/water-intake-calculator/">
    <meta property="og:title" content="Daily Water Intake Calculator">
    <meta property="og:description" content="Get a personalised daily hydration target from your weight, activity, and climate. Free, no sign-up.">
    <meta property="og:url" content="https://purposelabstudio.github.io/tools/water-intake-calculator/">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="PurposeLab Studio">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Daily Water Intake Calculator">
    <meta name="twitter:description" content="Personalised daily hydration target from weight, activity, and climate. Free.">
    <link rel="stylesheet" href="../../style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💧</text></svg>">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Daily Water Intake Calculator",
      "url": "https://purposelabstudio.github.io/tools/water-intake-calculator/",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Any (web)",
      "browserRequirements": "Requires JavaScript",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "publisher": { "@type": "Organization", "name": "PurposeLab Studio", "url": "https://purposelabstudio.github.io" }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://purposelabstudio.github.io/" },
        { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://purposelabstudio.github.io/tools/" },
        { "@type": "ListItem", "position": 3, "name": "Water Intake Calculator", "item": "https://purposelabstudio.github.io/tools/water-intake-calculator/" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "How much water should I drink a day?", "acceptedAnswer": { "@type": "Answer", "text": "A common starting point is about 33 ml of water per kilogram of body weight, adjusted up for exercise and hot weather. This calculator estimates that target for you; individual needs vary." } },
        { "@type": "Question", "name": "Does exercise change how much water I need?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Moderate activity adds roughly 350 ml and vigorous activity roughly 700 ml to your daily target to replace fluids lost through sweat." } },
        { "@type": "Question", "name": "Is this calculator medical advice?", "acceptedAnswer": { "@type": "Answer", "text": "No. It is an educational estimate. If you have a heart, kidney, or other condition that affects fluid intake, follow your doctor's guidance." } }
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
            <div class="eyebrow">~/ tools / water-intake</div>
            <h1>Daily Water Intake Calculator</h1>
            <p class="subtitle">Enter your details for a personalised daily hydration target. No sign-up, no ads — the math runs entirely in your browser.</p>
        </section>

        <section class="section">
            <div class="card">
                <form id="calc" onsubmit="return false">
                    <label>Weight (kg)<br><input type="number" id="weight" min="30" max="200" value="70" inputmode="numeric" required></label>
                    <p style="margin:14px 0 4px;"><strong>Activity level</strong></p>
                    <label><input type="radio" name="activity" value="sedentary" checked> Sedentary</label>
                    <label><input type="radio" name="activity" value="moderate"> Moderate (30–60 min/day)</label>
                    <label><input type="radio" name="activity" value="active"> Active (intense/long)</label>
                    <p style="margin:14px 0 4px;"><strong>Climate</strong></p>
                    <label><input type="radio" name="climate" value="temperate" checked> Temperate</label>
                    <label><input type="radio" name="climate" value="hot"> Hot / humid</label>
                    <p style="margin-top:16px;"><button type="submit" class="btn btn-primary" id="go">Calculate</button></p>
                </form>
                <div id="result" role="status" aria-live="polite" style="margin-top:8px;"></div>
            </div>
            <p style="font-size:13px;color:var(--text-secondary);">Educational estimate only, not medical advice. People with heart or kidney conditions should follow their doctor's guidance.</p>
        </section>

        <div class="app-cta">
            <img src="/waterwise/icon.png" alt="WaterWise">
            <div><strong>WaterWise</strong> — hit your target with one-tap logging and gentle reminders, no ads. <a href="/waterwise/">Learn more &rarr;</a></div>
        </div>

        <aside class="related-guides">
            <h2>Related guides</h2>
            <ul>
                <li><a href="/blog/how-much-water-should-i-drink-daily/">How Much Water Should I Actually Drink? The Science Behind Daily Hydration Goals</a></li>
                <li><a href="/blog/why-water-apps-are-full-of-ads/">Why Water Tracking Apps Are Full of Ads (And What to Do About It)</a></li>
                <li><a href="/waterwise/">WaterWise — ad-free water reminder &rarr;</a></li>
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
    <script type="module">
        import { waterIntakeMl } from './calc.js';
        const $ = (s) => document.querySelector(s);
        $('#calc').addEventListener('submit', () => {
            const w = $('#weight').value;
            const a = document.querySelector('input[name=activity]:checked').value;
            const c = document.querySelector('input[name=climate]:checked').value;
            const ml = waterIntakeMl(w, a, c);
            const litres = (ml / 1000).toFixed(1);
            const glasses = Math.round(ml / 250);
            $('#result').innerHTML = `<p style="font-size:20px;margin:8px 0;"><strong>${litres} litres/day</strong> — about ${glasses} glasses (250 ml each).</p>`;
        });
    </script>
</body>
</html>
```

- [ ] **Step 2: Blood-pressure checker page.** Create `tools/blood-pressure-checker/index.html` using the SAME structure as Step 1 with these differences: title `Blood Pressure Category Checker — AHA Classification`; description/keywords about BP categories; emoji `❤️‍🩹`; `WebApplication` name `Blood Pressure Category Checker`; breadcrumb name `Blood Pressure Checker`; FAQ Q&As about AHA categories (reuse the three AHA answers from `bplog/index.html`); app CTA → `/bplog/` with icon `/bplog/icon.png`; related-guides linking `/blog/normal-blood-pressure-by-age/`, `/blog/how-to-track-blood-pressure-at-home/`, `/bplog/`. Form:

```html
                <form id="calc" onsubmit="return false">
                    <label>Systolic (top)<br><input type="number" id="sys" min="60" max="260" value="118" inputmode="numeric" required></label>
                    <label style="display:block;margin-top:10px;">Diastolic (bottom)<br><input type="number" id="dia" min="40" max="160" value="78" inputmode="numeric" required></label>
                    <p style="margin-top:16px;"><button type="submit" class="btn btn-primary">Check category</button></p>
                </form>
                <div id="result" role="status" aria-live="polite" style="margin-top:8px;"></div>
```

Module script:

```html
    <script type="module">
        import { bpCategory } from './calc.js';
        const $ = (s) => document.querySelector(s);
        $('#calc').addEventListener('submit', () => {
            const r = bpCategory($('#sys').value, $('#dia').value);
            $('#result').innerHTML = `<p style="font-size:20px;margin:8px 0;"><strong>${r.label}</strong></p><p style="color:var(--text-secondary);">${r.note}</p><p style="font-size:13px;color:var(--text-secondary);">Reference only — not a diagnosis. Always confirm with your doctor.</p>`;
        });
    </script>
```

- [ ] **Step 3: Journaling-prompt generator page.** Create `tools/journal-prompt-generator/index.html` using the SAME structure: title `Journaling Prompt Generator — Free Daily Writing Prompts`; emoji `📝`; `WebApplication` name `Journaling Prompt Generator`; FAQ Q&As reused from `blog/why-journaling-fails-and-how-to-stick-with-it/` (the four added earlier); app CTA → `/folio/` with icon `/folio/icon.png`; related-guides linking `/blog/why-journaling-fails-and-how-to-stick-with-it/`, `/blog/daily-journal-vs-mood-tracker-why-you-need-both/`, `/folio/`. Widget:

```html
                <div class="card" style="text-align:center;">
                    <p id="prompt" style="font-size:22px;line-height:1.4;margin:8px 0 20px;">Tap the button for a prompt to write about.</p>
                    <button class="btn btn-primary" id="go">Give me a prompt</button>
                </div>
```

Module script (imports `prompts.js`):

```html
    <script type="module">
        import { PROMPTS, pickPrompt } from './prompts.js';
        const el = document.querySelector('#prompt');
        document.querySelector('#go').addEventListener('click', () => {
            el.textContent = pickPrompt(Math.floor(Math.random() * PROMPTS.length));
        });
    </script>
```

- [ ] **Step 4: Tools hub page.** Create `tools/index.html` — standard head (title `Free Tools — PurposeLab Studio`, canonical `.../tools/`, stylesheet `../style.css`, analytics), standard 8-link nav, hero, and a `.card` list linking the three tools with one-line descriptions, then the standard footer. Include a `BreadcrumbList` (Home → Tools) and an `ItemList` JSON-LD of the three tools.

- [ ] **Step 5: Manual smoke test.** Run a local server and click each tool:

Run: `python3 -m http.server 8000` then open `http://localhost:8000/tools/`
Expected: each calculator/generator returns a result; no console errors (ES modules load over http, not `file://`).

- [ ] **Step 6: Commit.**

```bash
git add tools/
git commit -m "feat(tools): water/BP/journal tool pages + tools hub"
```

---

## Task 5: Wire tools into discovery, invariants, sitemap, IndexNow, llms.txt

**Files:**
- Modify: `scripts/test-site.mjs`, `sitemap.xml`, `submit-indexnow.sh`, `llms.txt`

- [ ] **Step 1: Add tool pages to test discovery + a tool invariant.** In `scripts/test-site.mjs`, after the `appPages` line add:

```js
const toolPages = ['tools/index.html', 'tools/water-intake-calculator/index.html', 'tools/blood-pressure-checker/index.html', 'tools/journal-prompt-generator/index.html'];
```

Add `...toolPages` to the `allPages` array. Then add a failing invariant before `// Summary`:

```js
// 12. Each interactive tool imports its module and links to its app
const TOOL_APP = {
  'tools/water-intake-calculator/index.html': '/waterwise/',
  'tools/blood-pressure-checker/index.html': '/bplog/',
  'tools/journal-prompt-generator/index.html': '/folio/',
};
for (const [p, app] of Object.entries(TOOL_APP)) {
  const html = read(p);
  check(`${p}: uses ES module`, /<script type="module">/.test(html), 'no module script');
  check(`${p}: links its app ${app}`, html.includes(`href="${app}"`), 'no app link');
  check(`${p}: has WebApplication schema`, /"@type":\s*"WebApplication"/.test(html));
}
```

- [ ] **Step 2: Run the suite.**

Run: `npm test`
Expected: initially FAIL if any tool page is missing a nav link/schema; fix the offending page, then PASS both suites. (The nav-consistency check #9 now also runs on all 4 tool pages — they must carry all 8 nav links.)

- [ ] **Step 3: Add the four tool URLs to `sitemap.xml`** (before `</urlset>`), matching the existing block format, `changefreq monthly`, `priority 0.7`, `lastmod 2026-07-09`:

```xml
  <url>
    <loc>https://purposelabstudio.github.io/tools/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/tools/water-intake-calculator/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/tools/blood-pressure-checker/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://purposelabstudio.github.io/tools/journal-prompt-generator/</loc>
    <lastmod>2026-07-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

- [ ] **Step 4: Add the four URLs to `submit-indexnow.sh`** `URLS` array (after the `/blog/` entry):

```bash
  "https://${HOST}/tools/"
  "https://${HOST}/tools/water-intake-calculator/"
  "https://${HOST}/tools/blood-pressure-checker/"
  "https://${HOST}/tools/journal-prompt-generator/"
```

- [ ] **Step 5: Add a `## Tools` section to `llms.txt`** (after `## Apps`):

```markdown
## Tools

- [Daily Water Intake Calculator](https://purposelabstudio.github.io/tools/water-intake-calculator/): Free calculator — enter weight, activity, and climate for a personalised daily hydration target. Pairs with WaterWise.
- [Blood Pressure Category Checker](https://purposelabstudio.github.io/tools/blood-pressure-checker/): Enter systolic/diastolic to see the AHA category. Educational reference. Pairs with BP Log.
- [Journaling Prompt Generator](https://purposelabstudio.github.io/tools/journal-prompt-generator/): Free daily writing prompts to beat the blank page. Pairs with Folio.
```

- [ ] **Step 6: Run the full suite and commit.**

Run: `npm test`
Expected: PASS (both suites).

```bash
git add scripts/test-site.mjs sitemap.xml submit-indexnow.sh llms.txt
git commit -m "feat(tools): register tools in discovery, sitemap, IndexNow, llms.txt"
```

---

## Task 6: Contextual internal links from cluster posts + app pages

**Why:** tools need internal links to be crawled and to pass authority. Link each tool from its matching blog post and app page.

**Files:**
- Modify: `blog/how-much-water-should-i-drink-daily/index.html`, `blog/normal-blood-pressure-by-age/index.html`, `blog/why-journaling-fails-and-how-to-stick-with-it/index.html`, `waterwise/index.html`, `bplog/index.html`, `folio/index.html`

- [ ] **Step 1: Add a failing link test.** In `scripts/test-site.mjs` before `// Summary`:

```js
// 13. Tools are internally linked from their cluster post and app page
const TOOL_BACKLINKS = {
  '/tools/water-intake-calculator/': ['blog/how-much-water-should-i-drink-daily/index.html', 'waterwise/index.html'],
  '/tools/blood-pressure-checker/': ['blog/normal-blood-pressure-by-age/index.html', 'bplog/index.html'],
  '/tools/journal-prompt-generator/': ['blog/why-journaling-fails-and-how-to-stick-with-it/index.html', 'folio/index.html'],
};
for (const [tool, pages] of Object.entries(TOOL_BACKLINKS)) {
  for (const pg of pages) check(`${pg}: links ${tool}`, read(pg).includes(`href="${tool}"`), 'tool link missing');
}
```

- [ ] **Step 2: Run to verify it fails.**

Run: `node scripts/test-site.mjs`
Expected: FAIL — 6 missing tool links.

- [ ] **Step 3: Add each link.** In each blog post, add to its existing `.related-guides` `<ul>` a list item pointing to the tool, e.g. in `blog/how-much-water-should-i-drink-daily/index.html`:

```html
                    <li><a href="/tools/water-intake-calculator/">Try the free Daily Water Intake Calculator →</a></li>
```

In each app page, add one contextual link (inside the page body, e.g. near the features/FAQ) — for `waterwise/index.html`:

```html
            <p class="post-app-hint">💧 Not sure how much to aim for? Try our free <a href="/tools/water-intake-calculator/">Daily Water Intake Calculator</a>.</p>
```

Repeat analogously for BP (`/tools/blood-pressure-checker/` in `normal-blood-pressure-by-age` + `bplog`) and journaling (`/tools/journal-prompt-generator/` in `why-journaling-fails-and-how-to-stick-with-it` + `folio`).

- [ ] **Step 4: Run to verify it passes.**

Run: `npm test`
Expected: PASS (both suites).

- [ ] **Step 5: Commit.**

```bash
git add blog/ waterwise/index.html bplog/index.html folio/index.html scripts/test-site.mjs
git commit -m "feat(tools): cross-link tools from cluster posts and app pages"
```

---

## Self-Review

- **Spec coverage:** Implements strategy Phase C (C1 water, C2/C3 BP checker — the by-age post already covers the static chart, so the checker subsumes C3, C5 journaling) + C6 (sitemap/nav/IndexNow). C4 (white-noise web player) deferred: it needs hosted audio assets and is a distinct build — note it as a follow-up. Each tool funnels to its app (install goal).
- **Placeholder scan:** All calc modules, tests, and the water page are complete literal code. BP and journal pages are specified as deltas from the fully-written water page (same structure) with every differing value enumerated — an engineer has all values needed. No TBDs.
- **Type consistency:** Exported names match between module, page import, and test: `waterIntakeMl`, `bpCategory` (returns `{key,label,note}`), `PROMPTS`/`pickPrompt`. Tool slugs match across pages, tests, sitemap, IndexNow, and llms.txt.

## Follow-up (separate plans)

- **White-noise web player** (Hushly) — needs royalty-free/self-hosted audio + a minimal player; distinct asset-and-licensing scope.
- **Commercial / comparison pages** ("best free X no ads", "X vs Y", "[competitor] alternative").
- **GSC positions-11–20 optimization loop** (once Search Console has ≥4 weeks of data).

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-09-free-web-tools.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.

**2. Inline Execution** — batch execution in this session with checkpoints.

Which approach?
