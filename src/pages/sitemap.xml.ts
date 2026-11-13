import { site, absoluteUrl } from '../lib/site';
import { tablePages, tablesIndexPath } from '../lib/dataPages';

// The main page, the table index and one page per table.
export function GET() {
  const paths = ['/', tablesIndexPath, ...tablePages.map((p) => p.path)];
  const urls = paths
    .map((p) => `  <url>\n    <loc>${absoluteUrl(p)}</loc>\n    <lastmod>${site.updated}</lastmod>\n  </url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
