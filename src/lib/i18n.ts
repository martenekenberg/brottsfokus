// Languages. Swedish is the main site (at /). The English copy lives under /en/ and
// has the same pages, charts and tables.
//
// Copy is written side by side in each file with tr(lang, sv, en), so the two
// versions can be checked against each other.

export type Lang = 'sv' | 'en';

export const LANGS: Lang[] = ['sv', 'en'];

/** Value of the html lang attribute. */
export const HTML_LANG: Record<Lang, string> = { sv: 'sv', en: 'en' };

/** Value of og:locale. */
export const OG_LOCALE: Record<Lang, string> = { sv: 'sv_SE', en: 'en_GB' };

/** Language for the Schema.org inLanguage property. */
export const IN_LANGUAGE: Record<Lang, string> = { sv: 'sv-SE', en: 'en' };

/** Pick the text for a language. */
export function tr<T>(lang: Lang, sv: T, en: T): T {
  return lang === 'en' ? en : sv;
}

/** The path of a page in a language: localePath('en', '/data/') -> '/en/data/'. */
export function localePath(lang: Lang, path: string): string {
  if (lang === 'sv') return path;
  return path === '/' ? '/en/' : `/en${path}`;
}

/** The same page in the other language, for language switch links (only for paths without table slugs). */
export function otherLang(lang: Lang): Lang {
  return lang === 'sv' ? 'en' : 'sv';
}

/** Text shown where a value is missing (tooltips, tables, screen readers). */
export function missingText(lang: Lang): string {
  return tr(lang, 'uppgift saknas', 'no value');
}

/** Hint for keyboard users, read out with each chart. */
export function chartKeyboardHint(lang: Lang): string {
  return tr(
    lang,
    'Diagram. Använd piltangenterna för att läsa värdena ett i taget.',
    'Chart. Use the arrow keys to read the values one at a time.',
  );
}
