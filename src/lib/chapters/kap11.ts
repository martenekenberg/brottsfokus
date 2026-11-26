// Chapter 5.1: people found guilty of crime in Denmark, by origin, per 1,000 residents aged 15–79.
// Counts from Statbank table STRFNA10, population from FOLK1E (Danmarks Statistik).
// Shared by the chart, the table page and the number checklist, so all show the same numbers.
import { meanPopulation, per1000, ratioToComparison } from '../calc';
import type { DkGroup, DkGuiltyRow, DkOffence, DkPopulationRow } from '../data';
import type { LineChartSpec, LineSeries } from '../charts/line';
import { formatNumber } from '../format';
import { pick, tr, type BaseLang, type Lang, type Text } from '../i18n';
import type { DataTable } from '../tables';

export interface Kap11 {
  years: number[];
  firstYear: number;
  lastYear: number;
  /** Per 1,000, unrounded, by offence and group, one value per year. */
  rates: Record<DkOffence, Record<DkGroup, number[]>>;
  /** People found guilty, by offence and group, one value per year. */
  persons: Record<DkOffence, Record<DkGroup, number[]>>;
  /** Population aged 15–79 during the year (mean of 1 January this year and next), by group. */
  population: Record<DkGroup, number[]>;
  /** Population on 1 January, by group, for every year in the file (one more than `years`). */
  populationJan1: Map<number, Record<DkGroup, number>>;
}

interface GroupStyle {
  label: Text;
  endLabel: Text;
  color: string;
  textColor: string;
  strokeWidth: number;
  dashed?: boolean;
}

/** Shown order: the largest rates first, the whole population last. */
export const DK_ORDER: DkGroup[] = ['eftk_ikkevest', 'indv_ikkevest', 'eftk_vest', 'indv_vest', 'dansk', 'alla'];

export const DK_STYLE: Record<DkGroup, GroupStyle> = {
  eftk_ikkevest: {
    label: { sv: 'Barn till invandrare från icke-västliga länder', en: 'Descendants of immigrants from non-Western countries', da: 'Efterkommere fra ikke-vestlige lande' },
    endLabel: { sv: 'barn till inv., icke-västliga', en: 'descendants, non-Western', da: 'efterkommere, ikke-vestlige' },
    color: '#C2410C',
    textColor: '#C2410C',
    strokeWidth: 2.5,
  },
  indv_ikkevest: {
    label: { sv: 'Invandrare från icke-västliga länder', en: 'Immigrants from non-Western countries', da: 'Indvandrere fra ikke-vestlige lande' },
    endLabel: { sv: 'invandrare, icke-västliga', en: 'immigrants, non-Western', da: 'indvandrere, ikke-vestlige' },
    color: '#1D4E89',
    textColor: '#1D4E89',
    strokeWidth: 2.5,
  },
  eftk_vest: {
    label: { sv: 'Barn till invandrare från västliga länder', en: 'Descendants of immigrants from Western countries', da: 'Efterkommere fra vestlige lande' },
    endLabel: { sv: 'barn till inv., västliga', en: 'descendants, Western', da: 'efterkommere, vestlige' },
    color: '#6B3FA0',
    textColor: '#6B3FA0',
    strokeWidth: 2,
  },
  indv_vest: {
    label: { sv: 'Invandrare från västliga länder', en: 'Immigrants from Western countries', da: 'Indvandrere fra vestlige lande' },
    endLabel: { sv: 'invandrare, västliga', en: 'immigrants, Western', da: 'indvandrere, vestlige' },
    color: '#0F766E',
    textColor: '#0F766E',
    strokeWidth: 2,
  },
  dansk: {
    label: { sv: 'Dansk ursprung', en: 'Danish origin', da: 'Dansk oprindelse' },
    endLabel: { sv: 'dansk ursprung', en: 'Danish origin', da: 'dansk oprindelse' },
    color: '#121212',
    textColor: '#121212',
    strokeWidth: 2,
  },
  alla: {
    label: { sv: 'Hela befolkningen 15–79 år', en: 'Whole population aged 15–79', da: 'Hele befolkningen 15–79 år' },
    endLabel: { sv: 'hela befolkningen', en: 'whole population', da: 'hele befolkningen' },
    color: '#8A8A8A',
    textColor: '#5C5C5C',
    strokeWidth: 2,
    dashed: true,
  },
};

export const OFFENCE_NAME: Record<DkOffence, Text> = {
  straffelov: { sv: 'brott mot strafflagen', en: 'criminal code offences', da: 'overtrædelser af straffeloven' },
  vold: { sv: 'våldsbrott', en: 'crimes of violence', da: 'voldsforbrydelser' },
};

