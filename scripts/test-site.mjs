// scripts/test-site.mjs — static-site validation suite.
// Run: node scripts/test-site.mjs   (or: npm test)
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(detail ? `${name} — ${detail}` : name); }
}

function read(p) { return readFileSync(join(ROOT, p), 'utf8'); }

// Discover all HTML pages
const blogPosts = readdirSync(join(ROOT, 'blog'))
  .filter((d) => statSync(join(ROOT, 'blog', d)).isDirectory())
  .map((d) => `blog/${d}/index.html`)
  .filter((p) => existsSync(join(ROOT, p)));

const appPages = ['crumbs', 'folio', 'waterwise', 'bplog', 'hushly'].map((a) => `${a}/index.html`);
const corePages = ['index.html', 'about/index.html', 'support/index.html', 'blog/index.html', '404.html'];
const DIARY = 'folio/diary/index.html';
const toolPages = ['tools/index.html', 'tools/water-intake-calculator/index.html', 'tools/blood-pressure-checker/index.html', 'tools/journal-prompt-generator/index.html', 'tools/white-noise-player/index.html'];
const commercialPages = ['best-free-blood-pressure-app/index.html', 'best-free-water-reminder-app/index.html', 'best-free-baby-sleep-app/index.html', 'best-free-journal-app/index.html'];
const allPages = [...corePages, ...appPages, ...blogPosts, DIARY, ...toolPages, ...commercialPages];

// 1. SEO invariants on every indexable page (404 is noindex, skip canonical there)
for (const p of allPages) {
  const html = read(p);
  check(`${p}: has viewport`, /name="viewport"/i.test(html));
  check(`${p}: links a stylesheet`, /rel="stylesheet"/i.test(html) || p === '404.html');
  if (p !== '404.html') {
    check(`${p}: has canonical`, /rel="canonical"/i.test(html));
    check(`${p}: has og:title`, /property="og:title"/i.test(html));
  }
}

// 2. Every JSON-LD block parses as valid JSON
for (const p of allPages) {
  const html = read(p);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (let i = 0; i < blocks.length; i++) {
    let ok = true, msg = '';
    try { JSON.parse(blocks[i][1]); } catch (e) { ok = false; msg = e.message; }
    check(`${p}: JSON-LD block ${i} valid`, ok, msg);
  }
}

// 3. Internal links resolve to a real file
function resolveInternal(href) {
  let h = href.split('#')[0].split('?')[0];
  if (!h) return true; // pure anchor
  if (!h.startsWith('/')) return true; // relative links vary by depth; skip
  h = h.replace(/^\//, '');
  if (h === '') h = 'index.html';
  const candidates = [h, join(h, 'index.html'), h.endsWith('/') ? join(h, 'index.html') : h];
  return candidates.some((c) => existsSync(join(ROOT, c)));
}
for (const p of allPages) {
  const html = read(p);
  const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    // skip external absolute and privacy-policies (separate repo/site)
    if (href.startsWith('//') || href.includes('privacy-policies')) continue;
    check(`${p}: internal link ${href} resolves`, resolveInternal(href), 'target missing');
  }
}

// 4. Each app page carries its own scoped theme override
for (const p of appPages) {
  const html = read(p);
  check(`${p}: has scoped :root theme override`, /<style>[\s\S]*:root\s*\{[\s\S]*--accent[\s\S]*\}[\s\S]*<\/style>/.test(html));
}

// 5. Newsletter wiring on homepage + blog index
for (const p of ['index.html', 'blog/index.html']) {
  const html = read(p);
  check(`${p}: has MailerLite placeholder`, /MAILERLITE FORM/.test(html));
  check(`${p}: has functional subscribe form`, /form class="fallback-input js-subscribe"/.test(html));
  check(`${p}: requires email input`, /type="email"[^>]*required/.test(html));
  check(`${p}: has no-JS fallback`, /<noscript>[\s\S]*mailto:[\s\S]*<\/noscript>/.test(html));
  check(`${p}: loads newsletter.js`, /assets\/newsletter\.js/.test(html));
}
check('assets/newsletter.js exists', existsSync(join(ROOT, 'assets/newsletter.js')));
// 5b. newsletter.js is wired to the MailerLite form endpoint
{
  const nl = read('assets/newsletter.js');
  check('newsletter.js posts to MailerLite endpoint', /assets\.mailerlite\.com\/jsonp\/2499229\/forms\/192498487000040910\/subscribe/.test(nl), 'ML endpoint missing');
  check('newsletter.js sends fields[email]', /fields\[email\]/.test(nl), 'ML email field missing');
  check('newsletter.js keeps mailto fallback for waitlists', /dataset\.subject/.test(nl) && /__buildSubscribeMailto/.test(nl), 'mailto fallback removed');
}

