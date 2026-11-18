// Chapter 10: share of each birth year convicted at least once by age 25 (and by age 20), by birth background
// (Brå 2025:21, tables 1 and 4). Shared by the main page, the table page and the number checklist.
import type { KohortGroup, KohortRow } from '../data';
import { fmt, type LineChartSpec, type LineSeries } from '../charts/line';
import { tr, type Lang } from '../i18n';
import { csvNumber, longCsv, type DataTable } from '../tables';
import { GROUPS } from './kap1';

export type Measure = KohortRow['measure'];
export type Sex = KohortRow['sex'];

/** Line styles follow chapter 1, so each background group has the same colour across the site. */
const STYLE: Record<KohortGroup, keyof typeof GROUPS> = { Utr: 'utr', I02: 'u2', I11: 'sv1', I20: 'sv2', alla: 'tot' };
const ORDER: KohortGroup[] = ['Utr', 'I02', 'I11', 'I20', 'alla'];

export const GROUP_LABEL: Record<KohortGroup, Record<Lang, string>> = {
  Utr: GROUPS.utr.label,
  I02: GROUPS.u2.label,
  I11: GROUPS.sv1.label,
  I20: GROUPS.sv2.label,
  alla: { sv: 'Alla födda det året', en: 'Everyone born that year' },
};
const END_LABEL: Record<KohortGroup, Record<Lang, string>> = {
  Utr: GROUPS.utr.endLabel,
  I02: GROUPS.u2.endLabel,
  I11: GROUPS.sv1.endLabel,
  I20: GROUPS.sv2.endLabel,
  alla: { sv: 'Alla', en: 'Everyone' },
};

export const SEX_LABEL: Record<Sex, Record<Lang, string>> = {
  samtliga: { sv: 'Kvinnor och män', en: 'Women and men' },
  man: { sv: 'Män', en: 'Men' },
  kvinnor: { sv: 'Kvinnor', en: 'Women' },
};

export function birthYears(rows: KohortRow[], measure: Measure): number[] {
  return [...new Set(rows.filter((r) => r.measure === measure).map((r) => r.birthYear))].sort((a, b) => a - b);
}

/** One value, or null for years Brå does not report by background (before 1984). */
export function kohortValue(rows: KohortRow[], measure: Measure, sex: Sex, group: KohortGroup, year: number): number | null {
  return rows.find((r) => r.measure === measure && r.sex === sex && r.group === group && r.birthYear === year)?.pct ?? null;
}

/** First birth year with values by background. */
export function firstBackgroundYear(rows: KohortRow[], measure: Measure): number {
  return Math.min(...rows.filter((r) => r.measure === measure && r.group !== 'alla').map((r) => r.birthYear));
}

export function buildKohortSpec(rows: KohortRow[], measure: Measure, sex: Sex, lang: Lang): LineChartSpec {
  const years = birthYears(rows, measure);
  const age = measure === 'fore25' ? 25 : 20;
  const series: LineSeries[] = ORDER.map((g) => {
    const s = GROUPS[STYLE[g]];
    return {
      id: g,
      label: GROUP_LABEL[g][lang],
      endLabel: END_LABEL[g][lang],
      endLabelShort: '',
      color: s.color,
      textColor: s.textColor,
      strokeWidth: s.strokeWidth,
      dashed: s.dashed,
      dotRadius: g === 'alla' ? 2 : 2.5,
      values: years.map((y) => kohortValue(rows, measure, sex, g, y)),
      format: 'pct1',
    };
  });
  const describe = series
    .map((s) => {
      const i = s.values.findIndex((v) => v !== null);
      const j = s.values.length - 1;
      return tr(
        lang,
        `${s.label}: ${fmt(s.values[i]!, 'pct1', lang)} för födda ${years[i]} och ${fmt(s.values[j]!, 'pct1', lang)} för födda ${years[j]}.`,
        `${s.label}: ${fmt(s.values[i]!, 'pct1', lang)} for those born in ${years[i]} and ${fmt(s.values[j]!, 'pct1', lang)} for those born in ${years[j]}.`,
      );
    })
    .join(' ');
  return {
    lang,
    years,
    series,
    yMax: 30,
    yTickStep: 10,
    yFormat: 'pct',
    ariaLabel:
      tr(
        lang,
        `Linjediagram. Andel av alla födda ett visst år som lagförts för brott minst en gång före ${age} års ålder, efter födelseår ${years[0]}–${years[years.length - 1]} och födelsebakgrund. `,
        `Line chart. Share of everyone born in a given year who was convicted of a crime at least once before age ${age}, by birth year ${years[0]}–${years[years.length - 1]} and birth background. `,
      ) + describe,
  };
}

