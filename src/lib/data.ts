// Build-time CSV loading. Runs in Node during `astro build`, never in the browser.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { csvParse } from 'd3';

const DATA_DIR = join(process.cwd(), 'data');

function readCsv(file: string): Record<string, string>[] {
  const text = readFileSync(join(DATA_DIR, file), 'utf-8');
  return csvParse(text) as unknown as Record<string, string>[];
}

/** Empty cell means "no value". It is never turned into 0. */
export function num(cell: string | undefined): number | null {
  if (cell === undefined) return null;
  const trimmed = cell.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  if (Number.isNaN(value)) throw new Error(`Not a number: "${cell}"`);
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
  return readCsv('intagna_medborgarskap.csv').map((r) => ({
    year: required(r.year, 'year'),
    population: r.population as PrisonRow['population'],
    group: r.group as PrisonRow['group'],
    shareWithoutPct: num(r.share_without_pct),
    persons: num(r.persons),
    source: r.source,
    sourceUrl: r.source_url,
  }));
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
  return readCsv('scb_befolkning.csv').map((r) => ({
    year: required(r.year, 'year'),
    folkmangd: required(r.folkmangd, 'folkmangd'),
    utrikesFodda: num(r.utrikes_fodda),
    utlandskBakgrund: num(r.utlandsk_bakgrund),
    utlandskaMedborgare: num(r.utlandska_medborgare),
    source: r.source,
  }));
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
  return readCsv('misstankta_bakgrund_2007_2018.csv').map((r) => ({
    year: required(r.year, 'year'),
    crimeId: r.crime_id,
    crime: r.crime_sv,
    depth: required(r.depth, 'depth'),
    crimeOrder: required(r.crime_order, 'crime_order'),
    group: r.group as SuspectsRow['group'],
    groupName: r.group_sv,
    groupOrder: required(r.group_order, 'group_order'),
    per1000: num(r.per1000),
  }));
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
  return readCsv('misstankta_ursprung_2015_2018.csv').map((r) => ({
    view: r.view as OriginRow['view'],
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
  return readCsv('valdtakt_domda.csv').map((r) => ({
    chart: r.chart as RapeStudyRow['chart'],
    itemId: r.item_id,
    item: r.item,
    period: r.period,
    n: num(r.n),
    pct: required(r.pct, 'pct'),
    pctControls: num(r.pct_controls),
    note: r.note,
  }));
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
  return readCsv('bra2005.csv').map((r) => ({
    chart: r.chart,
    groupId: r.group_id,
    group: r.group,
    series: r.series,
    value: required(r.value, 'value'),
    sourceTable: r.source_table,
  }));
}
