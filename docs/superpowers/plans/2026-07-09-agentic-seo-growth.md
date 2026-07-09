# Agentic-SEO Growth Plan — Traffic → Installs

> Source: distilled from the highest-signal, most-upvoted threads in r/Agentic_SEO (July 2026) + audit of the current PurposeLab site. Companion to `2026-07-09-website-traffic-readiness.md` (that plan = measurement/plumbing; **this** plan = the content & structure strategy that actually earns the traffic).

**Goal:** Grow organic traffic and, more importantly, grow *Play Store installs*. Every page must funnel to an app. Clicks that don't convert are vanity.

**Hard constraints (unchanged):** 100% static GitHub Pages, no backend, hand-maintained HTML, privacy-first brand, India-first audience.

---

## What the subreddit actually agreed on (deduped signal)

Ignoring the hype and the tool-shilling, the same handful of points showed up in every high-upvote post/comment:

1. **Foundations beat volume.** "Most sites don't have a traffic problem, they have a structure + authority problem." Fix crawlability, architecture, and internal linking *before* writing more.
2. **Topical clusters around *buyer intent*, not isolated blogs.** Pillar + support, but linked like a *web* (cross-links), not just hub-spokes. Every article must support a product/commercial page.
3. **Fix existing pages first.** Weak metadata, keyword cannibalization, thin internal linking, stale content. Refreshing beats publishing new.
4. **Low-hanging fruit = GSC positions 11–20.** Update titles/content/links on things already ranking on page 2 to push them to page 1. Fastest wins, keeps you motivated.
5. **Commercial-intent pages convert; "how-to" traffic often doesn't.** Add "best X", "X vs Y", "X alternative", "free X" pages that match buying/install intent.
6. **Free tools are link + citation magnets.** 3–5 genuinely good calculators/generators. They earn backlinks and get cited by AI, and each can funnel to an app.
7. **Structure content for AI Overview / AEO.** Lead with the answer. Make every heading+section self-contained (LLMs chunk unpredictably). Use FAQ Q&A blocks. Name specifics (real numbers, versions, tools). Add E‑E‑A‑T signals.
8. **AI Overviews eat clicks.** Check GSC for high-impression / near-zero-click queries — you may already "rank" but AI answers inline. Target queries AI *can't* fully answer (personal, tool-driven, local).
9. **Backlinks still matter** and are the slow part. Earn them via the free tools + being genuinely citeable, not spam.
10. **`llms.txt` is a nice-to-have, not a growth lever.** Don't over-invest. (You already have one — leave it, don't expand into `llm-full.txt`.) Do real SEO.

---

## Current state (what we already have)

- **5 apps:** Crumbs (WhatsApp second brain), Folio (journal/mood), WaterWise (water reminder), BP Log (blood pressure), Hushly (baby sleep sounds).
- **11 blog posts** already forming 5 embryonic clusters: BP (3), baby sleep (2), water (2), journaling (2), second-brain/WhatsApp (2).
- Good technical baseline: sitemap, robots, RSS, canonical tags, Organization/Blog schema, GoatCounter analytics, `llms.txt`.

**Gaps vs. the subreddit playbook:**
- No **commercial/comparison pages** ("best free BP app", "X vs Y", "app without ads"). The blog is all informational → weak install intent.
- Clusters are **not wired as pillars**. No pillar page per topic; app pages aren't positioned as the commercial hub of each cluster; cross-linking is thin.
- **No free tools** (biggest missed opportunity for a tools studio — we literally build tools).
- Blog posts likely **not AEO-structured** (answer-first, FAQ schema, self-contained sections) — needs an audit.
- No **`Product`/`SoftwareApplication` + `FAQPage` structured data** on app pages → losing rich results and AI citation.

---

## The plan (priority order = ROI order from the subreddit)

### Phase A — Foundations & fix-first (do before writing anything new)

- [ ] **A1. Cluster + internal-linking map.** For each of the 5 apps, define: app page = commercial pillar; existing blog posts = support; identify missing support/commercial pages. One `draw.io`/markdown map. Deliverable: `docs/superpowers/specs/2026-07-09-topical-map.md`.
- [ ] **A2. Wire every existing blog post to its app.** Each post must (a) link up to its app page with install intent, (b) cross-link to 1–2 sibling posts in the same cluster, (c) app page links down to its best posts. Verify with a grep that no post is orphaned from its app.
- [ ] **A3. Metadata + cannibalization audit.** Check the 11 posts for duplicate/overlapping target keywords (e.g. the two WhatsApp posts, the two water posts). Give each ONE primary keyword; adjust titles/H1/description so they don't compete.
- [ ] **A4. GSC low-hanging-fruit pass (recurring).** Once GSC has data: pull queries at positions 11–20, update those pages' titles/content/links. Repeat monthly. (This is the single highest-velocity tactic in the whole subreddit.)
- [ ] **A5. AEO structural retrofit of existing posts.** For each post: answer-first opening paragraph; self-contained H2 sections; a real FAQ section + `FAQPage` schema; name specifics (numbers, AHA categories, dB levels, mL targets). This is what gets pulled into AI Overviews.

