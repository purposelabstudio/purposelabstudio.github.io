// Derive sitemap <lastmod> from each page's own JSON-LD dateModified.
//
// The sitemap had been bulk-stamped 2026-07-06/07-09 and never touched again,
// so 18 pages ended up asserting two different "last modified" dates: one in
// sitemap.xml and a different one in their own structured data. An engine
// reconciling that has to distrust one of them, and Bing had not re-read the
// sitemap since 2026-07-15.
//
// This does NOT stamp everything with today's date. It copies each page's own
// declared content date, so a page whose real last content change was
// 2026-06-06 gets 2026-06-06 — older than the bulk value it replaces. lastmod
// is meant to reflect significant CONTENT change; bumping all of them because
// a font preload or a colour token changed would be the same mistake as
// announcing the whole site to IndexNow on every commit.
//
// Pages with no dateModified keep whatever lastmod they already had.
//
// Run: node scripts/sync-sitemap-lastmod.mjs

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

if (!existsSync('sitemap.xml')) {
  console.error('sitemap.xml not found. Run this from the repo root.');
  process.exit(1);
}

export function pageFileFor(urlPath) {
  return urlPath === '/' ? 'index.html' : `${urlPath.replace(/^\/|\/$/g, '')}/index.html`;
}

export function dateModifiedOf(html) {
  const m = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

const sitemap = readFileSync('sitemap.xml', 'utf8');
let changed = 0;
let skipped = 0;

const updated = sitemap.replace(
  /(<loc>https:\/\/purposelabstudio\.com([^<]*)<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g,
  (whole, open, urlPath, current, close) => {
    const file = pageFileFor(urlPath);
    if (!existsSync(file)) {
      skipped += 1;
      return whole;
    }
    const declared = dateModifiedOf(readFileSync(file, 'utf8'));
    if (!declared) {
      skipped += 1;
      return whole;
    }
    if (declared !== current.slice(0, 10)) changed += 1;
    return `${open}${declared}${close}`;
  },
);

writeFileSync('sitemap.xml', updated);
console.log(`sitemap lastmod synced from JSON-LD: ${changed} updated, ${skipped} left alone`);
