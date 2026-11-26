// Part 7: people charged in Norway by immigrant background (SSB, table 3, yearly average 2021–2023).
// Chapter 7.1 (kap15) shows the immigrant categories, country groups and world regions; chapter 7.2 (kap16)
// single countries. Every rate and ratio is SSB's own; nothing is recalculated here.
// Shared by the charts, the table pages and the number checklist.
import type { NoCategory, NoChargedRow, NoRegion } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { formatNumber } from '../format';
import { pick, tr, type BaseLang, type Lang, type Text } from '../i18n';
import { csvNumber, longCsv, type DataTable } from '../tables';

export interface NoData {
  /** "2021–2023". */
  period: string;
  rows: NoChargedRow[];
}

export function buildNo(rows: NoChargedRow[]): NoData {
  return { period: rows[0].period.replace('-', '–'), rows };
}

export type Measure = 'all' | 'men15_24';

/** SSB's names for its groups, in Swedish, English and Norwegian (Bokmål). */
export const NO_CATEGORY_LABEL: Record<'ovrige' | 'innvandrere' | 'norskfodte', Text> = {
  ovrige: { sv: 'Övriga befolkningen', en: 'Rest of the population', nb: 'Befolkningen ellers' },
  innvandrere: { sv: 'Invandrare', en: 'Immigrants', nb: 'Innvandrere' },
  norskfodte: { sv: 'Barn till två invandrare, födda i Norge', en: 'Norwegian-born to immigrant parents', nb: 'Norskfødte med innvandrerforeldre' },
};

export const NO_REGION_LABEL: Record<NoRegion, Text> = {
  landgruppe1: { sv: 'Norden, EU/EFTA, Storbritannien, Nordamerika och Oceanien', en: 'Nordic countries, EU/EFTA, UK, North America and Oceania', nb: 'Norden, EU/EFTA, Storbritannia, Nord-Amerika og Oseania' },
  landgruppe2: { sv: 'Övriga Europa, Afrika, Asien och Latinamerika', en: 'Rest of Europe, Africa, Asia and Latin America', nb: 'Europa utenom EU/EFTA, Afrika, Asia og Latin-Amerika' },
  europa_ovrig: { sv: 'Europa utanför EU/EFTA och Storbritannien', en: 'Europe outside EU/EFTA and the UK', nb: 'Europa utenom EU/EFTA og Storbritannia' },
  afrika: { sv: 'Afrika', en: 'Africa', nb: 'Afrika' },
  asia: { sv: 'Asien', en: 'Asia', nb: 'Asia' },
  latinamerika: { sv: 'Latinamerika och Karibien', en: 'Latin America and the Caribbean', nb: 'Latin-Amerika og Karibia' },
};

/** Shorter names for the two country groups in the charts, where the full names do not fit. The note gives the full names. */
const NO_REGION_SHORT: Partial<Record<NoRegion, Text>> = {
  landgruppe1: { sv: 'EU/EFTA, Nordamerika m.fl.', en: 'EU/EFTA, North America etc.', nb: 'EU/EFTA, Nord-Amerika mfl.' },
  landgruppe2: { sv: 'Övriga länder', en: 'Other countries', nb: 'Andre land' },
};

