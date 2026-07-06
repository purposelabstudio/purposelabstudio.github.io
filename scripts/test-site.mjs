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
const allPages = [...corePages, ...appPages, ...blogPosts, DIARY];

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

// 5b. Folio Diary sales page
{
  const html = read(DIARY);
  check('diary: waitlist form with custom subject', /form class="fallback-input js-subscribe"[^>]*data-subject="Folio Diary/.test(html));
  check('diary: loads newsletter.js', /assets\/newsletter\.js/.test(html));
  check('diary: Product JSON-LD has price 699 INR', /"price":\s*"699"[\s\S]*"priceCurrency":\s*"INR"/.test(html));
  check('diary: PreOrder availability', /schema\.org\/PreOrder/.test(html));
  check('diary: shows \u20b9699 price', /\u20b9699/.test(html));
  check('diary: links back to Folio app page', /href="\/folio\/"/.test(html));
  check('diary: has no-JS waitlist fallback', /<noscript>[\s\S]*mailto:[\s\S]*<\/noscript>/.test(html));
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

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('All checks passed ✓');
