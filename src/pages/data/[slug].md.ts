import type { APIRoute } from 'astro';
import { tablePages } from '../../lib/dataPages';
import { dataDate } from '../../lib/dataDates';
import { pageToMarkdown } from '../../lib/markdown';
import { tablePageContent } from '../../lib/tablePageContent';

export function getStaticPaths() {
  return tablePages.map((p) => ({ params: { slug: p.slug }, props: { chapterId: p.chapterId } }));
}

export const GET: APIRoute = ({ props }) => {
  const content = tablePageContent(props.chapterId);
  return new Response(pageToMarkdown(content, dataDate(content.dataFiles)), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
