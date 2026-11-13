import { site, absoluteUrl } from '../lib/site';
import { tablePages, tablesIndexPath } from '../lib/dataPages';
import { dataDate } from '../lib/dataDates';
import { tablePageContent } from '../lib/tablePageContent';

// The main page (its copy changes with deploys, so it uses the build date), the table
// index and one page per table. Table pages change when their data changes.
export function GET() {
  const entries: [string, string][] = [
    ['/', site.updated],
    [tablesIndexPath, dataDate()],
    ...tablePages.map((p): [string, string] => [p.path, dataDate(tablePageContent(p.chapterId).dataFiles)]),
  ];
  const urls = entries
    .map(([path, date]) => `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
