import { absoluteUrl, site } from '../lib/site';
import { tablePage, tablePages, tablesIndexPath } from '../lib/dataPages';
import { dataDate } from '../lib/dataDates';
import { tablePageContent } from '../lib/tablePageContent';
import { ALL_LANGS, HTML_LANG, localePath, type Lang, type Text } from '../lib/i18n';
import { pagePairs } from '../lib/parts';

interface Entry {
  /** The page in each language it exists in: Swedish and English, and a country language for some part pages. */
  paths: Text;
  date: string;
}

// The front pages and part pages (their copy changes with deploys, so they use the build date), the table
// index and one page per table in each language. Table pages change when their data changes.
// Each entry lists its other-language version, so search engines can offer the right one.
export function GET() {
  const entries: Entry[] = [
    { paths: { sv: localePath('sv', '/'), en: localePath('en', '/') }, date: site.updated },
    // The part pages, Metod and Om sidan. Their copy changes with deploys, like the front page.
    ...pagePairs.map((paths): Entry => ({ paths, date: site.updated })),
    { paths: { sv: tablesIndexPath('sv'), en: tablesIndexPath('en') }, date: dataDate() },
    ...tablePages.map((p): Entry => {
      const sv = tablePage(p.chapterId, 'sv');
      const en = tablePage(p.chapterId, 'en');
      return {
        paths: { sv: sv.path, en: en.path },
        date: dataDate(tablePageContent(p.chapterId, 'sv').dataFiles),
      };
    }),
  ];

  const urls = entries
    .map(({ paths, date }) => {
      const langs = ALL_LANGS.filter((l): l is Lang => paths[l] !== undefined);
      const links = langs
        .map((lang) => `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[lang]}" href="${absoluteUrl(paths[lang] as string)}"/>`)
        .join('\n');
      return langs
        .map(
          (lang) =>
            `  <url>\n    <loc>${absoluteUrl(paths[lang] as string)}</loc>\n    <lastmod>${date}</lastmod>\n${links}\n  </url>`,
        )
        .join('\n');
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
