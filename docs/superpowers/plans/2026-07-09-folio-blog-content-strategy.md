# Folio Blog Content Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to run this task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build a repeatable content engine that ranks Folio's blog for winnable journaling keywords, converts readers to installs, and gets Folio recommended by generative engines (ChatGPT/Perplexity/Gemini) — mostly autonomously, flagging exactly what needs the owner.

**Approach:** Research real demand → build a pillar/cluster keyword map → mass-produce human-sounding, SERP-informed posts using the on-page pattern already proven on this site (analytics, FAQ schema, internal-link mesh, IndexNow) → optimize for generative engines → distribute off-site → measure and iterate. This plan is Folio-specific but the workflow generalizes to all 5 apps.

**Folio positioning (the wedge every post reinforces):** Private, offline, no-pressure daily **journal + mood + habit tracker** with **app lock** — free, no ads, no social feed, India-friendly. Free core + premium. Android + iOS + a physical KDP diary.

---

## Reusable site pattern (already built — every new post inherits this)
- GoatCounter + Clarity analytics; Play Store CTAs with install-referrer + click tracking.
- `FAQPage` schema + visible FAQ; `BlogPosting` schema with `dateModified`.
- Top-of-article `.post-app-hint` callout → app page; "From the blog" back-link on app page.
- Pillar/cluster internal-link mesh; one target keyword per post.
- `node scripts/audit.mjs <file>`, `npm test`, `npm run check:analytics`, `bash submit-indexnow.sh`.

---

## Phase 0 — Research: find real demand (do FIRST)

### Task 0.1: Harvest real questions & language (autonomous, with fallback)
**Tools to leverage (free-first):**
- **`last30days` skill** — Reddit/X/YouTube/HN/web on "journaling habits", "journaling app recommendation", "privacy journal app", "how to stick with journaling". Full power needs `SCRAPECREATORS_API_KEY` (owner provides); otherwise runs on the WebSearch fallback.
- **YouTube MCP** (`mcp_youtube_*`, load via tool_search) — `youtube_search` + `youtube_search_suggestions` for journaling video demand and titles; `youtube_get_transcript` to mine talking points.
- **Reddit/Quora via `fetch_webpage`** — pull top threads in r/Journaling, r/DecidingToBeBetter, r/Anxiety, r/adhd, r/india.
- **Google autocomplete / People-Also-Ask / AlsoAsked / AnswerThePublic** (free) — question-shaped queries.

- [ ] **Step 1:** Run `last30days` on 4 seeds: `journaling habits`, `journaling app recommendation`, `private offline journal app`, `mood tracking`. Save raw findings to `docs/research/folio-demand-<date>.md`.
- [ ] **Step 2:** Pull YouTube search + suggestions for the same seeds; note recurring title patterns and pain points.
- [ ] **Step 3:** Extract from all sources: exact phrasings, recurring frustrations (streak guilt, privacy fear, "I quit after a week", subscription fatigue), and unanswered questions.
- [ ] **Step 4:** Output a deduped list of ~40 candidate topics with the real phrasing people use.

### Task 0.2: Turn demand into a keyword map (autonomous)
- [ ] **Step 1:** For each candidate, tag **intent** (informational / commercial / problem-solution) and **competition** (head vs long-tail).
- [ ] **Step 2:** Keep only **low-competition, long-tail, product-adjacent** terms; drop unwinnable head terms ("best journal app").
- [ ] **Step 3:** Assign **one primary keyword per post**; group into clusters (below). Deliver as a table: keyword → intent → cluster → title → priority.

---

## Phase 1 — The pillar/cluster content map

`/folio/` is the **pillar**. Clusters (one journaling "type" each), ~2–4 posts per cluster, no keyword overlap:

