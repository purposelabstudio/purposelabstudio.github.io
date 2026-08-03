# Sellable PDFs — Product Line and Build Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Scope:** Downloadable PDFs, sold from our own site. **No KDP, no print-on-demand, no physical products, no affiliate, no ads.** Those are out of scope by decision, not by analysis.

**Goal:** One PDF generation engine, and a product line of themed journals sold as digital downloads in INR and USD.

**Supersedes** the paper/KDP portions of [2026-08-03-paper-products-monetization.md](2026-08-03-paper-products-monetization.md). Competitor context lives in [../commerce-offerings-and-competitors.md](../commerce-offerings-and-competitors.md).

---

## 1. Two PDF buyers. We only sell to one.

This is the single most important distinction in the whole plan.

| | **Utility buyer** | **Designed-journal buyer** |
|---|---|---|
| How they arrive | Google: `printable blood pressure log` | Instagram, Pinterest, YouTube, our own app |
| What they want | A sheet, now, free | A product they like the look of |
| Evidence | Autocomplete embeds "free" in this intent across every niche we tested | Passion Planner sells **76 digital SKUs** at Rs. 600–2,500, in INR, to Indian browsers |
| We should | Serve them free, forever. They are the funnel | **Sell to them** |

Trying to charge the utility buyer fails: they are one search result away from a free equivalent and the query itself says so. Selling to the designed-journal buyer works, and is a real market with a measured price band.

### Measured price ladder (passionplanner.com/collections/digital, 2026-08-03)

| Product | Price |
|---|---|
| Meal Planner · Fitness · 30-Day Challenge | **Rs. 600** |
| Finance · Self-Care · Best Year · Overcoming Roadblocks | **Rs. 800** |
| Mindful Minute Journal | Rs. 1,200 |
| Finally Finished Journal | Rs. 2,500 |
| Mid-Year Planner bundle (hyperlinked, colour tabs) | Rs. 2,000 (from Rs. 3,900) |

**76 products, one design system.** They are themed variations, not separate builds. That is the model to copy: build the engine once, then a new SKU is a content file, not a project.

---

## 2. Correction to an earlier claim

An earlier note said the Folio Diary tablet edition would be "a re-export of an existing generator." **That is false, and it was checked rather than assumed:**

- No print/PDF generator exists in `sites/` or `apps/folio/` — searched for `*diary*`, `*interior*`, `*kdp*`.
- The only diary artefacts in version control are images: `assets/branding/diary_spread.png` and two store screenshots.
- No Playwright or Puppeteer is installed in either project.

The published Folio Diary interior was produced outside version control. **The engine has to be built.** It is a genuine one-time cost, and it is the foundation of everything below — which is why it is Phase 1 and why the first product is chosen partly to justify it.

---

## 3. Two output formats from one source

These are different products for different people. Ship both; do not pick.

| | **Print-at-home PDF** | **Tablet PDF** |
|---|---|---|
| Buyer | Has a printer or uses a print shop | Has an iPad/tablet + stylus |
| Page setup | A4 **and** US Letter, both included | Tablet aspect ratio, no print margins |
| Key feature | Low-ink, prints clean on plain paper | **Hyperlinked tabs**, tappable navigation |
| Apps | — | GoodNotes, Notability, Samsung Notes |
| India fit | Weaker — home printer ownership is low | Device-gated but growing, and the buyer is already a payer |
| Competition | Free equivalents everywhere | Designed products with real prices |

One HTML source, two export profiles. That is the entire argument for building a parametric engine instead of designing in Canva.

---

## 4. The product line

Everything here comes out of an app we already own, which is what keeps it credible and gives each product a free companion nobody else can offer.

