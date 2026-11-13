// Every calculated value on the site comes from one small, named function here,
// so each one can be checked against the rules in CLAUDE.md.
import type { PopulationRow, PrisonRow } from './data';

/** Round to a fixed number of decimals (half away from zero). */
export function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.sign(value) * Math.round(Math.abs(value) * f) / f;
}

/**
 * Foreign citizens' share of the population, in percent, one decimal.
 * Rule: utlandska_medborgare / folkmangd * 100. Null if the year has no value.
 */
export function foreignCitizenSharePct(row: PopulationRow): number | null {
  if (row.utlandskaMedborgare === null) return null;
  return round((row.utlandskaMedborgare / row.folkmangd) * 100, 1);
}

/**
 * Swedish-born with two foreign-born parents.
 * Rule: utlandsk_bakgrund - utrikes_fodda.
 */
export function swedishBornTwoForeignParents(row: PopulationRow): number | null {
  if (row.utlandskBakgrund === null || row.utrikesFodda === null) return null;
  return row.utlandskBakgrund - row.utrikesFodda;
}

/**
 * Population comparison for the rape study 2000–2015.
 * Rule: mean of the values for 2000, 2005, 2010 and 2015.
 * Throws if any of the four years is missing, so a gap is never averaged over.
 */
export function meanOfStudyYears(values: Map<number, number | null>): number {
  const years = [2000, 2005, 2010, 2015];
  const picked = years.map((y) => {
    const v = values.get(y);
    if (v === null || v === undefined) throw new Error(`No value for ${y}`);
    return v;
  });
  return picked.reduce((a, b) => a + b, 0) / picked.length;
}

/** Share without Swedish citizenship for one prison series, as (year, value) pairs. */
export function prisonSeries(
  rows: PrisonRow[],
  population: PrisonRow['population'],
  group: PrisonRow['group'],
): Map<number, number | null> {
  const out = new Map<number, number | null>();
  for (const r of rows) {
    if (r.population === population && r.group === group) out.set(r.year, r.shareWithoutPct);
  }
  return out;
}


/**
 * A group's rate relative to the comparison group's rate in the same year.
 * Rule: value / base. Null if either is missing, so a gap stays a gap.
 */
export function ratioToComparison(value: number | null, base: number | null): number | null {
  if (value === null || base === null || base === 0) return null;
  return value / base;
}

/** A count's share of the whole population in one year, in percent. */
export function populationSharePct(count: number | null, folkmangd: number): number | null {
  return count === null ? null : (count / folkmangd) * 100;
}

/**
 * Share of the population for the rape study comparison, 2000–2015.
 * Rule: the mean of the yearly shares for 2000, 2005, 2010 and 2015, one decimal.
 * `count` picks the group from a population row, e.g. foreign-born.
 */
export function studyPopulationSharePct(
  rows: PopulationRow[],
  count: (row: PopulationRow) => number | null,
): number {
  const shares = new Map(rows.map((r) => [r.year, populationSharePct(count(r), r.folkmangd)]));
  return round(meanOfStudyYears(shares), 1);
}
