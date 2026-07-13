# Blog content pipeline

Working home for blog articles **before and after** they ship to the live site.
The published site itself is hand-authored HTML under [`../blog/`](../blog/); this
folder holds the editable source-of-truth drafts and a record of what shipped.

```
content/
  drafts/      work-in-progress articles (Markdown) — not yet on the site
  published/   Markdown source of record for articles already live in ../blog/<slug>/
```

## Flow (draft → live)

1. **Strategy / topic** — pick the angle. Prior strategy notes live in
   [`../docs/superpowers/plans/`](../docs/superpowers/plans/)
   (`folio-blog-content-strategy.md`, `serpiq-blog-briefs.md`).
   Skill: `content-strategy` (in `platform/skills/`).
2. **Draft** — write the long-form article as Markdown in `drafts/<slug>.md`.
   Skill: `article-writer`.
3. **Voice pass** — de-AI / brand voice. Skill: `humanizer`.
4. **On-page SEO/GEO** — titles, meta, schema/JSON-LD, internal links, `llms.txt`.
   Skill: `website-seo-geo`.
5. **Render to the site** — convert the finished draft into the site's HTML format:
   create `../blog/<slug>/index.html`, add the card to `../blog/index.html`, and add
   the item to `../blog/rss.xml`. (Articles are authored as static HTML — there is no
   Markdown build step; the Markdown draft is the human source, the HTML is the output.)
6. **Verify** — from the site root run:
   - `node scripts/aeo-audit.mjs` (answer-engine / GEO checks)
   - `node scripts/audit.mjs` (SEO/meta/links audit)
   - `npm test` (`scripts/test-site.mjs` + `scripts/test-tools.mjs`)
7. **Record** — move the finished `drafts/<slug>.md` to `published/<slug>.md` so the
   editable source stays alongside the shipped HTML.

## External / distribution versions

For Medium / Substack / LinkedIn / Reddit variants of an article, use the
`platform-post-writer` skill (handles canonical tags + per-platform format); schedule
social captions with `publish-scheduler`. Keep those as separate files under
`drafts/` if you want them tracked.

## Notes

- Blog-writing **skills** stay shared in `platform/skills/` — do not copy them here.
- This is the website's own git repo (`purposelabstudio/purposelabstudio.github.io`);
  commits here are independent of the PurposeLab monorepo.
