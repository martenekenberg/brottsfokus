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
  {
    chapterId: 'kap3',
    path: '/data/fangelse-medborgarskap/',
    csvPath: '/data/fangelse-medborgarskap.csv',
    name: 'Fängelse och medborgarskap',
  },
];

export function tablePage(chapterId: string): TablePage {
  const p = tablePages.find((x) => x.chapterId === chapterId);
  if (!p) throw new Error(`No table page for ${chapterId}`);
  return p;
}
