// The table pages, one per chapter that has one. Used by the chapter links,
// the table index page, the sitemap and the language links.
import { ALL_LANGS, isLocal, linkLang, localePath, type BaseLang, type Lang } from './i18n';
import { pagePairs } from './parts';

export interface TablePage {
  chapterId: string;
  /** URL part for each language, e.g. "misstankta-over-tid" and "suspects-over-time". */
  slug: Record<BaseLang, string>;
  /** Short name, used in lists and breadcrumbs. */
  name: Record<BaseLang, string>;
}

/** A table page in one language, with its URLs. */
export interface TablePageUrls {
  chapterId: string;
  slug: string;
  name: string;
  path: string;
  csvPath: string;
  /** Plain-text copy of the page, for AI tools and readers who want text only. */
  mdPath: string;
}

export const tablePages: TablePage[] = [
  {
    chapterId: 'kap1',
    slug: { sv: 'misstankta-over-tid', en: 'suspects-over-time' },
    name: { sv: 'Misstänkta över tid', en: 'Suspects over time' },
  },
  {
    chapterId: 'kap2',
    slug: { sv: 'fodelseomrade', en: 'birth-region' },
    name: { sv: 'Födelseområde och födelseland', en: 'Birth region and country' },
  },
  {
    chapterId: 'kap3',
    slug: { sv: 'fangelse-medborgarskap', en: 'prison-citizenship' },
    name: { sv: 'Fängelse och medborgarskap', en: 'Prison and citizenship' },
  },
  {
    chapterId: 'kap4',
    slug: { sv: 'valdtakt', en: 'rape-convictions' },
    name: { sv: 'Dömda för våldtäkt', en: 'Convicted for rape' },
  },
  {
    chapterId: 'kap5',
    slug: { sv: 'bra-2005', en: 'bra-2005' },
    name: { sv: 'Brås äldre studier', en: 'Brå’s older studies' },
  },
  {
    chapterId: 'kap6',
    slug: { sv: 'utsatta-for-brott', en: 'crime-victims' },
    name: { sv: 'Utsatta för brott', en: 'Victims of crime' },
  },
  {
    chapterId: 'kap7',
    slug: { sv: 'utvisning', en: 'deportation' },
    name: { sv: 'Utvisning på grund av brott', en: 'Deportation for crime' },
  },
  {
    chapterId: 'kap8',
    slug: { sv: 'dodligt-vald', en: 'homicide' },
    name: { sv: 'Dödligt våld', en: 'Homicide' },
  },
  {
    chapterId: 'kap9',
    slug: { sv: 'lagforda-fore-25', en: 'convicted-before-25' },
    name: { sv: 'Lagförda före 25 års ålder', en: 'Convicted before age 25' },
  },
  {
    chapterId: 'kap10',
    slug: { sv: 'fodelsear', en: 'birth-year' },
    name: { sv: 'Lagförda efter födelseår', en: 'Convicted by birth year' },
  },
  {
    chapterId: 'kap11',
    slug: { sv: 'danmark-lagforda', en: 'denmark-convictions' },
    name: { sv: 'Lagförda i Danmark', en: 'Convicted in Denmark' },
  },
  {
    chapterId: 'kap12',
    slug: { sv: 'danmark-kriminalitetsindex', en: 'denmark-crime-index' },
    name: { sv: 'Danmarks kriminalitetsindex', en: 'Denmark’s crime index' },
  },
  {
    chapterId: 'kap13',
    slug: { sv: 'finland-misstankta', en: 'finland-suspects' },
    name: { sv: 'Misstänkta i Finland', en: 'Suspects in Finland' },
  },
  {
    chapterId: 'kap14',
    slug: { sv: 'finland-alder', en: 'finland-age' },
    name: { sv: 'Misstänkta i Finland efter ålder', en: 'Suspects in Finland by age' },
  },
];

/** The table index page: /data/ in Swedish, /en/data/ in English. Country pages link to the English one. */
export function tablesIndexPath(lang: Lang): string {
  return localePath(linkLang(lang), '/data/');
}

/** URLs of one table page in a language. The table pages are in Swedish and English; country pages link to the English ones. */
export function tablePage(chapterId: string, anyLang: Lang): TablePageUrls {
  const lang = linkLang(anyLang);
  const p = tablePages.find((x) => x.chapterId === chapterId);
  if (!p) throw new Error(`No table page for ${chapterId}`);
  const slug = p.slug[lang];
  const base = localePath(lang, `/data/${slug}`);
  return {
    chapterId,
    slug,
    name: p.name[lang],
    path: `${base}/`,
    csvPath: `${localePath(lang, `/data/${slug}`)}.csv`,
    mdPath: `${localePath(lang, `/data/${slug}`)}.md`,
  };
}

/**
 * Every language a page exists in, with its path there, in menu order. Part pages can also have a
 * country-language version; all other pages are in Swedish and English only.
 */
export function pageVersions(path: string, lang: Lang): { lang: Lang; path: string }[] {
  for (const pair of pagePairs) {
    if (path === pair[lang]) return ALL_LANGS.filter((l) => pair[l] !== undefined).map((l) => ({ lang: l, path: pair[l] as string }));
  }
  if (isLocal(lang)) throw new Error(`No page ${path} in ${lang}`);
  return [
    { lang: 'sv', path: lang === 'sv' ? path : alternatePath(path, lang) },
    { lang: 'en', path: lang === 'en' ? path : alternatePath(path, lang) },
  ];
}

/**
 * The same page in the other language, for language links. Paths without a table
 * page only change the language prefix. Returns null if the path is not in the other language.
 */
export function alternatePath(path: string, lang: BaseLang): string {
  const other: BaseLang = lang === 'sv' ? 'en' : 'sv';
  // Part pages, Metod and Om sidan have their own slug in each language.
  for (const pair of pagePairs) {
    if (path === pair[lang]) return pair[other];
  }
  for (const p of tablePages) {
    const from = tablePage(p.chapterId, lang);
    const to = tablePage(p.chapterId, other);
    for (const key of ['path', 'csvPath', 'mdPath'] as const) {
      if (path === from[key]) return to[key];
    }
  }
  return localePath(other, stripLocale(path));
}

/** "/en/data/" -> "/data/", "/data/" -> "/data/". */
export function stripLocale(path: string): string {
  if (path === '/en/') return '/';
  return path.startsWith('/en/') ? path.slice(3) : path;
}
