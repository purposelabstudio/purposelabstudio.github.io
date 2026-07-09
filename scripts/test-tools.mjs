// scripts/test-tools.mjs — unit tests for tool calc modules.
import assert from 'node:assert/strict';
import { waterIntakeMl } from '../tools/water-intake-calculator/calc.js';

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('  ✓ ' + name); }

// Base: 33 ml per kg. +350 moderate / +700 active. +500 hot climate.
t('70kg sedentary temperate = 2310', () => assert.equal(waterIntakeMl(70, 'sedentary', 'temperate'), 2310));
t('70kg moderate temperate = 2660', () => assert.equal(waterIntakeMl(70, 'moderate', 'temperate'), 2660));
t('70kg active hot = 3510', () => assert.equal(waterIntakeMl(70, 'active', 'hot'), 3510));
t('clamps weight <30 to 30', () => assert.equal(waterIntakeMl(10, 'sedentary', 'temperate'), 990));
t('clamps weight >200 to 200', () => assert.equal(waterIntakeMl(500, 'sedentary', 'temperate'), 6600));
t('unknown activity/climate treated as none', () => assert.equal(waterIntakeMl(60, 'x', 'y'), 1980));

console.log(`\n${passed} tool checks passed ✓`);