// 5b. Folio Diary sales page
{
  const html = read(DIARY);
  check('diary: Product JSON-LD has price 9.99 USD', /"price":\s*"9\.99"[\s\S]*"priceCurrency":\s*"USD"/.test(html));
  check('diary: InStock availability', /schema\.org\/InStock/.test(html));
  check('diary: shows $9.99 launch price', /\$9\.99/.test(html));
  check('diary: links back to Folio app page', /href="\/folio\/"/.test(html));
  check('diary: advertises ~50% launch offer', /50%\s*off/i.test(html));
  check('diary: has Amazon buy button', /Get it on Amazon/.test(html));
  check('diary: no Flipkart references', !/Flipkart/i.test(html));
  check('homepage/folio links to diary', read('folio/index.html').includes('/folio/diary/'));
}

// 6. Every blog post has the reading enhancements + correct app CTA
const CTA_MAP = {
  'build-a-second-brain-on-whatsapp': '/crumbs/',
  'stop-messaging-yourself-on-whatsapp': '/crumbs/',
  'daily-journal-vs-mood-tracker-why-you-need-both': '/folio/',
  'why-journaling-fails-and-how-to-stick-with-it': '/folio/',
  'how-much-water-should-i-drink-daily': '/waterwise/',
  'why-water-apps-are-full-of-ads': '/waterwise/',
  'how-to-lower-blood-pressure-naturally': '/bplog/',
  'how-to-track-blood-pressure-at-home': '/bplog/',
  'normal-blood-pressure-by-age': '/bplog/',
  'baby-wont-sleep-through-night': '/hushly/',
  'white-noise-baby-sleep-science': '/hushly/',
};
for (const p of blogPosts) {
  const html = read(p);
  const slug = p.split('/')[1];
  check(`${p}: has progress bar`, /class="progress-bar"/.test(html));
  check(`${p}: has TOC`, /class="toc"/.test(html));
  check(`${p}: has app CTA`, /class="app-cta"/.test(html));
  check(`${p}: loads blog.js`, /assets\/blog\.js/.test(html));
  check(`${p}: links RSS alternate`, /application\/rss\+xml/.test(html));
  if (CTA_MAP[slug]) {
    check(`${p}: CTA links ${CTA_MAP[slug]}`, new RegExp(`app-cta[\\s\\S]*href="${CTA_MAP[slug]}"`).test(html), 'wrong app in CTA');
  }
}
check('assets/blog.js exists', existsSync(join(ROOT, 'assets/blog.js')));

// 7. RSS feed well-formed-ish and item count matches posts
const rss = read('blog/rss.xml');
check('rss.xml declares xml', rss.trimStart().startsWith('<?xml'));
check('rss.xml has channel', /<rss[\s\S]*<channel>[\s\S]*<\/channel>[\s\S]*<\/rss>/.test(rss));
const itemCount = (rss.match(/<item>/g) || []).length;
check(`rss.xml has an <item> per post (${itemCount} vs ${blogPosts.length})`, itemCount === blogPosts.length,
  `${itemCount} items for ${blogPosts.length} posts`);

// 8. Folio App Store links present everywhere expected
const APPSTORE = 'apps.apple.com/us/app/folio-daily-journal-diary/id6781551692';
check('homepage Folio card has App Store link', read('index.html').includes(APPSTORE));
const folio = read('folio/index.html');
check('folio page has App Store button(s)', (folio.match(new RegExp(APPSTORE, 'g')) || []).length >= 2);
check('folio JSON-LD downloadUrl includes App Store', /"downloadUrl":\s*\[[^\]]*apps\.apple\.com/.test(folio));

// 9. Every page's nav links to all 5 apps + Blog/About/Support (consistent internal graph)
const NAV_TARGETS = ['/crumbs/', '/folio/', '/waterwise/', '/bplog/', '/hushly/', '/blog/', '/about/', '/support/'];
for (const p of allPages) {
  if (p === '404.html') continue; // standalone page with its own minimal link block
  const html = read(p);
  const nav = (html.match(/<nav class="nav">([\s\S]*?)<\/nav>/) || [, ''])[1];
  for (const t of NAV_TARGETS) {
    check(`${p}: nav links ${t}`, nav.includes(`href="${t}"`), 'missing from nav');
  }
}