| # | Product | From | Format | Why it sells |
|---|---|---|---|---|
| **P1** | **The Folio Journal** — undated daily page, habit tracker, monthly reflection | Folio | Both | Design is proven; it is already a published book. Brand-consistent. Makes the engine |
| **P2** | **Baby Sleep & Feed Log** | Hushly | Both | Highest urgency in the set. Exhausted parents buy at 3am and do not comparison-shop. Strong gift purchase |
| P3 | **Home Blood Pressure Journal** — bilingual Hindi/English, large print, doctor-visit page | BP Log | Print-first | Our strongest search surface — but the free sheet must stay, so this is the *designed* upgrade, not the utility sheet |
| P4 | **90-Day Reset** — a short, finishable journal | Folio | Both | "Finishable" is why Passion Planner's 30-Day Challenge sells at Rs. 600 |
| P5 | **365 Journal Prompts** | Folio | Both | We already have prompt content in the free generator tool |
| P6 | **Combo Health Journal** — BP + sugar + pulse + weight | BP Log | Print-first | `ME IN 210 DAYS` proves combo health logs sell |
| P7 | **Bundles** — any two, or the full set | — | Both | Passion Planner discounts a bundle 3,900 → 2,000. Bundles raise order value with no new product |

**Do not build all seven.** Build P1, prove the engine and the checkout, then each additional SKU is days not weeks.

### Pricing

Enter one band below Passion Planner. Being cheapest is not the goal; being obviously fair is.

| | India | International |
|---|---|---|
| Single journal | **Rs. 499** | **$7** |
| Two-pack | Rs. 799 | $11 |
| Everything | Rs. 1,299 | $18 |

Free sample of every product, always. Passion Planner's own FAQ carries *"Can I try a digital planner before I buy?"* — a free sample is an expectation in this category, not a giveaway.

---

## Phase 1 — The engine and the first product

### Task 1.1 — Stand up the PDF pipeline

**Files:**
- Create: `tools/pdf/` — generator
- Create: `tools/pdf/README.md`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

```bash
cd app-factory/sites/purposelabstudio.github.io
npm install --save-dev playwright
npx playwright install chromium
```

- [ ] **Step 2: Write the smallest possible generator that proves the two-profile idea**

`tools/pdf/render.mjs` takes an HTML file plus a profile name and writes a PDF. Two profiles: `print` (A4 and Letter, print margins, `printBackground: true`) and `tablet` (custom viewport-sized page, zero margin).

- [ ] **Step 3: Prove it on a throwaway page before building any product**

Render a one-page test with a ruled grid, a filled circle and embedded webfont text. Open both outputs. Confirm: text is selectable (vector, not raster), the font renders, and no page clips.

- [ ] **Step 4: Add an overflow check to the generator**

Before writing any PDF, loop every page element and compare `scrollHeight - clientHeight`. Anything over 2px clips silently under `overflow:hidden` and will ship broken. Fail the build instead.

- [ ] **Step 5: Commit**

```bash
git add tools/pdf package.json package-lock.json
git commit -m "feat: PDF generation pipeline with print and tablet profiles"
```

### Task 1.2 — Settle font licensing before anything is sold

Selling a PDF with an embedded font is a different licence question from displaying it on a website. All five app fonts — Caveat, DancingScript, DMSans, Kalam, PlayfairDisplay — are Google Fonts under the SIL Open Font License, which permits embedding in documents including commercial ones. But **no licence files are bundled in the repo**, which is an OFL requirement.

- [ ] **Step 1:** Add `OFL.txt` for each font under `tools/pdf/fonts/`.
- [ ] **Step 2:** Confirm each font's licence at its source before shipping a paid product. Do not assume from the family name.
- [ ] **Step 3:** Add a colophon page to every sold PDF naming the fonts and their licence.
- [ ] **Step 4:** Commit.

### Task 1.3 — Build P1, The Folio Journal

- [ ] **Step 1:** Build the page templates as HTML/CSS/SVG so every rule, chip and circle is vector-crisp: title, welcome, how-to-use, daily page, habit tracker, monthly reflection, colophon.
- [ ] **Step 2:** Do **not** use `aspect-ratio` on grid cells inside a fixed-height page. It overflows badly — a 12×31 grid once blew ~500px past an A5 safe area. Use an explicit fixed `height` per cell.
- [ ] **Step 3:** Drive facing-page row alignment from one shared CSS variable so spreads line up across the gutter.
- [ ] **Step 4:** Export the print profile at A4 and Letter, and the tablet profile with hyperlinked month tabs.
- [ ] **Step 5:** **Test the tablet PDF on a real tablet in GoodNotes.** A hyperlink that does not work is a refund and a bad review.
- [ ] **Step 6:** Print one page at home on plain paper. Check ink weight and that nothing is cut off.
- [ ] **Step 7:** Build the free sample — 4 pages, same quality, watermark-free.
- [ ] **Step 8:** Commit.