/** Country names as SSB writes them (Norwegian), with Swedish and English names. */
export const NO_COUNTRY_LABEL: Record<string, { sv: string; en: string }> = {
  Danmark: { sv: 'Danmark', en: 'Denmark' },
  Island: { sv: 'Island', en: 'Iceland' },
  Sverige: { sv: 'Sverige', en: 'Sweden' },
  Bulgaria: { sv: 'Bulgarien', en: 'Bulgaria' },
  Latvia: { sv: 'Lettland', en: 'Latvia' },
  Polen: { sv: 'Polen', en: 'Poland' },
  Romania: { sv: 'Rumänien', en: 'Romania' },
  Litauen: { sv: 'Litauen', en: 'Lithuania' },
  Storbritannia: { sv: 'Storbritannien', en: 'United Kingdom' },
  Russland: { sv: 'Ryssland', en: 'Russia' },
  Tyrkia: { sv: 'Turkiet', en: 'Turkey' },
  Tyskland: { sv: 'Tyskland', en: 'Germany' },
  Kosovo: { sv: 'Kosovo', en: 'Kosovo' },
  Eritrea: { sv: 'Eritrea', en: 'Eritrea' },
  Etiopia: { sv: 'Etiopien', en: 'Ethiopia' },
  Marokko: { sv: 'Marocko', en: 'Morocco' },
  Somalia: { sv: 'Somalia', en: 'Somalia' },
  Sudan: { sv: 'Sudan', en: 'Sudan' },
  Afghanistan: { sv: 'Afghanistan', en: 'Afghanistan' },
  Filippinene: { sv: 'Filippinerna', en: 'Philippines' },
  Irak: { sv: 'Irak', en: 'Iraq' },
  Iran: { sv: 'Iran', en: 'Iran' },
  Palestina: { sv: 'Palestina', en: 'Palestine' },
  Pakistan: { sv: 'Pakistan', en: 'Pakistan' },
  Syria: { sv: 'Syrien', en: 'Syria' },
  Thailand: { sv: 'Thailand', en: 'Thailand' },
  Vietnam: { sv: 'Vietnam', en: 'Vietnam' },
  Ukraina: { sv: 'Ukraina', en: 'Ukraine' },
  Kongo: { sv: 'Kongo', en: 'Congo' },
  Serbia: { sv: 'Serbien', en: 'Serbia' },
};

export function countryLabel(no: string, lang: Lang): string {
  const c = NO_COUNTRY_LABEL[no];
  if (!c) throw new Error(`Part 7: no name for country ${no}`);
  return tr(lang, c.sv, c.en, { nb: no });
}

export function row(d: NoData, level: NoChargedRow['level'], category: NoCategory, group: string): NoChargedRow {
  const r = d.rows.find((x) => x.level === level && x.category === category && x.group === group);
  if (!r) throw new Error(`Part 7: no row for ${level}, ${category}, ${group}`);
  return r;
}

/** The row for an immigrant category as a whole. */
export function catRow(d: NoData, c: 'ovrige' | 'innvandrere' | 'norskfodte'): NoChargedRow {
  return row(d, 'bakgrunn', c, c);
}

/** SSB's rate per 1,000 for a row and measure, or null where SSB gives none. */
export function rateOf(r: NoChargedRow, m: Measure): number | null {
  return m === 'all' ? r.per1000 : r.men15_24Per1000;
}

/** SSB's ratio to the rest of the population for a row and measure, or null where SSB gives none. */
export function ratioOf(r: NoChargedRow, m: Measure): number | null {
  return m === 'all' ? r.ratio : r.men15_24Ratio;
}

/** The same, for values the page text relies on: stops the build if the value is missing. */
export function need(v: number | null, what: string): number {
  if (v === null) throw new Error(`Part 7: ${what} is missing`);
  return v;
}

/** Groups in the chapter 7.1 chart: all country backgrounds, the two country groups, and the four regions. */
export const NO_CHART_GROUPS: ('alle' | NoRegion)[] = ['alle', 'landgruppe1', 'landgruppe2', 'europa_ovrig', 'afrika', 'asia', 'latinamerika'];

function groupLabel(g: 'alle' | NoRegion, lang: Lang): string {
  return g === 'alle' ? tr(lang, 'Alla landbakgrunder', 'All country backgrounds', { nb: 'All landbakgrunn' }) : pick(NO_REGION_SHORT[g] ?? NO_REGION_LABEL[g], lang);
}

function groupRow(d: NoData, c: 'innvandrere' | 'norskfodte', g: 'alle' | NoRegion): NoChargedRow {
  return g === 'alle' ? catRow(d, c) : row(d, 'region', c, g);
}

