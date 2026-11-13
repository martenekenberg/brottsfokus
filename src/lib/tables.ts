// Data tables shown on the table pages, and the CSV files made from them.
// A table holds raw numbers; formatting happens only when it is shown.
import { round } from './calc';
import { formatNumber } from './format';

export interface NumberColumn {
  kind: 'number';
  label: string;
  /** Column name in the CSV file. */
  csv: string;
  /** Decimals shown, as in the source. */
  decimals: number;
}

export interface LinksColumn {
  kind: 'links';
  label: string;
  csv: string;
}

export interface TextColumn {
  kind: 'text';
  label: string;
  csv: string;
}

export type Column = NumberColumn | LinksColumn | TextColumn;
export type Link = { label: string; url: string };
export type Cell = number | null | Link[] | string;

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

/** Number as shown in the table, Swedish format. Null is handled by the component. */
export function formatCell(value: number, decimals: number): string {
  return formatNumber(value, decimals);
}

/** Number as written in a CSV file: dot as decimal separator, no thousands separator. */
export function csvNumber(value: number | null, decimals: number): string {
  return value === null ? '' : round(value, decimals).toFixed(decimals);
}

export function csvQuote(text: string): string {
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
        if (typeof cell === 'string') return csvQuote(cell);
        return col.kind === 'number' ? csvNumber(cell, col.decimals) : '';
      });
    });
    return [key, ...cells].join(',');
  });
  return [header.join(','), ...lines].join('\n') + '\n';
}


/**
 * A CSV file in long format: one row per group and measure, ready for spreadsheets.
 * Cells are already text (use csvNumber for numbers); empty text = no value.
 */
export function longCsv(header: string[], rows: string[][]): string {
  return [header, ...rows].map((r) => r.map(csvQuote).join(',')).join('\n') + '\n';
}
