# Website Redesign: PurposeLab Studio

**Date:** 2026-07-06
**Status:** Draft for review

## Overview

Redesign `purposelabstudio.github.io` (static site, GitHub Pages) to feel like a
crafted indie developer's home rather than a plain app catalog. Introduce a shared
"Warm Editorial" design system, re-theme each app page in its own brand identity,
make blog posts genuinely reader-friendly, add a low-cost email newsletter, and
reposition the homepage around a first-person maker voice with a "say hi" CTA.

## Goals

1. **More appealing, cohesive look** via a Warm Editorial design system.
2. **Homepage repositioned** as a developer-forward, human-voiced home where
   visitors want to connect ("say hi"), with apps as proof-of-work.
3. **Per-app pages themed in each app's own identity**, and made self-contained so
   they can later be lifted into standalone product sites with no rework.
4. **Reader-friendly blog** that retains traffic (readability, TOC, progress, related
   posts, soft app CTAs, RSS).
5. **Email newsletter opt-in** using a free tool (MailerLite), plus an RSS feed.

## Non-Goals

- No services/pricing page. "Hire/connect" is intentionally just "say hi / feedback".
- No personal details (no real name, photo, or bio). Voice stays behind
  "PurposeLab Studio", first-person.
- No build tooling / framework migration. Site stays hand-authored HTML + CSS.
- No backend. Newsletter is a third-party embed; no server-side code is added.

## Constraints & Context

- **Static GitHub Pages.** No server-side rendering or backend. Email capture must
  be a third-party embed (MailerLite free tier).
- **Existing structure** (keep URLs stable for SEO): `/`, `/crumbs/`, `/folio/`,
  `/waterwise/`, `/bplog/`, `/hushly/`, `/blog/` (+ ~11 post folders), `/about/`,
  `/support/`. Preserve all existing structured data (JSON-LD), canonical URLs,
  Open Graph tags, and the Google verification meta.
- **Shared CSS** today is a single `style.css` with a blue theme. It will be
  refactored (not replaced wholesale) into a base + theme-variable model.

## Design System (Warm Editorial)

### Base palette (CSS custom properties on `:root`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F7F3EA` | page background |
| `--paper-2` | `#F1EADB` | inset panels / cards |
| `--ink` | `#2B2A26` | primary text |
| `--ink-soft` | `#5A574E` | secondary text |
| `--accent` | `#2C5556` | links, primary CTA (deep teal) |
| `--accent-ink` | `#F7F3EA` | text on accent |
| `--gold` | `#9A7B45` | small labels / eyebrows |
| `--border` | `rgba(0,0,0,.10)` | hairlines |
| `--radius` | `14px` | cards |

Per-app pages **override these same tokens** to re-skin without touching structure.

### Typography
- **Display/headings:** a free, open-licensed serif — **Fraunces** or **Newsreader**
  (self-hosted `.woff2` in `/assets/fonts/` to avoid third-party requests and
  licensing ambiguity; both are OFL-licensed). Fallback stack:
  `Georgia, 'Times New Roman', serif`.
- **Body:** system sans stack (unchanged from today).
- **Developer edge:** monospace (`ui-monospace, 'SF Mono', Menlo, monospace`) for
  eyebrow labels and small section kickers (e.g. `~/ purposelab`).

### Shared components (in base CSS)
Navigation, footer, buttons (`.btn`, `.btn-primary`, `.btn-outline`), badges,
`.app-card`, `.article` typography, blockquotes, and the newsletter block. All
consume theme tokens so they recolor per page automatically.

### File / CSS architecture
- `style.css` — base layer: reset, layout, tokens (`:root` defaults = Warm Editorial),
  shared components. Keep the existing filename and path so all pages keep working.
- **Per-app theming:** each app `index.html` includes a small scoped `<style>` block
  (or `theme.css` in its folder) that overrides the tokens. Because each app page
  loads the shared base + its own theme override, the folder is **self-contained and
  liftable** (copy the folder + `style.css` → standalone site).
- Self-host fonts under `/assets/fonts/` and reference with `@font-face` in `style.css`.

## Homepage (`/index.html`)

Sections, top to bottom:
1. **Hero:** mono eyebrow (`~/ purposelab`), serif H1 "I build calm Android apps that
   respect you.", one philosophy line, **"Say hi →"** primary CTA (to contact section).
2. **Promise strip:** Free · No Ads · Offline-first · Privacy-first (quiet row).
3. **Proof of work (apps):** redesigned cards; each card carries a hint of its app's
   color (themed left border + icon halo). Crumbs featured (larger card). Same links
   as today (Learn More, Play Store / WhatsApp, Privacy Policy).
4. **"How I build" philosophy band:** 3 principles — *one thing well* · *your data stays
   yours* · *no dark patterns*.
