// Chapter 8: homicide victims and perpetrators compared with the population, 2005–2021
// (Brå 2025:5). Shared by the main page, the table page and the number checklist.
import type { HomicideRow } from '../data';
import { barFmt, type BarChartSpec } from '../charts/bar';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type DataTable } from '../tables';

/** Rows shown in the charts (the others are mentioned in the notes). */
const BACKGROUND_IDS = ['utl', 'utr', 'sv2'];
const SOCIO_IDS = ['lagford', 'lagsta_decil', 'omrade', 'ensamstaende', 'forvarvsarbete'];

export function homicideItem(rows: HomicideRow[], id: string): HomicideRow {
  const r = rows.find((x) => x.itemId === id);
  if (!r) throw new Error(`dodligt_vald.csv: ${id} missing`);
  return r;
}

function complete(r: HomicideRow): { victims: number; perpetrators: number; population: number } {
  if (r.victims === null || r.perpetrators === null || r.population === null) throw new Error(`dodligt_vald.csv: ${r.itemId} is incomplete`);
  return { victims: r.victims, perpetrators: r.perpetrators, population: r.population };
}

export const SERIES = {
  victims: { sv: 'Offer', en: 'Victims' },
  perpetrators: { sv: 'Gärningspersoner', en: 'Perpetrators' },
  population: { sv: 'Befolkningen', en: 'Population' },
} as const;

function spec(rows: HomicideRow[], ids: string[], lang: Lang, intro: Record<Lang, string>): BarChartSpec {
  const groups = ids.map((id) => {
    const r = homicideItem(rows, id);
    const v = complete(r);
    return {
      label: dataLabel(r.item, lang),
      bars: [
        { label: SERIES.victims[lang], value: v.victims, kind: 'focus' as const },
        { label: SERIES.perpetrators[lang], value: v.perpetrators, kind: 'second' as const },
        { label: SERIES.population[lang], value: v.population, kind: 'comparison' as const },
      ],
    };
  });
  const pct = (v: number) => barFmt(v, 'pctSource', lang);
  return {
    lang,
    format: 'pctSource',
    xMax: 100,
    hideBarLabels: true,
    groups,
    ariaLabel:
      intro[lang] +
      groups
        .map((g) =>
          tr(
            lang,
            `${g.label}: offer ${pct(g.bars[0].value)}, gärningspersoner ${pct(g.bars[1].value)}, befolkningen ${pct(g.bars[2].value)}`,
            `${g.label}: victims ${pct(g.bars[0].value)}, perpetrators ${pct(g.bars[1].value)}, population ${pct(g.bars[2].value)}`,
          ),
        )
        .join('. ') +
      '.',
  };
}

export function buildBackgroundSpec(rows: HomicideRow[], lang: Lang): BarChartSpec {
  return spec(rows, BACKGROUND_IDS, lang, {
    sv: 'Stapeldiagram. Andel med olika bakgrund bland offer och gärningspersoner vid dödligt våld 2005–2021, jämfört med befolkningen. ',
    en: 'Bar chart. Share with different backgrounds among homicide victims and perpetrators in 2005–2021, compared with the population. ',
  });
}

export function buildSocioSpec(rows: HomicideRow[], lang: Lang): BarChartSpec {
  return spec(rows, SOCIO_IDS, lang, {
    sv: 'Stapeldiagram. Socioekonomisk situation och tidigare lagföringar bland offer och gärningspersoner vid dödligt våld 2005–2021, jämfört med befolkningen. ',
    en: 'Bar chart. Socio-economic situation and earlier convictions among homicide victims and perpetrators in 2005–2021, compared with the population. ',
  });
}

/** True if both victims and perpetrators had more than twice the population's share with a foreign background. */
export function moreThanTwiceForeign(rows: HomicideRow[]): boolean {
  const v = complete(homicideItem(rows, 'utl'));
  return v.victims > 2 * v.population && v.perpetrators > 2 * v.population;
}

/** True if victims and perpetrators fared worse than the population on every measure in the second chart. */
export function worseOnAll(rows: HomicideRow[]): boolean {
  return SOCIO_IDS.every((id) => {
    const v = complete(homicideItem(rows, id));
    // Employment is the one measure where a lower share is worse.
    return id === 'forvarvsarbete'
      ? v.victims < v.population && v.perpetrators < v.population
      : v.victims > v.population && v.perpetrators > v.population;
  });
}

const COLUMNS = (lang: Lang) => [
  { kind: 'number' as const, label: tr(lang, 'Offer (%)', 'Victims (%)'), csv: tr(lang, 'offer_pct', 'victims_pct'), decimals: 1 },
  { kind: 'number' as const, label: tr(lang, 'Gärningspersoner (%)', 'Perpetrators (%)'), csv: tr(lang, 'garningspersoner_pct', 'perpetrators_pct'), decimals: 1 },
  { kind: 'number' as const, label: tr(lang, 'Befolkningen (%)', 'Population (%)'), csv: tr(lang, 'befolkningen_pct', 'population_pct'), decimals: 1 },
  { kind: 'text' as const, label: tr(lang, 'Var i rapporten', 'Where in the report'), csv: tr(lang, 'kalla', 'source') },
];

/** "s. 13" in English is "p. 13". */
function sourceText(source: string, lang: Lang): string {
  if (lang === 'sv') return source;
  return source
    .replace(/ s\. /g, ' p. ')
    .replace(' och ', ' and ')
    .replace('figur', 'figure')
    .replace(' not ', ' note ')
    .replace('(befolkningen: per definition en tiondel)', '(population: one tenth by definition)');
}

export function homicideTables(rows: HomicideRow[], lang: Lang): DataTable[] {
  const table = (id: string, caption: string, chart: HomicideRow['chart']): DataTable => ({
    id,
    caption,
    rowLabel: tr(lang, 'Mått', 'Measure'),
    rowCsv: tr(lang, 'matt', 'measure'),
    columns: COLUMNS(lang),
    rows: rows
      .filter((r) => r.chart === chart)
      .map((r) => ({ key: dataLabel(r.item, lang), cells: [r.victims, r.perpetrators, r.population, sourceText(r.source, lang)] })),
  });
  return [
    table('kap8-bakgrund', tr(lang, 'Bakgrund, 2005–2021', 'Background, 2005–2021'), 'bakgrund'),
    table('kap8-socioekonomi', tr(lang, 'Socioekonomisk situation och tidigare lagföringar, 2005–2021', 'Socio-economic situation and earlier convictions, 2005–2021'), 'socioekonomi'),
  ];
}

export function kap8Csv(rows: HomicideRow[], lang: Lang): string {
  const cols = COLUMNS(lang);
  const header = [tr(lang, 'del', 'part'), tr(lang, 'matt', 'measure'), ...cols.map((c) => c.csv)];
  const part = (c: HomicideRow['chart']) => (c === 'bakgrund' ? tr(lang, 'bakgrund', 'background') : tr(lang, 'socioekonomi', 'socio_economic'));
  return longCsv(
    header,
    rows.map((r) => [part(r.chart), dataLabel(r.item, lang), csvNumber(r.victims, 1), csvNumber(r.perpetrators, 1), csvNumber(r.population, 1), sourceText(r.source, lang)]),
  );
}
