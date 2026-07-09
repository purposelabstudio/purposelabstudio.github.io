# Blog briefs — serpiq-style (Google Autocomplete + synthesis)

Date: 2026-07-09. Source: real Google Autocomplete (`suggestqueries.google.com`) for seed
keywords across all apps, cross-referenced against existing 11 posts + 3 tools to find gaps.
This reproduces serpiq's pipeline manually (serpiq itself needs its own LLM API key, which we
don't have; the free Autocomplete data + synthesis is the valuable part).

## Opportunity map (priority order)

| # | Target query (real autocomplete) | Intent | App | Status |
|---|----------------------------------|--------|-----|--------|
| 1 | water reminder app without ads | Commercial | WaterWise | **DRAFTED** |
| 2 | blood pressure log sheet printable / pdf | Tool/lead-magnet | BP Log | **DRAFTED** |
| 3 | how to lower blood pressure instantly / immediately at home | Informational | BP Log | **SHIPPED** |
| 4 | message yourself on whatsapp not showing | Troubleshooting | Crumbs | **DRAFTED** |
| 5 | journaling prompts for anxiety / overthinking / self-discovery | Informational | Folio | **SHIPPED** (3 posts) |
| 6 | best free journal app for android (no ads) | Commercial | Folio | Backlog |
| 7 | baby sleep sounds app free / best; do babies sleep better with sound machine | Commercial/info | Hushly | Backlog |
| 8 | note to self app / second brain app free (Obsidian/Notion alt) | Commercial | Crumbs | Backlog |

Signal: "without ads / free / no ads / reddit" recur across every app cluster — the privacy/no-ads
positioning is exactly the filter these searchers apply. "printable pdf / log book / sheet" on BP is
a lead-magnet opportunity mirroring the Folio Diary KDP play.

## Drafted (this session)

### Brief 1 — WaterWise (commercial quick win) — `/blog/water-reminder-app-without-ads/`
Target: water reminder app without ads · secondary: with alarm, with widget, without account.
Angle: ad-free/no-paywall filter. Links: WaterWise pillar, water-intake-calculator tool,
why-water-apps-are-full-of-ads, how-much-water post.

### Brief 2 — BP Log (lead magnet) — `/blog/printable-blood-pressure-log/` + print page `/bplog/printable-log/`
Target: blood pressure log sheet printable · pdf · log book · printable.
Deliverable: a print-optimized log page (Print → Save as PDF) + post explaining correct logging and
when to switch to the app. YMYL: reference-only, cite AHA, not medical advice. Links: BP Log pillar,
blood-pressure-checker tool, how-to-track-blood-pressure-at-home, normal-blood-pressure-by-age.

### Brief 3 — Crumbs (troubleshooting) — `/blog/message-yourself-on-whatsapp-not-showing/`
Target: message yourself on whatsapp not showing · change name · samsung/iphone/android.
Angle: fix the missing/won't-pin self-chat, then offer a smarter self-notes system. Links: Crumbs
pillar, stop-messaging-yourself-on-whatsapp, build-a-second-brain-on-whatsapp.

## Backlog briefs (not yet written)

- **BP instant** `/blog/how-to-lower-blood-pressure-immediately-at-home/` — informational, high volume;
  we cover "naturally" but not "instantly/immediately". YMYL care + AHA + "seek care" framing.
- **Journaling prompts by theme** — `/blog/journaling-prompts-for-anxiety/`, `.../overthinking/`,
  `.../self-discovery/` — each a themed prompt list that feeds the journal-prompt-generator tool.
- **Best free journal app for android (no ads)** `/blog/best-free-journal-app-android/` — comparison.
- **Hushly** `/blog/best-baby-sleep-sounds-app/` — comparison + "do babies sleep better with a sound
  machine?" explainer.
- **Crumbs** `/blog/best-note-to-self-app/` — Obsidian/Notion/Apple Notes vs WhatsApp-based capture.

## Convention checklist for each new post (from scripts/test-site.mjs)
- Auto-discovered from `blog/<slug>/` — must add: RSS `<item>` (item count must equal post count),
  sitemap entry, submit-indexnow URL, blog/index.html list entry.
- Required per page: GoatCounter + Clarity snippets, `<link rel=alternate rss>`, full nav to all
  targets, `FAQPage` JSON-LD + visible "Frequently Asked Questions", `.related-guides` block.
- Add `<meta name="author" content="PurposeLab Studio">` (AEO author signal).
- CTA uses install-referrer UTM + `data-goatcounter-click`/`-title`.
