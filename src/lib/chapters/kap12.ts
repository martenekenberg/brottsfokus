// Chapter 5.2: Danmarks Statistik's crime index, unadjusted and adjusted for age and other factors
// (Indvandrere i Danmark 2025, tables 6.5, 6.7 and 6.9). The average for all men, or all women, aged 15–79 is 100.
// Shared by the charts, the table page and the number checklist.
import type { DkAdjustment, DkIndexGroup, DkIndexOffence, DkIndexRow } from '../data';
import type { BarChartSpec, BarKind } from '../charts/bar';
import { formatNumber } from '../format';
import { tr, type Lang } from '../i18n';
import type { DataTable } from '../tables';
import { DK_CSV, DK_STYLE } from './kap11';

type Text = Record<Lang, string>;
export type Sex = 'man' | 'kvinnor';

/** Shown order, as in chapter 5.1. */
export const INDEX_ORDER: DkIndexGroup[] = ['eftk_ikkevest', 'indv_ikkevest', 'eftk_vest', 'indv_vest', 'dansk'];
export const ADJ_ORDER: DkAdjustment[] = ['ingen', 'alder', 'alder_socio', 'alder_utb', 'alder_ink'];
export const OFFENCE_ORDER: DkIndexOffence[] = ['alle', 'straffelov', 'vold', 'ejendom', 'faerdsel', 'saerlove'];

export const ADJ_LABEL: Record<DkAdjustment, Text> = {
  ingen: { sv: 'Inte justerat', en: 'Not adjusted' },
  alder: { sv: 'Ålder', en: 'Age' },
  alder_socio: { sv: 'Ålder och egen sysselsättning', en: 'Age and own employment status' },
  alder_utb: { sv: 'Ålder och familjens utbildning', en: 'Age and family education' },
  alder_ink: { sv: 'Ålder och familjens inkomst', en: 'Age and family income' },
};
export const ADJ_KIND: Record<DkAdjustment, BarKind> = {
  ingen: 'second',
  alder: 'focus',
  alder_socio: 'focusMid',
  alder_utb: 'focusLight',
  alder_ink: 'focusPale',
};
const ADJ_CSV: Record<DkAdjustment, Text> = {
  ingen: { sv: 'ej_justerat', en: 'not_adjusted' },
  alder: { sv: 'alder', en: 'age' },
  alder_socio: { sv: 'alder_sysselsattning', en: 'age_employment' },
  alder_utb: { sv: 'alder_familjens_utbildning', en: 'age_family_education' },
  alder_ink: { sv: 'alder_familjens_inkomst', en: 'age_family_income' },
};
export const OFFENCE_LABEL: Record<DkIndexOffence, Text> = {
  alle: { sv: 'Alla lagföringar', en: 'All convictions' },
  straffelov: { sv: 'Strafflagen', en: 'Criminal code' },
  vold: { sv: 'Våldsbrott', en: 'Crimes of violence' },
  ejendom: { sv: 'Egendomsbrott', en: 'Property crimes' },
  faerdsel: { sv: 'Trafikbrott', en: 'Traffic offences' },
  saerlove: { sv: 'Särskilda lagar', en: 'Special laws' },
};
const OFFENCE_CSV: Record<DkIndexOffence, Text> = {
  alle: { sv: 'alla', en: 'all' },
  straffelov: { sv: 'strafflagen', en: 'criminal_code' },
  vold: { sv: 'vald', en: 'violence' },
  ejendom: { sv: 'egendom', en: 'property' },
  faerdsel: { sv: 'trafik', en: 'traffic' },
  saerlove: { sv: 'sarskilda_lagar', en: 'special_laws' },
};
export const SEX_LABEL: Record<Sex, Text> = { man: { sv: 'Män', en: 'Men' }, kvinnor: { sv: 'Kvinnor', en: 'Women' } };

export interface Kap12 {
  year: number;
  rows: DkIndexRow[];
}

export function buildKap12(rows: DkIndexRow[]): Kap12 {
  const years = [...new Set(rows.map((r) => r.year))];
  if (years.length !== 1) throw new Error('Chapter 5.2: the index file should hold one year');
  return { year: years[0], rows };
}

