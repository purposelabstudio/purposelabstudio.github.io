# Paper Products Monetization Plan

> **SUPERSEDED, 2026-08-03.** The studio chose to pursue **sellable PDF downloads only** — no KDP, no print-on-demand, no affiliate. See [2026-08-03-sellable-pdfs.md](2026-08-03-sellable-pdfs.md). This document is kept for its research (§1) and its competitor-watch method, both of which remain valid.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to work this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the studio's offering surface — a shop, a funnel and the first paid products — so that revenue exists to receive traffic when content work brings it. Deliberately built *before* traffic, not after.

**Architecture:** Free printable stays free forever as the SEO and email-capture asset. Money comes from (a) a digital tablet edition of the Folio Diary, (b) a differentiated physical log book on Amazon KDP using the already-proven Folio Diary pipeline, and (c) on-brand affiliate on buyer-intent health pages.

**Companion research:** [../../commerce-offerings-and-competitors.md](../../commerce-offerings-and-competitors.md) — full offerings catalogue and competitor teardown. Read it first.

**Tech stack:** Static GitHub Pages site, print-CSS HTML rendered by headless Chromium (`page.pdf()`) — same generator architecture as [2026-07-07-folio-diary-print-kdp.md](2026-07-07-folio-diary-print-kdp.md). Amazon KDP for print + fulfilment. No payment infrastructure until Phase 3.

---

## 1. What the research actually found (2026-08-03)

All evidence below was collected today. Re-verify before acting on it more than ~90 days from now.

### 1.1 "Free" is baked into printable demand

Google autocomplete (`suggestqueries.google.com`, `gl=in` and `gl=us`) for every printable niche we could sell into:

| Seed | Free-intent suggestions returned |
|---|---|
| `printable blood pressure` (IN) | `...chart free`, `...log free` |
| `printable blood pressure log` (US) | `...log free`, `...sheet free`, `...sheet pdf free`, `...with pulse free` — **4 of 10** |
| `habit tracker printable` (IN) | `...free`, `...pdf free download`, `...free pdf` |
| `journal prompts printable` (IN) | `...free`, `...pdf free` |
| `printable water tracker` (IN) | `...free`, `free printable...chart` |
| `printable diary` (IN) | `...2026 free`, `...pages free` |

**Read:** the searcher's default expectation for a printable PDF is zero rupees. A paid PDF here fights the query intent rather than serving it. This kills the "₹99 printable pack" as a primary product.

### 1.2 But there is real *physical* buying intent

US autocomplete for `blood pressure log book` returns `...near me`, `...amazon`, `...nearby`, `...booklet`. Those are shopping queries for an object, not a file. India autocomplete for `blood pressure log` returns `...log book` and `...log sheet pdf` side by side — both audiences exist, and only one of them intends to pay.

### 1.3 Language demand is unserved

India autocomplete returns `blood pressure chart in hindi` and `bp chart in hindi` on two separate seeds. Not one of the Amazon.in log books surfaced in the top ~22 organic results is in Hindi or bilingual. This is the clearest differentiation lever we found.

### 1.4 Competitor density

| Market | Result count | Character |
|---|---|---|
| Amazon.in `blood pressure log book` | **2,000+** | Generic English KDP titles, foreign authors, near-identical interiors, no India framing, no Hindi, weak covers |
| Amazon.in `habit tracker journal` | 654 | Funded Indian stationery brands — Papboo, DOODLE, LAURET BLANC, myPAPERCLIP, AccuPrints, Zaslan, Amazon Brand Eono — heavy Sponsored-ad spend, hardcover/GSM competition |

**Read:** BP log books are *crowded but undifferentiated* — beatable on positioning. Habit/planner journals are *crowded and well-capitalised* — **do not enter**. We would be a KDP paperback against brands running Sponsored Products on their own listings.

### 1.5 Our own asset position

From [/memories/repo/purposelab-growth-state.md](../../../../../../memories/repo/purposelab-growth-state.md), measured 2026-08-01: the website is a **BP Log / Hushly asset, not a Folio asset**. `/bplog/` is one of only two pages with any first-party AI-citation signal (33 Copilot citations in 3 months). Folio has effectively no organic search presence.

**Read:** monetize where the traffic actually is. That is blood pressure, not journaling.

---

## 2. The strategic call

