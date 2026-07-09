# Folio Diary — Print-Ready KDP Build Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Produce two print-ready PDFs (interior + wraparound cover) for *The Folio Diary* and upload them to Amazon KDP (Paperback, low-content book) to sell in the US and India.

**End deliverables:**
1. `interior.pdf` — single file, all pages, embedded fonts, flattened, 300 DPI, one color space.
2. `cover.pdf` — single wraparound (back + spine + front) at computed spine width.

---

## 0. Design revision v2 (2026-07-07) — current source of truth

**Philosophy:** calm, undated, no-guilt, unhurried, warm editorial botanical. Every page should feel like breathing room, not a feature. Aligns with the Folio app's tone but the paper product stands on its own.

**App-mention rule:** Do **NOT** describe the diary as an app companion/extension anywhere except the **back cover**. Title, welcome, guide, interior = no app references.

**Final interior page order (~56 pp, even):**
1. Title page
2. Copyright / edition (minimal)
3. **Welcome · mission · thank-you** (one calm page, no app mention)
4. **Guide — two facing pages** (left explains Moments & Gratitude, right explains Habits & Score). Uncluttered, a few gentle pointers kept *inside* each page. (Prototype shows this; cleanliness pass pending — candidate: small numbered markers + a short side legend instead of many crossing arrows.)
5. **12 × monthly units**, each = 2 spreads (4 pp):
   - Spread A: Moments & Gratitude  |  Habit Tracker & Score
   - Spread B: **Monthly reflection (dot grid, no prompts)**  |  **To-do (dot grid)**
6. **Back matter — free pages** (a mix of paper styles for free expression): **dot grid · square grid · ruled · blank** (a few of each).

**Content changes locked this revision:**
- **Mood dropped** entirely.
- **Month heading in the sample** = "July 2026" — bigger, with year, reads like a heading (shows users how to head a blank page). Blank monthly pages stay blank/undated.
- **Score board** = the achieved day is a **filled brown circle** (fills the ring) **joined by a brown trend line** (`#8a5a2b`). Sharp.
- Habit column headers: **left blank** (users write their own).

**Sharpness / HTML-native pages (KEY architectural decision):**
- Current samples were regenerated at ~430 DPI (crisp) — good enough to print sharp. But the recommended final architecture is to **rebuild the two diary template pages as pure HTML/CSS/SVG** ("exact replica"), so every line, chip, circle and the score board is **vector-crisp at any size** and generation is fully parametric.
  - **Feasible?** Yes. Structural elements (border frame, oval day-chips + numbers, dotted rules, dashed habit columns, check circles, score rings + filled dots + trend, headers, 1–31) are all simple HTML/SVG shapes → razor sharp.
  - **Decorative art** (botanical corners, top divider ornament, header-pill flourishes, bottom sprig) → reuse the **original art as transparent PNGs** extracted from the 600 DPI render (exact match). Only the geometry is rebuilt.
  - **Fonts:** headers → Fraunces (brand); handwriting → Caveat.
  - **Benefit:** one parametric generator renders blank (monthly) or filled (sample/guide) and exports straight to **vector PDF** via headless `page.pdf()` — feeds both the prototype and `interior.pdf`.
  - **Risk:** matching the original serif/ornaments exactly → mitigated by reusing the ornament PNGs and getting sign-off on the header font.
- **Recommendation:** build the HTML-native template as **Phase A-0** (foundation) before generating PDFs.

---

## 1. Decisions (locked)

| Decision | Value | Notes |
|---|---|---|
| Trim size | **6 × 9" (152.4 × 228.6 mm)** | Standard KDP *regular* trim; cheapest; sold on Amazon.com + Amazon.in; AR 1.50 closest to existing art (1.556). A5 (5.83×8.27) is the swap-in alt but needs wider art reflow. |
| Bleed | **0.125" (3.2 mm)** all outside edges | Botanicals bleed to edge → design canvas = **6.25 × 9.25" (158.75 × 234.95 mm)** |
| Interior ink | **Premium Color** | Sepia botanical art; white 60–71 lb paper |
| Cover finish | Matte | Calm/editorial feel |
| Per-month | **1 two-page spread** (Moments+Gratitude / Habit Tracker) | 12 months = 24 monthly pages |
| Dating | **Fully undated** | Only day chips **1–31** pre-printed on the left rail; month/theme/habits left blank for the user |
| ISBN | **Publish without ISBN** (low-content) | No barcode needed on cover |
| Spine text | **None** | Book will be < 79 pages; spine is art-only |

