// Chapter 6.1: people suspected of crime in Finland, by origin, per 1,000 residents, 2000 onwards.
// From Statistics Finland's table 13zk: suspects of solved criminal code offences, each counted once a year,
// with Statistics Finland's own rate per 10,000 residents in the group (shown here per 1,000).
// Shared by the charts, the table pages and the number checklist, so all show the same numbers.
import { per1000FromPer10000, ratioToComparison } from '../calc';
import type { FiAge, FiOrigin, FiSex, FiSuspectRow } from '../data';
import type { LineChartSpec, LineSeries } from '../charts/line';
import { formatNumber } from '../format';
import { pick, tr, type BaseLang, type Lang, type Text } from '../i18n';
import type { DataTable } from '../tables';

export interface Kap13 {
  years: number[];
  firstYear: number;
  lastYear: number;
  rows: FiSuspectRow[];
}

interface GroupStyle {
  label: Text;
  endLabel: Text;
  color: string;
  textColor: string;
  strokeWidth: number;
  dashed?: boolean;
}

/** The groups in the line chart, in legend order; the whole population last. */
export const FI_CHART: FiOrigin[] = ['utl_fodd_utl', 'utl_fodd_fi', 'fi_fodd_fi', 'alla'];
/** All groups with a rate, for the tables. */
export const FI_TABLE: FiOrigin[] = ['alla', 'fi', 'fi_fodd_fi', 'fi_fodd_utl', 'utl', 'utl_fodd_utl', 'utl_fodd_fi'];

/** Group names. Statistics Finland's own terms: "suomalaistaustainen" (Finnish background), "ulkomaalaistaustainen" (foreign background). */
export const FI_LABEL: Record<FiOrigin, Text> = {
  alla: { sv: 'Hela befolkningen', en: 'Whole population', fi: 'Koko väestö' },
  fi: { sv: 'Finländsk bakgrund, alla', en: 'Finnish background, all', fi: 'Suomalaistaustaiset yhteensä' },
  fi_fodd_fi: { sv: 'Finländsk bakgrund, födda i Finland', en: 'Finnish background, born in Finland', fi: 'Suomalaistaustaiset, syntyneet Suomessa' },
  fi_fodd_utl: { sv: 'Finländsk bakgrund, födda utomlands', en: 'Finnish background, born abroad', fi: 'Suomalaistaustaiset, syntyneet ulkomailla' },
  utl: { sv: 'Utländsk bakgrund, alla', en: 'Foreign background, all', fi: 'Ulkomaalaistaustaiset yhteensä' },
  utl_fodd_utl: { sv: 'Utländsk bakgrund, födda utomlands', en: 'Foreign background, born abroad', fi: 'Ulkomaalaistaustaiset, syntyneet ulkomailla' },
  utl_fodd_fi: { sv: 'Utländsk bakgrund, födda i Finland', en: 'Foreign background, born in Finland', fi: 'Ulkomaalaistaustaiset, syntyneet Suomessa' },
  okand: { sv: 'Okänd bakgrund', en: 'Origin unknown', fi: 'Syntyperä tuntematon' },
};

export const FI_STYLE: Record<'utl_fodd_utl' | 'utl_fodd_fi' | 'fi_fodd_fi' | 'alla', GroupStyle> = {
  utl_fodd_utl: {
    label: FI_LABEL.utl_fodd_utl,
    endLabel: { sv: 'utländsk bakgrund, födda utomlands', en: 'foreign background, born abroad', fi: 'ulkomaalaistaustaiset, ulkomailla syntyneet' },
    color: '#1D4E89',
    textColor: '#1D4E89',
    strokeWidth: 2.5,
  },
  utl_fodd_fi: {
    label: FI_LABEL.utl_fodd_fi,
    endLabel: { sv: 'utländsk bakgrund, födda i Finland', en: 'foreign background, born in Finland', fi: 'ulkomaalaistaustaiset, Suomessa syntyneet' },
    color: '#C2410C',
    textColor: '#C2410C',
    strokeWidth: 2.5,
  },
  fi_fodd_fi: {
    label: FI_LABEL.fi_fodd_fi,
    endLabel: { sv: 'finländsk bakgrund, födda i Finland', en: 'Finnish background, born in Finland', fi: 'suomalaistaustaiset, Suomessa syntyneet' },
    color: '#121212',
    textColor: '#121212',
    strokeWidth: 2,
  },
  alla: {
    label: FI_LABEL.alla,
    endLabel: { sv: 'hela befolkningen', en: 'whole population', fi: 'koko väestö' },
    color: '#8A8A8A',
    textColor: '#5C5C5C',
    strokeWidth: 2,
    dashed: true,
  },
};

