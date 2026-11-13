// Swedish number formatting. Decimal comma, space as thousands separator,
// a non-breaking space before "%", and "×" for multipliers.

const NBSP = ' ';

function fixed(value: number, decimals: number): string {
  const parts = value.toFixed(decimals).split('.');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = int.startsWith('-') ? '−' : '';
  const body = sign ? int.slice(1) : int;
  return parts[1] ? `${sign}${body},${parts[1]}` : `${sign}${body}`;
}

/** 1234567 -> "1 234 567", 2.5 with decimals=1 -> "2,5". */
export function formatNumber(value: number, decimals = 0): string {
  return fixed(value, decimals);
}

/** 22 -> "22 %", 7.81 with decimals=1 -> "7,8 %". */
export function formatPct(value: number, decimals = 0): string {
  return `${fixed(value, decimals)}${NBSP}%`;
}

/** 2.5 -> "2,5×". */
export function formatTimes(value: number, decimals = 1): string {
  return `${fixed(value, decimals)}×`;
}