| Cluster | Example posts (commercial-intent first) |
|---|---|
| **Privacy / offline** (strongest wedge) | "Free Offline Journal Apps With App Lock", "Why Your Journal Shouldn't Live in the Cloud", "Journal App With App Lock: Keep Your Diary Private" |
| **Anti-subscription / no-ads** | "Free Journaling Apps Without Subscriptions", "Why Free Journal Apps Are Full of Ads" |
| **Sticking with it / no-pressure** | "How to Start Journaling and Actually Stick With It", "Journaling Without Streaks: How to Drop the Guilt" |
| **Mood tracking** (core feature) | "What Is Mood Tracking and Does It Work?", "Mood Tracker vs Journal: Why You Need Both" *(exists — pillar of this cluster)* |
| **Habit tracking** | "Habit Journaling: Track Habits Without an App That Nags" |
| **Prompts / practice** (top-of-funnel reach) | "40 Journaling Prompts for Anxiety / Self-Discovery / Gratitude", "Gratitude Journaling: A 5-Minute Daily Practice" |
| **Mental-health (YMYL — cite sources)** | "Journaling for Anxiety: What the Research Says" |
| **Alternatives / comparison** | "Day One Alternative That Works Offline and Free" |

- [ ] **Task 1.1:** Finalize the map (12–16 posts) from Phase 0 data. Mark 3 "quick-win" commercial-intent posts to write first.

---

## Phase 2 — Content production (mostly autonomous, owner reviews)

