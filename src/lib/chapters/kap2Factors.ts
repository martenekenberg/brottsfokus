// Chapter 2, second chart: excess risk by background next to the excess risk for other
// factors that Brå gives in the same report, 2015–2018 (Brå 2021:9, table B6 and p. 54–55).
// Shared by the main page (chart), the table page (table, CSV) and the number checklist.
import type { B6Row, RiskFactorRow } from '../data';
import type { BarChartSpec, BarKind } from '../charts/bar';
import { formatTimes } from '../format';
import { tr, type BaseLang as Lang } from '../i18n';
import { dataLabel } from '../labels';
import type { DataTable } from '../tables';

const COMPARISON = 'Inrikesfödda med två inrikesfödda föräldrar';
/** Background groups from table B6, in the order Brå lists them. */
const BACKGROUND = [
  'Inrikesfödda med en inrikes- och en utrikesfödd förälder',
  'Inrikesfödda med två utrikesfödda föräldrar',
  'Utrikesfödda',
];

export interface FactorItem {
  kind: 'bakgrund' | 'faktor';
  /** Swedish name from the data file. */
  name: string;
  /** Swedish name of the group it is compared with. */
  comparison: string;
  risk: number;
  /** Where the number is in the source. */
  source: string;
}

/** Background rows from table B6 and the other factors, highest excess risk first. */
export function buildRiskFactors(factors: RiskFactorRow[], b6: B6Row[]): FactorItem[] {
  const background = BACKGROUND.map((unit) => {
    const r = b6.find((x) => x.view === 'bakgrund' && x.unit === unit);
    if (!r) throw new Error(`Table B6: ${unit} missing`);
    return { kind: 'bakgrund' as const, name: unit, comparison: COMPARISON, risk: r.risk, source: 'Brå 2021:9 tabellbilaga 1, tabell B6' };
  });
  const other = factors.map((f) => ({ kind: 'faktor' as const, name: f.factor, comparison: f.comparison, risk: f.risk, source: f.source }));
  return [...background, ...other].sort((a, b) => b.risk - a.risk);
}

/** Shorter names that fit beside a bar, as in chapter 1. */
const SHORT: Record<string, string> = {
  'Inrikesfödda med en inrikes- och en utrikesfödd förälder': 'Inrikesfödda med en utrikesfödd förälder',
};

/** Name of a group or factor as shown on the page. */
export function itemLabel(item: FactorItem, lang: Lang): string {
  return dataLabel(SHORT[item.name] ?? item.name, lang);
}

export function buildFactorsSpec(items: FactorItem[], lang: Lang): BarChartSpec {
  const kind = (i: FactorItem): BarKind => (i.kind === 'bakgrund' ? 'focus' : 'second');
  return {
    lang,
    format: 'x1',
    ref: { value: 1, label: tr(lang, '1 = lika vanligt som i jämförelsegruppen', '1 = as common as in the comparison group') },
    groups: items.map((i) => ({ label: itemLabel(i, lang), bars: [{ label: '', value: i.risk, kind: kind(i) }] })),
    ariaLabel:
      tr(
        lang,
        'Stapeldiagram. Överrisk att misstänkas för brott 2015–2018 efter bakgrund, jämfört med inrikesfödda med två inrikesfödda föräldrar, och för andra faktorer som Brå anger i samma rapport. ',
        'Bar chart. Excess risk of being suspected of crime in 2015–2018 by background, compared with people born in Sweden with two Swedish-born parents, and for other factors that Brå gives in the same report. ',
      ) +
      items
        .map((i) =>
          tr(
            lang,
            `${itemLabel(i, 'sv')} jämfört med ${dataLabel(i.comparison, 'sv').toLowerCase()}: ${formatTimes(i.risk, 1, 'sv')}`,
            `${itemLabel(i, 'en')} compared with ${lowerFirst(dataLabel(i.comparison, 'en'))}: ${formatTimes(i.risk, 1, 'en')}`,
          ),
        )
        .join('. ') +
      '.',
  };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** The same numbers as a table: what is compared with what, and where the number comes from. */
export function factorsTable(items: FactorItem[], lang: Lang): DataTable {
  return {
    id: 'kap2-faktorer',
    caption: tr(
      lang,
      'Överrisk att misstänkas för brott 2015–2018: bakgrund och andra faktorer, högst först',
      'Excess risk of being suspected of crime, 2015–2018: background and other factors, highest first',
    ),
    rowLabel: tr(lang, 'Grupp eller faktor', 'Group or factor'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: [
      { kind: 'text', label: tr(lang, 'Jämfört med', 'Compared with'), csv: tr(lang, 'jamfort_med', 'compared_with') },
      { kind: 'number', label: tr(lang, 'Överrisk', 'Excess risk'), csv: tr(lang, 'overrisk', 'excess_risk'), decimals: 1 },
      { kind: 'text', label: tr(lang, 'Var i rapporten', 'Where in the report'), csv: tr(lang, 'kalla', 'source') },
    ],
    rows: items.map((i) => ({
      key: itemLabel(i, lang),
      cells: [dataLabel(i.comparison, lang), i.risk, sourceText(i.source, lang)],
    })),
  };
}

/** "Brå 2021:9 s. 54" in English is "Brå 2021:9, p. 54". */
export function sourceText(source: string, lang: Lang): string {
  if (lang === 'sv') return source;
  return source.replace(' s. ', ', p. ').replace('tabellbilaga 1, tabell', 'table appendix 1, table');
}
