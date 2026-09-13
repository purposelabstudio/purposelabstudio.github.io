# PurposeLab Studio Website — Agent Guide

**Model fit: Medium — routine site work is multi-file; use Best for legal, health, privacy, or publishing decisions.**

This file is authoritative. Client-specific files only point here. The repository is a static
public website served from its root and must remain useful when cloned without PurposeLab.

## Repository map

| Path | Ownership / purpose |
|---|---|
| `index.html`, `about/`, `apps/`, `support/` | Human-owned studio and navigation pages |
| `folio/`, `crumbs/`, `waterwise/`, `bplog/`, `hushly/` | Human-owned app/product pages |
| `blog/`, `best-free-*/` | Human-owned editorial and comparison content |
| `tools/` | Human-owned browser tools; `tools/build-links.mjs` is the redirect generator |
| `assets/`, `style.css`, root images | Shared public scripts, fonts, images, and styling |
| `scripts/` | Local validation, audits, sitemap/IndexNow helpers |
| `tools/link-config.json` | Source of truth for generated short links |
| `go/` | **Generated redirect pages**; do not scan or edit individually |
| `docs/link-registry.md` | **Generated** by `npm run build:links`; do not hand-edit |
| `docs/superpowers/` | Historical plans/specs; low priority unless a decision history is needed |
| `tools/pdf/proof*.html`, rendered PDFs, `dist/` | Proof/build output; not normal site content |
| `.vscode/mcp.template.json`, `.gemini/settings.template.json` | Committed core-only client templates |
| `.vscode/mcp.json`, `.gemini/settings.json`, `.purposelab/` | Ignored machine-local activation output |
| `.github/workflows/` | Live external automation; changes need explicit review |

## Build and test

```sh
npm ci
npx playwright install chromium
npm test
npm run test:accessibility
node scripts/test-site.mjs
node scripts/test-tools.mjs
node scripts/test-links.mjs
node scripts/audit.mjs --all
npm run build:links       # only after changing tools/link-config.json or the generator
```

The root is the publish directory. For visual review use `python3 -m http.server 4173`; there is no
framework build. Never use live form submissions, deployment, IndexNow, cache-purge, analytics, or
store-publishing calls as tests.

## Public-site constraints

- Preserve valid semantic HTML, keyboard access, one useful `h1`, landmarks, labels, alt text, and
  WCAG AA colour contrast. Add or update focused tests with behavior changes.
- Keep canonical URLs, sitemap entries, RSS, structured data, attribution, and internal links in
  sync. Run the existing tests before broad manual edits.
- Health, legal, privacy, pricing, availability, and product claims require source-backed accuracy
  and human review. Do not invent testimonials, metrics, guarantees, or medical advice.
- Do not add trackers, remote dependencies, accounts, cookies, or form destinations casually.
- Keep secrets out of source. Workflow credentials belong in repository secret storage.
- Treat `CNAME`, `.nojekyll`, workflow permissions/triggers, analytics IDs, and redirect/store
  destinations as production configuration.

## External publishing approval

GitHub Pages may publish a push to `main`; successful deployments can trigger cache purge, and HTML
changes can trigger IndexNow. Prepare and validate local changes only. Do not push, deploy, dispatch
workflows, submit URLs/forms, purge caches, or publish legal/store content without explicit human
approval. Never weaken these controls to make a check pass.

## Portable PurposeLab preflight

The site works standalone. When the central foundation is available, use its CLI without adding
machine-specific paths to tracked files:

```sh
export PURPOSELAB_HOME=../purposelab
"$PURPOSELAB_HOME/pl" doctor
"$PURPOSELAB_HOME/pl" route "<task>"
"$PURPOSELAB_HOME/pl" context
"$PURPOSELAB_HOME/pl" enable website-maintenance
"$PURPOSELAB_HOME/pl" render-adapters --write
"$PURPOSELAB_HOME/pl" activate github-copilot
"$PURPOSELAB_HOME/pl" activate gemini-cli
"$PURPOSELAB_HOME/pl" activate github-copilot --check
"$PURPOSELAB_HOME/pl" activate gemini-cli --check
```

`render-adapters --write` writes previews under `.purposelab/generated/`; `activate` installs only
verified projections at the ignored native paths. GitHub Copilot and Gemini CLI are verified.
Claude Code, Codex, Cursor, and Antigravity are explicit `AGENTS.md` + `pl` fallbacks; generic
agents use the neutral `AGENTS.md` contract. Never invent a native MCP schema for a fallback.

Before handoff run `guard`, `dry-run`, `smoke`, `accessibility`, and `certify`. Default to `core`;
enable only an allowed profile needed for the current task. Active configs and state stay ignored.
If PurposeLab is absent, report the harness checks as skipped and still run repository tests.

## Context ladder

1. **L0:** This guide, `purpose-repo.yaml`, safety/publish boundary, and model-fit badge.
2. **L1:** The exact owning page/script plus its focused test.
3. **L2:** The selected PurposeLab profile/skill only when the task needs it.
4. **L3:** Supporting CSS, config, sitemap, fixtures, or decision record needed as evidence.
5. **L4:** Broader history or sibling repositories only with an explicit reason.

Stop when sufficient. Avoid broad scans of `go/`, generated assets, screenshots, plans, or
`node_modules/`. Make surgical edits, regenerate owned outputs from their source, and report
`PASS`, `FAIL`, or `SKIPPED` honestly.