Per post, repeat this loop (this is the SERP-informed workflow from the main plan's Task 8A):

- [ ] **Step 1 (autonomous):** Reverse-engineer the current top 3–5 ranking pages for the target keyword (manual Google + `fetch_webpage`, or Firecrawl free tier). List must-have subtopics + one angle competitors miss (our differentiator).
- [ ] **Step 2 (autonomous):** Draft the post in **Folio's calm, second-person, no-hype voice** (see Style rules below), covering must-haves + the unique angle.
- [ ] **Step 3 (autonomous):** Add `FAQPage` schema + visible FAQ, top callout to `/folio/`, internal links up to pillar + across cluster, `BlogPosting` schema with today's `dateModified`.
- [ ] **Step 4 (autonomous):** `node scripts/audit.mjs`, validate JSON-LD parses, `npm test`.
- [ ] **Step 5 (MANUAL — owner):** Review for accuracy + **add one genuinely personal paragraph** (the single most effective anti-AI-feel step). YMYL posts: confirm sources/claims.
- [ ] **Step 6 (autonomous):** Commit, push, add URL to `sitemap.xml` + `submit-indexnow.sh`, run IndexNow.
- [ ] **Step 7 (MANUAL — owner):** GSC → Request Indexing for the new URL.

### Style & anti-AI rules (bake into every draft)
- Second person, warm, plain; short sentences mixed with long; scannable subheads-as-questions.
- Lead with the reader's feeling; product enters only after being useful.
- Concrete specifics (real prompts, real scenarios, Indian context: monsoon, exam stress, festivals).
- Have a POV (e.g. "streaks are why you quit"). Cut AI tells ("in today's fast-paced world", "delve", "unlock", "elevate", "moreover", tidy rule-of-three, uniform sentence length).
- Owner adds a lived-experience paragraph per post.

---

## Phase 3 — Generative Engine Optimization (GEO) (autonomous)
- [ ] **Task 3.1:** Ensure each post has a crisp, quotable one-liner definition LLMs can lift ("Folio is a free, offline journal app with app lock that…").
- [ ] **Task 3.2:** Keep comparison/listicle posts factual and structured (LLMs synthesize these for "recommend a private journal app").
- [ ] **Task 3.3:** Keep `llms.txt` current with Folio's pitch + differentiators; confirm `robots.txt` allows AI crawlers (done).
- [ ] **Task 3.4:** Keep factual claims identical across site (free, offline, app lock, no ads) so models repeat them reliably.

---

## Phase 4 — Distribution & backlinks (MOSTLY MANUAL — needs a human account)
Bing already flags "not enough inbound links." This is the growth lever SEO can't fake.
- [ ] **Task 4.1 (MANUAL):** Post/answer authentically in r/Journaling, r/DecidingToBeBetter, r/Anxiety, r/india app-recommendation threads. (Agent can draft; a human must post — automated posting risks bans + is against platform rules.)
- [ ] **Task 4.2 (MANUAL):** List Folio on AlternativeTo, app directories, "best journal app" roundups (agent drafts submissions/outreach; human sends).
- [ ] **Task 4.3 (MANUAL):** Play Store ASO — title/short-desc keywords, screenshots, reviews (agent drafts copy; owner edits listing). See the `app-store-screenshots` skill for screenshot specs.

---

## Phase 5 — Measurement & iteration (shared)
- [ ] **Task 5.1 (MANUAL):** Weekly, skim GoatCounter (top posts, Play-Store CTA clicks) + GSC (queries, impressions/clicks) + Clarity (where readers drop).
- [ ] **Task 5.2 (autonomous):** Monthly, agent reads GSC-exported queries + analytics and proposes: which posts to refresh, new gaps to fill, which CTAs underperform.
- [ ] **Task 5.3 (autonomous):** Refresh decayed/near-miss posts (page-2 keywords) with the Phase 2 loop; bump `dateModified`; re-run IndexNow.

---

## Free tools & skills to leverage (and what each costs)

| Tool / skill | Use | Truly free? |
|---|---|---|
| **GoatCounter + Clarity + GSC + Bing WMT** | Real query + behavior data | Free (owner logs in) |
| **`last30days` skill** | Reddit/X/YouTube/HN demand research | Free via WebSearch fallback; richer with `SCRAPECREATORS_API_KEY` (owner adds) |
| **YouTube MCP (`mcp_youtube_*`)** | Video demand, titles, transcripts | Free (owner's YouTube API auth) |
| **`find-skills` / skills.sh** | Pull in free SEO/writing skills (`npx skills find seo`) | Free |
| **`app-store-screenshots` skill** | ASO screenshot specs | Free |
| **`fetch_webpage`** | SERP top-page analysis, Reddit threads | Free |
| **Google autocomplete / PAA / AnswerThePublic / Keyword Surfer** | Keyword expansion | Free tier |
| **Firecrawl** | SERP/scrape automation (optional) | Free tier / API key |
| **Semrush/Ahrefs** | Competitor keyword gaps | Trial only (manual) |

- [ ] **Task T.1 (autonomous):** Run `npx skills find "seo"` and `npx skills find "content"` to check the marketplace for a battle-tested SEO/keyword skill worth installing; report options to owner before installing.

---

## Responsibility split (the answer to "what's autonomous vs manual")

**Fully autonomous (agent does end-to-end):**
- Demand research (last30days/YouTube/fetch), keyword map, SERP analysis, drafting posts, all on-page SEO/schema/internal-linking, JSON-LD validation, tests, commits, sitemap + IndexNow updates, GEO tuning, monthly analytics-driven refresh proposals, drafting Reddit/ASO/outreach copy.

**Needs the owner (manual):**
1. **Provision API keys** (optional but unlocks more): `SCRAPECREATORS_API_KEY` for last30days; confirm YouTube MCP auth.
2. **Review each post + add one personal paragraph** (kills AI-feel; verifies YMYL accuracy).
3. **GSC actions:** Request Indexing, read query reports (login-gated).
4. **Publish to communities** (Reddit/forums) and **send directory/outreach submissions** — human accounts only; automating risks bans.
5. **Play Store ASO edits** (owner's console).
6. **Approve** the final keyword map + publishing cadence.
7. **Push to prod** if you want to gate deploys (or authorize auto-push).

**Decisions needed from you before we start:**
- Publishing cadence (e.g. 2 posts/week?).
- Will you add `SCRAPECREATORS_API_KEY` (deeper research) or run research on the free web-search fallback?
- Auto-push commits, or review before each push?

---

## Suggested first execution slice
1. Phase 0 research (autonomous) → deliver the keyword map.
2. You approve the map + pick cadence.
3. Phase 2 loop on the **3 quick-win commercial-intent posts** (privacy/offline/app-lock cluster) → you review + add a personal paragraph each → publish + IndexNow.
