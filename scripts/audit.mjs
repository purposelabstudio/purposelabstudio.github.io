// scripts/audit.mjs — on-page SEO linter for the static site.
// Usage:
//   node scripts/audit.mjs <file.html> [--jsonld]   audit one file
//   node scripts/audit.mjs --all                     audit every HTML page
//
// Folds in evidence-based on-page signals (title/description length, single H1,
// heading-order sanity, image alt coverage, JSON-LD validity, internal-link count,
// thin-content warning). FAIL = hard on-page requirement missing (non-zero exit).
// WARN = advisory only (never fails the run). Kept backward-compatible with the
// old single-file + --jsonld invocation.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const wantJsonld = args.includes('--jsonld');

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'docs') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith('.html')) acc.push(p.replace(ROOT + '/', ''));
  }
  return acc;
}

const text = (s) => (s || '').replace(/\s+/g, ' ').trim();

function auditFile(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const results = [];
  const pass = (n) => results.push(['PASS', n]);
  const fail = (n) => results.push(['FAIL', n]);
  const warn = (n) => results.push(['WARN', n]);

  const is404 = file.endsWith('404.html');

  // Hard requirements
  (/name="viewport"/i.test(html) ? pass : fail)('has viewport');
  // A page is "styled" if it links an external stylesheet OR ships a substantial
  // inline <style> block (e.g. a standalone print/utility page).
  const hasStyling = /rel="stylesheet"/i.test(html) || /<style[\s>][\s\S]{200,}?<\/style>/i.test(html);
  (hasStyling || is404 ? pass : fail)('links a stylesheet');
  if (!is404) (/rel="canonical"/i.test(html) ? pass : fail)('has canonical');
  if (!is404) (/property="og:title"/i.test(html) ? pass : fail)('has og:title');

  // Exactly one <h1>
  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length === 1) pass('exactly one <h1>');
  else fail(`<h1> count = ${h1s.length} (want 1)`);

  // All <img> have a non-empty alt
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const missingAlt = imgs.filter((t) => !/\balt="[^"]+"/i.test(t)).length;
  if (imgs.length === 0 || missingAlt === 0) pass(`img alt coverage (${imgs.length} imgs)`);
  else fail(`${missingAlt}/${imgs.length} <img> missing non-empty alt`);

  // JSON-LD blocks all parse
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let ldOk = true;
  for (const b of blocks) { try { JSON.parse(b[1]); } catch { ldOk = false; } }
  (ldOk ? pass : fail)(`JSON-LD parses (${blocks.length} blocks)`);

  // Advisory: title length (30–60 chars is a common sweet spot)
  const title = text((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  if (!title) { if (!is404) fail('missing <title>'); }
  else if (title.length < 30 || title.length > 62) warn(`title length ${title.length} (aim 30–60): "${title.slice(0, 70)}"`);
  else pass(`title length ${title.length}`);

  // Advisory: meta description length (~110–160 chars)
  const desc = text((html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [, ''])[1]);
  if (!desc) { if (!is404) warn('missing meta description'); }
  else if (desc.length < 70 || desc.length > 165) warn(`description length ${desc.length} (aim 110–160)`);
  else pass(`description length ${desc.length}`);

  // Advisory: heading-order sanity (no skipped levels going down the document)
  const levels = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  let skip = null;
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) { skip = `h${levels[i - 1]}->h${levels[i]}`; break; }
  }
  if (skip) warn(`heading level skip (${skip})`);
  else if (levels.length) pass('heading order');

  // Advisory: internal-link count (root-relative page links, excluding assets)
  const internal = new Set(
    [...html.matchAll(/href="(\/[^"]*)"/g)]
      .map((m) => m[1])
      .filter((h) => !h.startsWith('//') && !/\.(png|jpg|jpeg|svg|webp|pdf|xml|css|js|ico)$/i.test(h))
  );
  if (!is404 && internal.size < 5) warn(`only ${internal.size} internal links`);
  else if (!is404) pass(`${internal.size} internal links`);

  // Advisory: thin content (visible text words)
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = text(visible).split(' ').filter(Boolean).length;
  const isArticle = file.startsWith('blog/') && file !== 'blog/index.html';
  if (isArticle && words < 600) warn(`thin content: ~${words} words (aim 800+ for articles)`);

  if (wantJsonld) results.push(['INFO', `json-ld blocks: ${blocks.length}`]);
  return results;
}

// ---- Run ----
let files;
if (args.includes('--all')) {
  files = walkHtml(ROOT).sort();
} else {
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) { console.error('usage: node scripts/audit.mjs <file.html> [--jsonld] | --all'); process.exit(2); }
  if (!existsSync(join(ROOT, file))) { console.error(`not found: ${file}`); process.exit(2); }
  files = [file];
}

let hardFails = 0;
let warns = 0;
for (const f of files) {
  const results = auditFile(f);
  const fails = results.filter((r) => r[0] === 'FAIL');
  const fileWarns = results.filter((r) => r[0] === 'WARN');
  hardFails += fails.length;
  warns += fileWarns.length;
  if (files.length > 1) {
    if (fails.length || fileWarns.length) {
      console.log(`\n${f}`);
      for (const [lvl, n] of [...fails, ...fileWarns]) console.log(`  ${lvl}  ${n}`);
    }
  } else {
    for (const [lvl, n] of results) console.log(`${lvl}  ${n}`);
  }
}

if (files.length > 1) {
  console.log(`\n${files.length} pages · ${hardFails} FAIL · ${warns} WARN`);
}
process.exit(hardFails ? 1 : 0);
