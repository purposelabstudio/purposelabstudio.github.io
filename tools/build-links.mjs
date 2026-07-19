// tools/build-links.mjs — generate trackable short-link redirect pages under /go/.
//
// Reads tools/link-config.json and writes one smart redirect page per
// app × placement to go/<app>-<placement>/index.html, plus a registry page at
// go/index.html.
//
// Each page: fires a GoatCounter hit for its own path, then redirects the
// visitor to the right store (Android → Play w/ referrer, iOS → App Store w/ ct)
// or shows a desktop landing (icon + both store buttons + optional QR).
//
// QR codes are inlined only when `qrencode` is on PATH (brew install qrencode);
// otherwise the desktop landing shows buttons only. No third-party runtime deps.
//
// Run: node tools/build-links.mjs   (from the repo root)

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = join(ROOT, 'tools', 'link-config.json');
const OUT_DIR = join(ROOT, 'go');

const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
const { baseUrl, goatcounter, apps, placements } = config;

// ---- helpers ---------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Play Store URL carrying a URL-encoded install referrer. */
function playUrl(app, p) {
  const referrer = [
    `utm_source=${p.utm_source}`,
    `utm_medium=${p.utm_medium}`,
    `utm_campaign=${p.utm_campaign}`,
  ].join('&');
  return `https://play.google.com/store/apps/details?id=${app.android}&referrer=${encodeURIComponent(referrer)}`;
}

/** App Store URL carrying Apple's single campaign token (ct). */
function appStoreUrl(app, p) {
  if (!app.ios) return null;
  return `https://apps.apple.com/app/id${app.ios}?ct=${encodeURIComponent(p.ct)}`;
}

