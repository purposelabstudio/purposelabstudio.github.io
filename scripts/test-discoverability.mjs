// Discoverability invariants that the existing suite does not cover:
//  1. every indexable page declares max-image-preview:large (Google Discover eligibility)
//  2. sitemap.xml and the set of indexable pages on disk agree
//  3. no indexable page is orphaned (zero inbound internal links)
//  4. submit-indexnow.sh covers exactly the sitemap
//  5. llms.txt covers every sitemap URL
//  6. every indexable page carries a dateModified/datePublished signal
import { readFileSync, readdirSync, existsSync } from 'node:fs';

// Skips top-level build/vendor dirs and ANY dot-directory (.git, .github,
// .superpowers scratch) so local artifacts can never diverge results from CI.
const SKIP = /(^|\/)\.|^(go|docs|node_modules)\//;
const htmlFiles = readdirSync('.', { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.html'))
  .filter((f) => SKIP.test(f) === false && f !== '404.html');

const toUrl = (f) => '/' + f.replace(/index\.html$/, '');
const pages = htmlFiles.map((f) => ({ file: f, url: toUrl(f), html: readFileSync(f, 'utf8') }));
const indexable = pages.filter((p) => /<meta[^>]+name="robots"[^>]+noindex/i.test(p.html) === false);

const fails = [];

// 1. image preview
for (const p of indexable) {
  if (p.html.includes('max-image-preview:large') === false) {
    fails.push(`missing max-image-preview:large — ${p.url}`);
  }
}

// 2. sitemap parity
const sitemap = readFileSync('sitemap.xml', 'utf8');
const smUrls = new Set([...sitemap.matchAll(/<loc>https:\/\/purposelabstudio\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/'));
for (const p of indexable) {
  if (smUrls.has(p.url) === false) fails.push(`indexable but not in sitemap.xml — ${p.url}`);
}
for (const u of smUrls) {
  const onDisk = indexable.some((p) => p.url === u);
  if (onDisk === false) fails.push(`in sitemap.xml but not an indexable page on disk — ${u}`);
}

// 3. orphans
const inbound = new Map();
for (const p of pages) {
  const hrefs = [...p.html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1])
    .filter((u) => u.startsWith('/go/') === false)
    .filter((u) => /\.[a-z0-9]{2,5}$/i.test(u) === false || u.endsWith('/'));
  for (const h of new Set(hrefs)) {
    const k = h.endsWith('/') ? h : h + '/';
    if (k !== p.url) inbound.set(k, (inbound.get(k) ?? 0) + 1);
  }
}
for (const p of indexable) {
  if (p.url === '/') continue;
  if ((inbound.get(p.url) ?? 0) === 0) fails.push(`orphan, zero inbound internal links — ${p.url}`);
}

// 4. IndexNow parity
if (existsSync('submit-indexnow.sh')) {
  const sh = readFileSync('submit-indexnow.sh', 'utf8');
  for (const u of smUrls) {
    const path = u === '/' ? '/"' : u + '"';
    if (sh.includes(path) === false) fails.push(`in sitemap but missing from submit-indexnow.sh — ${u}`);
  }
}

// 5. llms.txt parity — every sitemap URL should be discoverable in llms.txt
if (existsSync('llms.txt')) {
  const llms = readFileSync('llms.txt', 'utf8');
  for (const u of smUrls) {
    if (llms.includes(u) === false) fails.push(`in sitemap but missing from llms.txt — ${u}`);
  }
}

// 6. date signal — every indexable page must declare when it was last updated,
// so an assistant can judge whether a product or comparison claim is current.
for (const p of indexable) {
  if (/"date(Modified|Published)"\s*:/.test(p.html) === false) {
    fails.push(`no dateModified or datePublished in JSON-LD — ${p.url}`);
  }
}

// 7. the two dates must agree. The sitemap had been bulk-stamped once and left,
// so 18 pages asserted one last-modified date in sitemap.xml and a different one
// in their own JSON-LD. Two contradictory claims about the same fact is worse
// than a stale one — an engine has to decide which of us to disbelieve.
// Fix with: node scripts/sync-sitemap-lastmod.mjs
{
  const sm = readFileSync('sitemap.xml', 'utf8');
  const lastmods = new Map(
    [...sm.matchAll(/<loc>https:\/\/purposelabstudio\.com([^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g)]
      .map((m) => [m[1] || '/', m[2].slice(0, 10)]),
  );
  let compared = 0;
  for (const p of indexable) {
    const lastmod = lastmods.get(p.url);
    const declared = p.html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})/);
    if (!lastmod || !declared) continue;
    compared += 1;
    if (lastmod !== declared[1]) {
      fails.push(
        `sitemap lastmod ${lastmod} contradicts JSON-LD dateModified ${declared[1]} — ${p.url}`,
      );
    }
  }
  // A comparison that compares nothing passes forever.
  if (compared < 20) {
    fails.push(`only ${compared} lastmod/dateModified pairs compared — the parser is probably broken`);
  }
}

for (const f of fails) console.log(`FAIL  ${f}`);
console.log(`\ndiscoverability: ${indexable.length} indexable pages · ${smUrls.size} sitemap URLs · ${fails.length} FAIL`);
if (fails.length) process.exit(1);
