// scripts/check-analytics.mjs — fails if any site HTML page is missing an
// analytics snippet, or if a second Clarity project sneaks in.
//
// This used to check GoatCounter only, which is why 11 pages ran without
// Clarity for months — including all four best-free-* comparison pages and
// every interactive tool, i.e. exactly the pages where session replay and
// heatmaps are worth having.
//
// The single-project assertion exists because Bing Webmaster Tools offers to
// "set up Clarity" by generating a BRAND NEW project and handing you its
// snippet. Pasting it alongside the existing one runs two projects at once:
// sessions split across two dashboards, neither one complete, double the
// script weight. If you ever intend to change project, change it everywhere
// and update EXPECTED_CLARITY_ID in the same commit.
import { readFileSync, globSync } from 'node:fs';

const EXPECTED_CLARITY_ID = 'xjkggf7dd9';

const files = globSync('**/*.html').filter(
  (p) =>
    !p.includes('node_modules') &&
    !p.startsWith('docs/') &&
    !p.startsWith('tools/') && // build sources (e.g. PDF templates), not public pages
    !p.includes('.superpowers/')
);

const fails = [];

const missingGoat = files.filter((f) => !readFileSync(f, 'utf8').includes('data-goatcounter='));
if (missingGoat.length) {
  fails.push('missing GoatCounter:\n' + missingGoat.map((m) => '  - ' + m).join('\n'));
}

// /go/ redirectors bounce in milliseconds and are noindex; measuring them with
// a session-replay tool would be pure noise.
const clarityScope = files.filter((f) => !f.startsWith('go/'));
const missingClarity = clarityScope.filter((f) => !readFileSync(f, 'utf8').includes('clarity.ms/tag'));
if (missingClarity.length) {
  fails.push('missing Clarity:\n' + missingClarity.map((m) => '  - ' + m).join('\n'));
}

const ids = new Set();
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(/"clarity",\s*"script",\s*"([a-z0-9]+)"/g)) {
    ids.add(m[1]);
  }
}
if (ids.size > 1) {
  fails.push(`more than one Clarity project on the site: ${[...ids].join(', ')} — sessions would split across dashboards`);
} else if (ids.size === 1 && !ids.has(EXPECTED_CLARITY_ID)) {
  fails.push(`Clarity project is ${[...ids][0]}, expected ${EXPECTED_CLARITY_ID} — update EXPECTED_CLARITY_ID if this was deliberate`);
}

// A checker that checks nothing passes forever.
if (files.length < 40) {
  fails.push(`only ${files.length} HTML files scanned — the glob is probably broken`);
}

if (fails.length) {
  console.error(fails.join('\n'));
  process.exit(1);
}
console.log(
  `PASS  analytics: GoatCounter on ${files.length} pages · Clarity on ${clarityScope.length} · 1 project (${EXPECTED_CLARITY_ID})`,
);
