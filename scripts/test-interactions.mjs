// Behavioral checks for interaction paths whose analytics or error handling can
// silently drift while static HTML remains valid.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

let passed = 0;
const failures = [];
function check(name, condition, detail = '') {
  if (condition) passed += 1;
  else failures.push(detail ? `${name} — ${detail}` : name);
}

function moduleScript(file) {
  const html = readFileSync(file, 'utf8');
  return [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].at(-1)?.[1] || '';
}

function runToolSubmit(file, importPattern, replacement, elements, expectedEvent) {
  const html = readFileSync(file, 'utf8');
  const script = moduleScript(file).replace(importPattern, replacement);
  let submit = null;
  const events = [];
  const form = {
    addEventListener(type, handler) {
      if (type === 'submit') submit = handler;
    },
  };
  const context = {
    __bpCategory: () => ({ label: 'Normal', note: 'Test note' }),
    __waterIntakeMl: () => 2310,
    document: {
      querySelector(selector) {
        if (selector === '#calc') return form;
        return elements[selector];
      },
    },
    window: {
      goatcounter: {
        count(event) { events.push(event); },
      },
    },
    Math,
  };
  vm.createContext(context);
  vm.runInContext(script, context);

  check(`${file}: completion is not attached to the submit button`,
    !/<button[^>]+data-goatcounter-click="tool-[^"]+-complete"/i.test(html));
  check(`${file}: submit handler registered`, typeof submit === 'function');
  submit();
  check(`${file}: successful submit emits exactly one completion`,
    events.length === 1 && events[0].path === expectedEvent,
    JSON.stringify(events));
}

runToolSubmit(
  'tools/blood-pressure-checker/index.html',
  /import\s+\{\s*bpCategory\s*\}\s+from\s+'\.\/calc\.js';/,
  'const bpCategory = globalThis.__bpCategory;',
  {
    '#sys': { value: '118' },
    '#dia': { value: '78' },
    '#result': { innerHTML: '' },
  },
  'tool-bp-checker-complete',
);

runToolSubmit(
  'tools/water-intake-calculator/index.html',
  /import\s+\{\s*waterIntakeMl\s*\}\s+from\s+'\.\/calc\.js';/,
  'const waterIntakeMl = globalThis.__waterIntakeMl;',
  {
    '#weight': { value: '70' },
    '#result': { innerHTML: '' },
    'input[name=activity]:checked': { value: 'sedentary' },
    'input[name=climate]:checked': { value: 'temperate' },
  },
  'tool-water-calculator-complete',
);

async function runNewsletter(fetchImpl) {
  const script = readFileSync('assets/newsletter.js', 'utf8');
  let submit = null;
  const appended = [];
  const status = {
    textContent: '',
    className: 'js-subscribe-ok',
    classList: { add() {}, remove() {} },
    appendChild(node) { appended.push(node); },
  };
  const button = { disabled: false };
  const wrap = {
    querySelector(selector) {
      return selector === '.js-subscribe-ok' ? status : null;
    },
    appendChild() {},
  };
  const form = {
    dataset: {},
    style: { display: '' },
    closest() { return wrap; },
    parentNode: wrap,
    querySelector(selector) {
      if (selector === 'input[type="email"]') return { value: 'reader@example.com', focus() {} };
      if (selector === '[type="submit"]') return button;
      return null;
    },
    addEventListener(type, handler) {
      if (type === 'submit') submit = handler;
    },
  };
  const context = {
    window: { location: { href: '' } },
    document: {
      querySelectorAll() { return [form]; },
      createElement(tag) { return { tagName: tag.toUpperCase(), href: '', textContent: '' }; },
      createTextNode(text) { return { textContent: text }; },
    },
    fetch: fetchImpl,
    URLSearchParams,
    encodeURIComponent,
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  submit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  return { form, status, appended, button, submit };
}

{
  const result = await runNewsletter(() => Promise.resolve({ type: 'opaque' }));
  check('newsletter success reports only that the request was sent',
    result.status.textContent.startsWith('Request sent.') &&
      result.form.style.display === 'none' &&
      result.button.disabled === true);
}

{
  const result = await runNewsletter(() => Promise.reject(new Error('offline')));
  const fallback = result.appended.find((node) => node.tagName === 'A');
  check('newsletter failure keeps the form available', result.form.style.display === '');
  check('newsletter failure re-enables submission',
    result.form.dataset.submitting === 'false' && result.button.disabled === false);
  check('newsletter failure renders an actionable email fallback',
    fallback?.href.startsWith('mailto:purposelab.studio@gmail.com?') &&
      fallback.textContent === 'Email PurposeLab to subscribe',
    JSON.stringify(fallback));
}

{
  let calls = 0;
  const pending = new Promise(() => {});
  const result = await runNewsletter(() => { calls += 1; return pending; });
  result.submit({ preventDefault() {} });
  check('newsletter blocks duplicate in-flight submissions', calls === 1, String(calls));
}

if (failures.length) {
  console.error(`FAIL  ${failures.length} interaction check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`PASS  interactions: ${passed} behavioral checks green`);
