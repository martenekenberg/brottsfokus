// Tables and CSV for the chapter 5 table page (Brå 2005:17). Build time only.
import type { Bra2005Row } from '../data';
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

const BG_NAME: Record<string, string> = {
  sv2: 'Inrikesfödda med två inrikesfödda föräldrar',
  sv1: 'Inrikesfödda med en utrikesfödd förälder',
  u2: 'Inrikesfödda med två utrikesfödda föräldrar',
  utr: 'Utrikesfödda',
};

export function kap5Tables(rows: Bra2005Row[]): DataTable[] {
  const period: DataTable = {
    id: 'kap5-period',
    caption: 'Överrisk 1985–89 och 1997–2001 (Brå 2005:17, tabell 8)',
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: '1985–89', csv: 'overrisk_1985_89', decimals: 1 },
      { kind: 'number', label: '1997–2001', csv: 'overrisk_1997_2001', decimals: 1 },
    ],
    rows: groups(rows, 'period').map((g) => ({ key: g.name, cells: [value(rows, 'period', g.id, 'p8589'), value(rows, 'period', g.id, 'p9701')] })),
  };

  const ids = ['sv2', 'sv1', 'u2', 'utr'];
  const risk: DataTable = {
    id: 'kap5-overrisk',
    caption: 'Andel misstänkta och överrisk 1997–2001, ojusterat och standardiserat (Brå 2005:17, tabell 7 och 10)',
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Andel misstänkta (%)', csv: 'andel_misstankta_pct', decimals: 0 },
      { kind: 'number', label: 'Överrisk', csv: 'overrisk', decimals: 1 },
      { kind: 'number', label: 'Andel misstänkta, standardiserad (%)', csv: 'andel_misstankta_standardiserad_pct', decimals: 0 },
      { kind: 'number', label: 'Överrisk, standardiserad', csv: 'overrisk_standardiserad', decimals: 1 },
    ],
    rows: ids.map((id) => ({
      key: BG_NAME[id],
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
    caption: 'Andel av de misstänkta och av befolkningen 1997–2001 (Brå 2005:17, tabell 9 och bilaga 4 tabell 1)',
    rowLabel: 'Grupp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Andel av de misstänkta (%)', csv: 'andel_av_misstankta_pct', decimals: 1 },
      { kind: 'number', label: 'Andel av befolkningen (%)', csv: 'andel_av_befolkningen_pct', decimals: 1 },
    ],
    rows: ids.map((id) => ({ key: BG_NAME[id], cells: [value(rows, 'andel_misst', id, 'misst'), value(rows, 'befolkning', id, 'bef')] })),
  };

  const region: DataTable = {
    id: 'kap5-region',
    caption: 'Utrikesfödda efter födelseregion 1997–2001 (Brå 2005:17, tabell 9 och bilaga 4 tabell 1)',
    rowLabel: 'Födelseregion',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Överrepresentation', csv: 'overrepresentation', decimals: 1 },
      { kind: 'number', label: 'Andel av de misstänkta (%)', csv: 'andel_av_misstankta_pct', decimals: 1 },
      { kind: 'number', label: 'Andel av befolkningen (%)', csv: 'andel_av_befolkningen_pct', decimals: 1 },
    ],
    rows: groups(rows, 'region')
      .map((g) => ({
        key: g.name,
        cells: [value(rows, 'region', g.id, 'overrep'), value(rows, 'region_misst', g.id, 'misst'), value(rows, 'region_bef', g.id, 'bef')],
      }))
      .sort((a, b) => (b.cells[0] as number) - (a.cells[0] as number)),
  };

  const crimes: DataTable = {
    id: 'kap5-brott',
    caption: 'Andel misstänkta 1997–2001 efter brottstyp, procent (Brå 2005:17, tabell 11)',
    rowLabel: 'Brottstyp',
    rowCsv: 'grupp',
    columns: [
      { kind: 'number', label: 'Två inrikesfödda föräldrar', csv: 'tva_inrikesfodda_foraldrar_pct', decimals: 2 },
      { kind: 'number', label: 'En eller två utrikesfödda föräldrar', csv: 'en_eller_tva_utrikesfodda_foraldrar_pct', decimals: 2 },
      { kind: 'number', label: 'Utrikesfödda', csv: 'utrikesfodda_pct', decimals: 2 },
    ],
    rows: groups(rows, 'brott').map((g) => ({
      key: g.name,
      cells: [value(rows, 'brott', g.id, 'sv2'), value(rows, 'brott', g.id, 'barn'), value(rows, 'brott', g.id, 'utr')],
    })),
  };

  return [period, risk, shares, region, crimes];
}

/** Decimals as printed in the report's tables. */
const CSV_DECIMALS: Record<string, number> = { andel: 0, brott: 2 };

/** The source file as read from the report: one row per value, with Brå's table number. */
export function kap5Csv(rows: Bra2005Row[]): string {
  return longCsv(
    ['diagram', 'grupp', 'serie', 'varde', 'bra_tabell'],
    rows.map((r) => [r.chart, r.group, r.series, csvNumber(r.value, CSV_DECIMALS[r.chart] ?? 1), r.sourceTable]),
  );
}
