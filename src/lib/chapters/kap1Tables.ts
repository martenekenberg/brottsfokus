// Tables and CSV for the chapter 1 table page. Build time only.
import { ratioToComparison } from '../calc';
import { tr, type Lang } from '../i18n';
import { csvNumber, longCsv, type DataTable } from '../tables';
import { crimeName, GROUPS, type GroupId, type Kap1Crime, type Kap1Data } from './kap1';

const RATE_GROUPS: GroupId[] = ['sv2', 'sv1', 'u2', 'utr', 'tot'];
const RATIO_GROUPS: GroupId[] = ['sv1', 'u2', 'utr'];

/** Column names in the CSV file, in each language. */
const CSV_NAME: Record<Lang, Record<GroupId, string>> = {
  sv: {
    sv2: 'inrikesfodda_tva_inrikesfodda_foraldrar',
    sv1: 'inrikesfodda_en_utrikesfodd_foralder',
    u2: 'inrikesfodda_tva_utrikesfodda_foraldrar',
    utr: 'utrikesfodda',
    tot: 'hela_befolkningen',
  },
  en: {
    sv2: 'born_in_sweden_two_swedish_born_parents',
    sv1: 'born_in_sweden_one_foreign_born_parent',
    u2: 'born_in_sweden_two_foreign_born_parents',
    utr: 'born_abroad',
    tot: 'whole_population',
  },
};

/** Rate per 1,000 for each group and year, for one crime type. */
export function rateTable(data: Kap1Data, crime: Kap1Crime, lang: Lang): DataTable {
  const name = crimeName(crime, lang);
  const first = data.years[0];
  const last = data.years[data.years.length - 1];
  return {
    id: `kap1-${crime.id}`,
    caption: tr(lang, `${name}: misstänkta per 1 000 invånare, ${first}–${last}`, `${name}: suspects per 1,000 residents, ${first}–${last}`),
    rowLabel: tr(lang, 'År', 'Year'),
    rowCsv: tr(lang, 'ar', 'year'),
    columns: RATE_GROUPS.map((g) => ({
      kind: 'number' as const,
      label: GROUPS[g].label[lang],
      csv: `${CSV_NAME[lang][g]}_per1000`,
      decimals: 2,
    })),
    rows: data.years.map((y, i) => ({ key: String(y), cells: RATE_GROUPS.map((g) => crime.values[g][i]) })),
  };
}

/** How many times the comparison group's rate, for one crime type. Computed from Brå's rounded rates. */
export function ratioTable(data: Kap1Data, crime: Kap1Crime, lang: Lang): DataTable {
  const name = crimeName(crime, lang);
  const first = data.years[0];
  const last = data.years[data.years.length - 1];
  return {
    id: `kap1-${crime.id}-jmf`,
    caption: tr(
      lang,
      `${name}: jämfört med inrikesfödda med två inrikesfödda föräldrar (gånger), ${first}–${last}`,
      `${name}: compared with born in Sweden, two Swedish-born parents (times), ${first}–${last}`,
    ),
    rowLabel: tr(lang, 'År', 'Year'),
    rowCsv: tr(lang, 'ar', 'year'),
    columns: RATIO_GROUPS.map((g) => ({
      kind: 'number' as const,
      label: GROUPS[g].label[lang],
      csv: `${CSV_NAME[lang][g]}_ganger`,
      decimals: 1,
    })),
    rows: data.years.map((y, i) => ({
      key: String(y),
      cells: RATIO_GROUPS.map((g) => ratioToComparison(crime.values[g][i], crime.values.sv2[i])),
    })),
  };
}

/** All crime types and years in one file, one row per crime type and year. */
export function kap1Csv(data: Kap1Data, lang: Lang): string {
  const header = [
    tr(lang, 'brottstyp', 'crime_type'),
    tr(lang, 'ar', 'year'),
    ...RATE_GROUPS.map((g) => `${CSV_NAME[lang][g]}_per1000`),
  ];
  const rows = data.crimes.flatMap((c) =>
    data.years.map((y, i) => [crimeName(c, lang), String(y), ...RATE_GROUPS.map((g) => csvNumber(c.values[g][i], 2))]),
  );
  return longCsv(header, rows);
}
