// Chapter 3: prison and citizenship. Shared by the chart on the main page and the table page,
// so both always show the same numbers.
import type { PopulationRow, PrisonRow } from '../data';
import { foreignCitizenSharePct, prisonSeries } from '../calc';
import { tr, type Lang } from '../i18n';
import type { DataTable } from '../tables';

export interface Kap3 {
  years: number[];
  firstYear: number;
  lastYear: number;
  newAll: Map<number, number | null>;
  newMen: Map<number, number | null>;
  newWomen: Map<number, number | null>;
  onOct1: Map<number, number | null>;
  /** Number of people in each prison series (Brå gives it for some years only). */
  countNewAll: Map<number, number | null>;
  countNewMen: Map<number, number | null>;
  countNewWomen: Map<number, number | null>;
  countOct1: Map<number, number | null>;
  /** Foreign citizens' share of the population, one decimal. */
  popShare: Map<number, number | null>;
  population: PopulationRow[];
  /** Brå reports used, one entry per report, in name order. */
  sources: { url: string; label: string }[];
  /** Brå reports used for each year. */
  sourcesByYear: Map<number, { url: string; label: string }[]>;
}

/** Number of people in one prison series, as (year, value) pairs. */
function prisonCounts(rows: PrisonRow[], population: PrisonRow['population'], group: PrisonRow['group']) {
  const out = new Map<number, number | null>();
  for (const r of rows) if (r.population === population && r.group === group) out.set(r.year, r.persons);
  return out;
}

