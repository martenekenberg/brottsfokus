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

// ---------- bra2021_brottsmisstankar.csv (chapter 1, second chart) ----------
// Copied from Brå 2021:9 appendix 3, tables D1 (number of registered suspicions) and D2 (share, %).
// Every suspicion is counted, not every person, including suspicions against people not registered in Sweden.

export const SUSPICION_GROUPS = ['sv2', 'sv1', 'u2', 'utr', 'ej'] as const;
export type SuspicionGroup = (typeof SUSPICION_GROUPS)[number];

export interface SuspicionRow {
  year: number;
  groupId: SuspicionGroup;
  group: string;
  suspicions: number;
  /** Brå's own share in table D2, kept to check the share calculated from the counts. */
  pctBra: number;
}

export function loadSuspicionShares(): SuspicionRow[] {
  const file = 'bra2021_brottsmisstankar.csv';
  const rows = readCsv(file, ['year', 'group_id', 'group', 'suspicions', 'pct_bra', 'source']).map((r) => ({
    year: required(r.year, 'year'),
    groupId: oneOf(r.group_id, SUSPICION_GROUPS, `${file} group_id`),
    group: r.group,
    suspicions: required(r.suspicions, 'suspicions'),
    pctBra: required(r.pct_bra, 'pct_bra'),
  }));
  return unique(rows, (r) => `${r.year}/${r.groupId}`, file);
}

// ---------- bra2021_riskfaktorer.csv (chapter 2, second chart) ----------
// Excess risks for other factors, stated in the text of Brå 2021:9 (p. 54–55), 2015–2018.

export interface RiskFactorRow {
  factorId: string;
  factor: string;
  comparison: string;
  risk: number;
  source: string;
}

export function loadRiskFactors(): RiskFactorRow[] {
  const file = 'bra2021_riskfaktorer.csv';
  const rows = readCsv(file, ['factor_id', 'factor', 'comparison', 'risk', 'source']).map((r) => ({
    factorId: r.factor_id,
    factor: r.factor,
    comparison: r.comparison,
    risk: required(r.risk, 'risk'),
    source: r.source,
  }));
  return unique(rows, (r) => r.factorId, file);
}

// ---------- ntu_utsatthet.csv (chapter 6) ----------
// Copied from Brå, NTU Kortanalys 2/2024, table appendix (tables 1A–9B). Self-reported victimisation, share (%).
// view: bakgrund = Swedish/foreign background, all years pooled; varldsdel = world region of background, pooled;
// ar = one value per year. flag: x = too few respondents to report, . = no cases (Brå's own markers).

export const NTU_SEX = ['samtliga', 'man', 'kvinnor'] as const;
export type NtuSex = (typeof NTU_SEX)[number];

export interface NtuRow {
  view: 'bakgrund' | 'varldsdel' | 'ar';
  crimeId: string;
  crime: string;
  sex: NtuSex;
  group: string;
  period: string;
  pct: number | null;
  ciLow: number | null;
  ciHigh: number | null;
  flag: '' | 'x' | '.';
  sourceTable: string;
}

export function loadNtu(): NtuRow[] {
  const file = 'ntu_utsatthet.csv';
  const cols = ['view', 'crime_id', 'crime', 'sex', 'group', 'period', 'pct', 'ci_low', 'ci_high', 'flag', 'source_table'];
  const rows = readCsv(file, cols).map((r) => {
    const flag = oneOf(r.flag, ['', 'x', '.'] as const, `${file} flag`);
    const pct = num(r.pct);
    if ((pct === null) !== (flag !== '')) throw new Error(`${file}: a value must be empty exactly when it is flagged (${r.crime_id} ${r.group})`);
    return {
      view: oneOf(r.view, ['bakgrund', 'varldsdel', 'ar'] as const, `${file} view`),
      crimeId: r.crime_id,
      crime: r.crime,
      sex: oneOf(r.sex, NTU_SEX, `${file} sex`),
      group: r.group,
      period: r.period,
      pct,
      ciLow: num(r.ci_low),
      ciHigh: num(r.ci_high),
      flag,
      sourceTable: r.source_table,
    };
  });
  return unique(rows, (r) => `${r.view}/${r.crimeId}/${r.sex}/${r.group}/${r.period}`, file);
}

// ---------- utvisning_b1.csv and utvisning_text.csv (chapter 7) ----------
// Brå 2026:15, Utvisningsdömda i brottmål. Table B1: everyone with a deportation order in a prison
// sentence who left prison 2013–2023, followed up to 2024. Empty cell = Brå does not report the value
// (fewer than 4 people, marked x by Brå). utvisning_text.csv holds figures Brå states only in the text.

export const DEPORT_DIMENSIONS = ['totalt', 'kon', 'alder', 'folkbokforing', 'huvudbrott', 'varldsdel', 'delomrade'] as const;
export type DeportDimension = (typeof DEPORT_DIMENSIONS)[number];

export interface DeportRow {
  dimension: DeportDimension;
  group: string;
  /** World region for a sub-region, or the main category for a sub-category. Empty otherwise. */
  parent: string;
  pctDeported: number | null;
  pctDeported1yr: number | null;
  pctReconvicted: number | null;
  pctReconvicted1yr: number | null;
  n: number | null;
}

export function loadDeportation(): DeportRow[] {
  const file = 'utvisning_b1.csv';
  const cols = ['dimension', 'group', 'parent', 'pct_deported', 'pct_deported_1yr', 'pct_reconvicted', 'pct_reconvicted_1yr', 'n', 'source'];
  const rows = readCsv(file, cols).map((r) => ({
    dimension: oneOf(r.dimension, DEPORT_DIMENSIONS, `${file} dimension`),
    group: r.group,
    parent: r.parent,
    pctDeported: num(r.pct_deported),
    pctDeported1yr: num(r.pct_deported_1yr),
    pctReconvicted: num(r.pct_reconvicted),
    pctReconvicted1yr: num(r.pct_reconvicted_1yr),
    n: num(r.n),
  }));
  return unique(rows, (r) => `${r.dimension}/${r.group}`, file);
}

export interface DeportFact {
  id: string;
  year: number | null;
  value: number;
  source: string;
}

export function loadDeportationFacts(): DeportFact[] {
  const file = 'utvisning_text.csv';
  const rows = readCsv(file, ['id', 'year', 'value', 'source']).map((r) => ({
    id: r.id,
    year: num(r.year),
    value: required(r.value, 'value'),
    source: r.source,
  }));
  return unique(rows, (r) => `${r.id}/${r.year}`, file);
}

// ---------- dodligt_vald.csv (chapter 8) ----------
// Brå 2025:5, Offer och gärningspersoner vid dödligt våld. Shares (%) among homicide victims, perpetrators
// and the population, 2005–2021, as Brå states them in the text or prints them on a figure. Empty = not given.

export interface HomicideRow {
  chart: 'bakgrund' | 'socioekonomi';
  itemId: string;
  item: string;
  victims: number | null;
  perpetrators: number | null;
  population: number | null;
  source: string;
}

export function loadHomicide(): HomicideRow[] {
  const file = 'dodligt_vald.csv';
  const rows = readCsv(file, ['chart', 'item_id', 'item', 'victims', 'perpetrators', 'population', 'source']).map((r) => ({
    chart: oneOf(r.chart, ['bakgrund', 'socioekonomi'] as const, `${file} chart`),
    itemId: r.item_id,
    item: r.item,
    victims: num(r.victims),
    perpetrators: num(r.perpetrators),
    population: num(r.population),
    source: r.source,
  }));
  return unique(rows, (r) => `${r.chart}/${r.itemId}`, file);
}
