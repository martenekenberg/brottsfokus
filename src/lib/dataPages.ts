// The table pages, one per chapter that has one. Used by the chapter links,
// the table index page and the sitemap.
export interface TablePage {
  chapterId: string;
  path: string;
  csvPath: string;
  /** Short name, used in lists and breadcrumbs. */
  name: string;
}

export const tablesIndexPath = '/data/';

export const tablePages: TablePage[] = [
  { chapterId: 'kap1', path: '/data/misstankta-over-tid/', csvPath: '/data/misstankta-over-tid.csv', name: 'Misstänkta över tid' },
  { chapterId: 'kap2', path: '/data/fodelseomrade/', csvPath: '/data/fodelseomrade.csv', name: 'Födelseområde och födelseland' },
  { chapterId: 'kap3', path: '/data/fangelse-medborgarskap/', csvPath: '/data/fangelse-medborgarskap.csv', name: 'Fängelse och medborgarskap' },
  { chapterId: 'kap4', path: '/data/valdtakt/', csvPath: '/data/valdtakt.csv', name: 'Dömda för våldtäkt' },
  { chapterId: 'kap5', path: '/data/bra-2005/', csvPath: '/data/bra-2005.csv', name: 'Brås äldre studier' },
];

export function tablePage(chapterId: string): TablePage {
  const p = tablePages.find((x) => x.chapterId === chapterId);
  if (!p) throw new Error(`No table page for ${chapterId}`);
  return p;
}
