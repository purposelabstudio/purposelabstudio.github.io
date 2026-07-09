// scripts/check-analytics.mjs — fails if any site HTML page is missing the analytics snippet.
import { readFileSync, globSync } from 'node:fs';

const files = globSync('**/*.html').filter(
  (p) => !p.includes('node_modules') && !p.startsWith('docs/') && !p.includes('.superpowers/')
);

const NEEDLE = 'data-goatcounter=';
const missing = files.filter((f) => !readFileSync(f, 'utf8').includes(NEEDLE));

if (missing.length) {
  console.error('MISSING analytics on:\n' + missing.map((m) => '  - ' + m).join('\n'));
  process.exit(1);
}
console.log(`PASS  analytics present on all ${files.length} HTML pages`);
