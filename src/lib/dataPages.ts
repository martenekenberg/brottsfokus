// The table pages, one per chapter that has one. Used by the chapter links,
// the table index page, the sitemap and the language links.
import { localePath, type Lang } from './i18n';

export interface TablePage {
  chapterId: string;
  /** URL part for each language, e.g. "misstankta-over-tid" and "suspects-over-time". */
  slug: Record<Lang, string>;
  /** Short name, used in lists and breadcrumbs. */
  name: Record<Lang, string>;
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
];

/** The table index page: /data/ in Swedish, /en/data/ in English. */
export function tablesIndexPath(lang: Lang): string {
  return localePath(lang, '/data/');
}

/** URLs of one table page in a language. */
export function tablePage(chapterId: string, lang: Lang): TablePageUrls {
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
 * The same page in the other language, for language links. Paths without a table
 * page only change the language prefix. Returns null if the path is not in the other language.
 */
export function alternatePath(path: string, lang: Lang): string {
  const other: Lang = lang === 'sv' ? 'en' : 'sv';
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