### Task 1.4 — Checkout and delivery

No backend. A Merchant of Record hosts the file, takes the card, remits EU VAT and US sales tax as the seller, and emails the download link.

- [ ] **Step 1:** Create a Payhip account (free tier, ~5% per sale; Lemon Squeezy is the alternative at ~5% + 50¢).
- [ ] **Step 2:** Upload P1 with both formats in one purchase. One product, three files — do not fragment it into separate SKUs.
- [ ] **Step 3:** Set INR and USD pricing per §4.
- [ ] **Step 4:** Write the refund policy honestly: no refunds after download, but email us and we will sort it out. Publish it alongside the existing policies in `sites/privacy-policies/`.
- [ ] **Step 5:** Test a real purchase end to end with your own card. Confirm the email arrives and the link works.

### Task 1.5 — The storefront

- [ ] **Step 1:** Create `shop/index.html` — static, no cart, links out to Payhip. Sections: Journals, Free downloads. Free downloads sit **inside** the shop as a named collection; this is exactly how Passion Planner structures theirs.
- [ ] **Step 2:** Product page per PDF: tablet and paper mockups, every interior page shown, format table, "works with GoodNotes/Notability/Samsung Notes", free-sample button above the buy button.
- [ ] **Step 3:** Show the interiors generously. Baronfig's entire product page is interior photography — for a paper-shaped product the gallery *is* the sales argument.
- [ ] **Step 4:** Link from `/folio/`, `/folio/diary/`, and the site nav. Add to `sitemap.xml` and `llms.txt`.
- [ ] **Step 5:** Instrument every outbound checkout click through the existing `/go/` redirector so conversion is attributable per page.
- [ ] **Step 6:** Run `npm test` — the site has link, schema and claims tests that must still pass. Note that `test-claims.mjs` asserts studio facts; adding a paid product may need it updated.
- [ ] **Step 7:** Commit.

---

## Phase 2 — Second product, and the engine's payoff

- [ ] **P2, Baby Sleep & Feed Log.** Different app, different buyer, same engine. If this takes more than a few days, the engine is not parametric enough — fix the engine rather than the product.
- [ ] **Free sample of every product**, listed in the shop's free collection.
- [ ] **Bundles.** Two-pack and full set.
- [ ] Then P3–P6 as content files.

---

## Phase 3 — Distribution (this is not an SEO product)

Worth stating plainly: **people do not find digital journals through Google.** Passion Planner runs a *separate* Instagram account (`@passionplannerdigital`) and a *separate* YouTube channel purely for digital-planner setup tutorials. The product is discovered visually and sold by demonstration.

- [ ] Tablet mockups in styled settings — the category's visual language.
- [ ] Pinterest, where planner and printable buyers actually browse.
- [ ] A short setup video: import into GoodNotes, tap a tab, write on a page.
- [ ] Offer the free sample inside our own apps. Folio has thousands of users who already like this exact aesthetic, and that is a distribution channel none of these competitors have.
- [ ] Email the list when a new journal ships.

---

## Decisions already made, so they are not re-litigated

- Free utility printables stay free and ungated, forever. They are the funnel, and the market leader runs them as a shop collection.
- No DRM, no watermarking a paid file. It punishes the buyer and does not stop copying.
- One purchase includes every format. Splitting print and tablet into separate SKUs to double revenue reads as mean and generates support mail.
- No subscription. These are objects, not services.

---

## Kill criteria

- P1 sells zero with real product-page traffic → the problem is the page or the price, not the category. Fix once, then stop.
- P2 takes as long as P1 → the engine failed its purpose. Stop making products and fix the engine.
- Any pull toward per-format pricing, DRM, or gating the free sheets → refuse; these are the failure modes of this category.

---

## Open questions

1. **Hindi.** P3's bilingual differentiator only works if a human writes and checks the medical wording. Who?
2. **GST.** Currently individual KYC. A Merchant of Record makes the foreign side clean, but domestic digital sales need a CA conversation before the first rupee.
3. **Does P1 cannibalise the printed Folio Diary?** Probably not — different buyer, different price, and the diary is currently US-only anyway. Worth watching rather than pre-solving.
