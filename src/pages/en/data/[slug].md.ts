import type { APIRoute } from 'astro';
import { tablePage, tablePages } from '../../../lib/dataPages';
import { dataDate } from '../../../lib/dataDates';
import { pageToMarkdown } from '../../../lib/markdown';
import { tablePageContent } from '../../../lib/tablePageContent';

export function getStaticPaths() {
  return tablePages.map((p) => ({ params: { slug: p.slug.en }, props: { chapterId: p.chapterId } }));
}

export const GET: APIRoute = ({ props }) => {
  const content = tablePageContent(props.chapterId, 'en');
  return new Response(pageToMarkdown(content, tablePage(props.chapterId, 'en'), dataDate(content.dataFiles)), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