**Open sub-decision (confirm during build):** habit column headers on the tracker page — leave blank (user writes own habits) vs. pre-print 7 defaults. Default assumption: **leave blank**.

---

## 2. KDP requirements reference (verified 2026-07-07)

- Trim: custom W 4–8.5", H 6–11.69"; 6×9 is standard regular trim.
- Bleed: add 0.125" (3.2 mm) to top, bottom, outside edges for any art touching the edge.
- Interior margins: **gutter (inside) ≥ 0.375"** for ≤150 pages; outside/top/bottom ≥ 0.25" (use 0.375" to be safe). Keep the writing grid out of the gutter.
- Page count: **even**, minimum 24.
- Interior PDF: embedded fonts, transparencies flattened, no security/encryption, 300 DPI, single color space (RGB or CMYK — do **not** mix; no ICC profiles/spot colors).
- Cover PDF: single wraparound. `Cover Width = 0.125 + backW + spineW + frontW + 0.125`; `Cover Height = 0.125 + trimH + 0.125`.
  Spine width (Premium Color) = **pageCount × 0.002347"**. (e.g. 28 pp → 0.0657" ≈ 1.67 mm.)
- Cover images CMYK, 300 DPI, flattened, no crop marks; borders must sit ≥ 0.25" inside trim (avoid borders).

---

## 3. Interior page map

Monthly spread must place the **left (Moments/Gratitude)** page on a **verso (even/left)** page and **right (Habit Tracker)** on the facing **recto (odd/right)** so the spread reads across the gutter. Pad front matter to make month 1 land on a verso.

```
p1  (recto) Title page — "The Folio Diary"
p2  (verso) Copyright / edition line (minimal)
p3  (recto) How to use / legend
p4  (verso) blank or "This diary belongs to ____"
p5  (recto) Filled SAMPLE — Moments page (example)      ← reuse existing render
p6  (verso) Filled SAMPLE — Habit page (example)
   ── ensure next page is a verso to start month spread ──
p7  (recto) blank spacer  (added so p8 = verso)
MONTHS ×12 (each = verso Moments + recto Habits):
p8/9, p10/11, ... p30/31   → 24 pages
p32 (verso) blank / notes
TOTAL = 32 pages (even, ≥24) ✓
```
> Exact front-matter recto/verso will be finalized when assembling; the rule is: **every monthly Moments page is a left/verso page.** Adjust one spacer page to satisfy parity.

Each **monthly page** = raw template (already has blank left day-chips + lines) + **overlay of numbers 1–31** into the left chips. Nothing else printed (fully undated). All 12 months identical.

---

## 4. Assets & tooling