/** The line at the rest of the population's rate. */
function refLine(d: NoData, m: Measure, lang: Lang): { value: number; label: string } {
  const v = need(rateOf(catRow(d, 'ovrige'), m), 'the rest of the population’s rate');
  return {
    value: v,
    label: tr(lang, `Övriga befolkningen: ${formatNumber(v, 1, lang)}`, `Rest of the population: ${formatNumber(v, 1, lang)}`, { nb: `Befolkningen ellers: ${formatNumber(v, 1, lang)}` }),
  };
}

/** Chapter 7.1: immigrants (blue) and Norwegian-born to immigrant parents (orange) by country group, per 1,000. */
export function buildKap15Spec(d: NoData, m: Measure, lang: Lang): BarChartSpec {
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const imm = need(rateOf(catRow(d, 'innvandrere'), m), 'immigrants’ rate');
  const nor = need(rateOf(catRow(d, 'norskfodte'), m), 'Norwegian-born rate');
  const ref = refLine(d, m, lang);
  const men = m === 'men15_24';
  return {
    lang,
    format: 'num1',
    hideBarLabels: true,
    ref,
    groups: NO_CHART_GROUPS.map((g) => ({
      label: groupLabel(g, lang),
      bars: (['innvandrere', 'norskfodte'] as const).flatMap((c) => {
        const v = rateOf(groupRow(d, c, g), m);
        return v === null ? [] : [{ label: pick(NO_CATEGORY_LABEL[c], lang), value: v, kind: c === 'innvandrere' ? ('focus' as const) : ('second' as const) }];
      }),
    })),
    ariaLabel: tr(
      lang,
      `Stapeldiagram. Misstänkta (siktade) i Norge per 1 000 ${men ? 'män 15–24 år' : 'invånare'}, årligt genomsnitt ${d.period}, efter landbakgrund. Invandrare ${n1(imm)}, barn till två invandrare födda i Norge ${n1(nor)}, övriga befolkningen ${n1(ref.value)}.`,
      `Bar chart. People charged in Norway per 1,000 ${men ? 'men aged 15–24' : 'residents'}, yearly average ${d.period}, by country background. Immigrants ${n1(imm)}, Norwegian-born to immigrant parents ${n1(nor)}, rest of the population ${n1(ref.value)}.`,
      {
        nb: `Stolpediagram. Siktede i Norge per 1000 ${men ? 'menn 15–24 år' : 'innbyggere'}, årlig gjennomsnitt ${d.period}, etter landbakgrunn. Innvandrere ${n1(imm)}, norskfødte med innvandrerforeldre ${n1(nor)}, befolkningen ellers ${n1(ref.value)}.`,
      },
    ),
  };
}

/** Countries for a category, highest rate first. Countries where SSB gives no rate are left out. */
export function countriesByRate(d: NoData, c: 'innvandrere' | 'norskfodte'): NoChargedRow[] {
  return d.rows
    .filter((r) => r.level === 'land' && r.category === c && r.per1000 !== null)
    .sort((a, b) => (b.per1000 as number) - (a.per1000 as number));
}

/** Chapter 7.2: one bar per country, highest first, with the rest of the population's rate as a dashed line. */
export function buildKap16Spec(d: NoData, c: 'innvandrere' | 'norskfodte', lang: Lang): BarChartSpec {
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const list = countriesByRate(d, c);
  const ref = refLine(d, 'all', lang);
  const top = list[0];
  const bottom = list[list.length - 1];
  const who = pick(NO_CATEGORY_LABEL[c], lang).toLowerCase();
  return {
    lang,
    format: 'num1',
    ref,
    groups: list.map((r) => ({ label: countryLabel(r.group, lang), bars: [{ label: '', value: r.per1000 as number, kind: c === 'innvandrere' ? 'focus' : 'second' }] })),
    ariaLabel: tr(
      lang,
      `Stapeldiagram. Misstänkta (siktade) i Norge per 1 000 invånare, årligt genomsnitt ${d.period}, ${who} efter landbakgrund. Högst ${countryLabel(top.group, 'sv')} med ${n1(top.per1000 as number)}, lägst ${countryLabel(bottom.group, 'sv')} med ${n1(bottom.per1000 as number)}. Övriga befolkningen ${n1(ref.value)}.`,
      `Bar chart. People charged in Norway per 1,000 residents, yearly average ${d.period}, ${who} by country background. Highest ${countryLabel(top.group, 'en')} at ${n1(top.per1000 as number)}, lowest ${countryLabel(bottom.group, 'en')} at ${n1(bottom.per1000 as number)}. Rest of the population ${n1(ref.value)}.`,
      {
        nb: `Stolpediagram. Siktede i Norge per 1000 innbyggere, årlig gjennomsnitt ${d.period}, ${who} etter landbakgrunn. Høyest ${top.group} med ${n1(top.per1000 as number)}, lavest ${bottom.group} med ${n1(bottom.per1000 as number)}. Befolkningen ellers ${n1(ref.value)}.`,
      },
    ),
  };
}

