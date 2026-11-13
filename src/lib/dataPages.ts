// The table pages, one per chapter that has one. Used by the chapter links,
// the table index page and the sitemap.
export interface TablePage {
  chapterId: string;
  slug: string;
  path: string;
  csvPath: string;
  /** Plain-text copy of the page, for AI tools and readers who want text only. */
  mdPath: string;
  /** Short name, used in lists and breadcrumbs. */
  name: string;
}

export const tablesIndexPath = '/data/';

export const tablePages: TablePage[] = [
  { chapterId: 'kap1', slug: 'misstankta-over-tid', path: '/data/misstankta-over-tid/', csvPath: '/data/misstankta-over-tid.csv', mdPath: '/data/misstankta-over-tid.md', name: 'Misstänkta över tid' },
  { chapterId: 'kap2', slug: 'fodelseomrade', path: '/data/fodelseomrade/', csvPath: '/data/fodelseomrade.csv', mdPath: '/data/fodelseomrade.md', name: 'Födelseområde och födelseland' },
  { chapterId: 'kap3', slug: 'fangelse-medborgarskap', path: '/data/fangelse-medborgarskap/', csvPath: '/data/fangelse-medborgarskap.csv', mdPath: '/data/fangelse-medborgarskap.md', name: 'Fängelse och medborgarskap' },
  { chapterId: 'kap4', slug: 'valdtakt', path: '/data/valdtakt/', csvPath: '/data/valdtakt.csv', mdPath: '/data/valdtakt.md', name: 'Dömda för våldtäkt' },
  { chapterId: 'kap5', slug: 'bra-2005', path: '/data/bra-2005/', csvPath: '/data/bra-2005.csv', mdPath: '/data/bra-2005.md', name: 'Brås äldre studier' },
];

export function tablePage(chapterId: string): TablePage {
  const p = tablePages.find((x) => x.chapterId === chapterId);
  if (!p) throw new Error(`No table page for ${chapterId}`);
  return p;
}