### Phase B — Commercial & comparison pages (the install-intent layer)

These match buying intent and are where installs actually come from. One per app to start.

- [ ] **B1. "Best free [category] app (no ads)" pages** — e.g. *Best free blood pressure app with no ads (India)*, *Best free baby white noise app*, *Best free water reminder app*, *Best free daily journal app with lock*. Position our app honestly as the ad-free/offline pick.
- [ ] **B2. "X vs Y" comparison pages** vs the popular competitor in each niche (the ad-heavy incumbents). Honest table: ads, price, offline, privacy. Our differentiator (free, no ads, offline) wins the comparison narrative.
- [ ] **B3. "[Competitor] alternative" pages** for the 1–2 most-searched competitor names per niche.
- [ ] **B4. Structured data on app pages.** Add `SoftwareApplication` (with `offers` = free, `applicationCategory`, `operatingSystem: Android`) + `FAQPage` to every app page. Unlocks rich results + AI citation.

### Phase C — Free web tools (link magnets + AI citations + install funnel)

Pick 3–5, build as static pages (vanilla JS, no backend — fits the stack). Each ends with a CTA to the matching app. These are the backlink/AEO engine.

- [ ] **C1. Blood-pressure category checker** — enter systolic/diastolic → AHA classification + what it means. Funnels to BP Log. (Pairs with existing BP cluster.)
- [ ] **C2. Daily water intake calculator** — weight/activity/climate → mL target. Funnels to WaterWise. (India-climate aware = differentiator.)
- [ ] **C3. Blood-pressure-by-age reference tool** — interactive version of the existing `normal-blood-pressure-by-age` post.
- [ ] **C4. White-noise player (web)** — a tiny in-browser sound player. Funnels to Hushly.
- [ ] **C5. Journaling-prompt generator** — random prompts by mood/theme. Funnels to Folio.
- [ ] **C6.** Add all tools to `sitemap.xml`, nav/footer, and the relevant cluster pillar. Submit via IndexNow (`submit-indexnow.sh` already exists).

### Phase D — Fill cluster gaps with intent-targeted content

Only after A–C. Use GSC + a budget keyword tool (subreddit consensus: DataForSEO / LowFruits are the cheap picks vs Semrush/Ahrefs). Prioritize:

- [ ] **D1. Commercial-adjacent + question content AI can't fully answer** (personal, tool-driven, India-specific long-tail). Avoid generic "what is X" that AI already answers above the fold.
- [ ] **D2. One new support post per cluster** that closes an obvious gap and links into the pillar + a tool.
- [ ] **D3. Cadence: quality over volume.** Subreddit consensus: 1 solid piece steadily > a burst then nothing. Refresh old before adding new.

### Phase E — Off-site / authority (slow lane, ongoing)

- [ ] **E1. Make the free tools the backlink pitch.** Tools earn links far more easily than blog posts.
- [ ] **E2. Genuine niche participation** (relevant subreddits/forums/communities) — helpful answers that reference our tools/apps where truly useful. No spam.
- [ ] **E3. Get listed** in "free/open/ad-free Android app" directories and privacy-app roundups (natural fit for the brand).

---

## Explicitly NOT doing (subreddit warned against these)

- ❌ Mass AI-generated "slop" blog posts / programmatic pages at volume without real data → scaled-content-abuse / manual-action risk.
- ❌ Expanding into `llm-full.txt` or chasing "LLM-only" magic files. Consensus: LLMs don't care; do real SEO.
- ❌ Chasing raw impressions / vanity traffic. We optimize for **installs**, so commercial-intent + tool pages come first.
- ❌ Buying spammy backlink packages.

---

## Success metrics (tie to installs, not just clicks)

1. **Play Store installs** attributed via GoatCounter + Play `referrer` params (from the readiness plan).
2. **GSC:** number of queries on page 1, and count of position-11–20 queries pushed up.
3. **AI Overview citations** — spot-check target queries by hand monthly.
4. **Backlinks earned by the free tools.**
5. Blog → app-page → Play click-through rate (the funnel that matters).

---

## Suggested execution order

**A (foundations) → B4 (schema, cheap + high value) → C (tools) → B1–B3 (commercial pages) → D → E.**
A and B4 are quick wins with the best effort/reward ratio; C tools are the compounding asset.
