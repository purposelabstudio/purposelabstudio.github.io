# SEO Foundations & AEO Quick-Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the highest-ROI, no-external-dependency lessons from r/Agentic_SEO — fix internal-linking foundations and finish AEO structure — so every page is crawlable, consistently interlinked, and citeable by AI search, funnelling to app installs.

**Architecture:** 100% static GitHub Pages, hand-maintained HTML, no backend. Every change is a static-file edit verified by the existing `node scripts/test-site.mjs` suite, which we extend with new invariants so regressions can't slip back in.

**Tech Stack:** HTML5, existing `style.css`, JSON-LD schema, Node test runner (`scripts/test-site.mjs`), `scripts/audit.mjs`.

**Source spec:** `docs/superpowers/plans/2026-07-09-agentic-seo-growth.md` (strategy). This plan implements only the parts that (a) need no GSC data or paid keyword tools and (b) are verified gaps in the current codebase.

---

## Verified current state (audited 2026-07-09)

- ✅ All 5 app pages already have `SoftwareApplication` + `FAQPage` + `BreadcrumbList` JSON-LD. **No work needed** (strategy task B4 already done).
- ✅ All 11 blog posts already up-link to their app via `.post-app-hint` and `.app-cta`.
- ❌ **Nav is inconsistent.** 15 pages carry the full 8-item nav (Crumbs, Folio, WaterWise, BP Log, Hushly, Blog, About, Support). **7 pages carry a reduced nav** missing Crumbs/Folio/WaterWise: `crumbs/index.html`, `404.html`, and 5 blog posts — `how-to-track-blood-pressure-at-home`, `normal-blood-pressure-by-age`, `how-to-lower-blood-pressure-naturally`, `baby-wont-sleep-through-night`, `white-noise-baby-sleep-science`. This is a real internal-linking gap.
- ❌ **No sibling cross-linking.** Posts link *up* to their app but not *across* to the other posts in the same cluster. No "Related guides" block exists anywhere.
- ❌ **FAQPage present on only 4 of 11 posts.** Missing on 7: `stop-messaging-yourself-on-whatsapp`, `build-a-second-brain-on-whatsapp`, `daily-journal-vs-mood-tracker-why-you-need-both`, `why-journaling-fails-and-how-to-stick-with-it`, `how-to-lower-blood-pressure-naturally`, `baby-wont-sleep-through-night`, `white-noise-baby-sleep-science`.

## Clusters (single source of truth for cross-linking)

| Cluster | App (pillar) | Posts |
|---|---|---|
| Blood pressure | BP Log `/bplog/` | `how-to-track-blood-pressure-at-home`, `normal-blood-pressure-by-age`, `how-to-lower-blood-pressure-naturally` |
| Baby sleep | Hushly `/hushly/` | `white-noise-baby-sleep-science`, `baby-wont-sleep-through-night` |
| Hydration | WaterWise `/waterwise/` | `how-much-water-should-i-drink-daily`, `why-water-apps-are-full-of-ads` |
| Journaling | Folio `/folio/` | `why-journaling-fails-and-how-to-stick-with-it`, `daily-journal-vs-mood-tracker-why-you-need-both` |
| Second brain | Crumbs `/crumbs/` | `stop-messaging-yourself-on-whatsapp`, `build-a-second-brain-on-whatsapp` |

## File Structure

- **Modify:** the 7 pages with reduced nav (Task 1); the 9 posts in multi-post clusters (Task 2); the 7 posts missing FAQ schema (Task 3).
- **Modify:** `scripts/test-site.mjs` — add nav-consistency, related-guides, and FAQ-schema invariants (each task).
- **No new files, no new dependencies.**

---

## Task 1: Standardize the nav on every page (internal-linking foundation)

**Why:** r/Agentic_SEO consensus #1 — fix structure/internal linking before anything else. Every page must expose the full site graph so crawlers and users can reach every app.

**Files:**
- Modify: `crumbs/index.html`, `404.html`, `blog/how-to-track-blood-pressure-at-home/index.html`, `blog/normal-blood-pressure-by-age/index.html`, `blog/how-to-lower-blood-pressure-naturally/index.html`, `blog/baby-wont-sleep-through-night/index.html`, `blog/white-noise-baby-sleep-science/index.html`
- Modify: `scripts/test-site.mjs`

