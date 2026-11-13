import { tablePages } from '../lib/dataPages';
import { llmsTxt } from '../lib/markdown';
import { tablePageContent } from '../lib/tablePageContent';

export function GET() {
  const pages = tablePages.map((page) => ({ page, content: tablePageContent(page.chapterId) }));
  return new Response(llmsTxt(pages), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
