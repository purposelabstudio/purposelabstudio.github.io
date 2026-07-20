// scripts/test-attribution.mjs — behavioral test of the SHIPPED /go/r redirect.
//
// Extracts the real inline redirect script from go/r/index.html and executes it
// in a Node sandbox with mocked browser globals, then asserts the exact store
// URLs it produces for each acceptance case. This guards the install-attribution
// contract (Play `referrer` packing incl. Founding `ref`, and the App Store `ct`)
// against silent regressions — a broken referrer is otherwise invisible until it
// shows up (missing) in Play Console weeks later.
//
// Run: node scripts/test-attribution.mjs   (or: npm test)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
let passed = 0;
let failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) passed++;
  else { failed++; failures.push(detail ? `${name} — ${detail}` : name); }
}

const html = readFileSync(join(ROOT, 'go/r/index.html'), 'utf8');
// The redirect IIFE is the inline <script> that reads the query string.
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('URLSearchParams'));
check('extracted redirect script from go/r/index.html', !!script);

/** Run the real redirect script with a mocked device + query, capture the store URL it navigates to. */
function runRedirect({ search, ua, platform = '', maxTouchPoints = 0 }) {
  let navigated = null;
  const ctx = {
    location: { search, pathname: '/go/r/', replace: (u) => { navigated = u; } },
    navigator: { userAgent: ua, platform, maxTouchPoints },
    document: {
      title: 'Opening…',
      referrer: '',
      addEventListener: () => {},
      documentElement: { style: { setProperty: () => {} }, setAttribute: () => {} },
      getElementById: () => ({ style: {}, appendChild: () => {}, textContent: '' }),
      createElement: () => ({ style: {} }),
    },
    Image: function Image() { return { set src(_v) {} }; },
    setTimeout: (fn) => { fn(); },        // fire the redirect synchronously
    encodeURIComponent,
    URLSearchParams,
    Math,
  };
  vm.createContext(ctx);
  vm.runInContext(script, ctx);
  return navigated;
}

const FOLIO = 'https://purposelabstudio.com'; // baseUrl (unused here; sanity)
const ANDROID = 'Mozilla/5.0 (Linux; Android 14)';
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';

// AC1 — Android, Founding: ref packed into the single referrer, single-encoded.
{
  const url = runRedirect({ search: '?a=folio&utm_source=share&utm_medium=referral&utm_campaign=founding&ref=42', ua: ANDROID });
  const want = 'https://play.google.com/store/apps/details?id=com.purposelab.folio&referrer=utm_source%3Dshare%26utm_medium%3Dreferral%26utm_campaign%3Dfounding%26ref%3D42';
  check('AC1 Android Founding referrer exact', url === want, url);
}
// AC2 — Android, non-founding: no ref.
{
  const url = runRedirect({ search: '?a=folio&utm_source=share&utm_medium=referral&utm_campaign=recap', ua: ANDROID });
  check('AC2 Android non-founding referrer', url.endsWith('referrer=utm_source%3Dshare%26utm_medium%3Dreferral%26utm_campaign%3Drecap'), url);
  check('AC2 no ref leaked', !url.includes('ref%3D'), url);
}
// AC3 — iOS: ct = share_<campaign>.
{
  const url = runRedirect({ search: '?a=folio&utm_source=share&utm_medium=referral&utm_campaign=founding&ref=42', ua: IOS });
  check('AC3 iOS ct = share_founding', url === 'https://apps.apple.com/app/id6781551692?ct=share_founding', url);
  check('AC3 iOS drops ref (Apple limitation)', !url.includes('42'), url);
}
// Robustness — non-numeric ref is rejected (injection-safe).
{
  const url = runRedirect({ search: '?a=folio&utm_source=share&utm_campaign=recap&ref=' + encodeURIComponent('4x2; DROP'), ua: ANDROID });
  check('bad ref rejected (digits only)', !url.includes('ref%3D'), url);
}
// Backward-compat — short s/m/c aliases produce the same referrer.
{
  const url = runRedirect({ search: '?a=folio&s=share&m=referral&c=founding&ref=7', ua: ANDROID });
  check('s/m/c aliases → utm_* referrer', url.includes('referrer=utm_source%3Dshare%26utm_medium%3Dreferral%26utm_campaign%3Dfounding%26ref%3D7'), url);
}
// utm_term / utm_content passthrough.
{
  const url = runRedirect({ search: '?a=folio&utm_source=share&utm_campaign=recap&utm_term=t1&utm_content=c1', ua: ANDROID });
  check('utm_term/content packed into referrer', url.includes('utm_term%3Dt1%26utm_content%3Dc1'), url);
}
// Android-only app (bplog) on iOS → no App Store navigation (landing handles it).
{
  const url = runRedirect({ search: '?a=bplog&utm_source=share&utm_campaign=recap', ua: IOS });
  check('Android-only app on iOS does not navigate to App Store', url === null, String(url));
}

if (failed) {
  console.error(`\nFAIL  ${failed} attribution check(s) failed:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`PASS  attribution: ${passed} behavioral checks green (real /go/r script)`);
