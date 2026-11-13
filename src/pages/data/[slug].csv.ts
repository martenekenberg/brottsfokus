import type { APIRoute } from 'astro';
import { tablePages } from '../../lib/dataPages';
import { tablePageContent } from '../../lib/tablePageContent';

export function getStaticPaths() {
  return tablePages.map((p) => ({ params: { slug: p.slug.sv }, props: { chapterId: p.chapterId } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(tablePageContent(props.chapterId, 'sv').csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
