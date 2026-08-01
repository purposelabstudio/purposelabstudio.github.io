// Colour-contrast gate.
//
// PageSpeed flagged contrast, and a one-off fix would silently rot the next time
// someone picks a brand colour by eye. So this reads the palettes out of the CSS
// and the per-page :root overrides and computes real WCAG ratios.
//
// Scope note: this checks TOKEN PAIRS, not rendered pixels. It cannot see a
// colour written inline on one element, and it does not try to. It guards the
// palette, which is where every colour on the site actually comes from.
//
// Usage: node scripts/test-contrast.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// WCAG 2.1 AA. 4.5 for normal text, 3.0 for large text (>=24px, or >=18.66px bold).
// Every token below is used at small sizes somewhere, so they are all held to 4.5.
const AA_NORMAL = 4.5;

// Foreground tokens that carry text against --paper.
const TEXT_TOKENS = ['ink', 'ink-soft', 'ink-muted', 'accent', 'accent-dark', 'gold'];

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

// Pull `--token: #hex;` pairs out of a chunk of CSS.
function parseTokens(css) {
  const out = {};
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*[;}]/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (entry.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const css = readFileSync('style.css', 'utf8');
// Take the first :root block specifically. Splitting on the first `}` would stop
// inside the @font-face rules that sit above it.
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\}/);
const base = rootBlock ? parseTokens(rootBlock[1] + '}') : {};
if (!base.paper) {
  console.error('contrast: could not read the base palette from style.css');
  process.exit(1);
}

const palettes = [{ name: 'style.css (base)', tokens: base }];

for (const file of walk('.')) {
  const html = readFileSync(file, 'utf8');
  // Per-page overrides are written as a single-line `:root{ --paper:#..; ... }`.
  // Require the colon: `--paper-line` in the /folio/try/ demo is a different
  // token in a different system, and that page deliberately replicates the
  // in-app themes rather than the site chrome.
  for (const m of html.matchAll(/:root\s*\{([^}]*--paper\s*:[^}]*)\}/g)) {
    const tokens = { ...base, ...parseTokens(m[1] + '}') };
    palettes.push({ name: file.replace(/^\.\//, ''), tokens });
  }
}

let failures = 0;
let checks = 0;

for (const { name, tokens } of palettes) {
  const paper = tokens.paper;
  for (const token of TEXT_TOKENS) {
    const fg = tokens[token];
    if (!fg) continue;
    checks += 1;
    const r = contrastRatio(fg, paper);
    if (r < AA_NORMAL) {
      failures += 1;
      console.error(
        `FAIL  ${name}  --${token} ${fg} on ${paper}  ${r.toFixed(2)} (needs ${AA_NORMAL})`,
      );
    }
  }
  // Text sitting on an accent-filled surface.
  if (tokens['accent-ink'] && tokens.accent) {
    checks += 1;
    const r = contrastRatio(tokens['accent-ink'], tokens.accent);
    if (r < AA_NORMAL) {
      failures += 1;
      console.error(
        `FAIL  ${name}  --accent-ink ${tokens['accent-ink']} on --accent ${tokens.accent}  ${r.toFixed(2)}`,
      );
    }
  }
}

// A checker that silently checks nothing always passes. Guard against that.
if (checks < 20) {
  console.error(`contrast: only ${checks} checks ran — the palette parser is probably broken`);
  process.exit(1);
}

console.log(`contrast: ${palettes.length} palettes · ${checks} pairs checked · ${failures} FAIL`);
process.exit(failures === 0 ? 0 : 1);
