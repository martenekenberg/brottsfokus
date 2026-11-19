// Chapter 9: share convicted before age 25 among people born 1966–1993, by background and birth-year group,
// for everyone and for those who grew up in low-income families (Bäckman et al. 2021, tables 1 and 2).
// Shared by the main page, the table page and the number checklist.
import type { CohortGroup, CohortRow } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { fmt, type LineChartSpec, type LineSeries } from '../charts/line';
import { GROUPS } from './kap1';
import { formatPct } from '../format';
import { tr, type Lang } from '../i18n';
import { csvNumber, longCsv, type DataTable } from '../tables';

export type Sex = 'man' | 'kvinna';
export type Table = 'alla' | 'laginkomst';

export const GROUP_LABEL: Record<CohortGroup, Record<Lang, string>> = {
  utrikesfodd: { sv: 'Utrikes födda', en: 'Born abroad' },
  andra_gen: { sv: 'Inrikes födda med två utrikes födda föräldrar', en: 'Born in Sweden, two foreign-born parents' },
  native: { sv: 'Inrikes födda med minst en inrikes född förälder', en: 'Born in Sweden, at least one Swedish-born parent' },
};

/** Order of the bars: the groups compared, then the comparison group (outlined). */
const BAR_ORDER: CohortGroup[] = ['utrikesfodd', 'andra_gen', 'native'];
const KIND = { utrikesfodd: 'focus', andra_gen: 'second', native: 'comparison' } as const;

export const SEX_LABEL: Record<Sex, Record<Lang, string>> = {
  man: { sv: 'Män', en: 'Men' },
  kvinna: { sv: 'Kvinnor', en: 'Women' },
};

export function cohorts(rows: CohortRow[]): string[] {
  return [...new Set(rows.map((r) => r.cohort))].sort();
}

export function cell(rows: CohortRow[], table: Table, sex: Sex, cohort: string, group: CohortGroup, measure: CohortRow['measure'] = 'minst1'): CohortRow {
  const r = rows.find((x) => x.table === table && x.sex === sex && x.cohort === cohort && x.group === group && x.measure === measure);
  if (!r) throw new Error(`backman_lagforda_fore_25.csv: ${table} ${sex} ${cohort} ${group} ${measure} missing`);
  return r;
}

/** Shared end of the scale for one sex, so the chart for everyone and the low-income chart can be compared. */
export function sexMax(rows: CohortRow[], sex: Sex): number {
  const max = Math.max(...rows.filter((r) => r.sex === sex && r.measure === 'minst1').map((r) => r.pct));
  return Math.ceil(max / 10) * 10;
}

export function buildCohortSpec(rows: CohortRow[], table: Table, sex: Sex, lang: Lang): BarChartSpec {
  const groups = cohorts(rows).map((c) => ({
    label: tr(lang, `Födda ${c}`, `Born ${c}`),
    bars: BAR_ORDER.map((g) => ({ label: GROUP_LABEL[g][lang], value: cell(rows, table, sex, c, g).pct, kind: KIND[g] })),
  }));
  const pct = (v: number) => formatPct(v, 1, lang);
  const who = table === 'alla' ? '' : ' från familjer med lägst inkomster';
  const whoEn = table === 'alla' ? '' : ' from the lowest-income families';
  return {
    lang,
    format: 'pct1',
    hideBarLabels: true,
    xMax: sexMax(rows, sex),
    groups,
    ariaLabel:
      tr(
        lang,
        `Stapeldiagram. ${SEX_LABEL[sex].sv}${who}: andel som lagförts för brott minst en gång före 25 års ålder, efter födelseår och bakgrund. `,
        `Bar chart. ${SEX_LABEL[sex].en}${whoEn}: share convicted of a crime at least once before age 25, by birth year and background. `,
      ) +
      groups.map((g) => `${g.label}: ${g.bars.map((b) => `${b.label} ${pct(b.value)}`).join(', ')}`).join('. ') +
      '.',
  };
}