| | Decision | Why |
|---|---|---|
| Free one-page sheet | **Stays free, unchanged, no watermark, no gate** | It is the ranking asset. Passion Planner — 3M+ units sold — runs "Free Downloads" as a shop collection, so this is the validated model, not a concession |
| Paid digital **printable** pack | **Do not build** | Query intent says free |
| Paid digital **tablet edition** (GoodNotes/Notability) | **Build** | Different buyer entirely. Passion Planner sells these at Rs. 800–1,200 *in INR to Indian browsers*. Our diary interior already exists as a parametric generator — this is a re-export |
| Physical BP log book (KDP) | **Build it** | Real shopping intent, zero inventory risk, pipeline already proven by the Folio Diary |
| Habit/planner paper products | **Do not build** | Losing category against funded incumbents quoting GSM in their titles |
| Affiliate on BP/health pages | **Build it** | Readers of `how to track blood pressure at home` are about to buy a monitor |
| Display ads | **Never** | Contradicts the promise in all four `best-free-*` comparison pages |

### How we are better

Not "another log book". Four differentiators, all absent from the top Amazon.in results:

1. **Bilingual Hindi + English** — column headers, category chart and the doctor-visit page in both. Directly serves `bp chart in hindi`.
2. **Large print for seniors** — the actual user is often 55+ with reading glasses. Competitors use 6×9" with cramped rows.
3. **Doctor-visit built in** — a "take this to your appointment" summary page (7-day averages, medication list, questions to ask). This is the job the reader is hiring the log for.
4. **Paired with a free app** — every book carries a QR to BP Log. Nobody else on that shelf has a companion app, and it makes the book a genuine acquisition channel, not just a revenue line.

### How we are cheaper

KDP print cost for a ~110-page 6×9" black-ink paperback is low; competitors price on Amazon.in in the ₹250–500 band. Undercut the mid-band, not the floor — being cheapest signals low quality on a health product. Target the price *after* pulling real print cost from the KDP calculator in Phase 2.

---

## Phase 0 — Baseline and instrumentation (not a gate)

Traffic is deliberately **not** a precondition. The offering is being built first so that content work has something to convert into. But we still need a before-picture, or we will never know what worked.

- [ ] **Step 1: Record the current baseline**

Search Console → Performance → Pages, filter to `/bplog`, export last 3 months. Record clicks and impressions for `/bplog/`, `/bplog/printable-log/`, `/blog/how-to-track-blood-pressure-at-home/`, `/blog/normal-blood-pressure-by-age/`, `/best-free-blood-pressure-app/`. Write the numbers into [../../../../blog-studio/docs/growth-operating-backlog.md](../../../../blog-studio/docs/growth-operating-backlog.md) with today's date.

- [ ] **Step 2: Instrument the download**

GitHub Pages has no server logs, so downloads of `/bplog/blood-pressure-log.pdf` are invisible today. Add a click event on the download link so that from now on we can tell a pageview from an actual download.

- [ ] **Step 3: Instrument outbound commerce clicks**