/** True if the share was lower in the last birth year than in the first year with background data, in every group. */
export function fellInAllGroups(rows: KohortRow[], measure: Measure, fromYear: number, toYear: number): boolean {
  return ORDER.every((g) => {
    const a = kohortValue(rows, measure, 'samtliga', g, fromYear);
    const b = kohortValue(rows, measure, 'samtliga', g, toYear);
    return a !== null && b !== null && b < a;
  });
}

/** One table per measure and sex: birth years as rows, groups as columns. */
export function kohortTables(rows: KohortRow[], lang: Lang): DataTable[] {
  const out: DataTable[] = [];
  for (const measure of ['fore25', 'fore20'] as Measure[]) {
    const age = measure === 'fore25' ? 25 : 20;
    for (const sex of ['samtliga', 'man', 'kvinnor'] as Sex[]) {
      out.push({
        id: `kap10-${measure}-${sex}`,
        caption: tr(lang, `${SEX_LABEL[sex].sv}: andel lagförda före ${age} års ålder (%)`, `${SEX_LABEL[sex].en}: share convicted before age ${age} (%)`),
        rowLabel: tr(lang, 'Födelseår', 'Birth year'),
        rowCsv: tr(lang, 'fodelsear', 'birth_year'),
        columns: (['alla', 'I20', 'I11', 'I02', 'Utr'] as KohortGroup[]).map((g) => ({
          kind: 'number' as const,
          label: GROUP_LABEL[g][lang],
          csv: `${GROUP_CSV[g][lang]}_pct`,
          decimals: 1,
        })),
        rows: birthYears(rows, measure).map((y) => ({
          key: String(y),
          cells: (['alla', 'I20', 'I11', 'I02', 'Utr'] as KohortGroup[]).map((g) => kohortValue(rows, measure, sex, g, y)),
        })),
      });
    }
  }
  return out;
}

const GROUP_CSV: Record<KohortGroup, Record<Lang, string>> = {
  alla: { sv: 'alla', en: 'everyone' },
  I20: { sv: 'inrikes_fodda_tva_inrikes_fodda_foraldrar', en: 'born_in_sweden_two_swedish_born_parents' },
  I11: { sv: 'inrikes_fodda_en_utrikes_fodd_foralder', en: 'born_in_sweden_one_foreign_born_parent' },
  I02: { sv: 'inrikes_fodda_tva_utrikes_fodda_foraldrar', en: 'born_in_sweden_two_foreign_born_parents' },
  Utr: { sv: 'utrikes_fodda', en: 'born_abroad' },
};

export function kap10Csv(rows: KohortRow[], lang: Lang): string {
  const header = [tr(lang, 'matt', 'measure'), tr(lang, 'fodelsear', 'birth_year'), tr(lang, 'kon', 'sex'), tr(lang, 'bakgrund', 'background'), tr(lang, 'andel_pct', 'share_pct')];
  const measure = (m: Measure) => (m === 'fore25' ? tr(lang, 'lagford_fore_25_ar', 'convicted_before_25') : tr(lang, 'lagford_fore_20_ar', 'convicted_before_20'));
  const sex = (s: Sex) => ({ samtliga: tr(lang, 'samtliga', 'everyone'), man: tr(lang, 'man', 'men'), kvinnor: tr(lang, 'kvinnor', 'women') })[s];
  return longCsv(
    header,
    rows.map((r) => [measure(r.measure), String(r.birthYear), sex(r.sex), GROUP_CSV[r.group][lang], csvNumber(r.pct, 1)]),
  );
}