const CAT_CSV: Record<'ovrige' | 'innvandrere' | 'norskfodte', Record<BaseLang, string>> = {
  ovrige: { sv: 'ovriga_befolkningen', en: 'rest_of_population' },
  innvandrere: { sv: 'invandrare', en: 'immigrants' },
  norskfodte: { sv: 'barn_till_tva_invandrare', en: 'norwegian_born_immigrant_parents' },
};

/** Columns shared by the two table pages: count, rate and SSB's ratio, for everyone and for men aged 15–24. */
export const NO_COLUMNS: { key: keyof NoChargedRow; label: Record<BaseLang, string>; csv: Record<BaseLang, string>; decimals: number }[] = [
  { key: 'persons', label: { sv: 'Antal, årligt genomsnitt', en: 'Number, yearly average' }, csv: { sv: 'antal', en: 'count' }, decimals: 0 },
  { key: 'per1000', label: { sv: 'Per 1 000 invånare', en: 'Per 1,000 residents' }, csv: { sv: 'per1000', en: 'per1000' }, decimals: 1 },
  { key: 'ratio', label: { sv: 'Gånger övriga befolkningen', en: 'Times the rest of the population' }, csv: { sv: 'ganger_ovriga', en: 'times_rest' }, decimals: 2 },
  { key: 'men15_24Persons', label: { sv: 'Män 15–24 år, antal', en: 'Men aged 15–24, number' }, csv: { sv: 'man_15_24_antal', en: 'men_15_24_count' }, decimals: 0 },
  { key: 'men15_24Per1000', label: { sv: 'Män 15–24 år, per 1 000', en: 'Men aged 15–24, per 1,000' }, csv: { sv: 'man_15_24_per1000', en: 'men_15_24_per1000' }, decimals: 1 },
  { key: 'men15_24Ratio', label: { sv: 'Män 15–24 år, gånger övriga', en: 'Men aged 15–24, times the rest' }, csv: { sv: 'man_15_24_ganger_ovriga', en: 'men_15_24_times_rest' }, decimals: 2 },
];

function rowTable(id: string, caption: string, rowLabel: string, rowCsv: string, rows: { key: string; r: NoChargedRow }[], lang: BaseLang): DataTable {
  return {
    id,
    caption,
    rowLabel,
    rowCsv,
    columns: NO_COLUMNS.map((c) => ({ kind: 'number' as const, label: c.label[lang], csv: c.csv[lang], decimals: c.decimals })),
    rows: rows.map(({ key, r }) => ({ key, cells: NO_COLUMNS.map((c) => r[c.key] as number | null) })),
  };
}