// 10. Multi-post clusters cross-link siblings via a .related-guides block
const CLUSTERS = {
  '/bplog/': ['how-to-track-blood-pressure-at-home', 'normal-blood-pressure-by-age', 'how-to-lower-blood-pressure-naturally'],
  '/hushly/': ['white-noise-baby-sleep-science', 'baby-wont-sleep-through-night'],
  '/waterwise/': ['how-much-water-should-i-drink-daily', 'why-water-apps-are-full-of-ads'],
  '/folio/': ['why-journaling-fails-and-how-to-stick-with-it', 'daily-journal-vs-mood-tracker-why-you-need-both'],
  '/crumbs/': ['stop-messaging-yourself-on-whatsapp', 'build-a-second-brain-on-whatsapp'],
};
for (const [app, slugs] of Object.entries(CLUSTERS)) {
  for (const slug of slugs) {
    const html = read(`blog/${slug}/index.html`);
    check(`${slug}: has related-guides block`, /class="related-guides"/.test(html));
    for (const sib of slugs) {
      if (sib === slug) continue;
      check(`${slug}: related links sibling ${sib}`, html.includes(`/blog/${sib}/`), 'sibling link missing');
    }
  }
}

// 11. Every blog post exposes an FAQ (FAQPage schema + visible heading) for AEO
for (const p of blogPosts) {
  const html = read(p);
  check(`${p}: has FAQPage JSON-LD`, /"@type":\s*"FAQPage"/.test(html), 'no FAQPage schema');
  check(`${p}: has visible FAQ heading`, /Frequently Asked Questions/i.test(html), 'no visible FAQ');
}

// 12. Each interactive tool imports its module and links to its app
const TOOL_APP = {
  'tools/water-intake-calculator/index.html': '/waterwise/',
  'tools/blood-pressure-checker/index.html': '/bplog/',
  'tools/journal-prompt-generator/index.html': '/folio/',
  'tools/white-noise-player/index.html': '/hushly/',
};
for (const [p, app] of Object.entries(TOOL_APP)) {
  const html = read(p);
  check(`${p}: uses ES module`, /<script type="module">/.test(html), 'no module script');
  check(`${p}: links its app ${app}`, html.includes(`href="${app}"`), 'no app link');
  check(`${p}: has WebApplication schema`, /"@type":\s*"WebApplication"/.test(html));
}

// 13. Tools are internally linked from their cluster post and app page
const TOOL_BACKLINKS = {
  '/tools/water-intake-calculator/': ['blog/how-much-water-should-i-drink-daily/index.html', 'waterwise/index.html'],
  '/tools/blood-pressure-checker/': ['blog/normal-blood-pressure-by-age/index.html', 'bplog/index.html'],
  '/tools/journal-prompt-generator/': ['blog/why-journaling-fails-and-how-to-stick-with-it/index.html', 'folio/index.html'],
  '/tools/white-noise-player/': ['blog/white-noise-baby-sleep-science/index.html', 'hushly/index.html'],
};
for (const [tool, pages] of Object.entries(TOOL_BACKLINKS)) {
  for (const pg of pages) check(`${pg}: links ${tool}`, read(pg).includes(`href="${tool}"`), 'tool link missing');
}

// 14. Commercial pages link their app's Play Store listing + carry a comparison table & FAQ
const COMMERCIAL_APP = {
  'best-free-blood-pressure-app/index.html': 'com.purposelab.bplog',
  'best-free-water-reminder-app/index.html': 'com.purposelab.waterwise',
  'best-free-baby-sleep-app/index.html': 'com.purposelab.hushly',
  'best-free-journal-app/index.html': 'com.purposelab.folio',
};
for (const [p, pkg] of Object.entries(COMMERCIAL_APP)) {
  const html = read(p);
  check(`${p}: links Play Store ${pkg}`, html.includes(`id=${pkg}`), 'no Play link');
  check(`${p}: has comparison table`, /class="compare"/.test(html), 'no compare table');
  check(`${p}: has FAQ`, /Frequently Asked Questions/i.test(html) && /"@type":\s*"FAQPage"/.test(html), 'no FAQ');
}

// 15. Commercial pages are internally linked from their app page and cluster posts
const COMMERCIAL_BACKLINKS = {
  '/best-free-blood-pressure-app/': ['bplog/index.html', 'blog/how-to-track-blood-pressure-at-home/index.html'],
  '/best-free-water-reminder-app/': ['waterwise/index.html', 'blog/how-much-water-should-i-drink-daily/index.html'],
  '/best-free-baby-sleep-app/': ['hushly/index.html', 'blog/white-noise-baby-sleep-science/index.html'],
  '/best-free-journal-app/': ['folio/index.html', 'blog/why-journaling-fails-and-how-to-stick-with-it/index.html'],
};
for (const [pg, pages] of Object.entries(COMMERCIAL_BACKLINKS)) {
  for (const src of pages) check(`${src}: links ${pg}`, read(src).includes(`href="${pg}"`), 'commercial link missing');
}

