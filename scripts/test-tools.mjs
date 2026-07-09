// scripts/test-tools.mjs — unit tests for tool calc modules.
import assert from 'node:assert/strict';
import { waterIntakeMl } from '../tools/water-intake-calculator/calc.js';
import { bpCategory } from '../tools/blood-pressure-checker/calc.js';
import { PROMPTS, pickPrompt } from '../tools/journal-prompt-generator/prompts.js';
import { fillWhite, fillPink, fillBrown, NOISE } from '../tools/white-noise-player/noise.js';

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

// Base: 33 ml per kg. +350 moderate / +700 active. +500 hot climate.
t('70kg sedentary temperate = 2310', () => assert.equal(waterIntakeMl(70, 'sedentary', 'temperate'), 2310));
t('70kg moderate temperate = 2660', () => assert.equal(waterIntakeMl(70, 'moderate', 'temperate'), 2660));
t('70kg active hot = 3510', () => assert.equal(waterIntakeMl(70, 'active', 'hot'), 3510));
t('clamps weight <30 to 30', () => assert.equal(waterIntakeMl(10, 'sedentary', 'temperate'), 990));
t('clamps weight >200 to 200', () => assert.equal(waterIntakeMl(500, 'sedentary', 'temperate'), 6600));
t('unknown activity/climate treated as none', () => assert.equal(waterIntakeMl(60, 'x', 'y'), 1980));

// AHA blood-pressure classification (worse of systolic/diastolic wins).
t('normal 118/78', () => assert.equal(bpCategory(118, 78).key, 'normal'));
t('elevated 125/78', () => assert.equal(bpCategory(125, 78).key, 'elevated'));
t('stage1 132/85', () => assert.equal(bpCategory(132, 85).key, 'stage1'));
t('stage2 145/95', () => assert.equal(bpCategory(145, 95).key, 'stage2'));
t('crisis 185/125', () => assert.equal(bpCategory(185, 125).key, 'crisis'));
t('higher-of-two wins: 122/82 = stage1', () => assert.equal(bpCategory(122, 82).key, 'stage1'));
t('returns a human label', () => assert.equal(typeof bpCategory(118, 78).label, 'string'));

// Journaling prompts.
t('has at least 20 prompts', () => assert.ok(PROMPTS.length >= 20));
t('all prompts are non-empty strings', () => assert.ok(PROMPTS.every(p => typeof p === 'string' && p.trim().length > 0)));
t('pickPrompt(0) is deterministic', () => assert.equal(pickPrompt(0), PROMPTS[0]));
t('pickPrompt wraps with modulo', () => assert.equal(pickPrompt(PROMPTS.length), PROMPTS[0]));

// White-noise synthesis. Deterministic LCG so results are reproducible.
function lcg(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const roughness = (a) => { let s = 0; for (let i = 1; i < a.length; i++) s += Math.abs(a[i] - a[i - 1]); return s / a.length; };
t('white with rng=0.5 is silence', () => { const a = new Float32Array(8); fillWhite(a, () => 0.5); assert.ok(a.every(v => v === 0)); });
t('white with rng=1 is +1', () => { const a = new Float32Array(4); fillWhite(a, () => 1); assert.ok(a.every(v => v === 1)); });
t('fillWhite preserves length', () => { const a = new Float32Array(100); assert.equal(fillWhite(a, Math.random).length, 100); });
t('all fillers stay within [-1,1]', () => { for (const f of [fillWhite, fillPink, fillBrown]) { const a = new Float32Array(3000); f(a, Math.random); assert.ok(a.every(v => v >= -1 && v <= 1)); } });
t('brown is smoother than white', () => { const W = new Float32Array(5000), B = new Float32Array(5000); fillWhite(W, lcg(1)); fillBrown(B, lcg(1)); assert.ok(roughness(B) < roughness(W)); });
t('pink is smoother than white', () => { const W = new Float32Array(5000), P = new Float32Array(5000); fillWhite(W, lcg(2)); fillPink(P, lcg(2)); assert.ok(roughness(P) < roughness(W)); });
t('NOISE map exposes white/pink/brown', () => assert.deepEqual(Object.keys(NOISE).sort(), ['brown', 'pink', 'white']));

console.log(`\n${passed} tool checks passed ✓`);