/** One index value, or null where Danmarks Statistik prints "..". */
export function indexValue(k: Kap12, sex: Sex, group: DkIndexGroup, adjustment: DkAdjustment, offence: DkIndexOffence = 'alle'): number | null {
  const r = k.rows.find((x) => x.sex === sex && x.group === group && x.adjustment === adjustment && x.offence === offence);
  if (!r) throw new Error(`Chapter 5.2: no index for ${sex}, ${group}, ${adjustment}, ${offence}`);
  return r.index;
}

/** Same, for values the page text relies on: stops the build if the value is missing. */
export function indexAt(k: Kap12, sex: Sex, group: DkIndexGroup, adjustment: DkAdjustment, offence: DkIndexOffence = 'alle'): number {
  const v = indexValue(k, sex, group, adjustment, offence);
  if (v === null) throw new Error(`Chapter 5.2: index missing for ${sex}, ${group}, ${adjustment}, ${offence}`);
  return v;
}

/** The page of the report a value is printed on, for the source line and the checklist. */
export function pageOf(k: Kap12, table: DkIndexRow['table']): number {
  const r = k.rows.find((x) => x.table === table);
  if (!r) throw new Error(`Chapter 5.2: no rows from table ${table}`);
  return r.page;
}

export function groupLabel(g: DkIndexGroup, lang: Lang): string {
  return DK_STYLE[g].label[lang];
}

/** Grouped bars: one group per origin, one bar per adjustment, a dashed line at 100. */
export function buildKap12Spec(k: Kap12, sex: Sex, lang: Lang): BarChartSpec {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const v = (g: DkIndexGroup, a: DkAdjustment) => indexAt(k, sex, g, a);
  const who = sex === 'man' ? L('män', 'men') : L('kvinnor', 'women');
  const n = (x: number, l: Lang) => formatNumber(x, 0, l);
  return {
    lang,
    format: 'int',
    hideBarLabels: true,
    ref: { value: 100, label: sex === 'man' ? L('Alla män = 100', 'All men = 100') : L('Alla kvinnor = 100', 'All women = 100') },
    groups: INDEX_ORDER.map((g) => ({
      label: groupLabel(g, lang),
      bars: ADJ_ORDER.map((a) => ({ label: ADJ_LABEL[a][lang], value: v(g, a), kind: ADJ_KIND[a] })),
    })),
    ariaLabel: L(
      `Stapeldiagram. Danmarks Statistiks kriminalitetsindex för ${who} ${k.year}, där alla ${who} 15–79 år är 100, efter ursprung, utan justering och justerat för ålder och andra förhållanden. ` +
        `Barn till invandrare från icke-västliga länder: ${n(v('eftk_ikkevest', 'ingen'), 'sv')} utan justering och ${n(v('eftk_ikkevest', 'alder'), 'sv')} justerat för ålder.`,
      `Bar chart. Danmarks Statistik’s crime index for ${who}, ${k.year}, where all ${who} aged 15–79 are 100, by origin, unadjusted and adjusted for age and other factors. ` +
        `Descendants of immigrants from non-Western countries: ${n(v('eftk_ikkevest', 'ingen'), 'en')} unadjusted and ${n(v('eftk_ikkevest', 'alder'), 'en')} adjusted for age.`,
    ),
  };
}

