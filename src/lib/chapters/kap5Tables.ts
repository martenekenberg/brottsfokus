// Tables and CSV for the chapter 5 table page (Brå 2005:17). Build time only.
import type { Bra2005Row } from '../data';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type DataTable } from '../tables';

function value(rows: Bra2005Row[], chart: string, groupId: string, series: string): number | null {
  return rows.find((x) => x.chart === chart && x.groupId === groupId && x.series === series)?.value ?? null;
}

/** Group ids in a chart, in file order, with their names. */
function groups(rows: Bra2005Row[], chart: string): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const r of rows) if (r.chart === chart && !seen.has(r.groupId)) seen.set(r.groupId, r.group);
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

const BG_NAME: Record<Lang, Record<string, string>> = {
  sv: {
    sv2: 'Inrikesfödda med två inrikesfödda föräldrar',
    sv1: 'Inrikesfödda med en utrikesfödd förälder',
    u2: 'Inrikesfödda med två utrikesfödda föräldrar',
    utr: 'Utrikesfödda',
  },
  en: {
    sv2: 'Born in Sweden, two Swedish-born parents',
    sv1: 'Born in Sweden, one foreign-born parent',
    u2: 'Born in Sweden, two foreign-born parents',
    utr: 'Born abroad',
  },
};

export function kap5Tables(rows: Bra2005Row[], lang: Lang): DataTable[] {
  const t = (sv: string, en: string) => tr(lang, sv, en);
  const groupName = (name: string) => dataLabel(name, lang);

  const period: DataTable = {
    id: 'kap5-period',
    caption: t('Överrisk 1985–89 och 1997–2001 (Brå 2005:17, tabell 8)', 'Excess risk 1985–89 and 1997–2001 (Brå 2005:17, table 8)'),
    rowLabel: t('Grupp', 'Group'),
    rowCsv: t('grupp', 'group'),
    columns: [
      { kind: 'number', label: '1985–89', csv: t('overrisk_1985_89', 'excess_risk_1985_89'), decimals: 1 },
      { kind: 'number', label: '1997–2001', csv: t('overrisk_1997_2001', 'excess_risk_1997_2001'), decimals: 1 },
    ],
    rows: groups(rows, 'period').map((g) => ({
      key: groupName(g.name),
      cells: [value(rows, 'period', g.id, 'p8589'), value(rows, 'period', g.id, 'p9701')],
    })),
  };

  const ids = ['sv2', 'sv1', 'u2', 'utr'];
  const risk: DataTable = {
    id: 'kap5-overrisk',
    caption: t(
      'Andel misstänkta och överrisk 1997–2001, ojusterat och standardiserat (Brå 2005:17, tabell 7 och 10)',
      'Share of suspects and excess risk 1997–2001, unadjusted and standardised (Brå 2005:17, tables 7 and 10)',
    ),
    rowLabel: t('Grupp', 'Group'),
    rowCsv: t('grupp', 'group'),
    columns: [
      { kind: 'number', label: t('Andel misstänkta (%)', 'Share of suspects (%)'), csv: t('andel_misstankta_pct', 'share_suspects_pct'), decimals: 0 },
      { kind: 'number', label: t('Överrisk', 'Excess risk'), csv: t('overrisk', 'excess_risk'), decimals: 1 },
      {
        kind: 'number',
        label: t('Andel misstänkta, standardiserad (%)', 'Share of suspects, standardised (%)'),
        csv: t('andel_misstankta_standardiserad_pct', 'share_suspects_standardised_pct'),
        decimals: 0,
      },
      {
        kind: 'number',
        label: t('Överrisk, standardiserad', 'Excess risk, standardised'),
        csv: t('overrisk_standardiserad', 'excess_risk_standardised'),
        decimals: 1,
      },
    ],
    rows: ids.map((id) => ({
      key: BG_NAME[lang][id],
      cells: [
        value(rows, 'andel', id, 'ostand'),
        id === 'sv2' ? 1 : value(rows, 'overrisk', id, 'ostand'),
        value(rows, 'andel', id, 'stand'),
        id === 'sv2' ? 1 : value(rows, 'overrisk', id, 'stand'),
      ],
    })),
  };

  const shares: DataTable = {
    id: 'kap5-andelar',
    caption: t(
      'Andel av de misstänkta och av befolkningen 1997–2001 (Brå 2005:17, tabell 9 och bilaga 4 tabell 1)',
      'Share of suspects and of the population 1997–2001 (Brå 2005:17, table 9 and appendix 4, table 1)',
    ),
    rowLabel: t('Grupp', 'Group'),
    rowCsv: t('grupp', 'group'),
    columns: [
      { kind: 'number', label: t('Andel av de misstänkta (%)', 'Share of suspects (%)'), csv: t('andel_av_misstankta_pct', 'share_of_suspects_pct'), decimals: 1 },
      { kind: 'number', label: t('Andel av befolkningen (%)', 'Share of population (%)'), csv: t('andel_av_befolkningen_pct', 'share_of_population_pct'), decimals: 1 },
    ],
    rows: ids.map((id) => ({
      key: BG_NAME[lang][id],
      cells: [value(rows, 'andel_misst', id, 'misst'), value(rows, 'befolkning', id, 'bef')],
    })),
  };

  const region: DataTable = {
    id: 'kap5-region',
    caption: t(
      'Utrikesfödda efter födelseregion 1997–2001 (Brå 2005:17, tabell 9 och bilaga 4 tabell 1)',
      'Born abroad by birth region 1997–2001 (Brå 2005:17, table 9 and appendix 4, table 1)',
    ),
    rowLabel: t('Födelseregion', 'Birth region'),
    rowCsv: t('grupp', 'group'),
    columns: [
      { kind: 'number', label: t('Överrepresentation', 'Overrepresentation'), csv: t('overrepresentation', 'overrepresentation'), decimals: 1 },
      { kind: 'number', label: t('Andel av de misstänkta (%)', 'Share of suspects (%)'), csv: t('andel_av_misstankta_pct', 'share_of_suspects_pct'), decimals: 1 },
      { kind: 'number', label: t('Andel av befolkningen (%)', 'Share of population (%)'), csv: t('andel_av_befolkningen_pct', 'share_of_population_pct'), decimals: 1 },
    ],
    rows: groups(rows, 'region')
      .map((g) => ({
        key: groupName(g.name),
        cells: [value(rows, 'region', g.id, 'overrep'), value(rows, 'region_misst', g.id, 'misst'), value(rows, 'region_bef', g.id, 'bef')],
      }))
      .sort((a, b) => (b.cells[0] as number) - (a.cells[0] as number)),
  };

  const crimes: DataTable = {
    id: 'kap5-brott',
    caption: t(
      'Andel misstänkta 1997–2001 efter brottstyp, procent (Brå 2005:17, tabell 11)',
      'Share of suspects 1997–2001 by crime type, percent (Brå 2005:17, table 11)',
    ),
    rowLabel: t('Brottstyp', 'Crime type'),
    rowCsv: t('grupp', 'group'),
    columns: [
      { kind: 'number', label: t('Två inrikesfödda föräldrar', 'Two Swedish-born parents'), csv: t('tva_inrikesfodda_foraldrar_pct', 'two_swedish_born_parents_pct'), decimals: 2 },
      {
        kind: 'number',
        label: t('En eller två utrikesfödda föräldrar', 'One or two foreign-born parents'),
        csv: t('en_eller_tva_utrikesfodda_foraldrar_pct', 'one_or_two_foreign_born_parents_pct'),
        decimals: 2,
      },
      { kind: 'number', label: t('Utrikesfödda', 'Born abroad'), csv: t('utrikesfodda_pct', 'born_abroad_pct'), decimals: 2 },
    ],
    rows: groups(rows, 'brott').map((g) => ({
      key: groupName(g.name),
      cells: [value(rows, 'brott', g.id, 'sv2'), value(rows, 'brott', g.id, 'barn'), value(rows, 'brott', g.id, 'utr')],
    })),
  };

  return [period, risk, shares, region, crimes];
}

/** Decimals as printed in the report's tables. */
const CSV_DECIMALS: Record<string, number> = { andel: 0, brott: 2 };

/** Brå's table references in English: "Tabell 7" -> "Table 7", "Bilaga 4" -> "Appendix 4". */
function sourceTableEn(s: string): string {
  return s.replace(/Tabell/g, 'Table').replace(/tabell/g, 'table').replace(/Bilaga/g, 'Appendix').replace(/personer/g, 'people');
}

/** The source file as read from the report: one row per value, with Brå's table number. */
export function kap5Csv(rows: Bra2005Row[], lang: Lang): string {
  return longCsv(
    lang === 'en' ? ['chart', 'group', 'series', 'value', 'bra_table'] : ['diagram', 'grupp', 'serie', 'varde', 'bra_tabell'],
    rows.map((r) => [
      r.chart,
      dataLabel(r.group, lang),
      r.series,
      csvNumber(r.value, CSV_DECIMALS[r.chart] ?? 1),
      lang === 'en' ? sourceTableEn(r.sourceTable) : r.sourceTable,
    ]),
  );
}