/** Line styles from chapter 1: born abroad blue, two foreign-born parents orange, the comparison group black. */
const LINE_STYLE: Record<CohortGroup, keyof typeof GROUPS> = { utrikesfodd: 'utr', andra_gen: 'u2', native: 'sv2' };
const END_LABEL: Record<CohortGroup, Record<Lang, string>> = {
  utrikesfodd: { sv: 'Utrikes födda', en: 'Born abroad' },
  andra_gen: { sv: 'Två utrikes födda föräldrar', en: 'Two foreign-born parents' },
  native: { sv: 'Minst en inrikes född förälder', en: 'At least one Swedish-born parent' },
};

/**
 * The same figures as buildCohortSpec, as a line chart: one point per birth-year group.
 * Points sit at each group's first birth year (the groups are four years each, so the spacing is even)
 * and are labelled with the whole group, e.g. "1966–69".
 */
export function buildCohortLineSpec(rows: CohortRow[], table: Table, sex: Sex, lang: Lang): LineChartSpec {
  const names = cohorts(rows);
  const years = names.map((c) => Number(c.slice(0, 4)));
  const series: LineSeries[] = BAR_ORDER.map((g) => {
    const st = GROUPS[LINE_STYLE[g]];
    return {
      id: g,
      label: GROUP_LABEL[g][lang],
      endLabel: END_LABEL[g][lang],
      endLabelShort: '',
      color: st.color,
      textColor: st.textColor,
      strokeWidth: st.strokeWidth,
      dotRadius: 3,
      values: names.map((c) => cell(rows, table, sex, c, g).pct),
      format: 'pct1',
    };
  });
  const who = table === 'alla' ? '' : tr(lang, ' från familjer med lägst inkomster', ' from the lowest-income families');
  const first = names[0];
  const last = names[names.length - 1];
  return {
    lang,
    years,
    xLabels: names,
    series,
    yMax: sexMax(rows, sex),
    yTickStep: 10,
    yFormat: 'pct',
    ariaLabel:
      tr(
        lang,
        `Linjediagram. ${SEX_LABEL[sex].sv}${who}: andel som lagförts för brott minst en gång före 25 års ålder, efter födelseår och bakgrund. `,
        `Line chart. ${SEX_LABEL[sex].en}${who}: share convicted of a crime at least once before age 25, by birth year and background. `,
      ) +
      series
        .map((s) =>
          tr(
            lang,
            `${s.label}: ${fmt(s.values[0]!, 'pct1', lang)} för födda ${first} och ${fmt(s.values[s.values.length - 1]!, 'pct1', lang)} för födda ${last}.`,
            `${s.label}: ${fmt(s.values[0]!, 'pct1', lang)} for those born in ${first} and ${fmt(s.values[s.values.length - 1]!, 'pct1', lang)} for those born in ${last}.`,
          ),
        )
        .join(' '),
  };
}

/** True if the share convicted fell in every group, for both sexes, from the oldest to the youngest birth-year group. */
export function allFell(rows: CohortRow[]): boolean {
  const list = cohorts(rows);
  const first = list[0];
  const last = list[list.length - 1];
  return (['man', 'kvinna'] as Sex[]).every((sex) =>
    BAR_ORDER.every((g) => cell(rows, 'alla', sex, last, g).pct < cell(rows, 'alla', sex, first, g).pct),
  );
}

/** Mean relative risk over the birth-year groups, as printed by the authors. */
export function meanRr(rows: CohortRow[], table: Table, sex: Sex, group: CohortGroup): number {
  const list = cohorts(rows).map((c) => cell(rows, table, sex, c, group).rr);
  return list.reduce((a, b) => a + b, 0) / list.length;
}

/** True if, for both sexes and both groups, the mean relative risk is lower among low-income families. */
export function smallerInLowIncome(rows: CohortRow[]): boolean {
  return (['man', 'kvinna'] as Sex[]).every((sex) =>
    (['utrikesfodd', 'andra_gen'] as CohortGroup[]).every((g) => meanRr(rows, 'laginkomst', sex, g) < meanRr(rows, 'alla', sex, g)),
  );
}

const MEASURE_LABEL: Record<CohortRow['measure'], Record<Lang, string>> = {
  minst1: { sv: 'Minst en lagföring', en: 'At least one conviction' },
  minst4: { sv: 'Minst fyra lagföringar', en: 'At least four convictions' },
  minst2: { sv: 'Minst två lagföringar', en: 'At least two convictions' },
};

