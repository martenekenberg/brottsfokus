// Chapter 7: people sentenced to prison and deportation who left prison 2013–2023, followed up to 2024
// (Brå 2026:15, table B1 and figures stated in the text). Shared by the main page, the table page and
// the number checklist.
import type { DeportDimension, DeportFact, DeportRow } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { formatPct } from '../format';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type DataTable } from '../tables';

/** Brå shows sub-regions with at least this many people in its own chart (table 6); the rest are in the appendix. */
export const MIN_GROUP = 50;

export function totalRow(rows: DeportRow[]): DeportRow {
  const r = rows.find((x) => x.dimension === 'totalt');
  if (!r || r.pctDeported === null || r.n === null) throw new Error('utvisning_b1.csv: total row missing');
  return r;
}

export function fact(facts: DeportFact[], id: string, year: number | null = null): number {
  const f = facts.find((x) => x.id === id && x.year === year);
  if (!f) throw new Error(`utvisning_text.csv: ${id} ${year ?? ''} missing`);
  return f.value;
}

/** Sub-regions of citizenship with at least MIN_GROUP people, plus "not defined", highest share deported first. */
export function citizenshipGroups(rows: DeportRow[]): DeportRow[] {
  return rows
    .filter(
      (r) =>
        (r.dimension === 'delomrade' || (r.dimension === 'varldsdel' && r.group === 'Ej definierat')) &&
        r.n !== null &&
        r.n >= MIN_GROUP &&
        r.pctDeported !== null,
    )
    .sort((a, b) => (b.pctDeported as number) - (a.pctDeported as number));
}

/** Main offence categories (not their sub-categories), highest share deported first. */
export function offenceGroups(rows: DeportRow[]): DeportRow[] {
  return rows
    .filter((r) => r.dimension === 'huvudbrott' && r.parent === '' && r.pctDeported !== null)
    .sort((a, b) => (b.pctDeported as number) - (a.pctDeported as number));
}

export function buildCitizenshipSpec(rows: DeportRow[], lang: Lang): BarChartSpec {
  const total = totalRow(rows);
  const groups = citizenshipGroups(rows).map((r) => ({
    label: dataLabel(r.group, lang),
    bars: [{ label: '', value: r.pctDeported as number, kind: 'focus' as const }],
  }));
  const pct = (v: number) => formatPct(v, 1, lang);
  return {
    lang,
    format: 'pct1',
    xMax: 100,
    ref: { value: total.pctDeported as number, label: tr(lang, `Alla: ${pct(total.pctDeported as number)}`, `Everyone: ${pct(total.pctDeported as number)}`) },
    groups,
    ariaLabel:
      tr(
        lang,
        'Stapeldiagram. Andel av de utvisningsdömda som lämnade fängelset 2013–2023 och hade utvisats till och med 2024, efter område för medborgarskap. ',
        'Bar chart. Share of people sentenced to deportation who left prison in 2013–2023 and had been deported by the end of 2024, by region of citizenship. ',
      ) +
      groups.map((g) => `${g.label}: ${pct(g.bars[0].value)}`).join('. ') +
      tr(lang, `. Alla: ${pct(total.pctDeported as number)}.`, `. Everyone: ${pct(total.pctDeported as number)}.`),
  };
}

export function buildOffenceSpec(rows: DeportRow[], lang: Lang): BarChartSpec {
  const groups = offenceGroups(rows).map((r) => ({
    label: dataLabel(r.group, lang),
    bars: [
      { label: tr(lang, 'Utvisade', 'Deported'), value: r.pctDeported as number, kind: 'focus' as const },
      { label: tr(lang, 'Lagförda för nya brott i Sverige', 'Convicted of new crimes in Sweden'), value: r.pctReconvicted as number, kind: 'second' as const },
    ],
  }));
  const pct = (v: number) => formatPct(v, 1, lang);
  return {
    lang,
    format: 'pct1',
    xMax: 100,
    hideBarLabels: true,
    groups,
    ariaLabel:
      tr(
        lang,
        'Stapeldiagram. Andel som utvisats och andel som lagförts för nya brott i Sverige, efter huvudbrott i den dom som ledde till fängelse. ',
        'Bar chart. Share deported and share convicted of new crimes in Sweden, by main offence in the sentence that led to prison. ',
      ) +
      groups
        .map((g) =>
          tr(
            lang,
            `${g.label}: ${pct(g.bars[0].value)} utvisade, ${pct(g.bars[1].value)} lagförda för nya brott`,
            `${g.label}: ${pct(g.bars[0].value)} deported, ${pct(g.bars[1].value)} convicted of new crimes`,
          ),
        )
        .join('. ') +
      '.',
  };
}

