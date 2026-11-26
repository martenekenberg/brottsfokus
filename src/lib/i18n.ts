// Languages. Swedish is the main site (at /). The English copy lives under /en/ and
// has the same pages, charts and tables.
//
// The pages about other countries also have a copy in that country's own language (owner's request,
// November 2026): Denmark in Danish (/da/), Finland in Finnish (/fi/), and Norway in Norwegian (/nb/)
// once that part exists. Only those part pages are translated; their links to the rest of the site go to
// the English pages (see `linkLang`).
//
// Copy is written side by side in each file with tr(lang, sv, en, { da, fi, nb }), so the versions can be
// checked against each other. A text that is shown on a Danish, Finnish or Norwegian page but has no
// translation stops the build, so a page never mixes languages without anyone noticing.

/** The two languages the whole site is written in. */
export type BaseLang = 'sv' | 'en';
/** Languages of the country pages only. */
export type LocalLang = 'da' | 'fi' | 'nb';
export type Lang = BaseLang | LocalLang;

export const LANGS: BaseLang[] = ['sv', 'en'];
export const LOCAL_LANGS: LocalLang[] = ['da', 'fi', 'nb'];
/** Every language, in the order the language menu shows them. */
export const ALL_LANGS: Lang[] = ['sv', 'en', 'da', 'fi', 'nb'];

/** A text in Swedish and English, and in the country languages where the text is shown on a country page. */
export type Text = { sv: string; en: string } & Partial<Record<LocalLang, string>>;
/** Translations for the country languages, the last argument of `tr`. */
export type LocalTexts<T> = Partial<Record<LocalLang, T>>;

export function isLocal(lang: Lang): lang is LocalLang {
  return lang === 'da' || lang === 'fi' || lang === 'nb';
}

/** The language's own name, for the language menu. */
export const LANG_NAME: Record<Lang, string> = { sv: 'Svenska', en: 'English', da: 'Dansk', fi: 'Suomi', nb: 'Norsk' };

/** Value of the html lang attribute and of hreflang. */
export const HTML_LANG: Record<Lang, string> = { sv: 'sv', en: 'en', da: 'da', fi: 'fi', nb: 'nb' };

/** Value of og:locale. */
export const OG_LOCALE: Record<Lang, string> = { sv: 'sv_SE', en: 'en_GB', da: 'da_DK', fi: 'fi_FI', nb: 'nb_NO' };

/** Language for the Schema.org inLanguage property. */
export const IN_LANGUAGE: Record<Lang, string> = { sv: 'sv-SE', en: 'en', da: 'da-DK', fi: 'fi-FI', nb: 'nb-NO' };

/** Pick the text for a language. On a country page, a missing translation stops the build. */
export function tr<T>(lang: Lang, sv: T, en: T, local?: LocalTexts<T>): T {
  if (lang === 'sv') return sv;
  if (lang === 'en') return en;
  const t = local?.[lang];
  if (t === undefined) throw new Error(`Missing ${lang} translation for: ${typeof en === 'string' ? en : JSON.stringify(en)}`);
  return t;
}

/** The same for a text object ({ sv, en, da, ... }). */
export function pick(text: Text, lang: Lang): string {
  return tr(lang, text.sv, text.en, text);
}

/**
 * The language that links from a page lead to. The country pages are the only ones in Danish, Finnish or
 * Norwegian, so their links to other pages go to the English site.
 */
export function linkLang(lang: Lang): BaseLang {
  return isLocal(lang) ? 'en' : lang;
}

/** The path of a page in a language: localePath('en', '/data/') -> '/en/data/'. Only for pages that exist in the language. */
export function localePath(lang: BaseLang, path: string): string {
  if (lang === 'sv') return path;
  return path === '/' ? '/en/' : `/en${path}`;
}

/** The other one of the two main languages, for language switch links. */
export function otherLang(lang: BaseLang): BaseLang {
  return lang === 'sv' ? 'en' : 'sv';
}

/** Text shown where a value is missing (tooltips, tables, screen readers). */
export function missingText(lang: Lang): string {
  return tr(lang, 'uppgift saknas', 'no value', { da: 'ingen oplysning', fi: 'tieto puuttuu', nb: 'opplysning mangler' });
}

/** Hint for keyboard users, read out with each chart. */
export function chartKeyboardHint(lang: Lang): string {
  return tr(lang, 'Diagram. Använd piltangenterna för att läsa värdena ett i taget.', 'Chart. Use the arrow keys to read the values one at a time.', {
    da: 'Diagram. Brug piletasterne til at læse værdierne én ad gangen.',
    fi: 'Kaavio. Lue arvot yksi kerrallaan nuolinäppäimillä.',
    nb: 'Diagram. Bruk piltastene for å lese verdiene én om gangen.',
  });
}
