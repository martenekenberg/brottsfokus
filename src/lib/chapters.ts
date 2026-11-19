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
    id: 'kap6',
    num: '06',
    navLabel: { sv: 'Brottsoffer', en: 'Victims' },
    kicker: { sv: 'Utsatta för brott', en: 'Victims of crime' },
    nextLabel: { sv: 'Utsatta för brott', en: 'Victims of crime' },
  },
  {
    id: 'kap7',
    num: '07',
    navLabel: { sv: 'Utvisning', en: 'Deportation' },
    kicker: { sv: 'Utvisning på grund av brott', en: 'Deportation for crime' },
    nextLabel: { sv: 'Utvisning', en: 'Deportation' },
  },
  {
    id: 'kap8',
    num: '08',
    navLabel: { sv: 'Dödligt våld', en: 'Homicide' },
    kicker: { sv: 'Dödligt våld', en: 'Homicide' },
    nextLabel: { sv: 'Dödligt våld', en: 'Homicide' },
  },
  {
    id: 'kap9',
    num: '09',
    navLabel: { sv: 'Före 25 år', en: 'Before 25' },
    kicker: { sv: 'Lagförda före 25 års ålder', en: 'Convicted before age 25' },
    nextLabel: { sv: 'Lagförda före 25 års ålder', en: 'Convicted before age 25' },
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

/**
 * Old chapter ids that now live inside another chapter. Chapter 10 (convicted by birth year) was merged
 * into chapter 9 in November 2026; its table page keeps the id "kap10".
 */
export const MERGED: Record<string, string> = { kap10: 'kap9' };

export function chapter(id: string): ChapterInfo {
  const c = chapters.find((x) => x.id === (MERGED[id] ?? id));
  if (!c) throw new Error(`Unknown chapter ${id}`);
  return c;
}

export function nextChapter(id: string): ChapterInfo | null {
  const i = chapters.findIndex((x) => x.id === id);
  return i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
}
