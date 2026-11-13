import type { APIRoute } from 'astro';
import { tablePage, tablePages } from '../../lib/dataPages';
import { dataDate } from '../../lib/dataDates';
import { pageToMarkdown } from '../../lib/markdown';
import { tablePageContent } from '../../lib/tablePageContent';

export function getStaticPaths() {
  return tablePages.map((p) => ({ params: { slug: p.slug.sv }, props: { chapterId: p.chapterId } }));
}

export const GET: APIRoute = ({ props }) => {
  const content = tablePageContent(props.chapterId, 'sv');
  return new Response(pageToMarkdown(content, tablePage(props.chapterId, 'sv'), dataDate(content.dataFiles)), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