- [ ] **Step 1: Add a failing nav-consistency test.** In `scripts/test-site.mjs`, immediately before the `// Summary` comment, insert:

```js
// 9. Every page's nav links to all 5 apps + Blog/About/Support (consistent internal graph)
const NAV_TARGETS = ['/crumbs/', '/folio/', '/waterwise/', '/bplog/', '/hushly/', '/blog/', '/about/', '/support/'];
for (const p of allPages) {
  const html = read(p);
  const nav = (html.match(/<nav class="nav">([\s\S]*?)<\/nav>/) || [,''])[1];
  for (const t of NAV_TARGETS) {
    check(`${p}: nav links ${t}`, nav.includes(`href="${t}"`), 'missing from nav');
  }
}
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `node scripts/test-site.mjs`
Expected: FAIL, listing the 7 reduced-nav pages missing `/crumbs/`, `/folio/`, `/waterwise/` (and `404.html`).

- [ ] **Step 3: Replace the `<ul class="nav-links">` on each of the 7 pages with the canonical list.** Keep each page's existing `class="active"` on its own current item (blog posts → Blog is active; `crumbs` → Crumbs active; `404.html` → none active). Canonical block for a blog post (Blog active):

```html
            <ul class="nav-links">
                <li><a href="/crumbs/">Crumbs</a></li>
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/" class="active">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
```

For `crumbs/index.html` use the same list but move `class="active"` to the Crumbs `<li>` and remove it from Blog. For `404.html` use the list with no `active`.

- [ ] **Step 4: Run the test to verify it passes.**

Run: `node scripts/test-site.mjs`
Expected: PASS — `All checks passed ✓`.

- [ ] **Step 5: Commit.**

```bash
git add scripts/test-site.mjs crumbs/index.html 404.html blog/how-to-track-blood-pressure-at-home/index.html blog/normal-blood-pressure-by-age/index.html blog/how-to-lower-blood-pressure-naturally/index.html blog/baby-wont-sleep-through-night/index.html blog/white-noise-baby-sleep-science/index.html
git commit -m "fix(seo): standardize site nav across all pages for consistent internal linking"
```

---

## Task 2: Add "Related guides" cross-linking within each cluster

**Why:** r/Agentic_SEO consensus #2 — link clusters like a *web*, not just hub-and-spoke. Sibling links spread authority and keep readers (and AI crawlers) inside the topic.

**Files:**
- Modify: the 9 posts that belong to a multi-post cluster (all clusters except none — every cluster has ≥2 posts). Add one block per post linking to its sibling(s) + the pillar app.
- Modify: `scripts/test-site.mjs`

- [ ] **Step 1: Add a failing related-guides test.** In `scripts/test-site.mjs`, before `// Summary`, insert:

```js
// 10. Multi-post clusters cross-link siblings via a .related-guides block
const CLUSTERS = {
  '/bplog/': ['how-to-track-blood-pressure-at-home','normal-blood-pressure-by-age','how-to-lower-blood-pressure-naturally'],
  '/hushly/': ['white-noise-baby-sleep-science','baby-wont-sleep-through-night'],
  '/waterwise/': ['how-much-water-should-i-drink-daily','why-water-apps-are-full-of-ads'],
  '/folio/': ['why-journaling-fails-and-how-to-stick-with-it','daily-journal-vs-mood-tracker-why-you-need-both'],
  '/crumbs/': ['stop-messaging-yourself-on-whatsapp','build-a-second-brain-on-whatsapp'],
};
for (const [app, slugs] of Object.entries(CLUSTERS)) {
  for (const slug of slugs) {
    const html = read(`blog/${slug}/index.html`);
    check(`${slug}: has related-guides block`, /class="related-guides"/.test(html));
    for (const sib of slugs) {
      if (sib === slug) continue;
      check(`${slug}: related links sibling ${sib}`, html.includes(`/blog/${sib}/`), 'sibling link missing');
    }
  }
}
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `node scripts/test-site.mjs`
Expected: FAIL — every listed post reports "has related-guides block" missing.

- [ ] **Step 3: Add the block at the end of each post's `<article>`, immediately before the existing `app-cta`.** Populate it with the *other* post(s) in the same cluster plus the app link. Example for `how-to-track-blood-pressure-at-home` (BP cluster):

```html
            <aside class="related-guides">
                <h2>Related guides</h2>
                <ul>
                    <li><a href="/blog/normal-blood-pressure-by-age/">Normal Blood Pressure by Age: Chart and What Your Numbers Mean</a></li>
                    <li><a href="/blog/how-to-lower-blood-pressure-naturally/">10 Natural Ways to Lower Blood Pressure (Backed by Research)</a></li>
                    <li><a href="/bplog/">Track your own readings with BP Log — free, offline, no ads →</a></li>
                </ul>
            </aside>
