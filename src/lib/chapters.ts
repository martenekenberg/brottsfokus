// Chapter list, shared by the nav, the chapter kickers and the "Next" links.
import type { Lang } from './i18n';

export interface ChapterInfo {
  id: string;
  num: string;
  navLabel: Record<Lang, string>;
  kicker: Record<Lang, string>;
  nextLabel: Record<Lang, string>;
}

export const chapters: ChapterInfo[] = [
  {
    id: 'kap1',
    num: '01',
    navLabel: { sv: 'Över tid', en: 'Over time' },
    kicker: { sv: 'Misstänkta över tid', en: 'Suspects over time' },
    nextLabel: { sv: 'Över tid', en: 'Over time' },
  },
  {
    id: 'kap2',
    num: '02',
    navLabel: { sv: 'Födelseområde', en: 'Birth region' },
    kicker: { sv: 'Födelseområde', en: 'Birth region' },
    nextLabel: { sv: 'Födelseområde', en: 'Birth region' },
  },
  {
    id: 'kap3',
    num: '03',
    navLabel: { sv: 'Fängelse', en: 'Prison' },
    kicker: { sv: 'Fängelse', en: 'Prison' },
    nextLabel: { sv: 'Fängelse', en: 'Prison' },
  },
  {
    id: 'kap4',
    num: '04',
    navLabel: { sv: 'Våldtäkt', en: 'Rape' },
    kicker: { sv: 'Våldtäkt', en: 'Rape' },
    nextLabel: { sv: 'Våldtäkt', en: 'Rape' },
  },
  {
    id: 'kap5',
    num: '05',
    navLabel: { sv: 'Äldre studier', en: 'Older studies' },
    kicker: { sv: 'Brås äldre studier', en: 'Brå’s older studies' },
    nextLabel: { sv: 'Brås äldre studier', en: 'Brå’s older studies' },
  },
  {
    id: 'metod',
    num: '',
    navLabel: { sv: 'Metod', en: 'Method' },
    kicker: { sv: 'Metod och begrepp', en: 'Method and terms' },
    nextLabel: { sv: 'Metod', en: 'Method' },
  },
  {
    id: 'om',
    num: '',
    navLabel: { sv: 'Om sidan', en: 'About' },
    kicker: { sv: 'Om sidan', en: 'About this site' },
    nextLabel: { sv: 'Om sidan', en: 'About this site' },
  },
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
