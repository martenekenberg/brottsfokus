// Tables and CSV for the chapter 2 table page. Build time only.
import type { B6Row } from '../data';
import { csvNumber, longCsv, type Column, type DataTable } from '../tables';
import type { Kap2Crime, Kap2Data, View } from './kap2';

export const TOTAL = 'Brott totalt';
const COMPARISON_LABEL = 'Inrikesfödda med två inrikesfödda föräldrar';

/** Highest excess risk first, as in the chart. */
const byRisk = <T extends { risk: number; per1000: number }>(a: T, b: T) => b.risk - a.risk || b.per1000 - a.per1000;

export function totalCrime(data: Kap2Data, view: View): Kap2Crime {
  const c = data[view].find((x) => x.name === TOTAL);
  if (!c) throw new Error(`Chapter 2: no ${TOTAL} for ${view}`);
  return c;
}

function b6For(b6: B6Row[], view: B6Row['view'], unit: string): B6Row {
  const r = b6.find((x) => x.view === view && x.unit === unit);
  if (!r) throw new Error(`Table B6: no row for ${view} / ${unit}`);
  return r;
}

const b6Columns: Column[] = [
  { kind: 'number', label: 'Antal i befolkningen', csv: 'antal_i_befolkningen', decimals: 0 },
  { kind: 'number', label: 'Andel av befolkningen (%)', csv: 'andel_av_befolkningen_pct', decimals: 2 },
  { kind: 'number', label: 'Antal misstänkta', csv: 'antal_misstankta', decimals: 0 },
  { kind: 'number', label: 'Andel av de misstänkta (%)', csv: 'andel_av_misstankta_pct', decimals: 2 },
  { kind: 'number', label: 'Andel av gruppen som misstänktes (%)', csv: 'andel_misstankta_i_gruppen_pct', decimals: 2 },
  { kind: 'number', label: 'Överrisk', csv: 'overrisk', decimals: 2 },
];

/** Brå table B6 as published: counts, shares and excess risk, brott totalt. */
export function b6Table(b6: B6Row[], view: B6Row['view'], id: string, caption: string): DataTable {
  const rows = b6.filter((r) => r.view === view);
  // Mother's region view: the comparison group is in the background view.
  if (view !== 'bakgrund') rows.unshift(b6For(b6, 'bakgrund', COMPARISON_LABEL));
  return {
    id,
    caption,
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: b6Columns,
    rows: rows.map((r) => ({
      key: r.unit,
      cells: [r.populationN, r.populationPct, r.suspectsN, r.suspectsPct, r.pctSuspected, r.risk],
    })),
  };
}

/** Per 1,000, excess risk and adjusted excess risk for one crime type, with the comparison group first. */
export function riskTable(data: Kap2Data, view: View, crime: Kap2Crime, id: string, caption: string): DataTable {
  const adjusted = crime.units.some((u) => u.riskAdj !== null);
  const decimals = view === 'land' ? 1 : 2;
  const columns: Column[] = [
    ...(view === 'land' ? [{ kind: 'text' as const, label: 'Födelseområde', csv: 'fodelseomrade' }] : []),
    ...(view === 'land' ? [{ kind: 'number' as const, label: 'Antal i gruppen', csv: 'antal_i_befolkningen', decimals: 0 }] : []),
    { kind: 'number', label: 'Misstänkta per 1 000', csv: 'misstankta_per1000', decimals },
    { kind: 'number', label: 'Överrisk', csv: 'overrisk', decimals: 2 },
    ...(adjusted ? [{ kind: 'number' as const, label: 'Justerad överrisk', csv: 'overrisk_justerad', decimals: 2 }] : []),
  ];
  const units = [...crime.units].sort(byRisk);
  const ref = [
    ...(view === 'land' ? ['', null] : []),
    crime.refPer1000,
    1,
    ...(adjusted ? [1] : []),
  ];
  return {
    id,
    caption,
    rowLabel: view === 'land' ? 'Födelseland' : view === 'moder' ? 'Moderns födelseområde' : 'Födelseområde',
    rowCsv: 'grupp',
    columns,
    rows: [
      { key: `${COMPARISON_LABEL} (jämförelsegrupp)`, cells: ref },
      ...units.map((u) => ({
        key: u.label,
        cells: [
          ...(view === 'land' ? [u.region, u.n] : []),
          u.per1000,
          u.risk,
          ...(adjusted ? [u.riskAdj] : []),
        ],
      })),
    ],
  };
}

const VIEW_CSV: Record<View, string> = { region: 'fodelseomrade', land: 'fodelseland', moder: 'moderns_fodelseomrade' };

/** Everything on the page in one long file: one row per view, crime type and group. */
export function kap2Csv(data: Kap2Data, b6: B6Row[]): string {
  const header = [
    'vy',
    'brottstyp',
    'grupp',
    'fodelseomrade',
    'antal_i_befolkningen',
    'misstankta_per1000',
    'overrisk',
    'overrisk_justerad',
    'antal_misstankta',
    'andel_av_misstankta_pct',
    'andel_av_befolkningen_pct',
    'andel_misstankta_i_gruppen_pct',
  ];
  const rows: string[][] = [];
  for (const r of b6.filter((x) => x.view === 'bakgrund')) {
    rows.push(['bakgrund', TOTAL, r.unit, '', csvNumber(r.populationN, 0), '', csvNumber(r.risk, 2), '', csvNumber(r.suspectsN, 0), csvNumber(r.suspectsPct, 2), csvNumber(r.populationPct, 2), csvNumber(r.pctSuspected, 2)]);
  }
  for (const view of ['region', 'land', 'moder'] as View[]) {
    const d = view === 'land' ? 1 : 2;
    for (const c of data[view]) {
      rows.push([VIEW_CSV[view], c.name, COMPARISON_LABEL, '', '', csvNumber(c.refPer1000, d), '1.00', '', '', '', '', '']);
      for (const u of [...c.units].sort(byRisk)) {
        const b = c.name === TOTAL && view !== 'land' ? b6.find((x) => x.view === view && x.unit === u.label) : undefined;
        rows.push([
          VIEW_CSV[view],
          c.name,
          u.label,
          view === 'land' ? u.region : '',
          csvNumber(b?.populationN ?? u.n, 0),
          csvNumber(u.per1000, d),
          csvNumber(u.risk, 2),
          csvNumber(u.riskAdj, 2),
          csvNumber(b?.suspectsN ?? null, 0),
          csvNumber(b?.suspectsPct ?? null, 2),
          csvNumber(b?.populationPct ?? null, 2),
          csvNumber(b?.pctSuspected ?? null, 2),
        ]);
      }
    }
  }
  return longCsv(header, rows);
}