Every link out to Amazon or a checkout gets a tagged event, so conversion is attributable per page. Reuse the existing `/go/` redirector conventions rather than inventing new ones.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: baseline + download/outbound instrumentation before commerce build"
```

---

## Phase 1 — Build the offering surface

Goal: by the end of this phase the studio has a funnel, a shop, and three things people can actually buy — without standing up any payment backend of our own.

### Task 1.1 — Expand the free printable into a free 6-page pack

**Files:**
- Create: `bplog/printable-log/pack/` (print-CSS HTML source, one file per sheet)
- Create: `bplog/blood-pressure-pack.pdf` (generated output)
- Modify: `bplog/printable-log/index.html`

Contents (all free, all bilingual Hindi + English):
1. Daily log sheet — the existing one, unchanged
2. Weekly summary with an averages row
3. AHA category reference chart
4. Medication + timing chart
5. Doctor-visit prep page (7-day averages, questions to ask)
6. A filled example so the reader knows how to use it

- [ ] **Step 1: Build the print-CSS source**

Reuse the geometry approach from the Folio Diary plan: pure HTML/CSS/SVG so every rule and box is vector-crisp, rendered via headless Chromium `page.pdf()`. Do **not** use `aspect-ratio` on grid cells inside a fixed-height page — it overflows badly (see the web-CSS gotchas note). Give each row an explicit small fixed `height`.

- [ ] **Step 2: Verify no page overflows before generating**

Loop every `.safe` page element and compare `scrollHeight - clientHeight`; anything over 2px clips silently under `overflow:hidden`.

- [ ] **Step 3: Generate and eyeball at A4 and Letter**

- [ ] **Step 4: Wire the page**

Keep the current single-sheet download exactly where it is. Add the pack below it, with an email field. Free either way — asking for the email must not block the download, or we lose the ranking intent.

- [ ] **Step 5: Commit**

```bash
git add bplog/ && git commit -m "feat: free bilingual BP printable pack"
```

### Task 1.2 — Create `/subscribe/`

Flagged as missing since 2026-08-01: the UTM spec in AGENTS.md references `/subscribe` but no such page exists.

- [ ] **Step 1:** Create `subscribe/index.html` with a single email field and an honest promise ("a few emails a year, when we make something").
- [ ] **Step 2:** Add to `sitemap.xml` and `llms.txt`.
- [ ] **Step 3:** Commit.

### Task 1.3 — On-brand affiliate on buyer-intent pages

- [ ] **Step 1:** Join Amazon Associates India.
- [ ] **Step 2:** Add a clearly-disclosed "what to look for in a home BP monitor" section — with links — to `blog/how-to-track-blood-pressure-at-home/` and `blog/normal-blood-pressure-by-age/`.
- [ ] **Step 3:** Write the disclosure in the studio's own voice, above the links, not in fine print. Never place affiliate links on any `best-free-*` page — those pages promise no ads and readers will read it as one.
- [ ] **Step 4:** Commit.

### Task 1.4 — List the Folio Diary on Amazon.in

The book already exists and is live, but only as `amazon.com/dp/B0H89T4VLP`. It is invisible to our own India-first market. This is finished work sitting unsold.

- [ ] **Step 1:** In KDP, confirm India is an enabled marketplace for the existing title; set an INR price.
- [ ] **Step 2:** Update [/folio/diary/](../../../folio/diary/index.html) to show the right store per visitor, reusing the `/go/` redirector rather than hardcoding two links.
- [ ] **Step 3:** Add more interior spreads to that page's gallery. Baronfig's Clear Habit Journal page is almost entirely interior photography — for a paper product the gallery *is* the sales argument.
- [ ] **Step 4:** Commit.

### Task 1.5 — Build `/shop/`

A static page, no cart, no backend. It lists everything buyable and links out to Amazon or a Merchant-of-Record checkout. Its job is to exist so that later products have a home and internal links have a destination.

- [ ] **Step 1:** Create `shop/index.html` with sections for Paper, Digital, and Free. Free downloads sit *in* the shop, as a named collection — this is exactly how Passion Planner structures theirs.
- [ ] **Step 2:** Add to `sitemap.xml`, `llms.txt`, and the site nav.
- [ ] **Step 3:** Commit.

### Task 1.6 — Digital tablet edition of the Folio Diary

The highest-value paid product we can ship without new design work. A hyperlinked PDF for GoodNotes / Notability / Samsung Notes. Passion Planner sells the equivalent at **Rs. 800–1,200 in INR**, so the price point is validated in our market.

- [ ] **Step 1:** Re-export the existing diary generator with tappable month tabs and internal links instead of print bleed. One source, two outputs — do not fork the design.
- [ ] **Step 2:** Test on a real tablet in at least GoodNotes. A hyperlink that does not work is a refund.
- [ ] **Step 3:** Put it on a Merchant-of-Record platform (Payhip or Lemon Squeezy) so VAT and delivery are handled and no backend is needed. Price ~Rs. 799 / $9.
- [ ] **Step 4:** Link from `/shop/` and `/folio/diary/`.
- [ ] **Step 5:** Commit.

**Phase 1 review, at 60 days:** record email signups, affiliate earnings, Diary sales on `.in`, and tablet-edition sales. Low numbers here mean traffic is the bottleneck — that is expected and is what the content work is for. Do not read it as the products being wrong.

---

## Phase 2 — The physical BP log book

**Working title:** *The Home Blood Pressure Log — बीपी रिकॉर्ड बुक* (bilingual on the cover).

### Task 2.1 — Lock the specs

Reuse the verified KDP requirements already captured in [2026-07-07-folio-diary-print-kdp.md](2026-07-07-folio-diary-print-kdp.md) §2 — trim, bleed, gutter ≥ 0.375", even page count, embedded fonts, single colour space, spine formula.

Differences from the Folio Diary:

| Decision | Value | Why |
|---|---|---|
| Trim | 6 × 9" | Standard, cheapest, sold on both .com and .in |
| Ink | **Black & white** | Not Premium Color. A medical log does not need colour, and it roughly halves print cost — this is where the price advantage comes from |
| Pages | ~110 | One year of twice-daily readings + summaries |
| Type size | **Large** | The senior differentiator. Test-print and check it at arm's length |
| Dating | Undated | Start any day |
| ISBN | None (low-content) | Same as the Diary |

- [ ] Pull the real print cost from the KDP calculator for both marketplaces **before** setting price.
- [ ] Price India below the ₹250–500 incumbent band, but not at the floor.

### Task 2.2 — Build interior + cover

- [ ] Build the interior from the same generator as the Phase 1 pack — one source, two outputs. Do not maintain two designs.
- [ ] Back cover carries the BP Log app QR. Interior does **not** — same app-mention rule the Folio Diary uses.
- [ ] Verify: embedded fonts, flattened, 300 DPI, single colour space, even page count.

### Task 2.3 — Listing

- [ ] Title and subtitle must carry the differentiators: bilingual, large print, doctor-visit summary.
- [ ] Order a proof copy. Do not skip this — check the large print and the gutter on paper.
- [ ] Link it from `/bplog/` and `/bplog/printable-log/`.

**Phase 2 review, at 90 days:** record copies sold and read every review. Fewer than 20 copies with meaningful traffic means the differentiation did not land — fix the listing once, then stop. Fewer than 20 copies with no traffic means nothing at all; keep it listed and go write.

---

## Phase 3 — Only after Phases 1 and 2 have reported

- **Second title.** A diabetes/sugar log is the natural neighbour (`ME IN 210 DAYS` proves combo health logbooks sell on Amazon.in). A baby sleep + feed log feeds Hushly.
- **B2B / bulk.** Clinics, diagnostic labs and pharmacies handing a branded BP log to hypertensive patients. Nobody in the 2,000-result KDP crowd does this, and both Baronfig ("For Business") and Passion Planner ("Group & Bulk Orders") run it as a standing programme. Needs Phase 2 to exist first.
- **Crumbs pricing page.** An already-earning product with no storefront on our own site.
- **Bundles.** App + paper, or diary + tablet edition. Raises order value with no new product. Both premium competitors run bundles as a top-level collection.
- **Own Razorpay + Cloudflare Worker checkout.** Only if Merchant-of-Record fees start to hurt. The Crumbs stack already has HMAC-verified Razorpay webhooks to copy from. GST needs a CA conversation first — the studio is currently on individual KYC.
- **Stickers, posters, sleep-sound packs.** Real revenue for planner brands, but only once a shop with traffic exists.

---

## Competitor watch (repeatable, monthly)

Where to look and what to record. Keep results in `store-listing/research/`.

| Source | What it tells you | How |
|---|---|---|
| Amazon.in / .com search | Price band, page counts, cover quality, review counts, whether anyone has gone bilingual | Search `blood pressure log book`; record top 10 title, price, reviews, format |
| Amazon Best Sellers Rank | Real sales proxy — the only public one | Read BSR on each top listing's product page |
| Google autocomplete | Whether "free" still dominates, new phrasings, language demand | The `suggestqueries.google.com` calls in §1.1; re-run and diff |
| Etsy | Digital printable pricing | Blocked to automated fetch (403) — check manually in a browser |
| Amazon review text | What buyers complain about — this is where the next differentiator comes from | Read 1–3 star reviews on the top 5 competitors |
| Search Console | Whether *we* are gaining on these queries | Weekly, via `search-opportunity-routing` |

The single most valuable input is the **1–3 star reviews** on competitor log books. Every complaint there ("rows too small", "no place for medication", "not enough pages") is a free product spec.

---

## Kill criteria

Written down now so they are not rationalised away later. Note that **low sales on low traffic is not a kill signal** — it is the expected state until content work lands.

- Any change that drops the free sheet's rankings → revert immediately. The free asset outranks any revenue from it.
- Habit/planner paper products → do not start, at any traffic level. Funded incumbents.
- A product that has had **real traffic** (>500 sessions on its page) and still converts at ~0% → fix the page once, then retire the product.
- More than one KDP variant of a title that has not sold → stop. Printing variations of a thing nobody bought is the classic KDP trap.
- Any offering that requires holding inventory → decline until there is a proven repeat buyer.

---

## Open questions for the human

1. **GST.** Currently individual KYC only. KDP royalties and affiliate income both need a decision — ask a CA before Phase 2 goes live.
2. **Hindi copy.** The bilingual differentiator only works if the Hindi is genuinely good. Machine-translated medical wording would be worse than English-only. Who writes and checks it?
3. **Author name on KDP.** PurposeLab Studio, or a person? Affects the Folio Diary listing's consistency too.