/** Detect qrencode once; returns a fn(url) -> inline SVG string | null. */
function makeQrEncoder() {
  const probe = spawnSync('qrencode', ['--version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) return () => null;
  return (url) => {
    const r = spawnSync('qrencode', ['-t', 'SVG', '-m', '2', '-o', '-', url], { encoding: 'utf8' });
    if (r.error || r.status !== 0 || !r.stdout) return null;
    // strip XML prolog / DOCTYPE so it inlines cleanly inside HTML
    return r.stdout.replace(/<\?xml[\s\S]*?\?>/, '').replace(/<!DOCTYPE[\s\S]*?>/, '').trim();
  };
}

// ---- page template ---------------------------------------------------------

function redirectPage({ app, appKey, code, p, shortUrl, qrSvg }) {
  const play = playUrl(app, p);
  const appStore = appStoreUrl(app, p);
  const path = `/go/${appKey}-${code}`;
  const defaultUrl = app.default === 'ios' && appStore ? appStore : play;
  const accent = app.accent || '#A08560';

  const storeButtons = [
    `<a class="store" href="${esc(play)}">Get it on Google Play</a>`,
    appStore ? `<a class="store" href="${esc(appStore)}">Download on the App Store</a>` : '',
  ].filter(Boolean).join('\n        ');

  const qrBlock = qrSvg
    ? `<div class="qr" aria-label="Scan to install on your phone">${qrSvg}<span>Scan to install</span></div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Get ${esc(app.name)}</title>
<!-- Privacy-friendly analytics (GoatCounter, no cookies). no_onload: we fire the
     hit manually below so it is sent before the redirect navigates away. -->
<script>window.goatcounter = { no_onload: true };</script>
<script data-goatcounter="${esc(goatcounter)}" async src="//gc.zgo.at/count.js"></script>
<script>
(function () {
  var path = ${JSON.stringify(path)};
  // Fire the click hit immediately via a pixel so it survives the redirect.
  try {
    new Image().src = ${JSON.stringify(goatcounter)}
      + '?p=' + encodeURIComponent(path)
      + '&t=' + encodeURIComponent(document.title)
      + '&r=' + encodeURIComponent(document.referrer)
      + '&rnd=' + Math.random().toString(36).slice(2);
  } catch (e) {}
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var PLAY = ${JSON.stringify(play)};
  var APPSTORE = ${JSON.stringify(appStore)};
  var target = null;
  if (isAndroid) target = PLAY;
  else if (isIOS && APPSTORE) target = APPSTORE;
  if (target) {
    setTimeout(function () { location.replace(target); }, 120);
  } else {
    // Desktop, or iPhone when this app has no iOS build → show the landing.
    document.documentElement.setAttribute('data-mode', 'landing');
  }
})();
</script>
<noscript><meta http-equiv="refresh" content="0;url=${esc(defaultUrl)}"></noscript>
<style>
  :root { --accent: ${accent}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #FAF6F0; color: #2D2A26; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  a { color: var(--accent); }
  .redirecting { text-align: center; color: #8A8175; font-size: 15px; }
  .landing { display: none; }
  html[data-mode="landing"] .redirecting { display: none; }
  html[data-mode="landing"] .landing {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: 14px; max-width: 360px;
  }
  .landing img.icon { width: 84px; height: 84px; border-radius: 20px; box-shadow: 0 6px 20px rgba(45,42,38,.16); }
  .landing h1 { font-size: 22px; font-weight: 700; }
  .landing p.tag { color: #6E685E; font-size: 15px; }
  .store {
    display: inline-block; width: 100%; padding: 12px 18px; border-radius: 12px;
    background: var(--accent); color: #fff; text-decoration: none; font-weight: 600;
    font-size: 15px;
  }
  .store + .store { background: #2D2A26; }
  .buttons { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 4px; }
  .qr { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 8px; }
  .qr svg { width: 148px; height: 148px; }
  .qr span { color: #8A8175; font-size: 13px; }
</style>
</head>
<body>
  <div class="redirecting">
    Opening ${esc(app.name)}…
    <br><a href="${esc(defaultUrl)}">Tap here if it doesn't open.</a>
  </div>
  <main class="landing">
    <img class="icon" src="${esc(app.icon)}" alt="${esc(app.name)} icon">
    <h1>${esc(app.name)}</h1>
    <p class="tag">${esc(app.tagline)}</p>
    ${qrBlock}
    <div class="buttons">
        ${storeButtons}
    </div>
  </main>
</body>
</html>
`;
}

// ---- registry page ---------------------------------------------------------

function registryPage(rows) {
  const appBlocks = Object.keys(apps).map((appKey) => {
    const app = apps[appKey];
    const items = rows.filter((r) => r.appKey === appKey).map((r) => `
      <tr>
        <td>${esc(placements[r.code].label)}</td>
        <td><code>${esc(r.shortUrl)}</code></td>
        <td><button class="copy" data-url="${esc(r.shortUrl)}">Copy</button></td>
      </tr>`).join('');
    return `
    <section>
      <h2>${esc(app.name)}${app.ios ? '' : ' <small>(Android only)</small>'}</h2>
      <table>
        <thead><tr><th>Placement</th><th>Short link</th><th></th></tr></thead>
        <tbody>${items}</tbody>
      </table>
    </section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Share links — PurposeLab</title>
<!-- Privacy-friendly analytics (GoatCounter, no cookies) -->
<script data-goatcounter="${esc(goatcounter)}" async src="//gc.zgo.at/count.js"></script>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    max-width: 760px; margin: 40px auto; padding: 0 20px; color: #2D2A26; background: #FAF6F0; }
  h1 { font-size: 24px; }
  p.lead { color: #6E685E; margin: 8px 0 24px; }
  section { margin: 28px 0; }
  h2 { font-size: 18px; margin-bottom: 8px; }
  h2 small { color: #A89F92; font-weight: 400; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #E8E2D8; vertical-align: middle; }
  code { background: #F0EAE0; padding: 2px 6px; border-radius: 5px; font-size: 13px; }
  button.copy { border: 1px solid #C9BFB0; background: #fff; border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 13px; }
  button.copy:hover { background: #F0EAE0; }
</style>
</head>
<body>
  <h1>Share links</h1>
  <p class="lead">Paste one of these when sharing an app. Clicks show up in
    GoatCounter by placement (real-time); installs show up in Play Console /
    App Store Connect by campaign. Regenerate with
    <code>node tools/build-links.mjs</code>.</p>
  ${appBlocks}
  <script>
    document.querySelectorAll('button.copy').forEach(function (b) {
      b.addEventListener('click', function () {
        navigator.clipboard.writeText(b.dataset.url).then(function () {
          var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1200);
        });
      });
    });
  </script>
</body>
</html>
`;
}

// ---- build -----------------------------------------------------------------

function build() {
  const qrEncode = makeQrEncoder();
  const qrAvailable = qrEncode('probe') !== null;

  // Clean previously generated pages (but keep nothing else — /go/ is generated).
  if (existsSync(OUT_DIR)) {
    for (const entry of readdirSync(OUT_DIR)) {
      rmSync(join(OUT_DIR, entry), { recursive: true, force: true });
    }
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  for (const appKey of Object.keys(apps)) {
    const app = apps[appKey];
    for (const code of Object.keys(placements)) {
      const p = placements[code];
      const slug = `${appKey}-${code}`;
      const shortUrl = `${baseUrl}/go/${slug}`;
      const qrSvg = qrAvailable ? qrEncode(shortUrl) : null;
      const html = redirectPage({ app, appKey, code, p, shortUrl, qrSvg });
      const dir = join(OUT_DIR, slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), html);
      rows.push({ appKey, code, shortUrl });
    }
  }

  writeFileSync(join(OUT_DIR, 'index.html'), registryPage(rows));

  console.log(`Generated ${rows.length} redirect pages + registry at /go/`);
  console.log(`QR codes: ${qrAvailable ? 'inlined (qrencode found)' : 'omitted (install qrencode to enable)'}`);
}

build();
