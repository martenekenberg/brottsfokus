// Chapter 6.2: people suspected of crime in Finland by age, origin and sex, in the latest year
// (Statistics Finland, table 13zk). Comparing within each age group removes most of the effect of
// the groups' different ages. Shared by the charts, the table page and the number checklist.
import type { FiAge, FiOrigin, FiSex } from '../data';
import type { BarChartSpec, BarKind } from '../charts/bar';
import { formatNumber } from '../format';
import { pick, tr, type BaseLang, type Lang, type Text } from '../i18n';
import type { DataTable } from '../tables';
import { fiLabel, fiPersons, fiRate, FI_CSV, FI_SEX_CSV, type Kap13 } from './kap13';

export type Sex = 'man' | 'kvinnor';

/** Age groups in the chart, youngest first. Under 15 is left out: children cannot be prosecuted in Finland. */
export const AGES: Exclude<FiAge, 'alla' | '0-14'>[] = ['15-17', '18-20', '21-24', '25-29', '30-39', '40-49', '50-59', '60-69', '70-'];

/** The three groups in each age group: the comparison group first, as an outlined grey bar. */
export const AGE_GROUPS: FiOrigin[] = ['fi_fodd_fi', 'utl_fodd_utl', 'utl_fodd_fi'];
export const AGE_KIND: Record<string, BarKind> = { fi_fodd_fi: 'comparison', utl_fodd_utl: 'focus', utl_fodd_fi: 'second' };

/**
 * A rate built on fewer suspects than this is left out of the chart (shown as a gap and said so in the note),
 * because one person more or less moves it a lot. The table page still shows it, with the count.
 */
export const MIN_PERSONS = 20;

export function ageLabel(a: (typeof AGES)[number] | 'alla', lang: Lang): string {
  if (a === 'alla') return tr(lang, 'Alla åldrar', 'All ages', { fi: 'Kaikki ikäryhmät' });
  if (a === '70-') return tr(lang, '70 år och äldre', '70 and over', { fi: '70 vuotta täyttäneet' });
  const span = a.replace('-', '–');
  return tr(lang, `${span} år`, span, { fi: `${span}-vuotiaat` });
}

export const SEX_LABEL: Record<Sex, Text> = { man: { sv: 'Män', en: 'Men', fi: 'Miehet' }, kvinnor: { sv: 'Kvinnor', en: 'Women', fi: 'Naiset' } };

/** The latest year in the data, which the chapter shows. */
export function ageYear(k: Kap13): number {
  return k.lastYear;
}

/** True if a rate rests on enough suspects to be shown in the chart. */
export function shown(k: Kap13, sex: Sex, age: FiAge, origin: FiOrigin): boolean {
  return fiPersons(k, ageYear(k), origin, sex, age) >= MIN_PERSONS;
}

/** A group's rate divided by the rate for people with a Finnish background born in Finland, same sex and age. Unrounded. */
export function ageRatio(k: Kap13, sex: Sex, age: FiAge, origin: FiOrigin): number {
  const y = ageYear(k);
  return fiRate(k, y, origin, sex, age) / fiRate(k, y, 'fi_fodd_fi', sex, age);
}

