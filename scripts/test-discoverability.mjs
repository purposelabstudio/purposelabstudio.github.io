// Discoverability invariants that the existing suite does not cover:
//  1. every indexable page declares max-image-preview:large (Google Discover eligibility)
//  2. sitemap.xml and the set of indexable pages on disk agree
//  3. no indexable page is orphaned (zero inbound internal links)
//  4. submit-indexnow.sh covers exactly the sitemap
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const SKIP = /^(go|docs|node_modules|\.git|\.github)\//;
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

for (const f of fails) console.log(`FAIL  ${f}`);
console.log(`\ndiscoverability: ${indexable.length} indexable pages · ${smUrls.size} sitemap URLs · ${fails.length} FAIL`);
if (fails.length) process.exit(1);
