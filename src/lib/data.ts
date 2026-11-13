// Build-time CSV loading. Runs in Node during `astro build`, never in the browser.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { csvParse } from 'd3';

const DATA_DIR = join(process.cwd(), 'data');

/** Reads a CSV and fails the build if a column the code relies on is missing. */
function readCsv(file: string, columns: string[]): Record<string, string>[] {
  const text = readFileSync(join(DATA_DIR, file), 'utf-8').replace(/^\uFEFF/, '');
  const rows = csvParse(text);
  const missing = columns.filter((c) => !rows.columns.includes(c));
  if (missing.length) throw new Error(`${file}: missing column(s) ${missing.join(', ')}`);
  return rows as unknown as Record<string, string>[];
}

/** A cell that must be one of a fixed set of codes. A typo fails the build instead of dropping the row. */
function oneOf<T extends string>(cell: string | undefined, allowed: readonly T[], what: string): T {
  if (!allowed.includes(cell as T)) throw new Error(`${what}: unexpected value "${cell}" (expected ${allowed.join(', ')})`);
  return cell as T;
}

/** Fails the build if two rows describe the same thing, so one never silently replaces the other. */
function unique<T>(rows: T[], key: (row: T) => string, file: string): T[] {
  const seen = new Set<string>();
  for (const r of rows) {
    const k = key(r);
    if (seen.has(k)) throw new Error(`${file}: duplicate row for ${k}`);
    seen.add(k);
  }
  return rows;
}

/** Empty cell means "no value". It is never turned into 0. */
export function num(cell: string | undefined): number | null {
  if (cell === undefined) return null;
  const trimmed = cell.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || !/^-?\d+(\.\d+)?$/.test(trimmed)) throw new Error(`Not a number: "${cell}"`);
  return value;
}

function required(cell: string | undefined, what: string): number {
  const value = num(cell);
  if (value === null) throw new Error(`Missing ${what}`);
  return value;
}

// ---------- intagna_medborgarskap.csv (chapter 3) ----------

export interface PrisonRow {
  year: number;
  population: 'nyintagna' | '1okt';
  group: 'totalt' | 'man' | 'kvinnor';
  shareWithoutPct: number | null;
  persons: number | null;
  source: string;
  sourceUrl: string;
}

export function loadPrison(): PrisonRow[] {
  const file = 'intagna_medborgarskap.csv';
  const rows = readCsv(file, ['year', 'population', 'group', 'share_without_pct', 'persons', 'source', 'source_url']).map((r) => ({
    year: required(r.year, 'year'),
    population: oneOf(r.population, ['nyintagna', '1okt'] as const, `${file} population`),
    group: oneOf(r.group, ['totalt', 'man', 'kvinnor'] as const, `${file} group`),
    shareWithoutPct: num(r.share_without_pct),
    persons: num(r.persons),
    source: r.source,
    sourceUrl: r.source_url,
  }));
  return unique(rows, (r) => `${r.year}/${r.population}/${r.group}`, file);
}

// ---------- scb_befolkning.csv (chapters 3, 4) ----------

export interface PopulationRow {
  year: number;
  folkmangd: number;
  utrikesFodda: number | null;
  utlandskBakgrund: number | null;
  utlandskaMedborgare: number | null;
  source: string;
}

export function loadPopulation(): PopulationRow[] {
  const file = 'scb_befolkning.csv';
  const rows = readCsv(file, ['year', 'folkmangd', 'utrikes_fodda', 'utlandsk_bakgrund', 'utlandska_medborgare', 'source']).map((r) => ({
    year: required(r.year, 'year'),
    folkmangd: required(r.folkmangd, 'folkmangd'),
    utrikesFodda: num(r.utrikes_fodda),
    utlandskBakgrund: num(r.utlandsk_bakgrund),
    utlandskaMedborgare: num(r.utlandska_medborgare),
    source: r.source,
  }));
  return unique(rows, (r) => String(r.year), file);
}

// ---------- misstankta_bakgrund_2007_2018.csv (chapter 1, key figures) ----------

export interface SuspectsRow {
  year: number;
  crimeId: string;
  crime: string;
  depth: number;
  crimeOrder: number;
  group: 'sv2' | 'sv1' | 'u2' | 'utr' | 'tot';
  groupName: string;
  groupOrder: number;
  per1000: number | null;
}

export function loadSuspectsByBackground(): SuspectsRow[] {
  const file = 'misstankta_bakgrund_2007_2018.csv';
  const rows = readCsv(file, ['year', 'crime_id', 'crime_sv', 'depth', 'crime_order', 'group', 'group_sv', 'group_order', 'per1000']).map((r) => ({
    year: required(r.year, 'year'),
    crimeId: r.crime_id,
    crime: r.crime_sv,
    depth: required(r.depth, 'depth'),
    crimeOrder: required(r.crime_order, 'crime_order'),
    group: oneOf(r.group, ['sv2', 'sv1', 'u2', 'utr', 'tot'] as const, `${file} group`),
    groupName: r.group_sv,
    groupOrder: required(r.group_order, 'group_order'),
    per1000: num(r.per1000),
  }));
  return unique(rows, (r) => `${r.year}/${r.crimeId}/${r.group}`, file);
}

