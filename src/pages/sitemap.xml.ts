import { site } from '../lib/site';

// One page today. Add new pages here if chapters get their own URLs.
export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${site.updated}</lastmod>
  </url>
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