- Source vector templates: `~/Downloads/first_page.pdf`, `~/Downloads/second_page.pdf` (5.623×8.75", 1 page each; blank day-chips present, no numbers).
- Handwriting/label font: `/tmp/diary_fill/Caveat.ttf`. Print body font for numbers: use a clean serif/mono already embeddable (numbers can be Caveat for consistency or a legible serif).
- Existing filled renders (for the sample pages): `folio/diary/sample-moments.png`, `folio/diary/sample-habits.png` (1400×2178). For print, prefer re-rendering the sample at 300 DPI at 6.25×9.25 rather than upscaling.
- venv: `/tmp/folio_pdf_venv` (PyMuPDF + numpy + scipy + Pillow).
- Working dir for print build: `/tmp/diary_print/`.

---

## 5. Generation approach (vector-first, PyMuPDF)

Keep everything vector for crisp text and tiny file size.

1. **Bleed canvas:** create each interior page at **6.25 × 9.25"** (450 × 666 pt).
2. **Place template:** import the vector source page and scale/position it so its art fills the trim area and **extends into the 0.125" bleed** on the three outside edges (inside/gutter edge aligned to trim). Because source AR (1.556) ≠ 6×9 AR (1.50), the art is fit to width and slightly cropped/extended vertically — verify the botanical corners still land in the bleed, not inside the safe area.
3. **Day-number overlay:** compute the y-centers of the 31 left chips (linear from the template geometry we already have in `fill.html`: page-1 `y0≈22.32%`, `gap≈2.347%`; page-2 `rowY0≈19.86%`, `rowGap≈2.43%`), draw `1..31` centered in each chip in white/cream ink (chips are dark). Do this for both page types.
4. **Front matter:** generate title / how-to / legend / sample pages (can be authored as small HTML→PDF or drawn directly).
5. **Assemble:** insert pages in the order from §3 into one `interior.pdf`, honoring verso/recto parity; pad to an even count.
6. **Cover:** compute spine width from final page count; lay out back (blurb + logo), spine (art only), front (title + botanical) on one wraparound canvas at `coverW × coverH`; export `cover.pdf` in CMYK.
7. **Pre-flight:** embed fonts, flatten transparencies, strip ICC profiles, remove security, confirm 300 DPI, single color space, even page count.

**Fallback (richer styling):** extend `fill.html` with `@page{size:158.75mm 234.95mm; margin:0}` and render via Playwright `page.pdf()` per page, then merge. Use only if vector placement of the template proves fiddly.

---

## 6. Tasks

### Phase A — Interior monthly template
- [ ] A1. Set up `/tmp/diary_print/`, copy source PDFs + font.
- [ ] A2. Script: place one source page onto a 6.25×9.25" bleed canvas; verify botanicals reach the bleed and the writing grid clears the 0.375" gutter. Output `proof_month_moments.pdf` / `proof_month_habits.pdf`.
- [ ] A3. Add the `1..31` day-number overlay into left chips (both pages); tune size/position; render proof PNGs and visually verify centering.
- [ ] A4. Decide habit-header treatment (blank vs 7 defaults); apply.

### Phase B — Front matter & sample
- [ ] B1. Title page (Fraunces/serif, botanical accent).
- [ ] B2. Copyright/edition line.
- [ ] B3. How-to-use / legend page (explain moments, gratitude, habit grid, score board).
- [ ] B4. Sample spread rendered at print resolution (reuse fill.html content at 6.25×9.25, 300 DPI).

### Phase C — Assemble interior
- [ ] C1. Build page order per §3; enforce verso/recto parity for month spreads; pad to even count.
- [ ] C2. Pre-flight: embed fonts, flatten, strip ICC, 300 DPI, single color space; run through checklist.
- [ ] C3. Export `interior.pdf`; verify in a PDF viewer + measure page boxes = 6.25×9.25 with correct TrimBox/BleedBox if used.

### Phase D — Cover
- [ ] D1. Finalize page count from C1 → compute spine width (`pages×0.002347"`).
- [ ] D2. Compute cover W×H; build wraparound layout (back blurb, spine art, front title).
- [ ] D3. Export `cover.pdf` (CMYK, matte-intent, 300 DPI, no barcode area obstruction).

### Phase E — KDP upload & proof
- [ ] E1. Create paperback title (low-content, publish without ISBN); set trim 6×9, Premium Color, matte.
- [ ] E2. Upload `interior.pdf` + `cover.pdf`; run KDP Print Previewer; fix any flags.
- [ ] E3. Order a **physical proof copy** before publishing; verify bleed, gutter, color, paper feel.
- [ ] E4. Publish; set pricing for US (.com) and India (.in).

---

## 7. Risks / gotchas

- **Bleed on existing art:** current templates are exact-trim; the botanical corners will be clipped or show a white sliver unless re-placed on the bleed canvas. This is the #1 rework item.
- **AR mismatch** (1.556 vs 1.50): fitting source to 6×9 will slightly crop top/bottom or leave the 31 rows spaced differently. Verify all 31 chips + lines fit inside the safe area with the gutter margin respected. If it fights, choose A5 (closer? no — A5 is 1.418, farther) or keep custom 5.62×8.75 trim to avoid any reflow (trade-off: non-standard size, slightly higher cost).
- **Gutter swallow:** the left day-chips sit near the binding on verso pages; ensure they clear the 0.375" gutter or mirror the layout so chips are on the outside edge. **Check which edge the chips fall on for verso vs recto** — may need a mirrored template for left pages.
- **Color space:** keep the whole interior RGB *or* CMYK, not mixed; strip ICC profiles (KDP removes them anyway).
- **Even page count / parity:** adjust exactly one spacer page.

---

## 8. Owner inputs still needed

- Front cover artwork direction (title lockup + which botanical); back-cover blurb copy.
- Confirm habit-header treatment (blank vs 7 defaults).
- Confirm final trim (6×9 recommended) vs keeping custom 5.62×8.75 to avoid art reflow.
- Price points for Amazon.com and Amazon.in.