const DIMENSION_LABEL: Record<DeportDimension, Record<Lang, string>> = {
  totalt: { sv: 'Totalt', en: 'Total' },
  kon: { sv: 'Kön', en: 'Sex' },
  alder: { sv: 'Ålder', en: 'Age' },
  folkbokforing: { sv: 'Folkbokföring', en: 'Registration' },
  huvudbrott: { sv: 'Huvudbrott i domen', en: 'Main offence in the sentence' },
  varldsdel: { sv: 'Medborgarskap, världsdel', en: 'Citizenship, world region' },
  delomrade: { sv: 'Medborgarskap, område', en: 'Citizenship, sub-region' },
};

export function dimensionLabel(d: DeportDimension, lang: Lang): string {
  return DIMENSION_LABEL[d][lang];
}

/** Row name as shown: sub-groups are indented under their parent. */
function rowName(r: DeportRow, lang: Lang): string {
  const name = r.group === 'Totalt' ? tr(lang, 'Alla', 'Everyone') : dataLabel(r.group, lang);
  return r.parent ? `  ${name}` : name;
}

const COLUMNS = (lang: Lang) => [
  { kind: 'number' as const, label: tr(lang, 'Utvisade (%)', 'Deported (%)'), csv: tr(lang, 'utvisade_pct', 'deported_pct'), decimals: 1 },
  { kind: 'number' as const, label: tr(lang, 'Utvisade inom 1 år (%)', 'Deported within 1 year (%)'), csv: tr(lang, 'utvisade_inom_1_ar_pct', 'deported_within_1_year_pct'), decimals: 1 },
  { kind: 'number' as const, label: tr(lang, 'Lagförda för nya brott (%)', 'Convicted of new crimes (%)'), csv: tr(lang, 'lagforda_nya_brott_pct', 'convicted_new_crimes_pct'), decimals: 1 },
  {
    kind: 'number' as const,
    label: tr(lang, 'Lagförda, brott inom 1 år (%)', 'Convicted, crime within 1 year (%)'),
    csv: tr(lang, 'lagforda_brott_inom_1_ar_pct', 'convicted_crime_within_1_year_pct'),
    decimals: 1,
  },
  { kind: 'number' as const, label: tr(lang, 'Antal personer', 'Number of people'), csv: tr(lang, 'antal', 'count'), decimals: 0 },
];

/** Brå table B1, one table per dimension; citizenship shows world regions with their sub-regions. */
export function deportTables(rows: DeportRow[], lang: Lang): DataTable[] {
  const table = (id: string, caption: string, list: DeportRow[]): DataTable => ({
    id,
    caption,
    rowLabel: tr(lang, 'Grupp', 'Group'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: COLUMNS(lang),
    rows: list.map((r) => ({ key: rowName(r, lang), cells: [r.pctDeported, r.pctDeported1yr, r.pctReconvicted, r.pctReconvicted1yr, r.n] })),
  });
  const by = (d: DeportDimension) => rows.filter((r) => r.dimension === d);
  const citizenship = by('varldsdel').flatMap((w) => [w, ...rows.filter((r) => r.dimension === 'delomrade' && r.parent === w.group)]);
  return [
    table('kap7-totalt', tr(lang, 'Alla, efter kön, ålder och folkbokföring', 'Everyone, by sex, age and registration'), [...by('totalt'), ...by('kon'), ...by('alder'), ...by('folkbokforing')]),
    table('kap7-huvudbrott', tr(lang, 'Efter huvudbrott i den dom som ledde till fängelse', 'By main offence in the sentence that led to prison'), by('huvudbrott')),
    table('kap7-medborgarskap', tr(lang, 'Efter medborgarskap, världsdel och område', 'By citizenship, world region and sub-region'), citizenship),
  ];
}

/** Table B1 in one long CSV file. Empty cell = Brå does not report the value. */
export function kap7Csv(rows: DeportRow[], lang: Lang): string {
  const cols = COLUMNS(lang);
  const header = [tr(lang, 'indelning', 'breakdown'), tr(lang, 'grupp', 'group'), tr(lang, 'tillhor', 'part_of'), ...cols.map((c) => c.csv)];
  const out = rows.map((r) => [
    dimensionLabel(r.dimension, lang),
    r.group === 'Totalt' ? tr(lang, 'Alla', 'Everyone') : dataLabel(r.group, lang),
    r.parent ? dataLabel(r.parent, lang) : '',
    csvNumber(r.pctDeported, 1),
    csvNumber(r.pctDeported1yr, 1),
    csvNumber(r.pctReconvicted, 1),
    csvNumber(r.pctReconvicted1yr, 1),
    csvNumber(r.n, 0),
  ]);
  return longCsv(header, out);
}

/** Groups (and single cells) Brå does not report, for the notes. */
export function suppressedGroups(rows: DeportRow[]): DeportRow[] {
  return rows.filter((r) => r.n === null);
}
