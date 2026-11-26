// Number formatting for the page text and charts.
// Swedish: decimal comma, space as thousands separator, a non-breaking space before "%".
// English: decimal point, comma as thousands separator, no space before "%".
// Danish: decimal comma, full stop as thousands separator ("1.234,5"), a space before "%".
// Finnish and Norwegian: as Swedish.
// All use "×" for multipliers.

import { round } from './calc';
import type { Lang } from './i18n';

const NBSP = '\u00a0';
const THOUSANDS: Record<Lang, string> = { sv: NBSP, en: ',', da: '.', fi: NBSP, nb: NBSP };

function fixed(value: number, decimals: number, lang: Lang): string {
  const en = lang === 'en';
  // Round first: toFixed alone turns 1.95 into "1.9".
  const parts = round(value, decimals).toFixed(decimals).split('.');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS[lang]);
  const sign = int.startsWith('-') ? (en ? '-' : '−') : '';
  const body = sign ? int.slice(1) : int;
  const dec = en ? '.' : ',';
  return parts[1] ? `${sign}${body}${dec}${parts[1]}` : `${sign}${body}`;
}

/** 1234567 -> "1 234 567" (sv) or "1,234,567" (en). 2.5 with decimals=1 -> "2,5" (sv) or "2.5" (en). */
export function formatNumber(value: number, decimals: number, lang: Lang): string {
  return fixed(value, decimals, lang);
}

/** 22 -> "22 %" (sv) or "22%" (en). */
export function formatPct(value: number, decimals: number, lang: Lang): string {
  return lang === 'en' ? `${fixed(value, decimals, lang)}%` : `${fixed(value, decimals, lang)}${NBSP}%`;
}

/** 2.5 -> "2,5×" (sv) or "2.5×" (en). */
export function formatTimes(value: number, decimals: number, lang: Lang): string {
  return `${fixed(value, decimals, lang)}×`;
}
