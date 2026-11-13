import { absoluteUrl, site } from '../lib/site';
import { tablePage, tablePages, tablesIndexPath } from '../lib/dataPages';
import { dataDate } from '../lib/dataDates';
import { tablePageContent } from '../lib/tablePageContent';
import { localePath, type Lang } from '../lib/i18n';

interface Entry {
  /** The page in each language. */
  paths: Record<Lang, string>;
  date: string;
}

// The front pages (their copy changes with deploys, so they use the build date), the table
// index and one page per table in each language. Table pages change when their data changes.
// Each entry lists its other-language version, so search engines can offer the right one.
export function GET() {
  const entries: Entry[] = [
    { paths: { sv: localePath('sv', '/'), en: localePath('en', '/') }, date: site.updated },
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
      const links = (['sv', 'en'] as Lang[])
        .map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${absoluteUrl(paths[lang])}"/>`)
        .join('\n');
      return (['sv', 'en'] as Lang[])
        .map(
          (lang) =>
            `  <url>\n    <loc>${absoluteUrl(paths[lang])}</loc>\n    <lastmod>${date}</lastmod>\n${links}\n  </url>`,
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
