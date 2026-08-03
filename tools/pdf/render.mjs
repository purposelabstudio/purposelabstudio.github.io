import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { mkdir, access } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

/**
 * Output profiles.
 *
 * `print`  — for people who will print at home. Real paper sizes, print media,
 *            backgrounds on. The HTML owns its own margins so a spread can bleed.
 * `tablet` — for GoodNotes / Notability / Samsung Notes. 3:4 portrait at the
 *            resolution the category conventionally uses, zero margin, screen
 *            media so hover-free screen styles apply and links stay tappable.
 */
export const PROFILES = {
  print: {
    media: 'print',
    papers: {
      a4: { width: '210mm', height: '297mm' },
      letter: { width: '8.5in', height: '11in' },
    },
    defaultPaper: 'a4',
  },
  tablet: {
    media: 'screen',
    papers: {
      portrait: { width: '1620px', height: '2160px' },
      landscape: { width: '2160px', height: '1620px' },
    },
    defaultPaper: 'portrait',
  },
};

/**
 * Every page element must declare `data-page`. Anything that overflows its own
 * box clips silently under `overflow:hidden` and ships broken, so this fails the
 * build instead of writing a bad PDF.
 */
async function assertNoOverflow(page) {
  const offenders = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('[data-page]'));
    if (pages.length === 0) return [{ name: '(none)', reason: 'no [data-page] elements found' }];
    return pages
      .map((el, i) => ({
        name: el.dataset.page || `page-${i + 1}`,
        vertical: el.scrollHeight - el.clientHeight,
        horizontal: el.scrollWidth - el.clientWidth,
      }))
      .filter((p) => p.vertical > 2 || p.horizontal > 2);
  });

  if (offenders.length > 0) {
    const detail = offenders
      .map((o) => (o.reason ? `  ${o.name}: ${o.reason}` : `  ${o.name}: +${o.vertical}px tall, +${o.horizontal}px wide`))
      .join('\n');
    throw new Error(`Content overflows its page box:\n${detail}`);
  }
}

export async function render({ source, profile = 'print', paper, out }) {
  const spec = PROFILES[profile];
  if (!spec) throw new Error(`Unknown profile "${profile}". Known: ${Object.keys(PROFILES).join(', ')}`);

  const paperName = paper || spec.defaultPaper;
  const size = spec.papers[paperName];
  if (!size) {
    throw new Error(`Unknown paper "${paperName}" for profile "${profile}". Known: ${Object.keys(spec.papers).join(', ')}`);
  }

  const sourcePath = resolve(source);
  await access(sourcePath);

  const outPath = resolve(out);
  await mkdir(dirname(outPath), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    // Declare the profile before first paint so CSS can key off it.
    await page.addInitScript(
      ([p, pa]) => {
        document.documentElement.dataset.profile = p;
        document.documentElement.dataset.paper = pa;
      },
      [profile, paperName]
    );

    await page.goto(pathToFileURL(sourcePath).href, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: spec.media });
    await page.evaluate(() => document.fonts.ready);

    await assertNoOverflow(page);

    await page.pdf({
      path: outPath,
      width: size.width,
      height: size.height,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: false,
    });

    return outPath;
  } finally {
    await browser.close();
  }
}

function parseArgs(argv) {
  const [source, ...rest] = argv;
  const opts = { source };
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].replace(/^--/, '');
    opts[key] = rest[i + 1];
  }
  return opts;
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.source) {
    console.error(`Usage: node tools/pdf/render.mjs <source.html> [--profile print|tablet] [--paper a4|letter|portrait|landscape] [--out path.pdf]

Examples:
  node tools/pdf/render.mjs tools/pdf/proof.html --profile print --paper a4
  node tools/pdf/render.mjs tools/pdf/proof.html --profile tablet --out dist/proof-tablet.pdf`);
    process.exit(1);
  }

  const profile = opts.profile || 'print';
  const paper = opts.paper || PROFILES[profile]?.defaultPaper;
  const out = opts.out || `dist/pdf/${basename(opts.source, '.html')}-${profile}-${paper}.pdf`;

  try {
    const written = await render({ source: opts.source, profile, paper, out });
    console.log(`OK  ${written.replace(`${REPO_ROOT}/`, '')}  [${profile}/${paper}]`);
  } catch (err) {
    console.error(`FAIL  ${err.message}`);
    process.exit(1);
  }
}
