// Checks on the real data files and on what the chapters build from them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBra2005, loadOrigin, loadPopulation, loadPrison, loadRapeStudies, loadSuspectsByBackground, loadTableB6, num } from '../src/lib/data';
import { buildKap1Data, buildKap1Spec } from '../src/lib/chapters/kap1';
import { buildKap2Data, buildKap2Spec, hasShares, type Measure, type View } from '../src/lib/chapters/kap2';
import { buildKap4 } from '../src/lib/chapters/kap4';
import { buildKap5 } from '../src/lib/chapters/kap5';

test('num: empty is no value, never 0; bad numbers fail', () => {
  assert.equal(num(''), null);
  assert.equal(num('  '), null);
  assert.equal(num('0'), 0);
  assert.equal(num('7.5'), 7.5);
  assert.throws(() => num('7,5'));
  assert.throws(() => num('abc'));
});

test('all data files load', () => {
  assert.ok(loadPrison().length > 0);
  assert.ok(loadPopulation().length > 0);
  assert.ok(loadRapeStudies().length > 0);
  assert.ok(loadBra2005().length > 0);
  assert.ok(loadTableB6().length > 0);
});

const suspects = loadSuspectsByBackground();
const kap1 = buildKap1Data(suspects);

test('chapter 1: a missing value stays a gap in both views', () => {
  for (const crime of kap1.crimes) {
    for (const mode of ['rate', 'ratio'] as const) {
      const spec = buildKap1Spec(kap1, crime.id, mode, 'sv');
      for (const s of spec.series) {
        assert.equal(s.values.length, kap1.years.length);
        for (const v of s.values) assert.ok(v === null || Number.isFinite(v), `${crime.name} ${mode} ${s.id}`);
      }
    }
  }
  const gap = kap1.crimes.find((c) => c.values.sv2.includes(null));
  assert.ok(gap, 'expected at least one crime type with missing years');
  const ratio = buildKap1Spec(kap1, gap.id, 'ratio', 'sv');
  const i = gap.values.sv2.indexOf(null);
  for (const s of ratio.series) assert.equal(s.values[i], null);
});

const kap2 = buildKap2Data(loadOrigin(), new Map(suspects.map((r) => [r.crimeOrder, r.depth])), loadTableB6());

test('chapter 2: rows are sorted by the value shown, and shares are complete or absent', () => {
  for (const view of ['region', 'land', 'moder'] as View[]) {
    for (const crime of kap2[view]) {
      for (const measure of ['risk', 'rate', 'share'] as Measure[]) {
        const spec = buildKap2Spec(kap2, view, crime.name, measure, 'sv');
        if (measure === 'share' && hasShares(crime)) {
          for (const r of spec.rows) assert.ok(r.secondary !== null && Number.isFinite(r.primary));
          continue;
        }
        if (measure === 'share') continue; // falls back to the risk view
        for (let i = 1; i < spec.rows.length; i++) {
          assert.ok(spec.rows[i - 1].primary >= spec.rows[i].primary, `${view} ${crime.name} ${measure}`);
        }
      }
    }
  }
});

test('chapters 4 and 5 build', () => {
  const kap4 = buildKap4(loadRapeStudies(), loadPopulation(), 'sv');
  assert.equal(kap4.main.groups[0].bars[0].value, 63.1);
  assert.equal(kap4.main.groups[0].bars[1].value, 30.5);
  assert.deepEqual(kap4.main.groups.map((g) => g.bars.map((b) => b.value)), [[63.1, 30.5], [50.6, 18], [6.4, 4.8], [6.1, 7.7]]);
  assert.equal(kap4.population2015.groups[0].bars[1].value, 13.9);
  assert.equal(kap4.menPct, 99.7);
  assert.ok(buildKap5(loadBra2005(), 'sv').foreignBornRiskRose);
});
