// Site-wide facts used in the page head, structured data, sitemap and masthead.
export const site = {
  name: 'Brottsfokus',
  // Earlier name of the site, kept so search engines can connect the two.
  formerName: 'Brott och bakgrund',
  url: 'https://brottsfokus.xyz/',
  locale: 'sv_SE',
  title: 'Brottsfokus: statistik om brott, födelseland och medborgarskap',
  description:
    'Officiell statistik och forskning om misstänkta, dömda och intagna i Sverige efter födelseland, föräldrarnas födelseland och medborgarskap, jämfört med befolkningen.',
  // Build date in Swedish time (ISO, e.g. "2026-11-13"). The masthead shows month and year.
  updated: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date()),
  shareImage: 'https://brottsfokus.xyz/og.png',
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

const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];

/** "2026-11-13" -> "november 2026" */
export function monthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return `${months[m - 1]} ${y}`;
}

/** "2026-11-13" -> "13 november 2026" */
export function dayMonthYear(iso: string): string {
  const d = Number(iso.split('-')[2]);
  return `${d} ${monthYear(iso)}`;
}
