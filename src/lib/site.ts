// Site-wide facts used in the page head, structured data, sitemap and masthead.
import type { BaseLang } from './i18n';

export const site = {
  name: 'Brottsfokus',
  // Earlier name of the site, kept so search engines can connect the two.
  formerName: 'Brott och bakgrund',
  url: 'https://brottsfokus.xyz/',
  // Titles and descriptions per language. The name stays the same in both.
  title: {
    sv: 'Brottsfokus: statistik om brott, födelseland och medborgarskap',
    en: 'Brottsfokus: crime, country of birth and citizenship statistics for Sweden',
  } as Record<BaseLang, string>,
  description: {
    sv: 'Officiell statistik och forskning om misstänkta, dömda, intagna och brottsoffer i Sverige efter födelseland, föräldrarnas födelseland och medborgarskap, jämfört med befolkningen.',
    en: 'Official statistics and research on suspects, convicted people, prisoners and victims of crime in Sweden, by country of birth, parents’ country of birth and citizenship, compared with the population.',
  } as Record<BaseLang, string>,
  // Build date in Swedish time (ISO, e.g. "2026-11-13"). The masthead shows month and year.
  updated: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date()),
  // Drawn by scripts/og-image.cjs. One per language.
  shareImage: {
    sv: 'https://brottsfokus.xyz/og.png',
    en: 'https://brottsfokus.xyz/og-en.png',
  } as Record<BaseLang, string>,
  // Terms for the tables and CSV files the site publishes. Brå lets its statistics be reused
  // freely if Brå is named; SCB publishes under CC BY 4.0. CC BY 4.0 keeps both requirements.
  dataLicense: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/deed.sv',
  },
};

/** Absolute URL for a path on the site, e.g. "/data/" -> "https://brottsfokus.xyz/data/". */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}

const months: Record<BaseLang, string[]> = {
  sv: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** "2026-11-13" -> "november 2026" (sv) or "November 2026" (en) */
export function monthYear(iso: string, lang: BaseLang): string {
  const [y, m] = iso.split('-').map(Number);
  return `${months[lang][m - 1]} ${y}`;
}

/** "2026-11-13" -> "13 november 2026" (sv) or "13 November 2026" (en) */
export function dayMonthYear(iso: string, lang: BaseLang): string {
  const d = Number(iso.split('-')[2]);
  return `${d} ${monthYear(iso, lang)}`;
}
