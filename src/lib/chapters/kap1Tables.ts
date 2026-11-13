// Tables and CSV for the chapter 1 table page. Build time only.
import { ratioToComparison } from '../calc';
import { csvNumber, longCsv, type DataTable } from '../tables';
import { GROUPS, type GroupId, type Kap1Crime, type Kap1Data } from './kap1';

const RATE_GROUPS: GroupId[] = ['sv2', 'sv1', 'u2', 'utr', 'tot'];
const RATIO_GROUPS: GroupId[] = ['sv1', 'u2', 'utr'];

const CSV_NAME: Record<GroupId, string> = {
  sv2: 'inrikesfodda_tva_inrikesfodda_foraldrar',
  sv1: 'inrikesfodda_en_utrikesfodd_foralder',
  u2: 'inrikesfodda_tva_utrikesfodda_foraldrar',
  utr: 'utrikesfodda',
  tot: 'hela_befolkningen',
};

/** Rate per 1,000 for each group and year, for one crime type. */
export function rateTable(data: Kap1Data, crime: Kap1Crime): DataTable {
  return {
    id: `kap1-${crime.id}`,
    caption: `${crime.name}: misstänkta per 1 000 invånare, ${data.years[0]}–${data.years[data.years.length - 1]}`,
    rowLabel: 'År',
    rowCsv: 'ar',
    columns: RATE_GROUPS.map((g) => ({ kind: 'number' as const, label: GROUPS[g].label, csv: `${CSV_NAME[g]}_per1000`, decimals: 2 })),
    rows: data.years.map((y, i) => ({ key: String(y), cells: RATE_GROUPS.map((g) => crime.values[g][i]) })),
  };
}

/** How many times the comparison group's rate, for one crime type. Computed from Brå's rounded rates. */
export function ratioTable(data: Kap1Data, crime: Kap1Crime): DataTable {
  return {
    id: `kap1-${crime.id}-jmf`,
    caption: `${crime.name}: jämfört med inrikesfödda med två inrikesfödda föräldrar (gånger), ${data.years[0]}–${data.years[data.years.length - 1]}`,
    rowLabel: 'År',
    rowCsv: 'ar',
    columns: RATIO_GROUPS.map((g) => ({ kind: 'number' as const, label: GROUPS[g].label, csv: `${CSV_NAME[g]}_ganger`, decimals: 1 })),
    rows: data.years.map((y, i) => ({
      key: String(y),
      cells: RATIO_GROUPS.map((g) => ratioToComparison(crime.values[g][i], crime.values.sv2[i])),
    })),
  };
}

/** All crime types and years in one file, one row per crime type and year. */
export function kap1Csv(data: Kap1Data): string {
  const header = ['brottstyp', 'ar', ...RATE_GROUPS.map((g) => `${CSV_NAME[g]}_per1000`)];
  const rows = data.crimes.flatMap((c) => data.years.map((y, i) => [c.name, String(y), ...RATE_GROUPS.map((g) => csvNumber(c.values[g][i], 2))]));
  return longCsv(header, rows);
}
