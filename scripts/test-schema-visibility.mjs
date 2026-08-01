// Every FAQPage answer in JSON-LD must be present in the visible page text.
// Google requires structured-data content to be visible to users, and a model
// reading the rendered page never sees JSON-LD-only prose.
import { readFileSync, readdirSync } from 'node:fs';

// Skips top-level build/vendor dirs and ANY dot-directory (.git, .github,
// .superpowers scratch) so local artifacts can never diverge results from CI.
const SKIP = /(^|\/)\.|^(go|docs|node_modules)\//;
const files = readdirSync('.', { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.html'))
  .filter((f) => SKIP.test(f) === false && f !== '404.html');

const words = (s) =>
  s.replace(/&[a-z]+;/gi, ' ').replace(/[^a-z0-9 ]/gi, ' ').toLowerCase()
   .split(/\s+/).filter((w) => w.length > 2);

// Stripping an inline tag (<a>, <strong>) leaves a space the reader never sees:
// "Studio</a>, the maker" becomes "Studio , the maker". Close that gap on both
// sides so schema text can carry the punctuation a reader actually reads.
const tighten = (s) => s.replace(/\s+([,.;:!?])/g, '$1');

let checked = 0;
const fails = [];
const parseFailures = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const visible = tighten(html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
  const visibleWords = new Set(words(visible));

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch (err) { parseFailures.push(`${file} :: ${err.message}`); continue; }
    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      if (node['@type'] !== 'FAQPage') continue;
      for (const q of node.mainEntity ?? []) {
        checked++;
        const answer = tighten(q.acceptedAnswer?.text ?? '');
        const exact = visible.includes(answer.slice(0, 45));
        if (exact) continue;
        const toks = words(answer);
        const coverage = toks.length ? toks.filter((w) => visibleWords.has(w)).length / toks.length : 0;
        fails.push(`${file} :: ${q.name} (coverage ${coverage.toFixed(2)})`);
      }
    }
  }
}

for (const f of parseFailures) console.log(`FAIL  unparseable JSON-LD block: ${f}`);
for (const f of fails) console.log(`FAIL  answer does not match visible text: ${f}`);
console.log(`\nschema visibility: ${checked} FAQ answers checked · ${fails.length + parseFailures.length} FAIL`);

// An empty loop would otherwise exit 0 having verified nothing at all.
if (checked === 0) {
  console.log('FAIL  no FAQPage structured data found on any page — the gate verified nothing');
  process.exit(1);
}
if (fails.length || parseFailures.length) process.exit(1);