/** Grouped bars: one group per age, one bar per origin group, per 1,000 residents. */
export function buildKap14Spec(k: Kap13, sex: Sex, lang: Lang): BarChartSpec {
  const y = ageYear(k);
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const who = pick(SEX_LABEL[sex], lang).toLowerCase();
  const peak = (o: FiOrigin) => AGES.filter((a) => shown(k, sex, a, o)).reduce((best, a) => (fiRate(k, y, o, sex, a) > fiRate(k, y, o, sex, best) ? a : best), AGES[0]);
  const p = peak('utl_fodd_fi');
  return {
    lang,
    format: 'num1',
    hideBarLabels: true,
    groups: AGES.map((a) => ({
      label: ageLabel(a, lang),
      bars: AGE_GROUPS.filter((o) => shown(k, sex, a, o)).map((o) => ({ label: fiLabel(o, lang), value: fiRate(k, y, o, sex, a), kind: AGE_KIND[o] })),
    })),
    ariaLabel: tr(
      lang,
      `Stapeldiagram. Misstänkta för brott mot strafflagen i Finland ${y} per 1 000 ${who} i varje åldersgrupp, efter bakgrund. Högst för ${who} med utländsk bakgrund födda i Finland i åldern ${ageLabel(p, 'sv')}: ${n1(fiRate(k, y, 'utl_fodd_fi', sex, p))}, mot ${n1(fiRate(k, y, 'fi_fodd_fi', sex, p))} för ${who} med finländsk bakgrund födda i Finland.`,
      `Bar chart. ${pick(SEX_LABEL[sex], 'en')} suspected of criminal code offences in Finland, ${y}, per 1,000 in each age group, by origin. Highest for ${who} with a foreign background born in Finland aged ${ageLabel(p, 'en')}: ${n1(fiRate(k, y, 'utl_fodd_fi', sex, p))}, against ${n1(fiRate(k, y, 'fi_fodd_fi', sex, p))} for ${who} with a Finnish background born in Finland.`,
      {
        fi: `Pylväskaavio. Rikoslain rikoksista epäillyt ${who} Suomessa vuonna ${y}, 1 000 samanikäistä kohden, syntyperän mukaan. Suurin luku on Suomessa syntyneillä ulkomaalaistaustaisilla (${ageLabel(p, 'fi')}): ${n1(fiRate(k, y, 'utl_fodd_fi', sex, p))}, kun Suomessa syntyneillä suomalaistaustaisilla se on ${n1(fiRate(k, y, 'fi_fodd_fi', sex, p))}.`,
      },
    ),
  };
}

/** The tables on the chapter 6.2 table page: per 1,000 and number of suspects, by age, for men and women. */
export function kap14Tables(k: Kap13, lang: BaseLang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const y = ageYear(k);
  const ages: ((typeof AGES)[number] | 'alla')[] = [...AGES, 'alla'];
  const sexes: FiSex[] = ['man', 'kvinnor'];
  const rateTable = (sex: Sex): DataTable => ({
    id: `kap14-per1000-${sex}`,
    caption: T(
      `${SEX_LABEL[sex].sv} misstänkta för brott mot strafflagen ${y}, per 1 000 i varje åldersgrupp, efter bakgrund.`,
      `${SEX_LABEL[sex].en} suspected of criminal code offences, ${y}, per 1,000 in each age group, by origin.`,
    ),
    rowLabel: T('Ålder', 'Age'),
    rowCsv: T('alder', 'age'),
    columns: AGE_GROUPS.map((o) => ({ kind: 'number' as const, label: fiLabel(o, lang), csv: `${FI_SEX_CSV[sex][lang]}_${FI_CSV[o][lang]}_per1000`, decimals: 2 })),
    rows: ages.map((a) => ({ key: ageLabel(a, lang), cells: AGE_GROUPS.map((o) => fiRate(k, y, o, sex, a)) })),
  });
  const countTable = (sex: Sex): DataTable => ({
    id: `kap14-antal-${sex}`,
    caption: T(
      `Antal ${SEX_LABEL[sex].sv.toLowerCase()} misstänkta för brott mot strafflagen ${y}, efter ålder och bakgrund. Varje person räknas en gång.`,
      `Number of ${SEX_LABEL[sex].en.toLowerCase()} suspected of criminal code offences, ${y}, by age and origin. Each person is counted once.`,
    ),
    rowLabel: T('Ålder', 'Age'),
    rowCsv: T('alder', 'age'),
    columns: AGE_GROUPS.map((o) => ({ kind: 'number' as const, label: fiLabel(o, lang), csv: `${FI_SEX_CSV[sex][lang]}_${FI_CSV[o][lang]}_${T('antal', 'count')}`, decimals: 0 })),
    rows: ages.map((a) => ({ key: ageLabel(a, lang), cells: AGE_GROUPS.map((o) => fiPersons(k, y, o, sex, a)) })),
  });
  return [...sexes.map((s) => rateTable(s as Sex)), ...sexes.map((s) => countTable(s as Sex))];
}
