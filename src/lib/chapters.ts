// Chapter list, shared by the nav, the chapter kickers and the "Nästa" links.
export interface ChapterInfo {
  id: string;
  num: string;
  navLabel: string;
  kicker: string;
  nextLabel: string;
}

export const chapters: ChapterInfo[] = [
  { id: 'kap1', num: '01', navLabel: 'Över tid', kicker: 'Misstänkta över tid', nextLabel: 'Över tid' },
  { id: 'kap2', num: '02', navLabel: 'Födelseområde', kicker: 'Födelseområde', nextLabel: 'Födelseområde' },
  { id: 'kap3', num: '03', navLabel: 'Fängelse', kicker: 'Fängelse', nextLabel: 'Fängelse' },
  { id: 'kap4', num: '04', navLabel: 'Våldtäkt', kicker: 'Våldtäkt', nextLabel: 'Våldtäkt' },
  { id: 'kap5', num: '05', navLabel: 'Äldre studier', kicker: 'Brås äldre studier', nextLabel: 'Brås äldre studier' },
  { id: 'metod', num: '', navLabel: 'Metod', kicker: 'Metod och begrepp', nextLabel: 'Metod' },
];

export function chapter(id: string): ChapterInfo {
  const c = chapters.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown chapter ${id}`);
  return c;
}

export function nextChapter(id: string): ChapterInfo | null {
  const i = chapters.findIndex((x) => x.id === id);
  return i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
}
