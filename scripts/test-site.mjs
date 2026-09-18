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
function activeMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
}
function openingTags(html, tag) {
  return [...activeMarkup(html).matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map((m) => m[0]);
}
function hasAnchor(html, hrefPattern, eventName) {
  return openingTags(html, 'a').some((tag) =>
    hrefPattern.test(tag) && tag.includes(`data-goatcounter-click="${eventName}"`)
  );
}

// Discover all HTML pages
const blogPosts = readdirSync(join(ROOT, 'blog'))
  .filter((d) => statSync(join(ROOT, 'blog', d)).isDirectory())
  .map((d) => `blog/${d}/index.html`)
  .filter((p) => existsSync(join(ROOT, p)));

const appPages = ['crumbs', 'folio', 'waterwise', 'bplog', 'hushly'].map((a) => `${a}/index.html`);
const corePages = ['index.html', 'about/index.html', 'support/index.html', 'blog/index.html', '404.html', 'apps/index.html', 'folio/journal/index.html'];
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
  check('newsletter.js does not claim an opaque request succeeded',
    /Request sent\. Please check your inbox/.test(nl) &&
      /request could not be sent/.test(nl) &&
      !/Thanks! Please check your inbox/.test(nl),
    'no-cors submission must distinguish request sent from confirmed subscription');
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
const APPSTORE = 'apps.apple.com/app/zolio-journal-diary-log/id6781551692';
const GO_FOLIO = '/go/folio-web-app/';
const stripLd = (html) => html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
const home8 = read('index.html');
check('homepage Folio card has App Store link', home8.includes(APPSTORE));
const folio = read('folio/index.html');
check('folio page has App Store button(s)', (folio.match(new RegExp(APPSTORE, 'g')) || []).length >= 2);
check('folio JSON-LD downloadUrl includes App Store', /"downloadUrl":\s*\[[^\]]*apps\.apple\.com/.test(folio));
// 8b. Primary CTAs are attributed through /go/, and the direct store link survives as a no-JS fallback.
// /go/ pages redirect via JS with only a Play-targeted <noscript> refresh, so an iOS visitor
// without JS depends on a real App Store link staying on the page itself (not just in schema).
check('homepage primary CTA routes through /go/folio-web-app/',
  /href="\/go\/folio-web-app\/"[^>]*data-goatcounter-click="ps-folio-home-hero"/.test(home8),
  'homepage hero CTA is not routed through /go/ with its click id intact');
check('folio page primary CTA routes through /go/folio-web-app/',
  /href="\/go\/folio-web-app\/"[^>]*data-goatcounter-click="ps-folio-apppage-hero"/.test(folio),
  'folio hero CTA is not routed through /go/ with its click id intact');
check('homepage keeps a direct App Store link outside JSON-LD (no-JS fallback)',
  stripLd(home8).includes(APPSTORE),
  'homepage App Store link exists only in schema; no visible fallback');
check('folio page keeps a direct App Store link outside JSON-LD (no-JS fallback)',
  stripLd(folio).includes(APPSTORE),
  'folio App Store link exists only in schema; no visible fallback');
check('folio JSON-LD downloadUrl stays canonical, never a /go/ redirector',
  !/"downloadUrl":\s*\[[^\]]*\/go\//.test(folio),
  'schema downloadUrl must point at the store, not at an attribution redirector');
check('homepage direct Play fallback has distinct GoatCounter attribution',
  /href="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.purposelab\.folio[^"]*home-hero"[^>]*data-goatcounter-click="ps-folio-home-hero-play"/.test(home8),
  'homepage direct Play link needs its own click id');
