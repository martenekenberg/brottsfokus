import { tablePage, tablePages } from '../lib/dataPages';
import { llmsTxt } from '../lib/markdown';
import { tablePageContent } from '../lib/tablePageContent';

export function GET() {
  const pages = (lang: 'sv' | 'en') =>
    tablePages.map((p) => ({ page: tablePage(p.chapterId, lang), content: tablePageContent(p.chapterId, lang) }));
  return new Response(llmsTxt(pages('sv'), pages('en')), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
