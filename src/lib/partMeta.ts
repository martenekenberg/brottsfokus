// Search and structured-data facts for the part pages, worked out from the part's table pages
// so they follow the data: the years covered, the sources, and the datasets the page builds on.
// Build time only (reads the data files through the table page content).
import { MERGED } from './chapters';
import { tablePage, tablePages } from './dataPages';
import { linkLang, pick, type Lang } from './i18n';
import { part, type PartId } from './parts';
import { absoluteUrl } from './site';
import { tablePageContent } from './tablePageContent';

/** Table pages whose chapter is shown in the part (a merged chapter counts for the chapter it went into). */
function partTablePages(partId: PartId) {
  const chapters = part(partId).chapters;
  return tablePages.filter((t) => chapters.includes(MERGED[t.chapterId] ?? t.chapterId));
}

/** First and last year covered by the part's table pages, from their temporalCoverage ("2007/2018"). */
export function partCoverage(partId: PartId): { first: number; last: number } {
  const ranges = partTablePages(partId).map((t) => {
    const cov = tablePageContent(t.chapterId, 'sv').temporalCoverage;
    const m = /^(\d{4})\/(\d{4})$/.exec(cov);
    if (!m) throw new Error(`Table page ${t.chapterId}: temporalCoverage "${cov}" is not "YYYY/YYYY"`);
    return [Number(m[1]), Number(m[2])];
  });
  if (ranges.length === 0) throw new Error(`Part ${partId} has no table pages`);
  return { first: Math.min(...ranges.map((r) => r[0])), last: Math.max(...ranges.map((r) => r[1])) };
}

/** Title and description with "{period}" filled in, e.g. "1985–2018". */
export function partMeta(partId: PartId, lang: Lang): { title: string; description: string } {
  const { first, last } = partCoverage(partId);
  const fill = (s: string) => {
    const out = s.replaceAll('{period}', `${first}–${last}`);
    if (/[{}]/.test(out)) throw new Error(`Part ${partId}: unknown placeholder in "${s}"`);
    return out;
  };
  const m = part(partId).meta;
  return { title: fill(pick(m.title, lang)), description: fill(pick(m.description, lang)) };
}

/** Source URLs of the part's table pages, without repeats, in chapter order. */
export function partSourceUrls(partId: PartId, lang: Lang): string[] {
  return [...new Set(partTablePages(partId).flatMap((t) => tablePageContent(t.chapterId, linkLang(lang)).sources.map((s) => s.url)))];
}

/** The Dataset nodes (on the table pages) that the part's charts are drawn from. Country pages point to the English table pages. */
export function partDatasetIds(partId: PartId, lang: Lang): string[] {
  return partTablePages(partId).map((t) => `${absoluteUrl(tablePage(t.chapterId, linkLang(lang)).path)}#dataset`);
}
