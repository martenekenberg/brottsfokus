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