export function groupLabel(g: DkGroup, lang: Lang): string {
  return pick(DK_STYLE[g].label, lang);
}

export function buildKap11(guilty: DkGuiltyRow[], pop: DkPopulationRow[]): Kap11 {
  const years = [...new Set(guilty.map((r) => r.year))].sort((a, b) => a - b);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  if (years.length !== lastYear - firstYear + 1) throw new Error('Chapter 5.1: a year is missing in dst_lagforda_herkomst.csv');

  const populationJan1 = new Map<number, Record<DkGroup, number>>();
  for (const r of pop) {
    const rec = populationJan1.get(r.year) ?? ({} as Record<DkGroup, number>);
    rec[r.group] = r.population;
    populationJan1.set(r.year, rec);
  }
  const jan1 = (year: number, g: DkGroup) => {
    const v = populationJan1.get(year)?.[g];
    if (v === undefined) throw new Error(`Chapter 5.1: no population for ${g} on 1 January ${year}`);
    return v;
  };
  const count = (year: number, o: DkOffence, g: DkGroup) => {
    const r = guilty.find((x) => x.year === year && x.offence === o && x.group === g);
    if (!r) throw new Error(`Chapter 5.1: no count for ${o}, ${g}, ${year}`);
    return r.persons;
  };

  const groups = DK_ORDER;
  const byGroup = <T,>(f: (g: DkGroup) => T) => Object.fromEntries(groups.map((g) => [g, f(g)])) as Record<DkGroup, T>;
  const population = byGroup((g) => years.map((y) => meanPopulation(jan1(y, g), jan1(y + 1, g))));
  const persons = { straffelov: byGroup((g) => years.map((y) => count(y, 'straffelov', g))), vold: byGroup((g) => years.map((y) => count(y, 'vold', g))) };
  const rates = {
    straffelov: byGroup((g) => years.map((_, i) => per1000(persons.straffelov[g][i], population[g][i]))),
    vold: byGroup((g) => years.map((_, i) => per1000(persons.vold[g][i], population[g][i]))),
  };
  return { years, firstYear, lastYear, rates, persons, population, populationJan1 };
}

/** A group's rate divided by the whole population's rate, in one year (unrounded). */
export function ratioToAll(k: Kap11, o: DkOffence, g: DkGroup, year: number): number {
  const i = k.years.indexOf(year);
  if (i < 0) throw new Error(`Chapter 5.1: no year ${year}`);
  const r = ratioToComparison(k.rates[o][g][i], k.rates[o].alla[i]);
  if (r === null) throw new Error('Chapter 5.1: ratio missing');
  return r;
}

export function rateAt(k: Kap11, o: DkOffence, g: DkGroup, year: number): number {
  const i = k.years.indexOf(year);
  if (i < 0) throw new Error(`Chapter 5.1: no year ${year}`);
  return k.rates[o][g][i];
}

/** The line chart for one offence: every group per 1,000, the whole population dashed. */
export function buildKap11Spec(k: Kap11, o: DkOffence, lang: Lang): LineChartSpec {
  const last = k.lastYear;
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const series: LineSeries[] = DK_ORDER.map((g) => {
    const s = DK_STYLE[g];
    return {
      id: g,
      label: pick(s.label, lang),
      endLabel: pick(s.endLabel, lang),
      endLabelShort: '',
      color: s.color,
      textColor: s.textColor,
      strokeWidth: s.strokeWidth,
      dashed: s.dashed,
      dotRadius: s.dashed ? 2.5 : 3,
      values: k.rates[o][g],
      // The first year's value is printed only on the main chart; on the violence chart it would sit on the axis labels.
      annotate: g === 'eftk_ikkevest' && o === 'straffelov' ? [k.firstYear] : undefined,
      format: 'num1',
    };
  });
  const top = rateAt(k, o, 'eftk_ikkevest', last);
  const all = rateAt(k, o, 'alla', last);
  return {
    lang,
    years: k.years,
    series,
    yFormat: 'num1',
    ariaLabel: tr(
      lang,
      `Linjediagram. Lagförda för ${OFFENCE_NAME[o].sv} i Danmark per 1 000 invånare 15–79 år, efter ursprung, ${k.firstYear} till ${last}. ` +
        `År ${last}: ${n1(top)} bland barn till invandrare från icke-västliga länder och ${n1(all)} i hela befolkningen.`,
      `Line chart. People convicted of ${OFFENCE_NAME[o].en} in Denmark per 1,000 residents aged 15–79, by origin, ${k.firstYear} to ${last}. ` +
        `In ${last}: ${n1(top)} among descendants of immigrants from non-Western countries and ${n1(all)} in the whole population.`,
      {
        da:
          `Kurvediagram. Dømte for ${OFFENCE_NAME[o].da} i Danmark pr. 1.000 indbyggere 15–79 år, efter herkomst, ${k.firstYear} til ${last}. ` +
          `I ${last}: ${n1(top)} blandt efterkommere fra ikke-vestlige lande og ${n1(all)} i hele befolkningen.`,
      },
    ),
  };
}