```

Repeat per post, listing that post's siblings from the CLUSTERS map above and the cluster's app link. For 2-post clusters the list has one sibling + the app link.

- [ ] **Step 4: Add minimal styling.** Append to `style.css`:

```css
.related-guides{margin:40px 0 8px;padding:20px 24px;background:var(--paper-2);border-radius:var(--radius);border:1px solid var(--border)}
.related-guides h2{margin:0 0 10px;font-size:18px}
.related-guides ul{margin:0;padding-left:18px}
.related-guides li{margin:6px 0}
```

- [ ] **Step 5: Run the test to verify it passes.**

Run: `node scripts/test-site.mjs`
Expected: PASS — `All checks passed ✓`.

- [ ] **Step 6: Commit.**

```bash
git add scripts/test-site.mjs style.css blog/*/index.html
git commit -m "feat(seo): add related-guides cross-linking within topic clusters"
```

---

## Task 3: Add FAQ sections + FAQPage schema to the 7 posts missing them

**Why:** r/Agentic_SEO consensus #7/#8 — Q&A blocks get pulled into AI Overviews and win featured snippets. Four posts already do this; finish the other seven.

**Files:**
- Modify: `blog/stop-messaging-yourself-on-whatsapp/index.html`, `blog/build-a-second-brain-on-whatsapp/index.html`, `blog/daily-journal-vs-mood-tracker-why-you-need-both/index.html`, `blog/why-journaling-fails-and-how-to-stick-with-it/index.html`, `blog/how-to-lower-blood-pressure-naturally/index.html`, `blog/baby-wont-sleep-through-night/index.html`, `blog/white-noise-baby-sleep-science/index.html`
- Modify: `scripts/test-site.mjs`

**Procedure for every post (no placeholders — follow exactly):**
1. Read the post body. Pull **4–6 real questions** that the post already answers (reuse existing H2s and the reader's likely follow-ups).
2. Write each answer **answer-first, 2–4 sentences**, condensed from the post's own text (do not invent new medical/wellness claims — quote/condense what the post already states).
3. Add a visible `<section class="faq">` before the `.related-guides` block, and a matching `FAQPage` JSON-LD in `<head>` (place it next to the existing `Article` JSON-LD).

- [ ] **Step 1: Add a failing FAQ-coverage test.** In `scripts/test-site.mjs`, before `// Summary`, insert:

```js
// 11. Every blog post exposes an FAQPage (AEO)
for (const p of blogPosts) {
  const html = read(p);
  check(`${p}: has FAQPage JSON-LD`, /"@type":\s*"FAQPage"/.test(html), 'no FAQPage schema');
  check(`${p}: has visible FAQ section`, /class="faq"/.test(html), 'no visible FAQ');
}
```

- [ ] **Step 2: Run the test to verify it fails.**

Run: `node scripts/test-site.mjs`
Expected: FAIL for the 7 posts missing FAQ (the 4 existing ones already pass the JSON-LD check; add the visible `class="faq"` wrapper to them too if absent).

- [ ] **Step 3: Worked example — `blog/white-noise-baby-sleep-science/index.html`.** Add this JSON-LD in `<head>` (beside the `Article` block):

```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Is white noise safe for babies?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, when played at a safe volume and distance. Keep the sound below about 50 decibels and place the device at least 2 metres (7 feet) from the crib, and use it only for sleep rather than continuously." } },
        { "@type": "Question", "name": "Why does white noise help babies sleep?",
          "acceptedAnswer": { "@type": "Answer", "text": "White noise mimics the constant whooshing sound babies heard in the womb and masks sudden household noises that would otherwise wake them, helping them fall asleep faster and stay asleep." } },
        { "@type": "Question", "name": "How loud should white noise be for a baby?",
          "acceptedAnswer": { "@type": "Answer", "text": "Aim for around 50 decibels — roughly the level of a quiet shower heard from the next room. Louder or closer than that for long periods can risk hearing damage." } },
        { "@type": "Question", "name": "Should white noise play all night?",
          "acceptedAnswer": { "@type": "Answer", "text": "Many parents run it for the full sleep period at a safe, low volume. If you prefer, use a timer so it fades once the baby is settled; either approach is fine as long as the volume stays low." } }
      ]
    }
    </script>
```

And add the visible section before `.related-guides`:

```html
            <section class="faq">
                <h2>Frequently asked questions</h2>
                <h3>Is white noise safe for babies?</h3>
                <p>Yes, at a safe volume and distance — keep it below ~50 dB and at least 2 metres from the crib, and use it for sleep rather than around the clock.</p>
                <h3>Why does white noise help babies sleep?</h3>
                <p>It mimics the constant whoosh of the womb and masks sudden household noises, so babies fall asleep faster and stay asleep.</p>
                <h3>How loud should white noise be for a baby?</h3>
                <p>Around 50 dB — about a quiet shower from the next room. Louder or closer for long periods risks hearing damage.</p>
                <h3>Should white noise play all night?</h3>
                <p>A low, safe volume for the whole sleep period is fine; a fade-out timer works too.</p>
            </section>
```

- [ ] **Step 4: Repeat Step 3 for the remaining 6 posts**, using these question sets (answers condensed from each post's own body, answer-first, 2–4 sentences):

- `baby-wont-sleep-through-night`: *When do babies sleep through the night? / Why does my baby keep waking up? / How can I help my baby sleep longer stretches? / Is it normal for a 6-month-old to still wake at night?*
- `how-to-lower-blood-pressure-naturally`: *What is the fastest way to lower blood pressure naturally? / Which foods lower blood pressure? / How much does exercise lower blood pressure? / Can reducing salt really lower blood pressure? / How long does it take to lower blood pressure naturally?*
- `stop-messaging-yourself-on-whatsapp`: *Why is messaging yourself on WhatsApp a bad system? / How do I find old notes I sent myself? / What's a better alternative to the "Message Yourself" chat?*
- `build-a-second-brain-on-whatsapp`: *What is a second brain? / Can I build a second brain without a new app? / How do I organize notes in WhatsApp? / How do I get information back out later?*
- `daily-journal-vs-mood-tracker-why-you-need-both`: *What's the difference between a journal and a mood tracker? / Do I need both a journal and a mood tracker? / How do I combine journaling and mood tracking?*
- `why-journaling-fails-and-how-to-stick-with-it`: *Why do most people quit journaling? / How do I build a journaling habit that sticks? / How long should a daily journal entry be? / What should I write about when journaling?*

- [ ] **Step 5: Run the full suite to verify it passes.**

Run: `node scripts/test-site.mjs`
Expected: PASS — `All checks passed ✓`. Then validate JSON-LD parses (the suite's block-2 check already does this).

- [ ] **Step 6: Commit.**

```bash
git add scripts/test-site.mjs blog/*/index.html
git commit -m "feat(aeo): add FAQ sections + FAQPage schema to remaining blog posts"
```

---

## Self-Review

- **Spec coverage:** Implements strategy tasks A2 (interlinking), A5 (AEO/FAQ retrofit), and the internal-linking half of A1. B4 (app-page schema) verified already done → intentionally omitted. A3 (cannibalization), A4 (GSC 11–20), B1–B3 (commercial/comparison pages), C (free tools), D/E → deferred to follow-up plans below (they need GSC data, keyword tooling, or are large independent subsystems).
- **Placeholder scan:** FAQ answers for the exemplar post are fully written; remaining posts have concrete question lists with an explicit "condense from the post's own body" rule (grounded, not invented). No TBDs.
- **Type consistency:** CSS class names `related-guides`, `faq` match between HTML, CSS, and the test regexes. Nav targets list matches the canonical nav block.

## Follow-up plans (separate, larger subsystems — write when ready)

1. **Free web tools** (BP category checker, water-intake calculator, journaling-prompt generator, web white-noise player) — biggest compounding asset; own plan with per-tool TDD.
2. **Commercial / comparison pages** ("best free X no ads", "X vs Y", "[competitor] alternative") — needs light keyword validation.
3. **GSC-driven optimization loop** (positions 11–20, high-impression/low-CTR) — recurring; starts once Search Console has 4+ weeks of data.

---

**Plan complete and saved to `docs/superpowers/plans/2026-07-09-seo-foundations-quickwins.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
