// scripts/test-links.mjs — validates the /go/ trackable short-link infra.
// Run: node scripts/test-links.mjs   (or: npm test)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(detail ? `${name} — ${detail}` : name); }
}
function read(p) { return readFileSync(join(ROOT, p), 'utf8'); }

const config = JSON.parse(read('tools/link-config.json'));
const { apps, placements } = config;
const appKeys = Object.keys(apps);
const placementKeys = Object.keys(placements);

// 1. Config shape
for (const k of appKeys) {
  const a = apps[k];
  check(`app ${k}: has android package`, typeof a.android === 'string' && a.android.includes('.'));
  check(`app ${k}: ios is string or null`, a.ios === null || typeof a.ios === 'string');
  check(`app ${k}: icon file exists`, existsSync(join(ROOT, a.icon.replace(/^\//, ''))), a.icon);
  check(`app ${k}: has default store`, a.default === 'android' || a.default === 'ios');
}
for (const k of placementKeys) {
  const p = placements[k];
  check(`placement ${k}: has utm_source`, !!p.utm_source);
  check(`placement ${k}: has utm_campaign`, !!p.utm_campaign);
  check(`placement ${k}: has ct`, !!p.ct);
  check(`placement ${k}: has label`, !!p.label);
}

// 2. Every app × placement page was generated and is well-formed
const expected = appKeys.length * placementKeys.length;
const goDirs = existsSync(join(ROOT, 'go'))
  ? readdirSync(join(ROOT, 'go')).filter((d) => d !== 'index.html' && d !== 'r')
  : [];
check(`generated ${expected} pages (run: node tools/build-links.mjs)`, goDirs.length === expected,
  `found ${goDirs.length}, expected ${expected}`);

for (const appKey of appKeys) {
  const app = apps[appKey];
  for (const code of placementKeys) {
    const slug = `${appKey}-${code}`;
    const rel = `go/${slug}/index.html`;
    if (!existsSync(join(ROOT, rel))) { check(`${rel}: exists`, false, 'missing — regenerate'); continue; }
    const html = read(rel);
    const p = placements[code];
    check(`${rel}: noindex`, /content="noindex/i.test(html));
    check(`${rel}: has GoatCounter snippet`, /data-goatcounter=/.test(html));
    check(`${rel}: fires tracking pixel`, /new Image\(\)\.src/.test(html));
    check(`${rel}: path matches`, html.includes(`"/go/${slug}"`));
    check(`${rel}: noscript fallback`, /http-equiv="refresh"/i.test(html));
    check(`${rel}: has og:title`, /property="og:title"/.test(html));
    check(`${rel}: og:image is absolute`, /property="og:image" content="https?:\/\//.test(html));
    check(`${rel}: has twitter:card`, /name="twitter:card"/.test(html));
    check(`${rel}: Play URL has package`, html.includes(`id=${app.android}`));
    check(`${rel}: Play URL has campaign`, html.includes(`utm_campaign%3D${p.utm_campaign}`));
    if (app.ios) {
      check(`${rel}: App Store URL has ct`, html.includes(`id${app.ios}?ct=${p.ct}`));
    } else {
      check(`${rel}: Android-only → no App Store link`, !html.includes('apps.apple.com'));
    }
  }
}

// 3. Registry page
check('go/index.html exists', existsSync(join(ROOT, 'go/index.html')));
if (existsSync(join(ROOT, 'go/index.html'))) {
  const reg = read('go/index.html');
  check('registry: noindex', /content="noindex/i.test(reg));
  check('registry: has GoatCounter snippet', /data-goatcounter=/.test(reg));
  check('registry: lists a folio link', reg.includes('/go/folio-li'));
  check('registry: has link builder', /Build a custom tracking link/.test(reg));
  check('registry: builder has app + preset selects', /id="b-app"/.test(reg) && /id="b-preset"/.test(reg));
  check('registry: builder outputs a tracking link', /id="o-short"/.test(reg));
  check('registry: builder embeds app store ids', appKeys.every((k) => reg.includes(apps[k].android)));
}

// 4. Dynamic redirector (/go/r/)
check('go/r/index.html exists', existsSync(join(ROOT, 'go/r/index.html')));
if (existsSync(join(ROOT, 'go/r/index.html'))) {
  const rp = read('go/r/index.html');
  check('redirector: noindex', /content="noindex/i.test(rp));
  check('redirector: has GoatCounter snippet', /data-goatcounter=/.test(rp));
  check('redirector: reads query params', /URLSearchParams\(location\.search\)/.test(rp));
  check('redirector: fires tracking pixel', /new Image\(\)\.src/.test(rp));
  check('redirector: synthesizes a GC path', /\/go\/r\//.test(rp));
  check('redirector: builds Play URL', /play\.google\.com\/store\/apps\/details\?id=/.test(rp));
  check('redirector: embeds app store ids', appKeys.every((k) => rp.includes(apps[k].android)));
}

// 5. robots.txt keeps /go/ out of search
check('robots.txt disallows /go/', /Disallow:\s*\/go\//.test(read('robots.txt')));

// ---- report ---------------------------------------------------------------
if (failed) {
  console.error(`\nFAIL  ${failed} check(s) failed:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`PASS  links infra: ${passed} checks green (${expected} pages)`);
