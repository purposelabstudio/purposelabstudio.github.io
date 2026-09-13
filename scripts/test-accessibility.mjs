// Rendered accessibility checks for canonical, human-owned public pages.
// External requests are blocked so validation never submits analytics or forms.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const HOST = '127.0.0.1';
const MIME = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function canonicalPages() {
  const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  const pages = [];
  for (const match of sitemap.matchAll(/<loc>https:\/\/purposelabstudio\.com([^<]*)<\/loc>/g)) {
    const pathname = match[1] || '/';
    const relative = pathname === '/'
      ? 'index.html'
      : pathname.replace(/^\//, '').replace(/\/$/, '/index.html');
    pages.push({ pathname, relative });
  }
  return pages;
}

function startServer() {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, `http://${HOST}`).pathname);
    const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const relative = normalize(requested).replace(/^[/\\]+/, '');
    const file = join(ROOT, relative);
    if ((!file.startsWith(`${ROOT}${sep}`) && file !== ROOT)
      || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    response.end(readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, HOST, () => resolve(server));
  });
}

const failures = [];
let checks = 0;
function check(page, name, condition, detail = '') {
  checks += 1;
  if (!condition) failures.push(`${page}: ${name}${detail ? ` — ${detail}` : ''}`);
}

const CONTROL_SELECTOR = 'input:not([type="hidden"]), select, textarea, button';
const INTERACTIVE_SELECTOR =
  'a[href], button, input:not([type="hidden"]), select, textarea, [contenteditable="true"], [tabindex]';