5. **From the blog:** 3 latest posts (redesigned list).
6. **Newsletter block:** headline + MailerLite embed + reassurance ("occasional,
   no spam, unsubscribe anytime").
7. **Contact / "Say hi":** warm copy, email (`purposelab.studio@gmail.com`) + WhatsApp.
8. **Footer:** unchanged links + RSS link.

Preserve existing Organization + WebSite JSON-LD.

## Per-App Pages

Shared skeleton: **hero → screenshots → features → FAQ → download CTA → footer**.
Each overrides theme tokens and adjusts voice to the app's philosophy/user.

| App | Palette (tokens) | Mood / voice | User & use case |
|---|---|---|---|
| **Crumbs** | teal `#2C5556`, cream `#F5F1E8`, mustard/sage accents | cozy, organic | busy people who "message themselves"; capture on WhatsApp, recall in plain language |
| **Folio** | kraft tan `#C9A876`, cream `#F3ECDD`, brown `#4A3520`, gold | quiet stationery | reflective journalers; close the day gently, no streak pressure |
| **WaterWise** | cyan `#29B6C8`, aqua, coral accent | fresh, light, playful | anyone building a hydration habit; one-tap logging, no nagging/ads |
| **BP Log** | navy `#0D2E5C`, teal-green `#5F9E96`, clinical white | precise, trustworthy | home BP monitors; offline logging, AHA trends, PDF for doctor |
| **Hushly** | **dark** night-indigo `#2A2440`, amber `#F5B942` | calm nighttime | tired parents; soothing sounds, no account, dark UI for night use |

Requirements per app page:
- Preserve existing per-app JSON-LD (SoftwareApplication, BreadcrumbList, FAQPage),
  canonical, OG/Twitter tags, and Play Store / privacy-policy links.
- Reuse existing screenshots in each app's `screenshots/` folder.
- Self-contained: base CSS + own theme block only; no dependency on homepage.
- Hushly is the one **dark-themed** page (amber-on-indigo); ensure contrast/AA.

## Blog

### Post pages (`/blog/<slug>/index.html`)
- Reading measure ~680px; larger body type; generous line-height (~1.75).
- Strong hierarchy; styled `blockquote`, lists, inline code, images.
- **Reading-progress bar** (thin, top of viewport; CSS/tiny JS).
- **Table of contents** for long posts (auto-anchored H2s; tiny JS, progressive
  enhancement — page works without JS).
- Post header: date + read time (from existing `.meta`).
- **Related posts** block + a **soft CTA to the relevant app** at the end
  (mapping: WhatsApp/second-brain posts → Crumbs; journaling → Folio; hydration →
  WaterWise; BP → BP Log; baby-sleep → Hushly).
- Preserve existing Article JSON-LD and meta.

### Blog index (`/blog/index.html`)
- Redesigned browsable list (cards or clean rows), grouped newest-first.
- Newsletter block + RSS link.

### RSS
- Add `/blog/rss.xml` (hand-maintained or generated during implementation) listing
  posts with title, link, date, description. Link via `<link rel="alternate"
  type="application/rss+xml">` in blog pages and a footer link.

## Newsletter (MailerLite)

- A reusable **newsletter block** component (styled in base CSS) placed on the
  homepage and blog index (and optionally end of posts).
- Embeds MailerLite's form. The exact embed snippet/form ID is created by the site
  owner; implementation inserts a **clearly-marked placeholder** (HTML comment
  `<!-- MAILERLITE FORM: paste embed here -->`) plus a styled fallback so the block
  looks complete before the ID is added.
- Copy: "Occasional app news. No spam, unsubscribe anytime."
- No cost; no backend.

## Execution Strategy (subagents)

1. **Phase 1 — Design system (serial, foundational):** refactor `style.css` into
   base + tokens, self-host fonts, build shared components (nav, footer, buttons,
   cards, article, newsletter block). Verify on one page before fan-out.
2. **Phase 2 — Parallel fan-out (independent subagents):**
   - Homepage rebuild.
   - Blog system (post template treatment applied to all posts + index + RSS).
   - Each app page (Crumbs, Folio, WaterWise, BP Log, Hushly) — one unit each,
     briefed with its palette + philosophy from the table above.
3. **Phase 3 — Integration (serial):** unify nav across all pages, update
   `sitemap.xml`, wire RSS + newsletter, add cross-links, and run a visual + link
   check (and print/overflow sanity where relevant).

Each app page and the blog are isolated units with clear inputs (palette, voice,
existing content/screenshots) and one purpose — well-suited to concurrent subagents.

## Error Handling / Edge Cases

- **No-JS:** progress bar, TOC, and newsletter must degrade gracefully; core content
  and navigation work without JavaScript.
- **Missing MailerLite ID:** newsletter block shows a styled placeholder, never a
  broken embed.
- **Font load failure:** serif falls back to Georgia; no layout shift beyond metrics.
- **Dark page (Hushly) contrast:** verify text meets WCAG AA on indigo.
- **SEO preservation:** do not change URLs, canonicals, or existing JSON-LD blocks;
  only restyle and add.

## Testing / Verification

- Visual pass on every page type (homepage, each app, blog post, blog index) at
  mobile + desktop widths.
- Link check: nav, footer, cross-links, Play Store, privacy policies, RSS.
- Validate no JSON-LD/meta regressions vs. current pages.
- Confirm each app folder renders correctly if opened in isolation (self-contained).
- Confirm newsletter placeholder renders cleanly with and without an embed.

## Out of Scope / Future

- Actually creating the MailerLite account and pasting the embed (owner task).
- Migrating apps' real standalone product sites (this only makes the pages liftable).
- Any analytics or A/B tooling.
