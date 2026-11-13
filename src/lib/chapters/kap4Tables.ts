// Tables and CSV for the chapter 4 table page. Build time only.
import type { PopulationRow, RapeStudyRow } from '../data';
import { complementPct, populationSharePct, studyPopulationSharePct, swedishBornTwoForeignParents } from '../calc';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type DataTable } from '../tables';

const STUDY_YEARS = [2000, 2005, 2010, 2015];
const OTHER_LABEL = 'Utrikesfödda eller minst en utrikesfödd förälder';

function rowsOf(rows: RapeStudyRow[], chart: RapeStudyRow['chart']) {
  return rows.filter((r) => r.chart === chart);
}

export interface Kap4Tables {
  background: DataTable;
  controls: DataTable;
  region: DataTable;
  prior: DataTable;
  population: DataTable;
  csv: string;
  popForeignBorn: number;
  popTwoForeignParents: number;
}

export function kap4Tables(rows: RapeStudyRow[], population: PopulationRow[], lang: Lang): Kap4Tables {
  const popForeignBorn = studyPopulationSharePct(population, (r) => r.utrikesFodda);
  const popTwoForeignParents = studyPopulationSharePct(population, swedishBornTwoForeignParents);
  // The population comparison exists only for the two groups SCB's summary table covers.
  const popShare: Record<string, number | null> = { utr: popForeignBorn, u2: popTwoForeignParents };
  const otherLabel = tr(lang, `${OTHER_LABEL} (uträknat)`, 'Born abroad or at least one foreign-born parent (calculated)');
  const groupName = (item: string) => dataLabel(item, lang);

  const bg = rowsOf(rows, 'bakgrund');
  const background: DataTable = {
    id: 'kap4-bakgrund',
    caption: tr(
      lang,
      'Dömda för våldtäkt 2000–2015 efter bakgrund, jämfört med befolkningen (Khoshnood m.fl. 2021, tabell 1)',
      'Convicted for rape 2000–2015 by background, compared with the population (Khoshnood et al. 2021, table 1)',
    ),
    rowLabel: tr(lang, 'Grupp', 'Group'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: [
      { kind: 'number', label: tr(lang, 'Antal dömda', 'Number convicted'), csv: tr(lang, 'antal', 'number'), decimals: 0 },
      { kind: 'number', label: tr(lang, 'Andel av de dömda (%)', 'Share of convicted (%)'), csv: tr(lang, 'andel_pct', 'share_pct'), decimals: 1 },
      {
        kind: 'number',
        label: tr(lang, 'Andel av befolkningen, snitt 2000–2015 (%)', 'Share of population, average 2000–2015 (%)'),
        csv: tr(lang, 'andel_befolkning_pct', 'share_population_pct'),
        decimals: 1,
      },
    ],
    rows: bg.map((r) => ({ key: groupName(r.item), cells: [r.n, r.pct, popShare[r.itemId] ?? null] })),
  };

  // 2000–2020 study, table 1: the four groups (the "man" row is the share of men, not a group).
  const ctrl = ['sv2', 'sv1', 'u2', 'utr'].map((id) => {
    const r = rows.find((x) => x.chart === 'kontroll' && x.itemId === id);
    if (!r || r.pctControls === null) throw new Error(`valdtakt_domda.csv: kontroll/${id} missing`);
    return r;
  });
  const sv2 = ctrl[0];
  const sv2Controls = sv2.pctControls as number;
  const controls: DataTable = {
    id: 'kap4-kontroll',
    caption: tr(
      lang,
      `Dömda för våldtäkt ${sv2.period} jämfört med en matchad kontrollgrupp (Khoshnood m.fl. 2026, tabell 1)`,
      `Convicted for rape ${sv2.period} compared with a matched control group (Khoshnood et al. 2026, table 1)`,
    ),
    rowLabel: tr(lang, 'Grupp', 'Group'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: [
      { kind: 'number', label: tr(lang, 'Antal dömda', 'Number convicted'), csv: tr(lang, 'antal', 'number'), decimals: 0 },
      { kind: 'number', label: tr(lang, 'Andel av de dömda (%)', 'Share of convicted (%)'), csv: tr(lang, 'andel_pct', 'share_pct'), decimals: 1 },
      {
        kind: 'number',
        label: tr(lang, 'Andel av kontrollgruppen (%)', 'Share of control group (%)'),
        csv: tr(lang, 'andel_kontrollgrupp_pct', 'share_control_group_pct'),
        decimals: 1,
      },
    ],
    rows: [
      ...ctrl.map((r) => ({ key: groupName(r.item), cells: [r.n, r.pct, r.pctControls] })),
      { key: otherLabel, cells: [null, complementPct(sv2.pct), complementPct(sv2Controls)] },
    ],
  };

  const region: DataTable = {
    id: 'kap4-region',
    caption: tr(
      lang,
      'Utrikesfödda dömda för våldtäkt 2000–2015 efter födelseregion (Khoshnood m.fl. 2021, tabell 2)',
      'Born-abroad people convicted of rape 2000–2015 by birth region (Khoshnood et al. 2021, table 2)',
    ),
    rowLabel: tr(lang, 'Födelseregion', 'Birth region'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: [
      {
        kind: 'number',
        label: tr(lang, 'Andel av de utrikesfödda dömda (%)', 'Share of born-abroad convicted (%)'),
        csv: tr(lang, 'andel_pct', 'share_pct'),
        decimals: 1,
      },
    ],
    rows: [...rowsOf(rows, 'region')].sort((a, b) => b.pct - a.pct).map((r) => ({ key: groupName(r.item), cells: [r.pct] })),
  };

  const prior: DataTable = {
    id: 'kap4-tidigare',
    caption: tr(
      lang,
      'Alla dömda för våldtäkt 2000–2015: tidigare domar och ekonomiskt bistånd (Khoshnood m.fl. 2021, tabell 1)',
      'All convicted for rape 2000–2015: previous convictions and social assistance (Khoshnood et al. 2021, table 1)',
    ),
    rowLabel: tr(lang, 'Uppgift', 'Item'),
    rowCsv: tr(lang, 'grupp', 'group'),
    columns: [
      { kind: 'number', label: tr(lang, 'Antal', 'Number'), csv: tr(lang, 'antal', 'number'), decimals: 0 },
      { kind: 'number', label: tr(lang, 'Andel av de dömda (%)', 'Share of convicted (%)'), csv: tr(lang, 'andel_pct', 'share_pct'), decimals: 1 },
    ],
    rows: rowsOf(rows, 'ovrigt').map((r) => ({ key: groupName(r.item), cells: [r.n, r.pct] })),
  };

  const popRows = STUDY_YEARS.map((y) => {
    const r = population.find((p) => p.year === y);
    if (!r) throw new Error(`scb_befolkning.csv: ${y} missing`);
    return r;
  });
  const population_: DataTable = {
    id: 'kap4-befolkning',
    caption: tr(
      lang,
      'Befolkningen 2000, 2005, 2010 och 2015, underlag för jämförelsen (SCB)',
      'Population in 2000, 2005, 2010 and 2015, basis for the comparison (SCB)',
    ),
    rowLabel: tr(lang, 'År', 'Year'),
    rowCsv: tr(lang, 'ar', 'year'),
    columns: [
      { kind: 'number', label: tr(lang, 'Folkmängd', 'Population'), csv: tr(lang, 'folkmangd', 'population'), decimals: 0 },
      { kind: 'number', label: tr(lang, 'Utrikesfödda', 'Born abroad'), csv: tr(lang, 'utrikes_fodda', 'born_abroad'), decimals: 0 },
      {
        kind: 'number',
        label: tr(lang, 'Inrikesfödda med två utrikesfödda föräldrar', 'Born in Sweden, two foreign-born parents'),
        csv: tr(lang, 'inrikesfodda_tva_utrikesfodda_foraldrar', 'born_sweden_two_foreign_born_parents'),
        decimals: 0,
      },
      {
        kind: 'number',
        label: tr(lang, 'Andel utrikesfödda (%)', 'Share born abroad (%)'),
        csv: tr(lang, 'andel_utrikes_fodda_pct', 'share_born_abroad_pct'),
        decimals: 1,
      },
      {
        kind: 'number',
        label: tr(lang, 'Andel inrikesfödda med två utrikesfödda föräldrar (%)', 'Share born in Sweden, two foreign-born parents (%)'),
        csv: tr(lang, 'andel_tva_utrikesfodda_foraldrar_pct', 'share_two_foreign_born_parents_pct'),
        decimals: 1,
      },
    ],
    rows: [
      ...popRows.map((r) => ({
        key: String(r.year),
        cells: [
          r.folkmangd,
          r.utrikesFodda,
          swedishBornTwoForeignParents(r),
          populationSharePct(r.utrikesFodda, r.folkmangd),
          populationSharePct(swedishBornTwoForeignParents(r), r.folkmangd),
        ],
      })),
      { key: tr(lang, 'Snitt', 'Average'), cells: [null, null, null, popForeignBorn, popTwoForeignParents] },
    ],
  };

  const header = lang === 'en'
    ? ['table', 'group', 'period', 'number', 'share_pct', 'share_control_group_pct', 'share_population_average_pct']
    : ['tabell', 'grupp', 'period', 'antal', 'andel_pct', 'andel_kontrollgrupp_pct', 'andel_befolkning_snitt_pct'];
  const t = (sv: string, en: string) => tr(lang, sv, en);
  const csvRows: string[][] = [
    ...bg.map((r) => [t('bakgrund', 'background'), groupName(r.item), r.period, csvNumber(r.n, 0), csvNumber(r.pct, 1), '', csvNumber(popShare[r.itemId] ?? null, 1)]),
    ...ctrl.map((r) => [t('kontrollgrupp', 'control_group'), groupName(r.item), r.period, csvNumber(r.n, 0), csvNumber(r.pct, 1), csvNumber(r.pctControls, 1), '']),
    [t('kontrollgrupp', 'control_group'), otherLabel, sv2.period, '', csvNumber(complementPct(sv2.pct), 1), csvNumber(complementPct(sv2Controls), 1), ''],
    ...rowsOf(rows, 'region').map((r) => [t('fodelseregion_utrikesfodda', 'birth_region_born_abroad'), groupName(r.item), r.period, '', csvNumber(r.pct, 1), '', '']),
    ...rowsOf(rows, 'ovrigt').map((r) => [t('tidigare_domar_och_bistand', 'previous_convictions_and_social_assistance'), groupName(r.item), r.period, csvNumber(r.n, 0), csvNumber(r.pct, 1), '', '']),
  ];

  return {
    background,
    controls,
    region,
    prior,
    population: population_,
    csv: longCsv(header, csvRows),
    popForeignBorn,
    popTwoForeignParents,
  };
}
