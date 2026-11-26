// Chapter 1, second chart: each group's share of all registered suspicions, 2007–2018
// (Brå 2021:9, appendix 3, table D1), including people not registered in Sweden.
// Shared by the main page (chart), the table page (tables, CSV) and the number checklist.
import { round, shareOfTotalPct } from '../calc';
import type { SuspicionGroup, SuspicionRow } from '../data';
import { fmt, type LineChartSpec, type LineSeries } from '../charts/line';
import { tr, type BaseLang as Lang } from '../i18n';
import { dataLabel } from '../labels';
import type { DataTable } from '../tables';
import { GROUPS } from './kap1';

/** Order in the chart, the tables and the CSV file. */
export const SHARE_ORDER: SuspicionGroup[] = ['sv2', 'utr', 'u2', 'sv1', 'ej'];

/** Not in the population figures, so it gets a colour of its own outside the chapter 1 groups. */
// Colour token "extra" in CLAUDE.md: a fifth series, here people not registered in Sweden.
const NOT_REGISTERED = { color: '#6B3FA0', textColor: '#6B3FA0' };

export interface ShareGroup {
  id: SuspicionGroup;
  /** Swedish name from the data file. */
  name: string;
  counts: number[];
  /** Share of all suspicions that year, in percent, not rounded. */
  shares: number[];
}

export interface SuspicionShares {
  years: number[];
  groups: ShareGroup[];
  totals: number[];
}

/** Build time: one record per group, with counts and calculated shares per year. Fails if a year or group is missing. */
export function buildSuspicionShares(rows: SuspicionRow[]): SuspicionShares {
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const cell = (id: SuspicionGroup, year: number) => {
    const r = rows.find((x) => x.groupId === id && x.year === year);
    if (!r) throw new Error(`bra2021_brottsmisstankar.csv: no row for ${id} ${year}`);
    return r;
  };
  const totals = years.map((y) => SHARE_ORDER.reduce((sum, id) => sum + cell(id, y).suspicions, 0));
  const groups = SHARE_ORDER.map((id) => {
    const counts = years.map((y) => cell(id, y).suspicions);
    const shares = years.map((y, i) => shareOfTotalPct(counts[i], SHARE_ORDER.map((g) => cell(g, y).suspicions)));
    return { id, name: cell(id, years[0]).group, counts, shares };
  });
  return { years, groups, totals };
}

export function shareGroup(data: SuspicionShares, id: SuspicionGroup): ShareGroup {
  const g = data.groups.find((x) => x.id === id);
  if (!g) throw new Error(`Suspicion shares: no group ${id}`);
  return g;
}

/** Year with the highest share for a group (the first such year if two are equal). */
export function peakYear(data: SuspicionShares, id: SuspicionGroup): number {
  const g = shareGroup(data, id);
  let best = 0;
  g.shares.forEach((v, i) => {
    if (round(v, 1) > round(g.shares[best], 1)) best = i;
  });
  return data.years[best];
}

function style(id: SuspicionGroup) {
  if (id === 'ej') return { ...NOT_REGISTERED, strokeWidth: 2.5 };
  const g = GROUPS[id];
  return { color: g.color, textColor: g.textColor, strokeWidth: g.strokeWidth };
}

/** Short names for the end of each line. */
function endLabel(id: SuspicionGroup, lang: Lang): string {
  if (id === 'ej') return tr(lang, 'Icke folkbokförda', 'Not registered');
  return GROUPS[id].endLabel[lang];
}

/** Group name as in chapter 1; the data file's own name for people not registered in Sweden. */
export function groupLabel(g: ShareGroup, lang: Lang): string {
  return g.id === 'ej' ? dataLabel(g.name, lang) : GROUPS[g.id].label[lang];
}