/** Table page for 7.1: the categories, and the country groups and regions for immigrants and Norwegian-born. */
export function kap15Tables(d: NoData, lang: BaseLang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const cats = (['ovrige', 'innvandrere', 'norskfodte'] as const).map((c) => ({ key: NO_CATEGORY_LABEL[c][lang], r: catRow(d, c) }));
  const regions = (c: 'innvandrere' | 'norskfodte') =>
    rowTable(
      `kap15-${c}`,
      T(
        `${NO_CATEGORY_LABEL[c].sv} efter landbakgrund: misstänkta (siktade) i Norge, årligt genomsnitt ${d.period}.`,
        `${NO_CATEGORY_LABEL[c].en} by country background: people charged in Norway, yearly average ${d.period}.`,
      ),
      T('Landbakgrund', 'Country background'),
      T(`landbakgrund_${CAT_CSV[c].sv}`, `country_background_${CAT_CSV[c].en}`),
      (['landgruppe1', 'landgruppe2', 'europa_ovrig', 'afrika', 'asia', 'latinamerika'] as NoRegion[]).map((g) => ({ key: NO_REGION_LABEL[g][lang], r: row(d, 'region', c, g) })),
      lang,
    );
  return [
    rowTable('kap15-grupper', T(`Misstänkta (siktade) i Norge efter invandringsbakgrund, årligt genomsnitt ${d.period}.`, `People charged in Norway by immigrant background, yearly average ${d.period}.`), T('Grupp', 'Group'), T('grupp', 'group'), cats, lang),
    regions('innvandrere'),
    regions('norskfodte'),
  ];
}

/** Table page for 7.2: every country SSB lists, for immigrants and for Norwegian-born, highest rate first. */
export function kap16Tables(d: NoData, lang: BaseLang): DataTable[] {
  const T = (sv: string, en: string) => tr(lang, sv, en);
  const list = (c: 'innvandrere' | 'norskfodte') =>
    d.rows
      .filter((r) => r.level === 'land' && r.category === c)
      .sort((a, b) => (b.per1000 ?? -1) - (a.per1000 ?? -1))
      .map((r) => ({ key: countryLabel(r.group, lang), r }));
  return (['innvandrere', 'norskfodte'] as const).map((c) =>
    rowTable(
      `kap16-${c}`,
      T(`${NO_CATEGORY_LABEL[c].sv} efter land: misstänkta (siktade) i Norge, årligt genomsnitt ${d.period}.`, `${NO_CATEGORY_LABEL[c].en} by country: people charged in Norway, yearly average ${d.period}.`),
      T('Land', 'Country'),
      T(`land_${CAT_CSV[c].sv}`, `country_${CAT_CSV[c].en}`),
      list(c),
      lang,
    ),
  );
}

/** CSV columns before the measures: the category and the group (country group, region or country). */
export const NO_CSV_LEAD: { sv: string; en: string }[] = [
  { sv: 'kategori', en: 'category' },
  { sv: 'grupp', en: 'group' },
];

/** The table page's CSV file in long format: one row per category and group, the same values as the tables. */
export function noCsv(d: NoData, chapterId: 'kap15' | 'kap16', lang: BaseLang): string {
  const lines: string[][] = [];
  const add = (c: 'ovrige' | 'innvandrere' | 'norskfodte', group: string, r: NoChargedRow) =>
    lines.push([NO_CATEGORY_LABEL[c][lang], group, ...NO_COLUMNS.map((col) => csvNumber(r[col.key] as number | null, col.decimals))]);
  if (chapterId === 'kap15') {
    for (const c of ['ovrige', 'innvandrere', 'norskfodte'] as const) add(c, tr(lang, 'Alla', 'All'), catRow(d, c));
    for (const c of ['innvandrere', 'norskfodte'] as const) {
      for (const g of ['landgruppe1', 'landgruppe2', 'europa_ovrig', 'afrika', 'asia', 'latinamerika'] as NoRegion[]) add(c, NO_REGION_LABEL[g][lang], row(d, 'region', c, g));
    }
  } else {
    for (const c of ['innvandrere', 'norskfodte'] as const) {
      for (const r of d.rows.filter((x) => x.level === 'land' && x.category === c)) add(c, countryLabel(r.group, lang), r);
    }
  }
  return longCsv([...NO_CSV_LEAD.map((x) => x[lang]), ...NO_COLUMNS.map((c) => c.csv[lang])], lines);
}
