// Chapter 3: prison and citizenship. Shared by the chart on the main page and the table page,
// so both always show the same numbers.
import type { PopulationRow, PrisonRow } from '../data';
import { foreignCitizenSharePct, prisonSeries } from '../calc';
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
export function kap3Tables(k: Kap3): DataTable[] {
  const v = (m: Map<number, number | null>, y: number) => m.get(y) ?? null;
  const pop = new Map(k.population.map((r) => [r.year, r]));
  const countYears = k.years.filter((y) => [k.countNewAll, k.countNewMen, k.countNewWomen, k.countOct1].some((m) => v(m, y) !== null));

  return [
    {
      id: 'andel',
      caption: `Andel utan svenskt medborgarskap bland intagna i fängelse, och andel utländska medborgare i befolkningen, ${k.firstYear}–${k.lastYear}. Procent.`,
      rowLabel: 'År',
      rowCsv: 'ar',
      columns: [
        { kind: 'number', label: 'Nyintagna, alla', csv: 'nyintagna_utan_sv_medb_pct', decimals: 0 },
        { kind: 'number', label: 'Nyintagna män', csv: 'nyintagna_man_utan_sv_medb_pct', decimals: 0 },
        { kind: 'number', label: 'Nyintagna kvinnor', csv: 'nyintagna_kvinnor_utan_sv_medb_pct', decimals: 0 },
        { kind: 'number', label: 'Intagna den 1 oktober', csv: 'intagna_1okt_utan_sv_medb_pct', decimals: 0 },
        { kind: 'number', label: 'Utländska medborgare i befolkningen', csv: 'befolkning_utlandska_medborgare_pct', decimals: 1 },
        { kind: 'links', label: 'Källa, Brå', csv: 'kalla_bra' },
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
      caption: `Antal personer i Brås statistik, ${countYears[0]}–${countYears[countYears.length - 1]}. Alla, med och utan svenskt medborgarskap.`,
      rowLabel: 'År',
      rowCsv: 'ar',
      columns: [
        { kind: 'number', label: 'Nyintagna, alla', csv: 'nyintagna_antal', decimals: 0 },
        { kind: 'number', label: 'Nyintagna män', csv: 'nyintagna_man_antal', decimals: 0 },
        { kind: 'number', label: 'Nyintagna kvinnor', csv: 'nyintagna_kvinnor_antal', decimals: 0 },
        { kind: 'number', label: 'Intagna den 1 oktober', csv: 'intagna_1okt_antal', decimals: 0 },
      ],
      rows: countYears.map((y) => ({
        key: String(y),
        cells: [v(k.countNewAll, y), v(k.countNewMen, y), v(k.countNewWomen, y), v(k.countOct1, y)],
      })),
    },
    {
      id: 'befolkning',
      caption: `Befolkningen den 31 december, ${k.firstYear}–${k.lastYear}. Antal personer.`,
      rowLabel: 'År',
      rowCsv: 'ar',
      columns: [
        { kind: 'number', label: 'Folkmängd', csv: 'folkmangd', decimals: 0 },
        { kind: 'number', label: 'Utländska medborgare', csv: 'utlandska_medborgare', decimals: 0 },
      ],
      rows: k.years.map((y) => ({
        key: String(y),
        cells: [pop.get(y)?.folkmangd ?? null, pop.get(y)?.utlandskaMedborgare ?? null],
      })),
    },
  ];
}