/** Column name parts in the CSV files, per group and offence. */
export const DK_CSV: Record<DkGroup, Record<BaseLang, string>> = {
  alla: { sv: 'hela_befolkningen', en: 'whole_population' },
  dansk: { sv: 'dansk_ursprung', en: 'danish_origin' },
  indv_vest: { sv: 'invandrare_vastliga', en: 'immigrants_western' },
  indv_ikkevest: { sv: 'invandrare_icke_vastliga', en: 'immigrants_non_western' },
  eftk_vest: { sv: 'barn_till_invandrare_vastliga', en: 'descendants_western' },
  eftk_ikkevest: { sv: 'barn_till_invandrare_icke_vastliga', en: 'descendants_non_western' },
};
export const DK_OFFENCE_CSV: Record<DkOffence, Record<BaseLang, string>> = { straffelov: { sv: 'strafflagen', en: 'criminal_code' }, vold: { sv: 'vald', en: 'violence' } };

/** The tables on the chapter 5.1 table page, from the same values as the charts. */
export function kap11Tables(k: Kap11, lang: BaseLang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const period = `${k.firstYear}–${k.lastYear}`;
  const yearRows = (cells: (i: number) => (number | null)[]) => k.years.map((y, i) => ({ key: String(y), cells: cells(i) }));

  const rateTable = (o: DkOffence): DataTable => ({
    id: `kap11-${o}-per1000`,
    caption: T(
      `Lagförda för ${OFFENCE_NAME[o].sv} per 1 000 invånare 15–79 år, efter ursprung, ${period}.`,
      `People convicted of ${OFFENCE_NAME[o].en} per 1,000 residents aged 15–79, by origin, ${period}.`,
    ),
    rowLabel: T('År', 'Year'),
    rowCsv: T('ar', 'year'),
    columns: DK_ORDER.map((g) => ({ kind: 'number' as const, label: groupLabel(g, lang), csv: `${DK_OFFENCE_CSV[o][lang]}_${DK_CSV[g][lang]}_per1000`, decimals: 1 })),
    rows: yearRows((i) => DK_ORDER.map((g) => k.rates[o][g][i])),
  });
  const countTable = (o: DkOffence): DataTable => ({
    id: `kap11-${o}-antal`,
    caption: T(`Antal lagförda för ${OFFENCE_NAME[o].sv}, 15–79 år, efter ursprung, ${period}.`, `Number of people convicted of ${OFFENCE_NAME[o].en}, aged 15–79, by origin, ${period}.`),
    rowLabel: T('År', 'Year'),
    rowCsv: T('ar', 'year'),
    columns: DK_ORDER.map((g) => ({ kind: 'number' as const, label: groupLabel(g, lang), csv: `${DK_OFFENCE_CSV[o][lang]}_${DK_CSV[g][lang]}_${T('antal', 'count')}`, decimals: 0 })),
    rows: yearRows((i) => DK_ORDER.map((g) => k.persons[o][g][i])),
  });
  const popYears = [...k.populationJan1.keys()].sort((a, b) => a - b);
  const popTable: DataTable = {
    id: 'kap11-befolkning',
    caption: T(
      `Befolkningen 15–79 år den 1 januari, efter ursprung, ${popYears[0]}–${popYears[popYears.length - 1]}. Antal personer.`,
      `Population aged 15–79 on 1 January, by origin, ${popYears[0]}–${popYears[popYears.length - 1]}. Number of people.`,
    ),
    rowLabel: T('År', 'Year'),
    rowCsv: T('ar', 'year'),
    columns: DK_ORDER.map((g) => ({ kind: 'number' as const, label: groupLabel(g, lang), csv: `${T('befolkning_1jan', 'population_1jan')}_${DK_CSV[g][lang]}`, decimals: 0 })),
    rows: popYears.map((y) => ({ key: String(y), cells: DK_ORDER.map((g) => k.populationJan1.get(y)?.[g] ?? null) })),
  };
  return [rateTable('straffelov'), rateTable('vold'), countTable('straffelov'), countTable('vold'), popTable];
}