/** The tables on the chapter 5.2 table page: one row per group, the same values as the charts. */
export function kap12Tables(k: Kap12, lang: Lang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const sexCsv = (s: Sex) => T(s === 'man' ? 'man' : 'kvinnor', s === 'man' ? 'men' : 'women');
  const adjTable = (s: Sex): DataTable => ({
    id: `kap12-justering-${s}`,
    caption: T(
      `Kriminalitetsindex för ${s === 'man' ? 'män' : 'kvinnor'} ${k.year}, alla lagföringar, utan justering och justerat för olika förhållanden. Alla ${s === 'man' ? 'män' : 'kvinnor'} 15–79 år = 100.`,
      `Crime index for ${s === 'man' ? 'men' : 'women'}, ${k.year}, all convictions, unadjusted and adjusted for different factors. All ${s === 'man' ? 'men' : 'women'} aged 15–79 = 100.`,
    ),
    rowLabel: T('Grupp', 'Group'),
    rowCsv: T('grupp', 'group'),
    columns: ADJ_ORDER.map((a) => ({ kind: 'number' as const, label: ADJ_LABEL[a][lang], csv: `${sexCsv(s)}_${ADJ_CSV[a][lang]}`, decimals: 0 })),
    rows: INDEX_ORDER.map((g) => ({ key: DK_CSV[g][lang], cells: ADJ_ORDER.map((a) => indexValue(k, s, g, a)) })),
  });
  const offenceTable = (s: Sex): DataTable => ({
    id: `kap12-brott-${s}`,
    caption: T(
      `Kriminalitetsindex för ${s === 'man' ? 'män' : 'kvinnor'} ${k.year} efter typ av brott, justerat för ålder. Alla ${s === 'man' ? 'män' : 'kvinnor'} 15–79 år = 100.`,
      `Crime index for ${s === 'man' ? 'men' : 'women'}, ${k.year}, by type of offence, adjusted for age. All ${s === 'man' ? 'men' : 'women'} aged 15–79 = 100.`,
    ),
    rowLabel: T('Grupp', 'Group'),
    rowCsv: T('grupp', 'group'),
    columns: OFFENCE_ORDER.filter((o) => o !== 'alle').map((o) => ({
      kind: 'number' as const,
      label: OFFENCE_LABEL[o][lang],
      csv: `${sexCsv(s)}_${T('alder', 'age')}_${OFFENCE_CSV[o][lang]}`,
      decimals: 0,
    })),
    rows: INDEX_ORDER.map((g) => ({
      key: DK_CSV[g][lang],
      cells: OFFENCE_ORDER.filter((o) => o !== 'alle').map((o) => indexValue(k, s, g, 'alder', o)),
    })),
  });
  return [adjTable('man'), adjTable('kvinnor'), offenceTable('man'), offenceTable('kvinnor')];
}

/** Column names and descriptions for the data dictionary, in the CSV's order. */
export function kap12DictionaryColumns(): { name: Text; description: Text }[] {
  const out: { name: Text; description: Text }[] = [];
  for (const s of ['man', 'kvinnor'] as Sex[]) {
    for (const a of ADJ_ORDER) {
      out.push({
        name: { sv: `${s === 'man' ? 'man' : 'kvinnor'}_${ADJ_CSV[a].sv}`, en: `${s === 'man' ? 'men' : 'women'}_${ADJ_CSV[a].en}` },
        description: {
          sv: `Kriminalitetsindex för ${s === 'man' ? 'män' : 'kvinnor'}, alla lagföringar, ${a === 'ingen' ? 'inte justerat' : `justerat för ${ADJ_LABEL[a].sv.toLowerCase()}`}. Alla ${s === 'man' ? 'män' : 'kvinnor'} 15–79 år = 100.`,
          en: `Crime index for ${s === 'man' ? 'men' : 'women'}, all convictions, ${a === 'ingen' ? 'not adjusted' : `adjusted for ${ADJ_LABEL[a].en.toLowerCase()}`}. All ${s === 'man' ? 'men' : 'women'} aged 15–79 = 100.`,
        },
      });
    }
  }
  for (const s of ['man', 'kvinnor'] as Sex[]) {
    for (const o of OFFENCE_ORDER.filter((x) => x !== 'alle')) {
      out.push({
        name: { sv: `${s === 'man' ? 'man' : 'kvinnor'}_alder_${OFFENCE_CSV[o].sv}`, en: `${s === 'man' ? 'men' : 'women'}_age_${OFFENCE_CSV[o].en}` },
        description: {
          sv: `Kriminalitetsindex för ${s === 'man' ? 'män' : 'kvinnor'}, ${OFFENCE_LABEL[o].sv.toLowerCase()}, justerat för ålder. Tomt där Danmarks Statistik inte anger något värde (färre än tio lagförda).`,
          en: `Crime index for ${s === 'man' ? 'men' : 'women'}, ${OFFENCE_LABEL[o].en.toLowerCase()}, adjusted for age. Empty where Danmarks Statistik gives no value (fewer than ten convicted).`,
        },
      });
    }
  }
  return out;
}
