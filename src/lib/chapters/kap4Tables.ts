// Tables and CSV for the chapter 4 table page. Build time only.
import type { PopulationRow, RapeStudyRow } from '../data';
import { complementPct, populationSharePct, studyPopulationSharePct, swedishBornTwoForeignParents } from '../calc';
import { csvNumber, longCsv, type DataTable } from '../tables';

const STUDY_YEARS = [2000, 2005, 2010, 2015];
const OTHER_LABEL = 'Utrikesfödda eller minst en utrikesfödd förälder';

function rowsOf(rows: RapeStudyRow[], chart: RapeStudyRow['chart']) {
  return rows.filter((r) => r.chart === chart);
}

export interface Kap4Tables {
  background: DataTable;
  controls: DataTable;
  region: DataTable;
  prior: DataTable;
  population: DataTable;
  csv: string;
  popForeignBorn: number;
  popTwoForeignParents: number;
}

export function kap4Tables(rows: RapeStudyRow[], population: PopulationRow[]): Kap4Tables {
  const popForeignBorn = studyPopulationSharePct(population, (r) => r.utrikesFodda);
  const popTwoForeignParents = studyPopulationSharePct(population, swedishBornTwoForeignParents);
  // The population comparison exists only for the two groups SCB's summary table covers.
  const popShare: Record<string, number | null> = { utr: popForeignBorn, u2: popTwoForeignParents };

  const bg = rowsOf(rows, 'bakgrund');
  const background: DataTable = {
    id: 'kap4-bakgrund',
    caption: 'Dömda för våldtäkt 2000–2015 efter bakgrund, jämfört med befolkningen (Khoshnood m.fl. 2021, tabell 1)',
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Antal dömda', csv: 'antal', decimals: 0 },
      { kind: 'number', label: 'Andel av de dömda (%)', csv: 'andel_pct', decimals: 1 },
      { kind: 'number', label: 'Andel av befolkningen, snitt 2000–2015 (%)', csv: 'andel_befolkning_pct', decimals: 1 },
    ],
    rows: bg.map((r) => ({ key: r.item, cells: [r.n, r.pct, popShare[r.itemId] ?? null] })),
  };

  const sv2 = rows.find((r) => r.chart === 'kontroll' && r.itemId === 'sv2');
  if (!sv2 || sv2.pctControls === null) throw new Error('valdtakt_domda.csv: kontroll/sv2 missing');
  const controls: DataTable = {
    id: 'kap4-kontroll',
    caption: `Dömda för våldtäkt ${sv2.period} jämfört med en matchad kontrollgrupp (Khoshnood m.fl. 2026)`,
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Andel av de dömda (%)', csv: 'andel_pct', decimals: 1 },
      { kind: 'number', label: 'Andel av kontrollgruppen (%)', csv: 'andel_kontrollgrupp_pct', decimals: 1 },
    ],
    rows: [
      { key: sv2.item, cells: [sv2.pct, sv2.pctControls] },
      { key: `${OTHER_LABEL} (uträknat)`, cells: [complementPct(sv2.pct), complementPct(sv2.pctControls)] },
    ],
  };

  const region: DataTable = {
    id: 'kap4-region',
    caption: 'Utrikesfödda dömda för våldtäkt 2000–2015 efter födelseregion (Khoshnood m.fl. 2021, tabell 2)',
    rowLabel: 'Födelseregion',
    rowCsv: 'grupp',
    columns: [{ kind: 'number', label: 'Andel av de utrikesfödda dömda (%)', csv: 'andel_pct', decimals: 1 }],
    rows: [...rowsOf(rows, 'region')].sort((a, b) => b.pct - a.pct).map((r) => ({ key: r.item, cells: [r.pct] })),
  };

  const prior: DataTable = {
    id: 'kap4-tidigare',
    caption: 'Alla dömda för våldtäkt 2000–2015: tidigare domar och ekonomiskt bistånd (Khoshnood m.fl. 2021, tabell 1)',
    rowLabel: 'Uppgift',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Antal', csv: 'antal', decimals: 0 },
      { kind: 'number', label: 'Andel av de dömda (%)', csv: 'andel_pct', decimals: 1 },
    ],
    rows: rowsOf(rows, 'ovrigt').map((r) => ({ key: r.item, cells: [r.n, r.pct] })),
  };

  const popRows = STUDY_YEARS.map((y) => {
    const r = population.find((p) => p.year === y);
    if (!r) throw new Error(`scb_befolkning.csv: ${y} missing`);
    return r;
  });
  const population_: DataTable = {
    id: 'kap4-befolkning',
    caption: 'Befolkningen 2000, 2005, 2010 och 2015, underlag för jämförelsen (SCB)',
    rowLabel: 'År',
    rowCsv: 'ar',
    columns: [
      { kind: 'number', label: 'Folkmängd', csv: 'folkmangd', decimals: 0 },
      { kind: 'number', label: 'Utrikesfödda', csv: 'utrikes_fodda', decimals: 0 },
      { kind: 'number', label: 'Inrikesfödda med två utrikesfödda föräldrar', csv: 'inrikesfodda_tva_utrikesfodda_foraldrar', decimals: 0 },
      { kind: 'number', label: 'Andel utrikesfödda (%)', csv: 'andel_utrikes_fodda_pct', decimals: 1 },
      { kind: 'number', label: 'Andel inrikesfödda med två utrikesfödda föräldrar (%)', csv: 'andel_tva_utrikesfodda_foraldrar_pct', decimals: 1 },
    ],
    rows: [
      ...popRows.map((r) => ({
        key: String(r.year),
        cells: [
          r.folkmangd,
          r.utrikesFodda,
          swedishBornTwoForeignParents(r),
          populationSharePct(r.utrikesFodda, r.folkmangd),
          populationSharePct(swedishBornTwoForeignParents(r), r.folkmangd),
        ],
      })),
      { key: 'Snitt', cells: [null, null, null, popForeignBorn, popTwoForeignParents] },
    ],
  };

  const header = ['tabell', 'grupp', 'period', 'antal', 'andel_pct', 'andel_kontrollgrupp_pct', 'andel_befolkning_snitt_pct'];
  const csvRows: string[][] = [
    ...bg.map((r) => ['bakgrund', r.item, r.period, csvNumber(r.n, 0), csvNumber(r.pct, 1), '', csvNumber(popShare[r.itemId] ?? null, 1)]),
    ['kontrollgrupp', sv2.item, sv2.period, '', csvNumber(sv2.pct, 1), csvNumber(sv2.pctControls, 1), ''],
    ['kontrollgrupp', OTHER_LABEL, sv2.period, '', csvNumber(complementPct(sv2.pct), 1), csvNumber(complementPct(sv2.pctControls), 1), ''],
    ...rowsOf(rows, 'region').map((r) => ['fodelseregion_utrikesfodda', r.item, r.period, '', csvNumber(r.pct, 1), '', '']),
    ...rowsOf(rows, 'ovrigt').map((r) => ['tidigare_domar_och_bistand', r.item, r.period, csvNumber(r.n, 0), csvNumber(r.pct, 1), '', '']),
  ];

  return {
    background,
    controls,
    region,
    prior,
    population: population_,
    csv: longCsv(header, csvRows),
    popForeignBorn,
    popTwoForeignParents,
  };
}
