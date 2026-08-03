# PDF generation pipeline

Renders HTML into sellable PDFs. One HTML source, several output formats.

Built for [the sellable-PDF product line](../../docs/superpowers/plans/2026-08-03-sellable-pdfs.md).

## Quick start

```bash
npm install                      # installs playwright
npx playwright install chromium  # one-time browser download

npm run pdf:proof                # renders the proof sheet in every format
```

## Rendering

```bash
node tools/pdf/render.mjs <source.html> [--profile print|tablet] [--paper …] [--out path.pdf]
```

| Profile | Papers | Page size | Media | For |
|---|---|---|---|---|
| `print` | `a4` (default) | 210 × 297 mm | print | Printing at home or at a shop |
| `print` | `letter` | 8.5 × 11 in | print | US buyers |
| `tablet` | `portrait` (default) | 1620 × 2160 px | screen | GoodNotes, Notability, Samsung Notes |
| `tablet` | `landscape` | 2160 × 1620 px | screen | Landscape planners |

## How a source file must be written

**Every page element needs `data-page="<name>"`.** The renderer fails the build if any of them overflows its own box by more than 2px. Without that guard, `overflow:hidden` silently clips content and the defect ships.

The renderer sets `data-profile` and `data-paper` on `<html>` before first paint, so CSS keys off them:

```css
:root { --page-w: 210mm; --page-h: 297mm; }   /* browser-preview default */
html[data-profile="print"][data-paper="letter"]     { --page-w: 8.5in;  --page-h: 11in;   }
html[data-profile="tablet"][data-paper="portrait"]  { --page-w: 1620px; --page-h: 2160px; }

/* One layout at every page size: scale the root from page width. */
html { font-size: calc(var(--page-w) / 65); }

[data-page] { width: var(--page-w); height: var(--page-h); overflow: hidden; }
```

Size everything in `rem` from there and a single layout renders correctly at A4, Letter and tablet.

## Rules learned the hard way

**Use static fonts, never variable ones.** Chromium cannot embed a variable-font instance as a real outline font. It falls back to **Type 3** fonts — procedure-based glyphs that render poorly at small sizes and are flagged by print services. Measured on the proof sheet:

| | Variable fonts | Static instances |
|---|---|---|
| Font type in PDF | Type 3 | CID TrueType |
| Font objects | 14 (one subset per instance) | 4 |
| File size | 150 KB | **41 KB** |

`fonts/` holds the upstream variable TTFs. `fonts/static/` holds pinned instances and is what CSS must reference. Regenerate with:

```bash
./.venv/bin/python tools/pdf/make-static-fonts.py
```

(One-time setup: `python3 -m venv tools/pdf/.venv && tools/pdf/.venv/bin/pip install fonttools brotli`.)

**Never use `aspect-ratio` on grid cells inside a fixed-height page.** Cell height becomes column width × row count and overflows badly. Give rows an explicit fixed `height`.

**Drive facing-page row alignment from one shared CSS variable** so spreads line up across the gutter.

## Fonts and licensing

All fonts are SIL Open Font License 1.1. The licence text is in `fonts/OFL-*.txt`. Verified verbatim on 2026-08-03: the grant covers *"use, study, copy, merge, **embed**, modify, redistribute, and **sell** modified and unmodified copies"*.

The one restriction that matters to us: the font software may not be **sold by itself**. Selling a PDF that embeds it is fine. Every sold PDF must carry a colophon naming the fonts and their licence.

`Kalam` is the only family here with Devanagari coverage — required for the bilingual products.

## Verifying output before shipping

```bash
pdffonts  dist/pdf/x.pdf   # every font must say CID TrueType, emb=yes. Type 3 = bug
pdfinfo   dist/pdf/x.pdf   # page count and page size
pdftotext dist/pdf/x.pdf - # text must extract; if empty, it rasterised
pdftoppm -png -r 90 dist/pdf/x.pdf /tmp/preview   # then actually look at it
```

`brew install poppler` provides all four.

## Files

| File | Purpose |
|---|---|
| `render.mjs` | The renderer. Profiles, overflow guard, CLI |
| `make-static-fonts.py` | Pins static instances out of the variable fonts |
| `proof.html` | Proof sheet — grid, vector chart, all three typefaces |
| `proof-overflow.html` | Negative control. Must **fail** the overflow guard |
| `fonts/` | Upstream variable TTFs + OFL licences |
| `fonts/static/` | Pinned static instances — reference these from CSS |