export function buildSharesSpec(data: SuspicionShares, lang: Lang): LineChartSpec {
  const { years } = data;
  const first = years[0];
  const last = years[years.length - 1];
  const ejPeak = peakYear(data, 'ej');
  const series: LineSeries[] = data.groups.map((g) => {
    const s = style(g.id);
    return {
      id: g.id,
      label: groupLabel(g, lang),
      endLabel: endLabel(g.id, lang),
      endLabelShort: '',
      color: s.color,
      textColor: s.textColor,
      strokeWidth: s.strokeWidth,
      dotRadius: 3,
      values: g.shares.map((v) => round(v, 1)),
      annotate: g.id === 'ej' && ejPeak !== last ? [ejPeak] : undefined,
      format: 'pct1',
    };
  });
  const described = series
    .map((s) =>
      tr(
        lang,
        `${s.label}: ${fmt(s.values[0]!, 'pct1', lang)} år ${first} och ${fmt(s.values[s.values.length - 1]!, 'pct1', lang)} år ${last}.`,
        `${s.label}: ${fmt(s.values[0]!, 'pct1', lang)} in ${first} and ${fmt(s.values[s.values.length - 1]!, 'pct1', lang)} in ${last}.`,
      ),
    )
    .join(' ');
  return {
    lang,
    years,
    series,
    yMax: 60,
    yTickStep: 10,
    yFormat: 'pct',
    ariaLabel:
      tr(
        lang,
        `Linjediagram. Varje grupps andel av alla registrerade brottsmisstankar per år, ${first} till ${last}, även misstankar mot personer som inte är folkbokförda i Sverige. `,
        `Line chart. Each group’s share of all registered crime suspicions per year, ${first} to ${last}, including suspicions against people not registered as living in Sweden. `,
      ) + described,
  };
}

/** Number of registered suspicions and each group's share, per year, for the table page. */
export function sharesTables(data: SuspicionShares, lang: Lang): DataTable[] {
  const first = data.years[0];
  const last = data.years[data.years.length - 1];
  const rowLabel = tr(lang, 'År', 'Year');
  const rowCsv = tr(lang, 'ar', 'year');
  const counts: DataTable = {
    id: 'kap1-misstankar-antal',
    caption: tr(lang, `Antal registrerade brottsmisstankar per grupp, ${first}–${last} (Brå tabell D1)`, `Number of registered crime suspicions by group, ${first}–${last} (Brå table D1)`),
    rowLabel,
    rowCsv,
    columns: [
      ...data.groups.map((g) => ({ kind: 'number' as const, label: groupLabel(g, lang), csv: countColumn(g.id, lang), decimals: 0 })),
      { kind: 'number' as const, label: tr(lang, 'Totalt', 'Total'), csv: tr(lang, 'totalt_antal', 'total_count'), decimals: 0 },
    ],
    rows: data.years.map((y, i) => ({ key: String(y), cells: [...data.groups.map((g) => g.counts[i]), data.totals[i]] })),
  };
  const shares: DataTable = {
    id: 'kap1-misstankar-andel',
    caption: tr(lang, `Andel av alla registrerade brottsmisstankar (%), ${first}–${last}`, `Share of all registered crime suspicions (%), ${first}–${last}`),
    rowLabel,
    rowCsv,
    columns: data.groups.map((g) => ({ kind: 'number' as const, label: groupLabel(g, lang), csv: shareColumn(g.id, lang), decimals: 1 })),
    rows: data.years.map((y, i) => ({ key: String(y), cells: data.groups.map((g) => g.shares[i]) })),
  };
  return [counts, shares];
}

/** Column names in the CSV file. */
export const CSV_NAME: Record<Lang, Record<SuspicionGroup, string>> = {
  sv: {
    sv2: 'misstankar_inrikesfodda_tva_inrikesfodda_foraldrar',
    sv1: 'misstankar_inrikesfodda_en_utrikesfodd_foralder',
    u2: 'misstankar_inrikesfodda_tva_utrikesfodda_foraldrar',
    utr: 'misstankar_utrikesfodda',
    ej: 'misstankar_icke_folkbokforda',
  },
  en: {
    sv2: 'suspicions_born_in_sweden_two_swedish_born_parents',
    sv1: 'suspicions_born_in_sweden_one_foreign_born_parent',
    u2: 'suspicions_born_in_sweden_two_foreign_born_parents',
    utr: 'suspicions_born_abroad',
    ej: 'suspicions_not_registered',
  },
};

/** CSV column names, e.g. "misstankar_utrikesfodda_antal" or "suspicions_born_abroad_count". */
export function countColumn(id: SuspicionGroup, lang: Lang): string {
  return `${CSV_NAME[lang][id]}_${tr(lang, 'antal', 'count')}`;
}
export function shareColumn(id: SuspicionGroup, lang: Lang): string {
  return `${CSV_NAME[lang][id]}_${tr(lang, 'andel_pct', 'share_pct')}`;
}