// 16. Every indexable page is reachable from the homepage by following internal links (no orphans)
function hrefToPage(href) {
  let h = href.split('#')[0].split('?')[0];
  if (h.startsWith('//') || /^https?:/i.test(h) || h.startsWith('mailto:')) return null;
  if (!h.startsWith('/')) return null; // relative links vary by depth; skip
  h = h.replace(/^\//, '');
  if (h === '' || h.endsWith('/')) h += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(h)) h += '/index.html';
  return existsSync(join(ROOT, h)) ? h : null;
}
const reachable = new Set(['index.html']);
const queue = ['index.html'];
while (queue.length) {
  const cur = queue.shift();
  for (const m of read(cur).matchAll(/href="([^"]+)"/g)) {
    const pg = hrefToPage(m[1]);
    if (pg && !reachable.has(pg)) { reachable.add(pg); queue.push(pg); }
  }
}
for (const p of allPages) {
  if (p === '404.html') continue; // error page, intentionally not linked
  check(`${p}: reachable from homepage`, reachable.has(p), 'orphaned — no internal link path from /');
}

// 17. Canonical is self-referential (matches the page's own path) — guards copy-paste canonicals
const CANON_BASE = 'https://purposelabstudio.github.io/';
for (const p of allPages) {
  if (p === '404.html') continue;
  const m = read(p).match(/rel="canonical" href="([^"]*)"/);
  const expected = CANON_BASE + p.replace(/index\.html$/, '');
  check(`${p}: canonical is self-referential`, !!m && m[1] === expected, m ? `got ${m[1]}` : 'no canonical');
}

// 18. Interactive tool pages: every #id referenced in the module script exists in the HTML
for (const p of toolPages) {
  if (p === 'tools/index.html') continue; // hub has no interactive script
  const html = read(p);
  const script = (html.match(/<script type="module">([\s\S]*?)<\/script>/) || [, ''])[1];
  const ids = [...script.matchAll(/[$]\('#([\w-]+)'\)|querySelector\('#([\w-]+)'\)|getElementById\('([\w-]+)'\)/g)].map((m) => m[1] || m[2] || m[3]);
  for (const id of [...new Set(ids)]) {
    check(`${p}: element #${id} exists for its script`, new RegExp(`id="${id}"`).test(html), 'referenced id missing');
  }
}

// 19. No deprecated schema types (rich results retired by Google) — guards regressions
const DEPRECATED_SCHEMA = ['HowTo', 'SpecialAnnouncement', 'ClaimReview'];
for (const p of allPages) {
  const html = read(p);
  for (const t of DEPRECATED_SCHEMA) {
    check(`${p}: no deprecated schema "${t}"`, !new RegExp(`"@type":\\s*"${t}"`).test(html), `found ${t}`);
  }
}

// 20. No duplicate <title> across pages (cannibalization / copy-paste guard)
const titleOwners = {};
for (const p of allPages) {
  const t = (read(p).match(/<title>([^<]*)<\/title>/) || [, ''])[1].trim();
  if (t) (titleOwners[t] = titleOwners[t] || []).push(p);
}
for (const [t, owners] of Object.entries(titleOwners)) {
  check(`title unique: "${t.slice(0, 50)}"`, owners.length === 1, `shared by ${owners.join(', ')}`);
}

// 21. Tool + commercial pages show a visible breadcrumb matching their BreadcrumbList schema
for (const p of [...toolPages, ...commercialPages]) {
  check(`${p}: has visible breadcrumb`, /class="crumbs"/.test(read(p)), 'no visible breadcrumb');
}

// 19. Every indexable page appears in sitemap.xml (guards hand-maintained sitemap drift)
const sitemap = read('sitemap.xml');
const pageToPath = (p) => '/' + p.replace(/index\.html$/, '');
for (const p of allPages) {
  if (p === '404.html') continue; // noindex error page
  const loc = `<loc>https://purposelabstudio.github.io${pageToPath(p)}</loc>`;
  check(`sitemap lists ${p}`, sitemap.includes(loc), `missing ${loc}`);
}

// 20. IndexNow submission list stays in sync with the sitemap (both directions)
const indexnow = read('submit-indexnow.sh');
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/purposelabstudio\.github\.io(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
for (const path of sitemapPaths) {
  check(`IndexNow lists ${path}`, indexnow.includes('${HOST}' + path + '"'), `missing ${path} in submit-indexnow.sh`);
}

// 21. Author attribution present on every indexable page (E-E-A-T / AEO signal)
for (const p of allPages) {
  if (p === '404.html') continue;
  check(`${p}: has author meta`, /<meta\s+name="author"/i.test(read(p)), 'missing <meta name="author">');
}

// 22. llms.txt lists every blog post (guards the manually-maintained AEO/GEO index)
const llmsTxt = read('llms.txt');
for (const p of blogPosts) {
  const url = 'https://purposelabstudio.github.io/' + p.replace(/index\.html$/, '');
  check(`llms.txt lists ${p}`, llmsTxt.includes(url), `missing ${url} in llms.txt`);
}

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('All checks passed ✓');
