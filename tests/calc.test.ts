// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  complementPct,
  foreignCitizenSharePct,
  meanOfStudyYears,
  ratioToComparison,
  round,
  studyPopulationSharePct,
  swedishBornTwoForeignParents,
} from '../src/lib/calc';
import { formatNumber, formatPct, formatTimes } from '../src/lib/format';
import type { PopulationRow } from '../src/lib/data';

const pop = (year: number, folkmangd: number, utrikesFodda: number | null, utlandskBakgrund: number | null, medb: number | null): PopulationRow => ({
  year,
  folkmangd,
  utrikesFodda,
  utlandskBakgrund,
  utlandskaMedborgare: medb,
  source: '',
});

test('round: halves go up, also where binary floats fall just short', () => {
  assert.equal(round(1.95, 1), 2);
  assert.equal(round(4.35, 1), 4.4);
  assert.equal(round(4.05, 1), 4.1);
  assert.equal(round(0.15, 1), 0.2);
  assert.equal(round(63.25, 1), 63.3);
  assert.equal(round(1.005, 2), 1.01);
  assert.equal(round(2.51, 1), 2.5);
  assert.equal(round(-1.95, 1), -2);
  assert.equal(round(0.21 / 0.04, 1), 5.3); // 5.25 with float noise
});

test('format: Swedish style and correct rounding', () => {
  assert.equal(formatNumber(1234567), '1 234 567');
  assert.equal(formatNumber(1.95, 1), '2,0');
  assert.equal(formatPct(7.81, 1), '7,8 %');
  assert.equal(formatPct(22), '22 %');
  assert.equal(formatTimes(4.35), '4,4×');
  assert.equal(formatNumber(-0.5, 1), '−0,5');
});

test('foreign citizens share: medborgare / folkmangd * 100, one decimal, gap stays a gap', () => {
  assert.equal(foreignCitizenSharePct(pop(2025, 10605529, null, null, 828544)), 7.8);
  assert.equal(foreignCitizenSharePct(pop(2025, 10605529, null, null, null)), null);
});

test('Swedish-born with two foreign-born parents: background minus foreign-born', () => {
  assert.equal(swedishBornTwoForeignParents(pop(2000, 8882792, 1003798, 1288247, null)), 284449);
  assert.equal(swedishBornTwoForeignParents(pop(2014, 9747355, null, null, null)), null);
});

test('study mean: needs all four years', () => {
  assert.equal(meanOfStudyYears(new Map([[2000, 1], [2005, 2], [2010, 3], [2015, 6]])), 3);
  assert.throws(() => meanOfStudyYears(new Map([[2000, 1], [2005, null], [2010, 3], [2015, 6]])));
  const rows = [
    pop(2000, 8882792, 1003798, 1288247, null),
    pop(2005, 9047752, 1125790, 1463358, null),
    pop(2010, 9415570, 1384929, 1797889, null),
    pop(2015, 9851017, 1676264, 2187020, null),
  ];
  assert.equal(studyPopulationSharePct(rows, (r) => r.utrikesFodda), 13.9);
  assert.equal(studyPopulationSharePct(rows, swedishBornTwoForeignParents), 4.1);
});

test('ratio and complement', () => {
  assert.equal(ratioToComparison(10, 4), 2.5);
  assert.equal(ratioToComparison(null, 4), null);
  assert.equal(ratioToComparison(10, 0), null);
  assert.equal(complementPct(36.9), 63.1);
  assert.equal(complementPct(69.5), 30.5);
});
