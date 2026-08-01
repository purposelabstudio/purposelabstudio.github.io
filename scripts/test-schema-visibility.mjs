// Every FAQPage answer in JSON-LD must be present in the visible page text.
// Google requires structured-data content to be visible to users, and a model
// reading the rendered page never sees JSON-LD-only prose.
import { readFileSync, readdirSync } from 'node:fs';

const SKIP = /^(go|docs|node_modules|\.git|\.github)\//;
const files = readdirSync('.', { recursive: true })
  .filter((f) => typeof f === 'string' && f.endsWith('.html'))
  .filter((f) => SKIP.test(f) === false && f !== '404.html');

const words = (s) =>
  s.replace(/&[a-z]+;/gi, ' ').replace(/[^a-z0-9 ]/gi, ' ').toLowerCase()
   .split(/\s+/).filter((w) => w.length > 2);

let checked = 0;
const fails = [];
const warns = [];

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const visibleWords = new Set(words(visible));

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { continue; }
    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      if (node['@type'] !== 'FAQPage') continue;
      for (const q of node.mainEntity ?? []) {
        checked++;
        const answer = q.acceptedAnswer?.text ?? '';
        const exact = visible.includes(answer.slice(0, 45));
        if (exact) continue;
        const toks = words(answer);
        const coverage = toks.length ? toks.filter((w) => visibleWords.has(w)).length / toks.length : 0;
        const entry = `${file} :: ${q.name} (coverage ${coverage.toFixed(2)})`;
        if (coverage >= 0.85) warns.push(entry); else fails.push(entry);
      }
    }
  }
}

for (const w of warns) console.log(`WARN  drifted from visible text: ${w}`);
for (const f of fails) console.log(`FAIL  answer absent from visible text: ${f}`);
console.log(`\nschema visibility: ${checked} FAQ answers checked · ${fails.length} FAIL · ${warns.length} WARN`);
if (fails.length) process.exit(1);
