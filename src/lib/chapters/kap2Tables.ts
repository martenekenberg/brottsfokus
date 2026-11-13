// Tables and CSV for the chapter 2 table page. Build time only.
import type { B6Row } from '../data';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type Column, type DataTable } from '../tables';
import { crimeLabel, type Kap2Crime, type Kap2Data, type View } from './kap2';

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

const b6Columns = (lang: Lang): Column[] => [
  { kind: 'number', label: tr(lang, 'Antal i befolkningen', 'Number in population'), csv: tr(lang, 'antal_i_befolkningen', 'population_count'), decimals: 0 },
  { kind: 'number', label: tr(lang, 'Andel av befolkningen (%)', 'Share of population (%)'), csv: tr(lang, 'andel_av_befolkningen_pct', 'share_of_population_pct'), decimals: 2 },
  { kind: 'number', label: tr(lang, 'Antal misstänkta', 'Number of suspects'), csv: tr(lang, 'antal_misstankta', 'suspects_count'), decimals: 0 },
  { kind: 'number', label: tr(lang, 'Andel av de misstänkta (%)', 'Share of suspects (%)'), csv: tr(lang, 'andel_av_misstankta_pct', 'share_of_suspects_pct'), decimals: 2 },
  {
    kind: 'number',
    label: tr(lang, 'Andel av gruppen som misstänktes (%)', 'Share of group suspected (%)'),
    csv: tr(lang, 'andel_misstankta_i_gruppen_pct', 'share_of_group_suspected_pct'),
    decimals: 2,
  },
  { kind: 'number', label: tr(lang, 'Överrisk', 'Excess risk'), csv: tr(lang, 'overrisk', 'excess_risk'), decimals: 2 },
];

/** Brå table B6 as published: counts, shares and excess risk, brott totalt. */
export function b6Table(b6: B6Row[], view: B6Row['view'], id: string, caption: string, lang: Lang): DataTable {
  const rows = b6.filter((r) => r.view === view);
  // Mother's region view: the comparison group is in the background view.
  if (view !== 'bakgrund') rows.unshift(b6For(b6, 'bakgrund', COMPARISON_LABEL));
  return {
    id,
    caption,
    rowLabel: tr(lang, 'Grupp', 'Group'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: b6Columns(lang),
    rows: rows.map((r) => ({
      key: dataLabel(r.unit, lang),
      cells: [r.populationN, r.populationPct, r.suspectsN, r.suspectsPct, r.pctSuspected, r.risk],
    })),
  };
}

/** Per 1,000, excess risk and adjusted excess risk for one crime type, with the comparison group first. */
export function riskTable(view: View, crime: Kap2Crime, id: string, caption: string, lang: Lang): DataTable {
  const adjusted = crime.units.some((u) => u.riskAdj !== null);
  const decimals = view === 'land' ? 1 : 2;
  const columns: Column[] = [
    ...(view === 'land' ? [{ kind: 'text' as const, label: tr(lang, 'Födelseområde', 'Birth region'), csv: tr(lang, 'fodelseomrade', 'birth_region') }] : []),
    ...(view === 'land'
      ? [{ kind: 'number' as const, label: tr(lang, 'Antal i gruppen', 'Number in group'), csv: tr(lang, 'antal_i_befolkningen', 'population_count'), decimals: 0 }]
      : []),
    {
      kind: 'number',
      label: tr(lang, 'Misstänkta per 1 000', 'Suspects per 1,000'),
      csv: tr(lang, 'misstankta_per1000', 'suspects_per_1000'),
      decimals,
    },
    { kind: 'number', label: tr(lang, 'Överrisk', 'Excess risk'), csv: tr(lang, 'overrisk', 'excess_risk'), decimals: 2 },
    ...(adjusted
      ? [{ kind: 'number' as const, label: tr(lang, 'Justerad överrisk', 'Adjusted excess risk'), csv: tr(lang, 'overrisk_justerad', 'excess_risk_adjusted'), decimals: 2 }]
      : []),
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
    rowLabel:
      view === 'land'
        ? tr(lang, 'Födelseland', 'Birth country')
        : view === 'moder'
          ? tr(lang, 'Moderns födelseområde', 'Mother’s birth region')
          : tr(lang, 'Födelseområde', 'Birth region'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns,
    rows: [
      { key: tr(lang, `${COMPARISON_LABEL} (jämförelsegrupp)`, 'Born in Sweden, two Swedish-born parents (comparison group)'), cells: ref },
      ...units.map((u) => ({
        key: dataLabel(u.label, lang),
        cells: [
          ...(view === 'land' ? [dataLabel(u.region, lang), u.n] : []),
          u.per1000,
          u.risk,
          ...(adjusted ? [u.riskAdj] : []),
        ],
      })),
    ],
  };
}

const VIEW_CSV: Record<Lang, Record<View, string>> = {
  sv: { region: 'fodelseomrade', land: 'fodelseland', moder: 'moderns_fodelseomrade' },
  en: { region: 'birth_region', land: 'birth_country', moder: 'mother_birth_region' },
};

/** Everything on the page in one long file: one row per view, crime type and group. */
export function kap2Csv(data: Kap2Data, b6: B6Row[], lang: Lang): string {
  const header = [
    tr(lang, 'vy', 'view'),
    tr(lang, 'brottstyp', 'crime_type'),
    tr(lang, 'grupp', 'group'),
    tr(lang, 'fodelseomrade', 'birth_region'),
    tr(lang, 'antal_i_befolkningen', 'population_count'),
    tr(lang, 'misstankta_per1000', 'suspects_per_1000'),
    tr(lang, 'overrisk', 'excess_risk'),
    tr(lang, 'overrisk_justerad', 'excess_risk_adjusted'),
    tr(lang, 'antal_misstankta', 'suspects_count'),
    tr(lang, 'andel_av_misstankta_pct', 'share_of_suspects_pct'),
    tr(lang, 'andel_av_befolkningen_pct', 'share_of_population_pct'),
    tr(lang, 'andel_misstankta_i_gruppen_pct', 'share_of_group_suspected_pct'),
  ];
  const comparison = tr(lang, COMPARISON_LABEL, 'Born in Sweden, two Swedish-born parents');
  const rows: string[][] = [];
  for (const r of b6.filter((x) => x.view === 'bakgrund')) {
    rows.push([
      tr(lang, 'bakgrund', 'background'),
      crimeLabel(TOTAL, lang),
      dataLabel(r.unit, lang),
      '',
      csvNumber(r.populationN, 0),
      '',
      csvNumber(r.risk, 2),
      '',
      csvNumber(r.suspectsN, 0),
      csvNumber(r.suspectsPct, 2),
      csvNumber(r.populationPct, 2),
      csvNumber(r.pctSuspected, 2),
    ]);
  }
  for (const view of ['region', 'land', 'moder'] as View[]) {
    const d = view === 'land' ? 1 : 2;
    for (const c of data[view]) {
      rows.push([VIEW_CSV[lang][view], crimeLabel(c.name, lang), comparison, '', '', csvNumber(c.refPer1000, d), '1.00', '', '', '', '', '']);
      for (const u of [...c.units].sort(byRisk)) {
        const b = c.name === TOTAL && view !== 'land' ? b6.find((x) => x.view === view && x.unit === u.label) : undefined;
        rows.push([
          VIEW_CSV[lang][view],
          crimeLabel(c.name, lang),
          dataLabel(u.label, lang),
          view === 'land' ? dataLabel(u.region, lang) : '',
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

