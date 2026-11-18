// Checks on the real data files and on what the chapters build from them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadBra2005,
  loadOrigin,
  loadPopulation,
  loadPrison,
  loadRapeStudies,
  loadRiskFactors,
  loadSuspectsByBackground,
  loadSuspicionShares,
  loadTableB6,
  num,
} from '../src/lib/data';
import { round } from '../src/lib/calc';
import { buildSuspicionShares, peakYear } from '../src/lib/chapters/kap1Shares';
import { buildRiskFactors } from '../src/lib/chapters/kap2Factors';
import { crimes as ntuCrimes, pooled, swedishHigher, regionTables } from '../src/lib/chapters/kap6';
import { loadNtu, loadDeportation, loadHomicide, loadCohorts, loadBirthCohorts } from '../src/lib/data';
import { birthYears, fellInAllGroups, kohortValue } from '../src/lib/chapters/kap10';
import { allFell, smallerInLowIncome } from '../src/lib/chapters/kap9';
import { moreThanTwiceForeign, worseOnAll, homicideItem } from '../src/lib/chapters/kap8';
import { citizenshipGroups, offenceGroups, totalRow } from '../src/lib/chapters/kap7';
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

test('chapter 1, second chart: shares calculated from the counts match Brå table D2', () => {
  const rows = loadSuspicionShares();
  const data = buildSuspicionShares(rows);
  assert.deepEqual(data.years, [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]);
  // Brå's yearly totals in table D1.
  assert.equal(data.totals[0], 443208);
  assert.equal(data.totals[data.totals.length - 1], 537057);
  for (const g of data.groups) {
    data.years.forEach((y, i) => {
      const bra = rows.find((r) => r.groupId === g.id && r.year === y)!.pctBra;
      assert.equal(round(g.shares[i], 1), bra, `${g.id} ${y}`);
    });
  }
  data.years.forEach((_, i) => {
    const sum = data.groups.reduce((a, g) => a + g.shares[i], 0);
    assert.ok(Math.abs(sum - 100) < 1e-9);
  });
  assert.equal(peakYear(data, 'ej'), 2016);
});

test('chapter 2, second chart: background and other factors, highest first', () => {
  const items = buildRiskFactors(loadRiskFactors(), loadTableB6());
  assert.deepEqual(
    items.map((i) => [i.name, i.risk]),
    [
      ['Familjen fick försörjningsstöd', 6.1],
      ['Endast förgymnasial utbildning', 4.1],
      ['Inrikesfödda med två utrikesfödda föräldrar', 3.21],
      ['Män', 3.2],
      ['Utrikesfödda', 2.51],
      ['Inrikesfödda med en inrikes- och en utrikesfödd förälder', 1.86],
    ],
  );
});

test('chapter 6: NTU values as in Brå’s report, gaps stay gaps', () => {
  const rows = loadNtu();
  assert.equal(ntuCrimes(rows).length, 9);
  // Numbers printed in the text of NTU Kortanalys 2/2024.
  const one = (crime: string, sex: 'man' | 'kvinnor', g: string) => round(pooled(rows, crime, sex, g).pct!, 1);
  assert.equal(one('misshandel', 'man', 'utlandsk'), 4.2);
  assert.equal(one('misshandel', 'man', 'svensk'), 3.8);
  assert.equal(one('hot', 'kvinnor', 'utlandsk'), 9.2);
  assert.equal(one('sexualbrott', 'kvinnor', 'utlandsk'), 7.7);
  assert.equal(one('sexualbrott', 'kvinnor', 'svensk'), 9.2);
  assert.deepEqual(swedishHigher(rows), [{ crimeId: 'sexualbrott', sex: 'kvinnor' }]);
  // Brå's markers become empty cells, never 0.
  const soviet = pooled(rows, 'sexualbrott', 'man', 'Sovjetunionen');
  assert.equal(soviet.pct, null);
  assert.equal(soviet.flag, '.');
  const t = regionTables(rows, 'sv').find((x) => x.id === 'kap6-region-sexualbrott')!;
  assert.equal(t.rows.find((r) => r.key === 'Sovjetunionen')!.cells[1], null);
});

