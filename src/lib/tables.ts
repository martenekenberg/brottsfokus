// Data tables shown on the table pages, and the CSV files made from them.
// A table holds raw numbers; formatting happens only when it is shown.
import { round } from './calc';
import { formatNumber } from './format';

export type NumberFormat = 'int' | 'pct' | 'pct1';

export interface NumberColumn {
  kind: 'number';
  label: string;
  /** Column name in the CSV file. */
  csv: string;
  format: NumberFormat;
}

export interface LinksColumn {
  kind: 'links';
  label: string;
  csv: string;
}

export type Column = NumberColumn | LinksColumn;
export type Link = { label: string; url: string };
export type Cell = number | null | Link[];

export interface Row {
  /** Row heading, e.g. the year. Also the key used to join tables into one CSV file. */
  key: string;
  cells: Cell[];
}

export interface DataTable {
  id: string;
  caption: string;
  rowLabel: string;
  rowCsv: string;
  columns: Column[];
  rows: Row[];
}

const decimals: Record<NumberFormat, number> = { int: 0, pct: 0, pct1: 1 };

/** Number as shown in the table, Swedish format. Null is handled by the component. */
export function formatCell(value: number, format: NumberFormat): string {
  return formatNumber(value, decimals[format]);
}

/** Number as written in the CSV file: dot as decimal separator, no thousands separator. */
function csvNumber(value: number, format: NumberFormat): string {
  return round(value, decimals[format]).toFixed(decimals[format]);
}

function csvQuote(text: string): string {
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * One CSV file from one or more tables that share row keys (for example years).
 * Empty cell = no value, as in the site's own data files.
 */
export function tablesToCsv(tables: DataTable[]): string {
  const keys = [...new Set(tables.flatMap((t) => t.rows.map((r) => r.key)))].sort((a, b) => a.localeCompare(b, 'sv', { numeric: true }));
  const header = [tables[0].rowCsv, ...tables.flatMap((t) => t.columns.map((c) => c.csv))];
  const lines = keys.map((key) => {
    const cells = tables.flatMap((t) => {
      const row = t.rows.find((r) => r.key === key);
      return t.columns.map((col, i) => {
        const cell = row ? row.cells[i] : null;
        if (cell === null || cell === undefined) return '';
        if (Array.isArray(cell)) return cell.length === 0 ? '' : csvQuote(cell.map((l) => l.label).join('; '));
        return col.kind === 'number' ? csvNumber(cell, col.format) : '';
      });
    });
    return [key, ...cells].join(',');
  });
  return [header.join(','), ...lines].join('\n') + '\n';
}