function nameFromAriaSnapshot(snapshot) {
  const firstLine = snapshot.split('\n', 1)[0].trim();
  const match = firstLine.match(/^-\s+[^"]+\s+"((?:\\.|[^"])*)"/);
  if (!match) return '';
  try {
    return JSON.parse(`"${match[1]}"`).trim();
  } catch {
    return match[1].trim();
  }
}

async function controlsWithoutAccessibleNames(page) {
  const controls = page.locator(CONTROL_SELECTOR);
  const unnamed = [];
  for (let index = 0; index < await controls.count(); index += 1) {
    const control = controls.nth(index);
    if (!await control.isVisible()) continue;
    const snapshot = await control.ariaSnapshot();
    if (!snapshot.trim()) continue; // Excluded from the accessibility tree (for example aria-hidden).
    if (!nameFromAriaSnapshot(snapshot)) {
      unnamed.push((await control.evaluate((element) => element.outerHTML)).slice(0, 120));
    }
  }
  return unnamed;
}

async function ariaHiddenFocusViolations(page) {
  return page.locator('[aria-hidden="true"]').evaluateAll((containers, interactiveSelector) => {
    const isNonRendered = (element, boundary) => {
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (current.hidden || style.display === 'none' || style.visibility === 'hidden'
          || current.getClientRects().length === 0) return true;
        if (current === boundary) break;
      }
      return false;
    };
    const isInert = (element, boundary) => {
      for (let current = element; current; current = current.parentElement) {
        if (current.hasAttribute('inert')) return true;
        if (current === boundary) break;
      }
      return false;
    };

    const violations = [];
    for (const container of containers) {
      const candidates = [
        ...(container.matches(interactiveSelector) ? [container] : []),
        ...container.querySelectorAll(interactiveSelector),
      ];
      for (const element of candidates) {
        if (element.matches(':disabled')) continue;
        if (isInert(element, container) || isNonRendered(element, container) || element.tabIndex < 0) continue;
        violations.push({
          container: container.id || container.tagName.toLowerCase(),
          control: (element.outerHTML || element.tagName).slice(0, 120),
        });
      }
    }
    return violations;
  }, INTERACTIVE_SELECTOR);
}

async function keyboardAudit(page) {
  const inventory = await page.locator(INTERACTIVE_SELECTOR).evaluateAll((candidates) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const rendered = typeof element.checkVisibility === 'function'
        ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
        : style.display !== 'none' && style.visibility !== 'hidden';
      return rendered && !element.closest('[aria-hidden="true"]')
        && !element.closest('[inert]')
        && rect.width > 0 && rect.height > 0;
    };
    const elements = [...new Set(candidates)]
      .filter(visible)
      .filter((element) => !element.matches(':disabled') && element.getAttribute('aria-disabled') !== 'true');
    elements.forEach((element, index) => {
      element.dataset.a11yKeyboardId = `control-${index}`;
    });

    const radioGroups = new Map();
    for (const element of elements.filter((item) => item.matches('input[type="radio"]'))) {
      const formIndex = element.form ? [...document.forms].indexOf(element.form) : -1;
      const key = `${formIndex}:${element.name || element.dataset.a11yKeyboardId}`;
      if (!radioGroups.has(key)) radioGroups.set(key, []);
      radioGroups.get(key).push(element);
    }
    const radioTabStops = new Set();
    for (const group of radioGroups.values()) {
      radioTabStops.add((group.find((radio) => radio.checked) || group[0]).dataset.a11yKeyboardId);
    }

    return {
      unfocusable: elements
        .filter((element) => element.tabIndex < 0)
        .map((element) => element.dataset.a11yKeyboardId),
      tabStops: elements
        .filter((element) => element.tabIndex >= 0)
        .filter((element) => !element.matches('input[type="radio"]')
          || radioTabStops.has(element.dataset.a11yKeyboardId))
        .map((element) => element.dataset.a11yKeyboardId),
      radioGroups: [...radioGroups.values()].map((group) =>
        group.map((element) => element.dataset.a11yKeyboardId)),
    };
  });

  await page.evaluate(() => {
    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
    document.body.removeAttribute('tabindex');
  });
  const visitedOrder = [];
  for (let index = 0; index < inventory.tabStops.length; index += 1) {
    await page.keyboard.press('Tab');
    visitedOrder.push(
      await page.evaluate(() => document.activeElement.dataset.a11yKeyboardId || 'not-interactive'),
    );
  }
  const visited = new Set(visitedOrder);

  const radioVisited = new Set();
  for (const group of inventory.radioGroups) {
    if (group.length < 2) continue;
    await page.locator(`[data-a11y-keyboard-id="${group[0]}"]`).focus();
    for (let index = 0; index < group.length; index += 1) {
      radioVisited.add(await page.evaluate(
        () => document.activeElement.dataset.a11yKeyboardId || 'not-interactive',
      ));
      await page.keyboard.press('ArrowRight');
    }
  }

  return {
    expected: inventory.tabStops.length,
    visited: visited.size,
    visitedOrder,
    orderMatches: visitedOrder.every((id, index) => id === inventory.tabStops[index]),
    missing: inventory.tabStops.filter((id) => !visited.has(id)),
    unfocusable: inventory.unfocusable,
    radioMissing: inventory.radioGroups.flat().filter((id) => !radioVisited.has(id)
      && inventory.radioGroups.some((group) => group.length > 1 && group.includes(id))),
  };
}

const pages = canonicalPages();
check('sitemap.xml', 'has canonical pages to test', pages.length >= 20, `found ${pages.length}`);
for (const { relative } of pages) {
  check('sitemap.xml', `canonical page exists: ${relative}`, existsSync(join(ROOT, relative)));
}
const navExceptions = new Set(['/folio/try/']); // Immersive journal demo; its main landmark is sufficient.

const server = await startServer();
const { port } = server.address();
const localOrigin = `http://${HOST}:${port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
let blockedExternalRequests = 0;
await context.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  if (url.origin === localOrigin) await route.continue();
  else {
    blockedExternalRequests += 1;
    await route.abort();
  }
});

try {
  for (const { pathname, relative } of pages) {
    const page = await context.newPage();
    await page.goto(`${localOrigin}${pathname}`, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const images = [...document.images]
        .filter((image) => !image.hasAttribute('alt'))
        .map((image) => image.getAttribute('src'));
      const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
        .map((heading) => Number(heading.tagName.slice(1)));
      const skipped = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
      const positiveTabindex = [...document.querySelectorAll('[tabindex]')]
        .filter((element) => Number(element.getAttribute('tabindex')) > 0).length;
      const unfocusable = [...document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')]
        .filter(visible)
        .filter((element) => element.tabIndex < 0).length;
      return {
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        h1: document.querySelectorAll('h1').length,
        headings: headings.length,
        skipped,
        images,
        positiveTabindex,
        unfocusable,
      };
    });
    const unnamedControls = await controlsWithoutAccessibleNames(page);
    const hiddenFocusViolations = await ariaHiddenFocusViolations(page);
    check(relative, 'has one main landmark', result.main === 1, `found ${result.main}`);
    check(relative, 'has a navigation landmark or documented immersive layout',
      result.nav >= 1 || navExceptions.has(pathname), `found ${result.nav}`);
    check(relative, 'has one h1', result.h1 === 1, `found ${result.h1}`);
    check(relative, 'has a heading hierarchy', result.headings > 0 && !result.skipped);
    check(relative, 'gives visible form controls a computed accessible name',
      unnamedControls.length === 0, unnamedControls[0]);
    check(relative, 'gives every image an alt attribute', result.images.length === 0, result.images[0]);
    check(relative, 'does not use positive tabindex', result.positiveTabindex === 0);
    check(relative, 'keeps native controls keyboard-focusable', result.unfocusable === 0);
    check(relative, 'protects focusable descendants of aria-hidden containers',
      hiddenFocusViolations.length === 0,
      hiddenFocusViolations[0]
        ? `${hiddenFocusViolations[0].container}: ${hiddenFocusViolations[0].control}`
        : '');
    await page.close();
  }

  const keyboardPages = [
    '/',
    '/tools/water-intake-calculator/',
    '/tools/blood-pressure-checker/',
    '/tools/journal-prompt-generator/',
    '/tools/white-noise-player/',
    '/folio/try/',
  ];
  for (const pathname of keyboardPages) {
    const page = await context.newPage();
    await page.goto(`${localOrigin}${pathname}`, { waitUntil: 'domcontentloaded' });
    const result = await keyboardAudit(page);
    check(pathname, 'Tab reaches every expected interactive control',
      result.missing.length === 0 && result.visited === result.expected && result.orderMatches,
      `visited ${result.visited}/${result.expected}; missing ${result.missing.join(', ') || 'none'}`);
    check(pathname, 'arrow keys reach every radio in each group',
      result.radioMissing.length === 0, `missing ${result.radioMissing.join(', ') || 'none'}`);
    await page.close();
  }

  const fixture = await context.newPage();
  await fixture.setContent('<main><h1>No controls</h1></main>');
  check('mutation fixture', 'zero controls pass accessible-name audit',
    (await controlsWithoutAccessibleNames(fixture)).length === 0);
  check('mutation fixture', 'zero controls pass keyboard audit',
    (await keyboardAudit(fixture)).expected === 0);
  await fixture.setContent(`
    <main>
      <h1>Accessible-name fixture</h1>
      <input aria-label="Search">
      <label>Wrapped label <input></label>
      <button type="button">First</button>
      <button type="button">Second</button>
    </main>
  `);
  check('mutation fixture', 'aria-label and wrapping label provide accessible names',
    (await controlsWithoutAccessibleNames(fixture)).length === 0);
  const orderedControls = await keyboardAudit(fixture);
  check('mutation fixture', 'one and many controls preserve exact tab order',
    orderedControls.expected === 4 && orderedControls.orderMatches);
  await fixture.setContent(`
    <main>
      <h1>Tab-order mutation</h1>
      <button tabindex="2">First in the document</button>
      <button tabindex="1">Second in the document</button>
    </main>
  `);
  check('mutation fixture', 'out-of-order positive tabindex is rejected',
    !(await keyboardAudit(fixture)).orderMatches);
  await fixture.setContent(`
    <main>
      <h1>Accessibility fixture</h1>
      <label for="fixture-input">Meaningful name</label>
      <input id="fixture-input">
      <button type="button">Save</button>
    </main>
  `);
  check('mutation fixture', 'valid associated label passes',
    (await controlsWithoutAccessibleNames(fixture)).length === 0);
  await fixture.locator('label').evaluate((label) => { label.textContent = ''; });
  check('mutation fixture', 'empty associated label is rejected',
    (await controlsWithoutAccessibleNames(fixture)).some((control) => control.includes('fixture-input')));
  await fixture.locator('#fixture-input').evaluate((input) => {
    input.setAttribute('aria-label', 'Fallback name');
  });
  check('mutation fixture', 'aria-label repairs an empty associated label',
    (await controlsWithoutAccessibleNames(fixture)).length === 0);
  await fixture.locator('#fixture-input').evaluate((input) => {
    input.setAttribute('aria-label', ' ');
  });
  check('mutation fixture', 'empty aria-label is rejected',
    (await controlsWithoutAccessibleNames(fixture)).some((control) => control.includes('fixture-input')));
  await fixture.locator('#fixture-input').evaluate((input) => {
    input.setAttribute('aria-label', 'Meaningful name');
  });
  await fixture.locator('label').evaluate((label) => { label.textContent = 'Meaningful name'; });
  check('mutation fixture', 'valid keyboard controls pass',
    (await keyboardAudit(fixture)).unfocusable.length === 0);
  await fixture.locator('#fixture-input').evaluate((input) => { input.tabIndex = -1; });
  check('mutation fixture', 'unreachable interactive control is rejected',
    (await keyboardAudit(fixture)).unfocusable.length === 1);
  await fixture.setContent(`
    <main>
      <h1>Hidden focus fixture</h1>
      <button aria-hidden="true">Hidden action</button>
      <div aria-hidden="true"><button aria-disabled="true">Unavailable action</button></div>
    </main>
  `);
  check('mutation fixture', 'aria-hidden interactive containers are rejected',
    (await ariaHiddenFocusViolations(fixture)).length === 2);
  await fixture.setContent(`
    <main>
      <h1>Inert fixture</h1>
      <div inert><button>Unavailable action</button></div>
      <button>Available action</button>
    </main>
  `);
  const inertKeyboard = await keyboardAudit(fixture);
  check('mutation fixture', 'inert controls are omitted from expected tab stops',
    inertKeyboard.expected === 1 && inertKeyboard.visited === 1 && inertKeyboard.orderMatches);
  await fixture.setContent(`
    <main>
      <h1>Radio fixture</h1>
      <form><label><input type="radio" name="choice" checked> A</label>
        <label><input type="radio" name="choice"> B</label></form>
      <form><label><input type="radio" name="choice" checked> C</label>
        <label><input type="radio" name="choice"> D</label></form>
    </main>
  `);
  const radioKeyboard = await keyboardAudit(fixture);
  check('mutation fixture', 'radio groups in separate forms keep separate tab stops',
    radioKeyboard.expected === 2 && radioKeyboard.radioMissing.length === 0);
  const beforeBlockedRequest = blockedExternalRequests;
  await fixture.evaluate(() => fetch('http://127.0.0.1:1/a11y-network-mutation').catch(() => null));
  check('mutation fixture', 'external and wrong-port requests are blocked',
    blockedExternalRequests === beforeBlockedRequest + 1);
  await fixture.close();

  const zolioMutation = await context.newPage();
  await zolioMutation.goto(`${localOrigin}/folio/try/`, { waitUntil: 'domcontentloaded' });
  check('Zolio inert mutation', 'hidden result screen is protected',
    (await ariaHiddenFocusViolations(zolioMutation)).length === 0);
  await zolioMutation.locator('#screen2').evaluate((screen) => { screen.removeAttribute('inert'); });
  check('Zolio inert mutation', 'removing inert exposes hidden focusable controls',
    (await ariaHiddenFocusViolations(zolioMutation)).length > 0);
  await zolioMutation.reload({ waitUntil: 'domcontentloaded' });
  await zolioMutation.locator('#closeDay').focus();
  await zolioMutation.locator('#closeDay').click();
  check('Zolio screen transition', 'moves focus into the revealed result',
    await zolioMutation.evaluate(() => document.activeElement.id === 'writeAgain'));
  await zolioMutation.locator('#writeAgain').click();
  check('Zolio screen transition', 'restores focus to the journal',
    await zolioMutation.evaluate(() => document.activeElement.id === 'journal'));
  await zolioMutation.locator('#closeDay').click();
  await zolioMutation.locator('#writeAgain').click();
  check('Zolio screen transition', 'repeat reveal and reset preserves focus and inert state',
    await zolioMutation.evaluate(() =>
      document.activeElement.id === 'journal'
      && !document.querySelector('#screen1').inert
      && document.querySelector('#screen2').inert));
  await zolioMutation.close();

  for (const { pathname, relative } of pages) {
    const page = await context.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto(`${localOrigin}${pathname}`, { waitUntil: 'domcontentloaded' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(relative, 'fits a 375px responsive viewport', overflow <= 1, `${overflow}px overflow`);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

if (failures.length) {
  console.error(`accessibility: ${checks} checks · ${failures.length} FAIL`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`accessibility: ${pages.length} canonical pages · ${checks} checks · PASS`);