check('homepage direct App Store fallback has provider and campaign attribution',
  home8.includes('id6781551692?pt=129054116&amp;ct=website_home_hero&amp;mt=8') &&
    /ct=website_home_hero[^"]*"[^>]*data-goatcounter-click="ps-folio-home-hero-ios"/.test(home8),
  'homepage App Store link needs pt, ct, mt, and its own click id');
check('folio hero direct Play fallback has distinct GoatCounter attribution',
  /utm_campaign%3Dfolio-hero"[^>]*data-goatcounter-click="ps-folio-apppage-hero-play"/.test(folio),
  'folio hero direct Play link needs its own click id');
check('folio hero direct App Store fallback has provider and campaign attribution',
  folio.includes('id6781551692?pt=129054116&amp;ct=website_folio_hero&amp;mt=8') &&
    /ct=website_folio_hero[^"]*"[^>]*data-goatcounter-click="ps-folio-apppage-hero-ios"/.test(folio),
  'folio hero App Store link needs pt, ct, mt, and its own click id');
check('folio bottom direct Play fallback has distinct GoatCounter attribution',
  hasAnchor(folio, /utm_campaign%3Dfolio-cta/, 'ps-folio-apppage-cta-play'),
  'folio bottom direct Play link needs its own click id');
check('folio bottom direct App Store fallback has provider and campaign attribution',
  folio.includes('id6781551692?pt=129054116&amp;ct=website_folio_cta&amp;mt=8') &&
    hasAnchor(folio, /ct=website_folio_cta/, 'ps-folio-apppage-cta-ios'),
  'folio bottom App Store link needs pt, ct, mt, and its own click id');
{
  const campaignTokens = [...folio.matchAll(/apps\.apple\.com\/app\/zolio-journal-diary-log\/id6781551692\?pt=129054116&amp;ct=([^&"]+)&amp;mt=8/g)]
    .map((m) => m[1]);
  campaignTokens.push(...[...home8.matchAll(/apps\.apple\.com\/app\/zolio-journal-diary-log\/id6781551692\?pt=129054116&amp;ct=([^&"]+)&amp;mt=8/g)]
    .map((m) => m[1]));
  check('surfaced direct App Store links use distinct campaign tokens',
    campaignTokens.length === 3 && new Set(campaignTokens).size === 3,
    `expected 3 distinct ct tokens, got ${campaignTokens.join(', ')}`);
}

// 9. Every page's nav links to all 5 apps + Blog/About/Support (consistent internal graph)
const NAV_TARGETS = ['/folio/', '/folio/journal/', '/blog/', '/apps/', '/about/', '/support/'];
for (const p of allPages) {
  if (p === '404.html') continue; // standalone page with its own minimal link block
  const html = read(p);
  const nav = (html.match(/<nav class="nav"[^>]*>([\s\S]*?)<\/nav>/) || [, ''])[1];
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
  const active = activeMarkup(html);
  check(`${p}: links Play Store ${pkg}`, html.includes(`id=${pkg}`), 'no Play link');
  check(`${p}: has comparison table`, /class="compare"/.test(html), 'no compare table');
  check(`${p}: has FAQ`, /Frequently Asked Questions/i.test(html) && /"@type":\s*"FAQPage"/.test(html), 'no FAQ');
  check(`${p}: discloses PurposeLab ownership and conflict`,
    /Ownership and conflict disclosure:[\s\S]*PurposeLab Studio publishes this page and makes/i.test(active) &&
      /not an independent ranking/i.test(active),
    'comparison ownership or conflict disclosure missing');
  check(`${p}: publishes a dated evaluation method`,
    /Method, reviewed 18 September 2026:/i.test(active),
    'dated method missing');
  check(`${p}: labels product evidence and competitor limits`,
    /first-party product information/i.test(active) &&
      /Unknown(?:—|\/)not verified/i.test(active) &&
      /There is no independently verified single best app in this guide/i.test(active),
    'first-party or competitor evidence limits missing');
}

// 14b. The browser trial remains crawlable, local-font, private, and measurable.
{
  const trial = read('folio/try/index.html');
  check('folio trial: preserves canonical URL', /rel="canonical" href="https:\/\/purposelabstudio\.com\/folio\/try\/"/.test(trial));
  check('folio trial: uses local font assets only',
    /\/assets\/fonts\/fraunces-700\.woff2/.test(trial) &&
      !/fonts\.(?:googleapis|gstatic)\.com/.test(trial),
    'remote font dependency found');
  check('folio trial: excludes session-replay analytics',
    !/clarity\.ms|xjkggf7dd9/i.test(trial),
    'Clarity must not observe the journal trial');
  check('folio trial: explains browser-local handling',
    /does not save or submit it, and reloading clears it/i.test(trial),
    'visible privacy explanation missing');
  check('folio trial: completion and store transitions are measurable',
    /data-goatcounter-click="folio-try-complete"/.test(trial) &&
      /data-goatcounter-click="folio-try-store-android"/.test(trial) &&
      /data-goatcounter-click="folio-try-store-ios"/.test(trial),
    'distinct fixed events missing');
  check('folio trial: selectable controls expose pressed state',
    /data-mood="great"[^>]*aria-pressed="false"/.test(trial) &&
      /data-habit="walk"[^>]*aria-pressed="false"/.test(trial) &&
      /setAttribute\('aria-pressed'/.test(trial),
    'aria-pressed state missing');
  check('folio trial: heading precedes the interactive main',
    trial.indexOf('<h1 id="trial-title">') < trial.indexOf('<main class="stage"'),
    'page title must precede interactive controls');
}

// 14c. Safety-sensitive editorial pages retain explicit evidence and care boundaries.
{
  const immediate = read('blog/how-to-lower-blood-pressure-immediately-at-home/index.html');
  const byAge = read('blog/normal-blood-pressure-by-age/index.html');
  const natural = read('blog/how-to-lower-blood-pressure-naturally/index.html');
  const anxiety = read('blog/journaling-prompts-for-anxiety/index.html');
  const whiteNoise = read('blog/white-noise-baby-sleep-science/index.html');
  const babySleep = read('blog/baby-wont-sleep-through-night/index.html');
  const noiseColours = read('blog/brown-noise-vs-white-noise-vs-pink-noise/index.html');
  const hydration = read('blog/how-much-water-should-i-drink-daily/index.html');
  const healthPages = [immediate, byAge, natural, anxiety, whiteNoise, babySleep, noiseColours, hydration];
  const visibleText = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  for (const [index, html] of healthPages.entries()) {
    const active = activeMarkup(html);
    const sourceAside = active.match(/<aside class="[^"]*\bsources\b[^"]*">([\s\S]*?)<\/aside>/i)?.[1] || '';
    check(`health editorial ${index + 1}: discloses non-clinician review`,
      /Not (?:reviewed by a mental health clinician|clinician reviewed)/i.test(active),
      'review boundary missing');
    check(`health editorial ${index + 1}: cites visible sources`,
      /<h2>Sources<\/h2>/i.test(sourceAside) &&
        /<li>[\s\S]*?<a href="https?:\/\//i.test(sourceAside),
      'source section or citation link missing');
  }
  for (const [name, html] of [['immediate BP', immediate], ['BP by age', byAge], ['natural BP', natural]]) {
    check(`${name}: states the severe threshold without slash ambiguity`,
      /systolic (?:reading )?is higher than 180 mmHg and\/or the diastolic (?:reading )?is higher than 120 mmHg/i.test(visibleText(html)),
      'must distinguish systolic and diastolic thresholds');
  }
  check('BP by age: rejects unsupported adult age bands',
    /does not set separate blood pressure ranges by age for adults/i.test(byAge),
    'adult age-specific range caveat missing');
  check('anxiety prompts: includes crisis and professional-help boundaries',
    /Journaling is not crisis care/i.test(anxiety) &&
      /qualified mental health professional/i.test(anxiety),
    'mental-health safety boundary missing');
  check('baby sleep: avoids unsupported routine guarantees',
    !/Warm bath \(optional but effective\)|mimics the constant noise of the womb, which is comforting/i.test(babySleep) &&
      /no method guarantees longer sleep/i.test(babySleep),
    'unsupported sleep-effect claim found');
  check('infant noise pages: preserve safe-sleep and hearing boundaries',
    /Sound does not make an unsafe sleep space safe/i.test(whiteNoise) &&
      /Protect your hearing/i.test(noiseColours) &&
      /firm, flat, separate surface/i.test(babySleep),
    'infant sleep or hearing boundary missing');
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
const CANON_BASE = 'https://purposelabstudio.com/';
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
  const loc = `<loc>https://purposelabstudio.com${pageToPath(p)}</loc>`;
  check(`sitemap lists ${p}`, sitemap.includes(loc), `missing ${loc}`);
}

// 20. IndexNow submission list stays in sync with the sitemap (both directions)
const indexnow = read('submit-indexnow.sh');
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/purposelabstudio\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
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
  const url = 'https://purposelabstudio.com/' + p.replace(/index\.html$/, '');
  check(`llms.txt lists ${p}`, llmsTxt.includes(url), `missing ${url} in llms.txt`);
}

// 23. Studio-hub redesign + Zolio conversion and honesty invariants
{
  const home = read('index.html');
  check('home: Studio hero h1', /Small tools for everyday moments/.test(home), 'homepage h1 not Studio-forward');
  check('home: tagged Play hero CTA', /play\.google\.com[^"]*com\.purposelab\.folio[^"]*home-hero/.test(home), 'missing tagged Play hero CTA');
  check('home: App Store hero CTA', home.includes('apps.apple.com/app/zolio-journal-diary-log/id6781551692'), 'missing App Store CTA');
  check('home: hero CTA block is attributed via /go/folio-web-app/', home.includes('href="/go/folio-web-app/"'), 'homepage hero install CTA is not tracked');
  check('home: QR bridge uses home-qr asset', home.includes('/assets/qr-folio-home.svg'), 'homepage QR asset not referenced');
  check('home: links journaling hub', home.includes('href="/folio/journal/"'), 'homepage missing /folio/journal/ link');
  check('home: links apps index', home.includes('href="/apps/"'), 'homepage missing /apps/ link');
  for (const app of ['crumbs', 'waterwise', 'bplog', 'hushly']) {
    check(`home: apps-strip links /${app}/`, home.includes(`href="/${app}/"`), `homepage missing /${app}/`);
  }

  const apps = read('apps/index.html');
  for (const app of ['folio', 'crumbs', 'waterwise', 'bplog', 'hushly']) {
    check(`apps: lists ${app} card`, apps.includes(`/${app}/icon.png`), `/apps/ missing ${app} card`);
  }
  check('apps: explains Zolio’s backup boundary', /personal Google Drive or iCloud account is optional/.test(apps), 'apps must qualify Zolio backup');
  check('apps: explains BP Log boundary', /does not measure blood pressure and is not a medical device/.test(apps), 'apps must retain BP Log boundary');
  check('apps: CollectionPage schema', /"@type":\s*"CollectionPage"/.test(apps), 'missing CollectionPage schema');

  const hub = read('folio/journal/index.html');
  const journalPosts = [
    'why-journaling-apps-make-you-feel-guilty',
    'why-journaling-fails-and-how-to-stick-with-it',
    'daily-journal-vs-mood-tracker-why-you-need-both',
    'journaling-prompts-for-anxiety',
    'journaling-prompts-for-overthinking',
    'journaling-prompts-for-self-discovery',
  ];
  for (const slug of journalPosts) {
    check(`hub: links /blog/${slug}/`, hub.includes(`/blog/${slug}/`), `hub missing ${slug}`);
  }
  check('hub: ItemList schema', /"@type":\s*"ItemList"/.test(hub), 'hub missing ItemList schema');
  check('hub: tagged Play CTA (folio-journal-hub)', /folio-journal-hub/.test(hub), 'hub missing folio-journal-hub CTA');

  for (const slug of journalPosts) {
    const post = read(`blog/${slug}/index.html`);
    check(`post ${slug}: in-body hub back-link`, /Part of\s*<a href="\/folio\/journal\/"/.test(post), 'missing in-body /folio/journal/ back-link');
  }

  const folio = read('folio/index.html');
  check('folio: comparison table', /<table[^>]*class="compare"/.test(folio), 'missing comparison table');
  check('folio: GEO quotable intro', /free, offline, private daily journal and mood tracker/.test(folio), 'missing GEO intro sentence');
  check('folio: QR bridge uses folio-qr asset', folio.includes('/assets/qr-folio.svg'), 'folio QR asset not referenced');
  check('folio: links journaling hub', folio.includes('href="/folio/journal/"'), 'folio page missing /folio/journal/ link');

  check('assets/qr-folio.svg exists', existsSync(join(ROOT, 'assets/qr-folio.svg')), 'missing folio QR');
  check('assets/qr-folio-home.svg exists', existsSync(join(ROOT, 'assets/qr-folio-home.svg')), 'missing home QR');

  check('llms.txt: Zolio featured entity block', /Zolio \(Featured Product\)/.test(llmsTxt), 'missing Zolio featured block in llms.txt');
  check('llms.txt: preserves the Folio former-name association', /formerly Folio|Folio is now Zolio|formerly known as Folio/i.test(llmsTxt), 'llms.txt should keep the Folio→Zolio association for search/AI');
  check('llms.txt: frames Zolio for a global audience',
    /Available globally, with English and Hindi localization/.test(llmsTxt) &&
      /products are available to a global audience/.test(llmsTxt),
    'llms.txt should match current global positioning');
  check('Zolio: current App Store canonical listing is used',
    [home, folio, read('folio/diary/index.html'), llmsTxt].every((html) =>
      html.includes('apps.apple.com/app/zolio-journal-diary-log/id6781551692')),
    'one or more surfaced Zolio links use an obsolete App Store slug');
  check('Zolio: obsolete App Store slug is absent',
    ![home, folio, read('folio/diary/index.html'), llmsTxt].some((html) =>
      /folio-daily-journal-diary/.test(html)),
    'obsolete Folio App Store slug remains');

  // HONESTY: website copy must not contradict Zolio's real freemium/Plus model
  check('folio: FAQ does not claim "no in-app purchases"', !/no in-app purchases/i.test(folio), 'false claim: Zolio has Zolio Plus (IAP)');
  check('folio: acknowledges optional Zolio Plus', /Zolio Plus/.test(folio), 'page should acknowledge optional Zolio Plus for honesty');
  check('folio: compare price row is not a bare "Free"', !/>Price<\/td><td[^>]*>Free<\/td>/.test(folio), 'price row must reflect freemium (Free core + optional Plus)');

  const about = read('about/index.html');
  check('about: metadata represents apps, tools, and supported contexts',
    /<title>About PurposeLab Studio \| Privacy-First Apps &amp; Tools<\/title>/.test(about) &&
      /og:description" content="[^"]*apps and browser tools for Android, iOS, and WhatsApp/.test(about) &&
      /twitter:description" content="[^"]*apps and browser tools for Android, iOS, and WhatsApp/.test(about) &&
      /"description": "PurposeLab Studio builds simple, privacy-first apps and browser tools for Android, iOS, and WhatsApp/.test(about),
    'About metadata must reflect the current cross-platform portfolio');
  check('about: qualifies Zolio device storage with optional personal-cloud backup',
    /Zolio stores your notebook on your device by default[^.]*personal Google Drive or iCloud account/.test(about),
    'About must state both the on-device default and optional personal backup');
  check('about: does not claim the portfolio avoids recurring billing',
    !/none of them[^.]*recurring|no products?[^.]*recurring|never[^.]*recurring billing/i.test(about),
    'Zolio Plus has a monthly option');
  check('about: pricing names current conservative product boundaries',
    /Zolio Plus offers monthly or lifetime choices/.test(about) &&
      /Crumbs offers optional Pro and Max tiers/.test(about) &&
      /Hushly Premium is a one-time unlock/.test(about) &&
      /BP Log has nothing to buy inside it today/.test(about),
    'About pricing must match current product/support wording');
  check('studio entity: verified Apple developer profile is linked',
    home.includes('https://apps.apple.com/developer/atul-chaturvedi/id6781551694') &&
      about.includes('https://apps.apple.com/developer/atul-chaturvedi/id6781551694'),
    'home and About organization entities should link the Apple developer identity');

  for (const [page, image] of [
    ['folio/index.html', '/folio/og-share.png'],
    ['folio/journal/index.html', '/folio/og-share.png'],
    ['crumbs/index.html', '/crumbs/og-share.png'],
    ['bplog/index.html', '/bplog/og-share.png'],
    ['waterwise/index.html', '/waterwise/og-share.png'],
    ['hushly/index.html', '/hushly/og-share.png'],
  ]) {
    const html = read(page);
    check(`${page}: uses product large social card`,
      html.includes(`og:image" content="https://purposelabstudio.com${image}"`) &&
        /twitter:card" content="summary_large_image"/.test(html) &&
        /og:image:width" content="1200"/.test(html) &&
        /og:image:height" content="630"/.test(html),
      `expected ${image} at 1200x630`);
  }

  const linkConfig = JSON.parse(read('tools/link-config.json'));
  const crumbs = read('crumbs/index.html');
  const hushly = read('hushly/index.html');
  const bpLog = read('bplog/index.html');
  const waterWise = read('waterwise/index.html');
  const hydration = read('blog/how-much-water-should-i-drink-daily/index.html');
  check('Crumbs: generated links use a live web destination',
    linkConfig.apps.crumbs.android === null &&
      linkConfig.apps.crumbs.web === 'https://purposelabstudio.com/crumbs/' &&
      linkConfig.apps.crumbs.default === 'web',
    'Crumbs must not point at its unpublished Android package');
  check('Crumbs: schema only advertises the current WhatsApp surface',
    /"operatingSystem": "WhatsApp"/.test(crumbs) &&
      !/"operatingSystem": "WhatsApp, Android, iOS"/.test(crumbs),
    'Crumbs schema advertises unavailable native apps');
  check('Crumbs: WhatsApp troubleshooting CTA uses the preserved short link',
    /href="\/go\/crumbs-web-blog\/"/.test(read('blog/message-yourself-on-whatsapp-not-showing/index.html')) &&
      !/com\.purposelab\.crumbs/.test(read('blog/message-yourself-on-whatsapp-not-showing/index.html')),
    'article must not link to the unpublished Play package');
  check('Hushly: schema category matches the health listing',
    /"applicationCategory": "HealthApplication"/.test(hushly),
    'Hushly schema category mismatch');
  check('health product pages: primary guidance is cited',
    /heart\.org\/en\/health-topics\/high-blood-pressure/.test(bpLog) &&
      /nap\.nationalacademies\.org\/catalog\/10925/.test(waterWise) &&
      /publications\.aap\.org\/pediatrics/.test(hushly),
    'BP Log, WaterWise, and Hushly need primary-source links');
  check('hydration guide: primary sources and review boundary',
    /class="sources"/.test(hydration) &&
      /Not clinician reviewed/.test(hydration) &&
      /nap\.nationalacademies\.org\/catalog\/10925/.test(hydration),
    'hydration article must disclose review limits and cite primary guidance');
  for (const page of [
    'blog/what-happens-if-someone-reads-your-journal/index.html',
    'blog/why-journaling-apps-make-you-feel-guilty/index.html',
  ]) {
    const html = read(page);
    check(`${page}: labels publication date and canonical Zolio schema URL`,
      /class="meta"[^>]*>[^<]*Published/.test(html) &&
        /"url": "https:\/\/purposelabstudio\.com\/folio\/"/.test(html),
      'publication label or trailing slash is missing');
  }

  for (const [page, product] of [
    ['waterwise/index.html', 'WaterWise'],
    ['bplog/index.html', 'BP Log'],
    ['hushly/index.html', 'Hushly'],
  ]) {
    const html = read(page);
    const nav = (html.match(/<nav class="nav">([\s\S]*?)<\/nav>/) || [, ''])[1];
    check(`${page}: parent Apps nav is not aria-current`,
      !/<a href="\/apps\/"[^>]*aria-current="page"/.test(nav),
      `${product} is the current page, not /apps/`);
  }

  for (const [page, product, expectedAlt] of [
    ['folio/index.html', 'Zolio', 'Zolio app icon'],
    ['crumbs/index.html', 'Crumbs', 'Crumbs product icon'],
  ]) {
    const html = read(page);
    const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1];
    const textualHeading = h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    check(`${page}: h1 text includes product identity`, textualHeading.includes(product), `text-only h1 is "${textualHeading}"`);
    check(`${page}: hero icon has audit-safe alt`, h1.includes(`alt="${expectedAlt}"`), 'hero icon alt is missing or empty');
  }

  const rewrittenDates = new Map([
    ['index.html', '2026-09-18'],
    ['about/index.html', '2026-09-18T00:00:00+05:30'],
    ['apps/index.html', '2026-09-18'],
    ['blog/index.html', '2026-09-18'],
    ['bplog/index.html', '2026-09-18'],
    ['crumbs/index.html', '2026-09-18'],
    ['folio/index.html', '2026-09-18'],
    ['hushly/index.html', '2026-09-18'],
    ['support/index.html', '2026-09-18'],
    ['tools/index.html', '2026-09-18'],
    ['tools/water-intake-calculator/index.html', '2026-09-18'],
    ['waterwise/index.html', '2026-09-18'],
    ['blog/how-much-water-should-i-drink-daily/index.html', '2026-09-18'],
  ]);
  for (const [page, date] of rewrittenDates) {
    check(`${page}: rewritten dateModified is current`,
      read(page).includes(`"dateModified": "${date}"`),
      `expected ${date}`);
  }
  check('about: ProfilePage preserves full ISO 8601 dateModified',
    /"@type": "ProfilePage",[\s\S]*?"dateModified": "2026-09-18T00:00:00\+05:30"/.test(about),
    'ProfilePage dateModified must retain time and timezone');

  const whatsappFix = read('blog/message-yourself-on-whatsapp-not-showing/index.html');
  const whatsappNotes = read('blog/stop-messaging-yourself-on-whatsapp/index.html');
  const waterGuide = read('blog/water-reminder-app-without-ads/index.html');
  const waterComparison = read('best-free-water-reminder-app/index.html');
  const journalHub = read('folio/journal/index.html');
  const printableLog = read('bplog/printable-log/index.html');
  check('search intent: WhatsApp troubleshooting covers rename/profile-name intent',
    /cannot be renamed separately/.test(whatsappFix) && /Can You Rename "Message Yourself"\?/.test(whatsappFix),
    'troubleshooting page must answer the visible rename/profile query cluster');
  check('search intent: WhatsApp notes article is distinct from troubleshooting',
    /<title>Stop Using WhatsApp as a Notes-to-Self App<\/title>/.test(whatsappNotes),
    'notes workflow page title must not compete with the missing-chat fix');
  check('search intent: water guide and comparison have distinct roles',
    /<title>Water Reminder App Without Ads: What to Look For<\/title>/.test(waterGuide) &&
      /<title>How to Choose the Best Free Water Reminder App<\/title>/.test(waterComparison),
    'water information and commercial pages need distinct SERP propositions');
  check('AI discovery: journal hub explicitly covers generic prompt intent',
    /<h1>Journaling prompts and a calm daily journal guide<\/h1>/.test(journalHub) &&
      /journaling prompts for self-discovery, anxiety, overthinking, and reflection/i.test(journalHub),
    'journal collection must serve the generic prompts cluster');
  check('index discovery: hubs link directly to reported utility URLs',
    /href="\/folio\/try\/"/.test(read('blog/index.html')) &&
      /href="\/bplog\/printable-log\/"/.test(read('blog/index.html')) &&
      /href="\/bplog\/printable-log\/"/.test(read('bplog/index.html')),
    'reported discovered-not-indexed utilities need contextual internal links');
  check('conversion measurement: printable BP actions have explicit events',
    /data-goatcounter-click="bplog-printable-print"/.test(printableLog) &&
      /data-goatcounter-click="bplog-printable-pdf-download"/.test(printableLog) &&
      /data-goatcounter-click="bplog-printable-open-app"/.test(printableLog),
    'print, download, and app-page transitions must be separately measurable');
  for (const [page, eventName, marker] of [
    ['tools/blood-pressure-checker/index.html', 'tool-bp-checker-complete', `track('tool-bp-checker-complete'`],
    ['tools/water-intake-calculator/index.html', 'tool-water-calculator-complete', `track('tool-water-calculator-complete'`],
    ['tools/journal-prompt-generator/index.html', 'tool-journal-prompt-generate', 'data-goatcounter-click="tool-journal-prompt-generate"'],
    ['tools/white-noise-player/index.html', 'tool-white-noise-toggle', 'data-goatcounter-click="tool-white-noise-toggle"'],
  ]) {
    check(`${page}: tool action is measurable without input values`,
      activeMarkup(read(page)).includes(marker) || read(page).includes(marker),
      `expected ${eventName}`);
  }
  for (const page of [
    'folio/try/index.html',
    'tools/blood-pressure-checker/index.html',
    'tools/water-intake-calculator/index.html',
  ]) {
    check(`${page}: sensitive inputs exclude session replay`,
      !/clarity\.ms|xjkggf7dd9/i.test(read(page)),
      'Clarity must not load on sensitive input surfaces');
  }

  for (const [page, campaign, eventName] of [
    ['bplog/index.html', 'bplog-cta', 'ps-bplog-apppage-cta'],
    ['waterwise/index.html', 'waterwise-cta', 'ps-waterwise-apppage-cta'],
    ['hushly/index.html', 'hushly-cta', 'ps-hushly-apppage-cta'],
  ]) {
    check(`${page}: bottom install CTA keeps campaign and event on one link`,
      hasAnchor(read(page), new RegExp(`utm_campaign%3D${campaign}`), eventName),
      'bottom CTA attribution missing or split across elements');
  }

  const readingSection = folio.match(/<section class="section" aria-labelledby="reading-title">([\s\S]*?)<\/section>/)?.[1] || '';
  const readingHrefs = [...readingSection.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  check('folio: keep-exploring links are unique',
    readingHrefs.length > 0 && new Set(readingHrefs).size === readingHrefs.length,
    `duplicate links: ${readingHrefs.filter((href, i) => readingHrefs.indexOf(href) !== i).join(', ')}`);

  const support = read('support/index.html');
  for (const product of ['Zolio', 'Crumbs', 'WaterWise', 'BP Log', 'Hushly']) {
    const metadata = support.slice(0, support.indexOf('</head>'));
    check(`support metadata: includes ${product}`, metadata.includes(product), `${product} missing from support metadata`);
  }
  check('blog index: navigation landmarks are named',
    /<nav class="nav" aria-label="Primary">/.test(read('blog/index.html')) &&
      /<nav class="card" aria-label="Browse guide topics">/.test(read('blog/index.html')),
    'both navigation landmarks need distinct names');
  check('homepage: desktop-only QR bridge is scoped and responsive',
    /class="card qr-bridge"/.test(read('index.html')) &&
      /\.qr-bridge[\s\S]*max-width:\s*26rem/.test(read('style.css')) &&
      /@media \(max-width: 600px\)[\s\S]*\.qr-bridge[\s\S]*display:\s*none/.test(read('style.css')),
    'QR bridge needs a desktop cap and mobile hide rule');
  check('shared cards: paragraphs and disclosure summaries retain readable spacing',
    /\.card > :where\(p, ul, ol\) \+ :where\(p, ul, ol\)[\s\S]*margin-top:\s*var\(--space-3\)/.test(read('style.css')) &&
      /\.card summary[\s\S]*min-height:\s*var\(--control-min-height\)/.test(read('style.css')),
    'card flow or 44px summary target missing');
}

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\nFailures:');
  for (const f of failures) console.log('  ✗ ' + f);
  process.exit(1);
}
console.log('All checks passed ✓');
