// scripts/test-tools.mjs — unit tests for tool calc modules.
import assert from 'node:assert/strict';
import { waterIntakeMl } from '../tools/water-intake-calculator/calc.js';
import { bpCategory } from '../tools/blood-pressure-checker/calc.js';
import { PROMPTS, pickPrompt } from '../tools/journal-prompt-generator/prompts.js';

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

console.log(`\n${passed} tool checks passed ✓`);