/** Tables 1 and 2 as printed: one table per table, sex and measure. */
export function cohortTables(rows: CohortRow[], lang: Lang): DataTable[] {
  const out: DataTable[] = [];
  for (const table of ['alla', 'laginkomst'] as Table[]) {
    for (const sex of ['man', 'kvinna'] as Sex[]) {
      for (const measure of (sex === 'man' ? ['minst1', 'minst4'] : ['minst1', 'minst2']) as CohortRow['measure'][]) {
        const who = table === 'alla' ? tr(lang, 'alla', 'everyone') : tr(lang, 'familjer med lägst inkomster', 'lowest-income families');
        out.push({
          id: `kap9-${table}-${sex}-${measure}`,
          caption: `${SEX_LABEL[sex][lang]}, ${who}: ${MEASURE_LABEL[measure][lang].toLowerCase()} ${tr(lang, 'före 25 års ålder', 'before age 25')}`,
          rowLabel: tr(lang, 'Födda', 'Born'),
          rowCsv: tr(lang, 'fodda', 'born'),
          columns: [
            ...(['native', 'andra_gen', 'utrikesfodd'] as CohortGroup[]).flatMap((g) => [
              { kind: 'number' as const, label: `${GROUP_LABEL[g][lang]} (%)`, csv: `${GROUP_CSV[g][lang]}_pct`, decimals: 1 },
              ...(g === 'native'
                ? []
                : [{ kind: 'number' as const, label: tr(lang, 'Relativ risk', 'Relative risk'), csv: `${GROUP_CSV[g][lang]}_${tr(lang, 'relativ_risk', 'relative_risk')}`, decimals: 1 }]),
            ]),
            ...(['native', 'andra_gen', 'utrikesfodd'] as CohortGroup[]).map((g) => ({
              kind: 'number' as const,
              label: tr(lang, `Antal, ${GROUP_LABEL[g].sv.toLowerCase()}`, `Number, ${GROUP_LABEL[g].en.toLowerCase()}`),
              csv: `${GROUP_CSV[g][lang]}_${tr(lang, 'antal', 'count')}`,
              decimals: 0,
            })),
          ],
          rows: cohorts(rows).map((c) => {
            const v = (g: CohortGroup) => cell(rows, table, sex, c, g, measure);
            return {
              key: c,
              cells: [v('native').pct, v('andra_gen').pct, v('andra_gen').rr, v('utrikesfodd').pct, v('utrikesfodd').rr, v('native').n, v('andra_gen').n, v('utrikesfodd').n],
            };
          }),
        });
      }
    }
  }
  return out;
}

const GROUP_CSV: Record<CohortGroup, Record<Lang, string>> = {
  native: { sv: 'inrikes_fodda_minst_en_inrikes_fodd_foralder', en: 'born_in_sweden_at_least_one_swedish_born_parent' },
  andra_gen: { sv: 'inrikes_fodda_tva_utrikes_fodda_foraldrar', en: 'born_in_sweden_two_foreign_born_parents' },
  utrikesfodd: { sv: 'utrikes_fodda', en: 'born_abroad' },
};

export function kap9Csv(rows: CohortRow[], lang: Lang): string {
  const header = [
    tr(lang, 'urval', 'sample'),
    tr(lang, 'kon', 'sex'),
    tr(lang, 'fodda', 'born'),
    tr(lang, 'matt', 'measure'),
    tr(lang, 'bakgrund', 'background'),
    tr(lang, 'andel_pct', 'share_pct'),
    tr(lang, 'relativ_risk', 'relative_risk'),
    tr(lang, 'antal_i_gruppen', 'group_size'),
  ];
  const sample = (t: Table) => (t === 'alla' ? tr(lang, 'alla', 'everyone') : tr(lang, 'familjer_med_lagst_inkomster', 'lowest_income_families'));
  return longCsv(
    header,
    rows.map((r) => [sample(r.table), SEX_LABEL[r.sex][lang], r.cohort, MEASURE_LABEL[r.measure][lang], GROUP_CSV[r.group][lang], csvNumber(r.pct, 1), csvNumber(r.rr, 1), csvNumber(r.n, 0)]),
  );
}