// ---------- misstankta_ursprung_2015_2018.csv (chapter 2) ----------

export interface OriginRow {
  /** region = birth region, land = birth country, moder = Swedish-born with two
   *  foreign-born parents, by the mother's birth region. */
  view: 'region' | 'land' | 'moder';
  unitId: string;
  unit: string;
  region: string;
  crime: string;
  crimeOrder: number;
  /** Size of the group (country view only). */
  n: number | null;
  per1000: number;
  risk: number;
  /** Risk standardised for age, sex, disposable income and education (not in the moder view). */
  riskAdj: number | null;
}

export function loadOrigin(): OriginRow[] {
  const file = 'misstankta_ursprung_2015_2018.csv';
  const rows = readCsv(file, ['view', 'unit_id', 'unit', 'region', 'crime', 'crime_order', 'n', 'per1000', 'risk', 'risk_adj']).map((r) => ({
    view: oneOf(r.view, ['region', 'land', 'moder'] as const, `${file} view`),
    unitId: r.unit_id,
    unit: r.unit,
    region: r.region,
    crime: r.crime,
    crimeOrder: required(r.crime_order, 'crime_order'),
    n: num(r.n),
    per1000: required(r.per1000, 'per1000'),
    risk: required(r.risk, 'risk'),
    riskAdj: num(r.risk_adj),
  }));
  return unique(rows, (r) => `${r.view}/${r.unitId}/${r.crime}`, file);
}

// ---------- valdtakt_domda.csv (chapter 4) ----------

export interface RapeStudyRow {
  chart: 'bakgrund' | 'region' | 'kontroll' | 'ovrigt';
  itemId: string;
  item: string;
  period: string;
  n: number | null;
  pct: number;
  pctControls: number | null;
  note: string;
}

export function loadRapeStudies(): RapeStudyRow[] {
  const file = 'valdtakt_domda.csv';
  const rows = readCsv(file, ['chart', 'item_id', 'item', 'period', 'n', 'pct', 'pct_controls', 'note']).map((r) => ({
    chart: oneOf(r.chart, ['bakgrund', 'region', 'kontroll', 'ovrigt'] as const, `${file} chart`),
    itemId: r.item_id,
    item: r.item,
    period: r.period,
    n: num(r.n),
    pct: required(r.pct, 'pct'),
    pctControls: num(r.pct_controls),
    note: r.note,
  }));
  return unique(rows, (r) => `${r.chart}/${r.itemId}`, file);
}

// ---------- bra2005.csv (chapter 5) ----------

export interface Bra2005Row {
  chart: string;
  groupId: string;
  group: string;
  series: string;
  value: number;
  sourceTable: string;
}

export function loadBra2005(): Bra2005Row[] {
  const file = 'bra2005.csv';
  const rows = readCsv(file, ['chart', 'group_id', 'group', 'series', 'value', 'source_table']).map((r) => ({
    chart: r.chart,
    groupId: r.group_id,
    group: r.group,
    series: r.series,
    value: required(r.value, 'value'),
    sourceTable: r.source_table,
  }));
  return unique(rows, (r) => `${r.chart}/${r.groupId}/${r.series}`, file);
}

// ---------- bra2021_tabell_b6.csv (chapter 2 population shares, key figures) ----------
// Copied from Brå 2021:9 appendix 1, table B6 (brott totalt, 2015–2018).

export interface B6Row {
  view: 'bakgrund' | 'region' | 'moder';
  unit: string;
  populationN: number;
  populationPct: number;
  suspectsN: number;
  suspectsPct: number;
  overrepresentation: number;
  pctSuspected: number;
  risk: number;
}

export function loadTableB6(): B6Row[] {
  const file = 'bra2021_tabell_b6.csv';
  const cols = ['view', 'unit', 'population_n', 'population_pct', 'suspects_n', 'suspects_pct', 'overrepresentation', 'pct_suspected', 'risk'];
  const rows = readCsv(file, cols).map((r) => ({
    view: oneOf(r.view, ['bakgrund', 'region', 'moder'] as const, `${file} view`),
    unit: r.unit,
    populationN: required(r.population_n, 'population_n'),
    populationPct: required(r.population_pct, 'population_pct'),
    suspectsN: required(r.suspects_n, 'suspects_n'),
    suspectsPct: required(r.suspects_pct, 'suspects_pct'),
    overrepresentation: required(r.overrepresentation, 'overrepresentation'),
    pctSuspected: required(r.pct_suspected, 'pct_suspected'),
    risk: required(r.risk, 'risk'),
  }));
  return unique(rows, (r) => `${r.view}/${r.unit}`, file);
}