test('chapter 7: table B1 adds up, hidden values stay empty', () => {
  const rows = loadDeportation();
  const total = totalRow(rows);
  assert.equal(total.n, 5826);
  assert.equal(total.pctDeported, 48.2);
  const sum = (d: string) => rows.filter((r) => r.dimension === d && r.parent === '').reduce((a, r) => a + (r.n ?? 0), 0);
  for (const d of ['kon', 'alder', 'folkbokforing', 'huvudbrott']) assert.equal(sum(d), 5826, d);
  // World regions add up to 5,825; Brå hides one person (Oceania).
  assert.equal(sum('varldsdel'), 5825);
  assert.equal(rows.find((r) => r.group === 'Oceanien')!.pctDeported, null);
  assert.equal(citizenshipGroups(rows)[0].group, 'Västeuropa');
  assert.ok(citizenshipGroups(rows).every((r) => (r.n ?? 0) >= 50));
  assert.equal(offenceGroups(rows)[0].group, 'Narkotikabrott/smuggling');
});

test('chapter 8: homicide figures as stated by Brå', () => {
  const rows = loadHomicide();
  const utl = homicideItem(rows, 'utl');
  assert.deepEqual([utl.victims, utl.perpetrators, utl.population], [49, 43, 21]);
  // Swedish-born with Swedish-born parents plus born abroad never exceed 100.
  const sv2 = homicideItem(rows, 'sv2');
  const utr = homicideItem(rows, 'utr');
  for (const k of ['victims', 'perpetrators', 'population'] as const) assert.ok(sv2[k]! + utr[k]! <= 100);
  assert.ok(moreThanTwiceForeign(rows));
  assert.ok(worseOnAll(rows));
});

test('chapter 9: tables 1 and 2 are complete and the printed relative risks fit the shares', () => {
  const rows = loadCohorts();
  assert.equal(rows.length, 168);
  for (const r of rows) {
    if (r.group === 'native') {
      assert.equal(r.rr, 1);
      continue;
    }
    const ref = rows.find((x) => x.table === r.table && x.sex === r.sex && x.cohort === r.cohort && x.measure === r.measure && x.group === 'native')!;
    // Shares are rounded to one decimal, so the true ratio lies between these bounds; the printed RR (one decimal) must fit.
    const lo = (r.pct - 0.05) / (ref.pct + 0.05);
    const hi = (r.pct + 0.05) / (ref.pct - 0.05);
    assert.ok(r.rr >= lo - 0.05 && r.rr <= hi + 0.05, `${r.table} ${r.sex} ${r.cohort} ${r.measure} ${r.group}`);
  }
  assert.ok(allFell(rows));
  assert.ok(smallerInLowIncome(rows));
});

test('chapter 10: Brå birth cohort series are complete, values as in table 1', () => {
  const rows = loadBirthCohorts();
  assert.deepEqual([birthYears(rows, 'fore25')[0], birthYears(rows, 'fore25').at(-1)], [1958, 1998]);
  assert.deepEqual([birthYears(rows, 'fore20')[0], birthYears(rows, 'fore20').at(-1)], [1958, 2003]);
  // Background groups from 1984, every year and sex present.
  for (const m of ['fore25', 'fore20'] as const) {
    for (const y of birthYears(rows, m).filter((y) => y >= 1984)) {
      for (const sex of ['samtliga', 'man', 'kvinnor'] as const) {
        for (const g of ['alla', 'I20', 'I11', 'I02', 'Utr'] as const) assert.notEqual(kohortValue(rows, m, sex, g, y), null, `${m} ${y} ${sex} ${g}`);
      }
    }
    assert.equal(kohortValue(rows, m, 'samtliga', 'Utr', 1983), null);
  }
  // Brå's own report text: born abroad 26.3 (1984), born in Sweden with two Swedish-born parents 10.2 (1998).
  assert.equal(kohortValue(rows, 'fore25', 'samtliga', 'Utr', 1984), 26.3);
  assert.equal(kohortValue(rows, 'fore25', 'samtliga', 'I20', 1998), 10.2);
  assert.ok(fellInAllGroups(rows, 'fore25', 1984, 1998));
  assert.ok(fellInAllGroups(rows, 'fore20', 1998, 2003));
});