export function fiLabel(o: FiOrigin, lang: Lang): string {
  return pick(FI_LABEL[o], lang);
}

export function buildKap13(rows: FiSuspectRow[]): Kap13 {
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  if (years.length !== lastYear - firstYear + 1) throw new Error('Chapter 6.1: a year is missing in tk_misstankta_ursprung.csv');
  return { years, firstYear, lastYear, rows };
}

function row(k: Kap13, year: number, origin: FiOrigin, sex: FiSex = 'alla', age: FiAge = 'alla'): FiSuspectRow {
  const r = k.rows.find((x) => x.year === year && x.sex === sex && x.age === age && x.origin === origin);
  if (!r) throw new Error(`Chapter 6.1: no row for ${year}, ${sex}, ${age}, ${origin}`);
  return r;
}

/** Suspects per 1,000 residents in the group (Statistics Finland's rate per 10,000, divided by 10). Unrounded. */
export function fiRate(k: Kap13, year: number, origin: FiOrigin, sex: FiSex = 'alla', age: FiAge = 'alla'): number {
  const v = row(k, year, origin, sex, age).per10000;
  if (v === null) throw new Error(`Chapter 6.1: no rate for ${year}, ${sex}, ${age}, ${origin}`);
  return per1000FromPer10000(v);
}

/** Number of suspects in the group. */
export function fiPersons(k: Kap13, year: number, origin: FiOrigin, sex: FiSex = 'alla', age: FiAge = 'alla'): number {
  return row(k, year, origin, sex, age).persons;
}

/** A group's rate divided by another group's (by default the whole population's), same year, sex and age. Unrounded. */
export function fiRatio(k: Kap13, year: number, origin: FiOrigin, base: FiOrigin = 'alla', sex: FiSex = 'alla', age: FiAge = 'alla'): number {
  const r = ratioToComparison(fiRate(k, year, origin, sex, age), fiRate(k, year, base, sex, age));
  if (r === null) throw new Error('Chapter 6.1: ratio missing');
  return r;
}

/** The line chart: suspects per 1,000 in each group, all ages and both sexes, the whole population dashed. */
export function buildKap13Spec(k: Kap13, lang: Lang): LineChartSpec {
  const last = k.lastYear;
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const series: LineSeries[] = FI_CHART.map((g) => {
    const s = FI_STYLE[g as keyof typeof FI_STYLE];
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
      values: k.years.map((y) => fiRate(k, y, g)),
      annotate: g === 'utl_fodd_utl' ? [k.firstYear] : undefined,
      format: 'num1',
    };
  });
  const top = fiRate(k, last, 'utl_fodd_utl');
  const all = fiRate(k, last, 'alla');
  return {
    lang,
    years: k.years,
    series,
    yFormat: 'num1',
    ariaLabel: tr(
      lang,
      `Linjediagram. Misstänkta för brott mot strafflagen i Finland per 1 000 invånare, efter bakgrund, ${k.firstYear} till ${last}. År ${last}: ${n1(top)} bland personer med utländsk bakgrund födda utomlands och ${n1(all)} i hela befolkningen.`,
      `Line chart. People suspected of criminal code offences in Finland per 1,000 residents, by origin, ${k.firstYear} to ${last}. In ${last}: ${n1(top)} among people with a foreign background born abroad and ${n1(all)} in the whole population.`,
      {
        fi: `Viivakaavio. Rikoslain rikoksista epäillyt Suomessa 1 000 asukasta kohden syntyperän mukaan, ${k.firstYear}–${last}. Vuonna ${last}: ${n1(top)} ulkomailla syntyneillä ulkomaalaistaustaisilla ja ${n1(all)} koko väestössä.`,
      },
    ),
  };
}

