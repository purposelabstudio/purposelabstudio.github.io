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

/** JSON literal safe to embed inside an inline <script> (escapes `<`, U+2028/9). */
function jsLit(v) {
  return JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
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
<!-- Open Graph / Twitter: makes a pasted link unfurl with a preview card on
     WhatsApp, Reddit, Discord, Substack, Medium, etc. Unfurl bots read these
     static tags; they don't run the JS redirect, so humans still get sent on. -->
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(shortUrl)}">
<meta property="og:title" content="${esc(app.name)}">
<meta property="og:description" content="${esc(app.tagline)}">
<meta property="og:image" content="${esc(baseUrl + app.icon)}">
<meta property="og:image:alt" content="${esc(app.name)} app icon">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(app.name)}">
<meta name="twitter:description" content="${esc(app.tagline)}">
<meta name="twitter:image" content="${esc(baseUrl + app.icon)}">
<!-- Privacy-friendly analytics (GoatCounter, no cookies). no_onload: we fire the
     hit manually below so it is sent before the redirect navigates away. -->
<script>window.goatcounter = { no_onload: true };</script>
<script data-goatcounter="${esc(goatcounter)}" async src="//gc.zgo.at/count.js"></script>
<script>
(function () {
  var path = ${jsLit(path)};
  // Fire the click hit immediately via a pixel so it survives the redirect.
  try {
    new Image().src = ${jsLit(goatcounter)}
      + '?p=' + encodeURIComponent(path)
      + '&t=' + encodeURIComponent(document.title)
      + '&r=' + encodeURIComponent(document.referrer)
      + '&rnd=' + Math.random().toString(36).slice(2);
  } catch (e) {}
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var PLAY = ${jsLit(play)};
  var APPSTORE = ${jsLit(appStore)};
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

// ---- dynamic redirector (/go/r/) -------------------------------------------
// A single param-driven page powering ad-hoc custom links built on the registry
// page: /go/r?a=<app>&s=<source>&m=<medium>&c=<campaign>. It smart-redirects
// like the static pages and logs a synthesized GoatCounter path per campaign.

function redirectorPage() {
  const embedded = {};
  for (const k of Object.keys(apps)) {
    const a = apps[k];
    embedded[k] = { name: a.name, tagline: a.tagline, icon: a.icon, accent: a.accent, android: a.android, ios: a.ios, default: a.default };
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Opening…</title>
<!-- Generic unfurl card (this page serves any app via query params, so it can't
     be app-specific). Per-app preset links (/go/<app>-<placement>) unfurl per app. -->
<meta property="og:type" content="website">
<meta property="og:title" content="PurposeLab apps">
<meta property="og:description" content="Calm, private, offline-first apps.">
<meta property="og:image" content="${esc(baseUrl)}/og-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PurposeLab apps">
<meta name="twitter:description" content="Calm, private, offline-first apps.">
<meta name="twitter:image" content="${esc(baseUrl)}/og-default.png">
<script>window.goatcounter = { no_onload: true };</script>
<script data-goatcounter="${esc(goatcounter)}" async src="//gc.zgo.at/count.js"></script>
<script>
(function () {
  var APPS = ${jsLit(embedded)};
  var GC = ${jsLit(goatcounter)};
  var q = new URLSearchParams(location.search);
  var a = (q.get('a') || '').trim();
  var s = (q.get('s') || '').trim();
  var m = (q.get('m') || '').trim();
  var c = (q.get('c') || '').trim();
  var app = APPS[a];
  // Synthesize a clean, per-campaign GoatCounter path so custom links are
  // still trackable even though they share one physical page.
  var gcPath = '/go/r/' + (a || 'unknown') + (s ? '-' + s : '') + (c ? '-' + c : '');
  try {
    new Image().src = GC + '?p=' + encodeURIComponent(gcPath)
      + '&t=' + encodeURIComponent(document.title)
      + '&r=' + encodeURIComponent(document.referrer)
      + '&rnd=' + Math.random().toString(36).slice(2);
  } catch (e) {}

  function referrer() {
    return [s ? 'utm_source=' + s : '', m ? 'utm_medium=' + m : '', c ? 'utm_campaign=' + c : '']
      .filter(Boolean).join('&');
  }
  var PLAY = null, APPSTORE = null;
  if (app) {
    var ref = referrer();
    PLAY = 'https://play.google.com/store/apps/details?id=' + app.android
      + (ref ? '&referrer=' + encodeURIComponent(ref) : '');
    APPSTORE = app.ios
      ? 'https://apps.apple.com/app/id' + app.ios + (c ? '?ct=' + encodeURIComponent(c) : '')
      : null;
  }
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  var target = null;
  if (app) {
    if (isAndroid) target = PLAY;
    else if (isIOS && APPSTORE) target = APPSTORE;
  }
  if (target) { setTimeout(function () { location.replace(target); }, 120); return; }

  // Desktop / iOS-no-build / unknown app → render the landing.
  // Anchors are built with DOM APIs (not innerHTML) so reflected query params
  // can never inject markup, regardless of encoding.
  function storeLink(href, label) {
    var el = document.createElement('a');
    el.className = 'store';
    el.href = href;
    el.textContent = label;
    return el;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.getElementById('landing');
    var buttons = document.getElementById('buttons');
    if (!app) {
      document.getElementById('name').textContent = 'App not found';
      document.getElementById('tag').textContent = 'Check the link and try again.';
      buttons.appendChild(storeLink('https://purposelabstudio.com/apps/', 'See all apps'));
      wrap.style.display = 'flex';
      return;
    }
    document.documentElement.style.setProperty('--accent', app.accent || '#A08560');
    var icon = document.getElementById('icon');
    icon.src = app.icon; icon.alt = app.name + ' icon';
    document.getElementById('name').textContent = app.name;
    document.getElementById('tag').textContent = app.tagline;
    buttons.appendChild(storeLink(PLAY, 'Get it on Google Play'));
    if (APPSTORE) buttons.appendChild(storeLink(APPSTORE, 'Download on the App Store'));
    wrap.style.display = 'flex';
  });
})();
</script>
<style>
  :root { --accent: #A08560; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #FAF6F0; color: #2D2A26; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 24px; }
  a { color: var(--accent); }
  #landing { display: none; flex-direction: column; align-items: center; text-align: center; gap: 14px; max-width: 360px; }
  #landing img.icon { width: 84px; height: 84px; border-radius: 20px; box-shadow: 0 6px 20px rgba(45,42,38,.16); }
  #landing h1 { font-size: 22px; font-weight: 700; }
  #landing p.tag { color: #6E685E; font-size: 15px; }
  .store { display: inline-block; width: 100%; padding: 12px 18px; border-radius: 12px;
    background: var(--accent); color: #fff; text-decoration: none; font-weight: 600; font-size: 15px; }
  .store + .store { background: #2D2A26; margin-top: 10px; }
  #buttons { display: flex; flex-direction: column; width: 100%; margin-top: 4px; }
</style>
</head>
<body>
  <main id="landing">
    <img class="icon" id="icon" src="" alt="">
    <h1 id="name"></h1>
    <p class="tag" id="tag"></p>
    <div id="buttons"></div>
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

  // Data the client-side builder needs (store ids + presets).
  const data = { baseUrl, apps: {}, placements };
  for (const k of Object.keys(apps)) {
    data.apps[k] = { name: apps[k].name, android: apps[k].android, ios: apps[k].ios };
  }

  const appOptions = Object.keys(apps)
    .map((k) => `<option value="${esc(k)}">${esc(apps[k].name)}</option>`).join('');
  const presetOptions = Object.keys(placements)
    .map((k) => `<option value="${esc(k)}">${esc(placements[k].label)}</option>`).join('');

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
  code { background: #F0EAE0; padding: 2px 6px; border-radius: 5px; font-size: 13px; word-break: break-all; }
  button.copy { border: 1px solid #C9BFB0; background: #fff; border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 13px; white-space: nowrap; }
  button.copy:hover { background: #F0EAE0; }
  .builder { background: #fff; border: 1px solid #E8E2D8; border-radius: 14px; padding: 20px; }
  .builder .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin: 4px 0 18px; }
  .builder label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #6E685E; }
  .builder select, .builder input { padding: 8px 10px; border: 1px solid #C9BFB0; border-radius: 8px; font-size: 14px; background: #FAF6F0; }
  .builder .full { grid-column: 1 / -1; }
  .out-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid #F0EAE0; }
  .out-row .lbl { width: 130px; flex: none; font-size: 12px; color: #A89F92; }
  .out-row code { flex: 1; }
  @media (max-width: 560px) { .builder .grid { grid-template-columns: 1fr; } .out-row { flex-wrap: wrap; } .out-row .lbl { width: 100%; } }
</style>
</head>
<body>
  <h1>Share links</h1>
  <p class="lead">Paste one of these when sharing an app. Clicks show up in
    GoatCounter by placement (real-time); installs show up in Play Console /
    App Store Connect by campaign. Regenerate with
    <code>node tools/build-links.mjs</code>.</p>

  <section class="builder">
    <h2>Build a custom tracking link</h2>
    <p class="lead" style="margin:4px 0 14px">Pick an app, then choose a ready-made
      placement or type your own source / medium / campaign. Copy the tracking link
      and paste it anywhere. It smart-redirects (iPhone → App Store, Android → Play,
      desktop → both) and logs the campaign in GoatCounter.</p>
    <div class="grid">
      <label>App
        <select id="b-app">${appOptions}</select>
      </label>
      <label>Placement preset
        <select id="b-preset"><option value="">— custom —</option>${presetOptions}</select>
      </label>
      <label>Source <span style="color:#C0B6A6">utm_source</span>
        <input id="b-source" placeholder="linkedin" autocomplete="off">
      </label>
      <label>Medium <span style="color:#C0B6A6">utm_medium</span>
        <input id="b-medium" placeholder="social" autocomplete="off">
      </label>
      <label class="full">Campaign <span style="color:#C0B6A6">utm_campaign / ct</span>
        <input id="b-campaign" placeholder="launch_july" autocomplete="off">
      </label>
    </div>
    <div id="b-out">
      <div class="out-row"><span class="lbl">Tracking link</span><code id="o-short"></code><button class="copy" data-src="o-short">Copy</button></div>
      <div class="out-row"><span class="lbl">Play Store (raw)</span><code id="o-play"></code><button class="copy" data-src="o-play">Copy</button></div>
      <div class="out-row" id="o-ios-row"><span class="lbl">App Store (raw)</span><code id="o-ios"></code><button class="copy" data-src="o-ios">Copy</button></div>
    </div>
  </section>

  ${appBlocks}

  <script>
    var DATA = ${jsLit(data)};
    var $ = function (id) { return document.getElementById(id); };
    var enc = encodeURIComponent;

    function buildReferrer(s, m, c) {
      return [s ? 'utm_source=' + s : '', m ? 'utm_medium=' + m : '', c ? 'utm_campaign=' + c : '']
        .filter(Boolean).join('&');
    }
    function recompute() {
      var a = $('b-app').value;
      var preset = $('b-preset').value;
      var s = $('b-source').value.trim();
      var m = $('b-medium').value.trim();
      var c = $('b-campaign').value.trim();
      var app = DATA.apps[a];

      var short;
      if (preset) {
        short = DATA.baseUrl + '/go/' + a + '-' + preset;   // clean static link
      } else {
        var qp = ['a=' + enc(a)];
        if (s) qp.push('s=' + enc(s));
        if (m) qp.push('m=' + enc(m));
        if (c) qp.push('c=' + enc(c));
        short = DATA.baseUrl + '/go/r?' + qp.join('&');
      }
      var ref = buildReferrer(s, m, c);
      var play = 'https://play.google.com/store/apps/details?id=' + app.android
        + (ref ? '&referrer=' + enc(ref) : '');
      $('o-short').textContent = short;
      $('o-play').textContent = play;
      if (app.ios) {
        $('o-ios-row').style.display = '';
        $('o-ios').textContent = 'https://apps.apple.com/app/id' + app.ios + (c ? '?ct=' + enc(c) : '');
      } else {
        $('o-ios-row').style.display = 'none';
      }
    }
    // Selecting a preset fills the fields from config; picking "custom" clears them.
    $('b-preset').addEventListener('change', function () {
      var p = DATA.placements[this.value];
      if (p) { $('b-source').value = p.utm_source || ''; $('b-medium').value = p.utm_medium || ''; $('b-campaign').value = p.utm_campaign || ''; }
      recompute();
    });
    // Typing a custom value means it is no longer the chosen preset.
    ['b-source', 'b-medium', 'b-campaign'].forEach(function (id) {
      $(id).addEventListener('input', function () { $('b-preset').value = ''; recompute(); });
    });
    $('b-app').addEventListener('change', recompute);

    document.querySelectorAll('button.copy').forEach(function (b) {
      b.addEventListener('click', function () {
        var text = b.dataset.url || ($(b.dataset.src) && $(b.dataset.src).textContent) || '';
        if (!text) return;
        navigator.clipboard.writeText(text).then(function () {
          var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1200);
        });
      });
    });
    recompute();
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

  // Dynamic param-driven redirector for ad-hoc custom links (/go/r/).
  mkdirSync(join(OUT_DIR, 'r'), { recursive: true });
  writeFileSync(join(OUT_DIR, 'r', 'index.html'), redirectorPage());

  console.log(`Generated ${rows.length} redirect pages + registry + /go/r/ at /go/`);
  console.log(`QR codes: ${qrAvailable ? 'inlined (qrencode found)' : 'omitted (install qrencode to enable)'}`);
}

build();