export function buildKap3(prison: PrisonRow[], population: PopulationRow[]): Kap3 {
  // The period comes from the data file, so a new year shows up without code changes.
  const firstYear = Math.min(...prison.map((r) => r.year));
  const lastYear = Math.max(...prison.map((r) => r.year));
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  const sources = [...new Map(prison.map((r) => [r.sourceUrl, r.source])).entries()]
    .map(([url, label]) => ({ url, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'sv'));

  const sourcesByYear = new Map<number, { url: string; label: string }[]>();
  for (const y of years) {
    const used = new Map(prison.filter((r) => r.year === y).map((r) => [r.sourceUrl, r.source]));
    sourcesByYear.set(
      y,
      [...used.entries()].map(([url, label]) => ({ url, label })),
    );
  }

  return {
    years,
    firstYear,
    lastYear,
    newAll: prisonSeries(prison, 'nyintagna', 'totalt'),
    newMen: prisonSeries(prison, 'nyintagna', 'man'),
    newWomen: prisonSeries(prison, 'nyintagna', 'kvinnor'),
    onOct1: prisonSeries(prison, '1okt', 'totalt'),
    countNewAll: prisonCounts(prison, 'nyintagna', 'totalt'),
    countNewMen: prisonCounts(prison, 'nyintagna', 'man'),
    countNewWomen: prisonCounts(prison, 'nyintagna', 'kvinnor'),
    countOct1: prisonCounts(prison, '1okt', 'totalt'),
    popShare: new Map(population.map((r) => [r.year, foreignCitizenSharePct(r)])),
    population,
    sources,
    sourcesByYear,
  };
}

/** Brå report name without the leading "Brå ", for short source lists. */
export function shortReportName(label: string): string {
  return label.replace(/^Brå /, '');
}

/** The tables on the chapter 3 table page, built from the same values as the chart. */
export function kap3Tables(k: Kap3, lang: Lang): DataTable[] {
  const v = (m: Map<number, number | null>, y: number) => m.get(y) ?? null;
  const pop = new Map(k.population.map((r) => [r.year, r]));
  const countYears = k.years.filter((y) => [k.countNewAll, k.countNewMen, k.countNewWomen, k.countOct1].some((m) => v(m, y) !== null));

  return [
    {
      id: 'andel',
      caption: tr(
        lang,
        `Andel utan svenskt medborgarskap bland intagna i fängelse, och andel utländska medborgare i befolkningen, ${k.firstYear}–${k.lastYear}. Procent.`,
        `Share without Swedish citizenship among people in prison, and share of foreign citizens in the population, ${k.firstYear}–${k.lastYear}. Percent.`,
      ),
      rowLabel: tr(lang, 'År', 'Year'),
      rowCsv: tr(lang, 'ar', 'year'),
      columns: [
        { kind: 'number', label: tr(lang, 'Nyintagna, alla', 'New prisoners, all'), csv: tr(lang, 'nyintagna_utan_sv_medb_pct', 'new_all_no_swedish_citizenship_pct'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Nyintagna män', 'New prisoners, men'), csv: tr(lang, 'nyintagna_man_utan_sv_medb_pct', 'new_men_no_swedish_citizenship_pct'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Nyintagna kvinnor', 'New prisoners, women'), csv: tr(lang, 'nyintagna_kvinnor_utan_sv_medb_pct', 'new_women_no_swedish_citizenship_pct'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Intagna den 1 oktober', 'Prisoners on 1 October'), csv: tr(lang, 'intagna_1okt_utan_sv_medb_pct', 'prisoners_1oct_no_swedish_citizenship_pct'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Utländska medborgare i befolkningen', 'Foreign citizens in the population'), csv: tr(lang, 'befolkning_utlandska_medborgare_pct', 'population_foreign_citizens_pct'), decimals: 1 },
        { kind: 'links', label: tr(lang, 'Källa, Brå', 'Source, Brå'), csv: tr(lang, 'kalla_bra', 'source_bra') },
      ],
      rows: k.years.map((y) => ({
        key: String(y),
        cells: [
          v(k.newAll, y),
          v(k.newMen, y),
          v(k.newWomen, y),
          v(k.onOct1, y),
          v(k.popShare, y),
          (k.sourcesByYear.get(y) ?? []).map((s) => ({ label: shortReportName(s.label), url: s.url })),
        ],
      })),
    },
    {
      id: 'antal',
      caption: tr(
        lang,
        `Antal personer i Brås statistik, ${countYears[0]}–${countYears[countYears.length - 1]}. Alla, med och utan svenskt medborgarskap.`,
        `Number of people in Brå’s statistics, ${countYears[0]}–${countYears[countYears.length - 1]}. All, with and without Swedish citizenship.`,
      ),
      rowLabel: tr(lang, 'År', 'Year'),
      rowCsv: tr(lang, 'ar', 'year'),
      columns: [
        { kind: 'number', label: tr(lang, 'Nyintagna, alla', 'New prisoners, all'), csv: tr(lang, 'nyintagna_antal', 'new_all_count'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Nyintagna män', 'New prisoners, men'), csv: tr(lang, 'nyintagna_man_antal', 'new_men_count'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Nyintagna kvinnor', 'New prisoners, women'), csv: tr(lang, 'nyintagna_kvinnor_antal', 'new_women_count'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Intagna den 1 oktober', 'Prisoners on 1 October'), csv: tr(lang, 'intagna_1okt_antal', 'prisoners_1oct_count'), decimals: 0 },
      ],
      rows: countYears.map((y) => ({
        key: String(y),
        cells: [v(k.countNewAll, y), v(k.countNewMen, y), v(k.countNewWomen, y), v(k.countOct1, y)],
      })),
    },
    {
      id: 'befolkning',
      caption: tr(
        lang,
        `Befolkningen den 31 december, ${k.firstYear}–${k.lastYear}. Antal personer.`,
        `Population on 31 December, ${k.firstYear}–${k.lastYear}. Number of people.`,
      ),
      rowLabel: tr(lang, 'År', 'Year'),
      rowCsv: tr(lang, 'ar', 'year'),
      columns: [
        { kind: 'number', label: tr(lang, 'Folkmängd', 'Population'), csv: tr(lang, 'folkmangd', 'population'), decimals: 0 },
        { kind: 'number', label: tr(lang, 'Utländska medborgare', 'Foreign citizens'), csv: tr(lang, 'utlandska_medborgare', 'foreign_citizens'), decimals: 0 },
      ],
      rows: k.years.map((y) => ({
        key: String(y),
        cells: [pop.get(y)?.folkmangd ?? null, pop.get(y)?.utlandskaMedborgare ?? null],
      })),
    },
  ];
}