/** Column name parts in the CSV files, per group. */
export const FI_CSV: Record<FiOrigin, Record<BaseLang, string>> = {
  alla: { sv: 'hela_befolkningen', en: 'whole_population' },
  fi: { sv: 'finlandsk_bakgrund', en: 'finnish_background' },
  fi_fodd_fi: { sv: 'finlandsk_bakgrund_fodda_i_finland', en: 'finnish_background_born_in_finland' },
  fi_fodd_utl: { sv: 'finlandsk_bakgrund_fodda_utomlands', en: 'finnish_background_born_abroad' },
  utl: { sv: 'utlandsk_bakgrund', en: 'foreign_background' },
  utl_fodd_utl: { sv: 'utlandsk_bakgrund_fodda_utomlands', en: 'foreign_background_born_abroad' },
  utl_fodd_fi: { sv: 'utlandsk_bakgrund_fodda_i_finland', en: 'foreign_background_born_in_finland' },
  okand: { sv: 'okand_bakgrund', en: 'origin_unknown' },
};
export const FI_SEX_CSV: Record<FiSex, Record<BaseLang, string>> = {
  alla: { sv: 'alla', en: 'all' },
  man: { sv: 'man', en: 'men' },
  kvinnor: { sv: 'kvinnor', en: 'women' },
};
const SEX_TEXT: Record<FiSex, Record<BaseLang, string>> = {
  alla: { sv: 'båda könen', en: 'both sexes' },
  man: { sv: 'män', en: 'men' },
  kvinnor: { sv: 'kvinnor', en: 'women' },
};

/** The tables on the chapter 6.1 table page, from the same values as the chart. */
export function kap13Tables(k: Kap13, lang: BaseLang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const period = `${k.firstYear}–${k.lastYear}`;
  const rateTable = (sex: FiSex): DataTable => ({
    id: `kap13-per1000-${FI_SEX_CSV[sex].sv}`,
    caption: T(
      `Misstänkta för brott mot strafflagen per 1 000 invånare, alla åldrar, ${SEX_TEXT[sex].sv}, efter bakgrund, ${period}.`,
      `People suspected of criminal code offences per 1,000 residents, all ages, ${SEX_TEXT[sex].en}, by origin, ${period}.`,
    ),
    rowLabel: T('År', 'Year'),
    rowCsv: T('ar', 'year'),
    columns: FI_TABLE.map((o) => ({ kind: 'number' as const, label: fiLabel(o, lang), csv: `${FI_SEX_CSV[sex][lang]}_${FI_CSV[o][lang]}_per1000`, decimals: 2 })),
    rows: k.years.map((y) => ({ key: String(y), cells: FI_TABLE.map((o) => fiRate(k, y, o, sex)) })),
  });
  const origins: FiOrigin[] = [...FI_TABLE, 'okand'];
  const countTable: DataTable = {
    id: 'kap13-antal',
    caption: T(
      `Antal misstänkta för brott mot strafflagen, alla åldrar, båda könen, efter bakgrund, ${period}. Varje person räknas en gång per år.`,
      `Number of people suspected of criminal code offences, all ages, both sexes, by origin, ${period}. Each person is counted once a year.`,
    ),
    rowLabel: T('År', 'Year'),
    rowCsv: T('ar', 'year'),
    columns: origins.map((o) => ({ kind: 'number' as const, label: fiLabel(o, lang), csv: `${T('antal', 'count')}_${FI_CSV[o][lang]}`, decimals: 0 })),
    rows: k.years.map((y) => ({ key: String(y), cells: origins.map((o) => fiPersons(k, y, o)) })),
  };
  return [rateTable('alla'), rateTable('man'), rateTable('kvinnor'), countTable];
}
