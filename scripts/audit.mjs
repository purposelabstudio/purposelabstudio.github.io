// scripts/audit.mjs — usage: node scripts/audit.mjs <file.html> [--jsonld]
import { readFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/audit.mjs <file.html>'); process.exit(2); }
const html = readFileSync(file, 'utf8');
const checks = [
  ['canonical', /<link[^>]+rel="canonical"/i],
  ['og:title', /property="og:title"/i],
  ['viewport', /name="viewport"/i],
  ['stylesheet', /rel="stylesheet"/i],
];
let ok = true;
for (const [name, re] of checks) {
  const pass = re.test(html);
  if (!pass) ok = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
}
if (process.argv.includes('--jsonld')) {
  const count = (html.match(/application\/ld\+json/g) || []).length;
  console.log(`INFO  json-ld blocks: ${count}`);
}
process.exit(ok ? 0 : 1);
