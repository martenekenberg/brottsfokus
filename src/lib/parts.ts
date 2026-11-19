// The site's four parts, each its own page, plus the Metod and Om sidan pages.
// Decided by the owner on 19 November 2026: a front page plus one page per part.
// The order of `chapters` is the order on the page and gives each chapter its number ("1.2").
import type { Lang } from './i18n';

export type PartId = 'misstankta' | 'lagforda' | 'fangelse' | 'brottsoffer';

export interface PartInfo {
  id: PartId;
  num: number;
  path: Record<Lang, string>;
  title: Record<Lang, string>;
  /** One sentence on the front page card and under the part's headline. Approved by the owner, 19 November 2026. */
  card: Record<Lang, string>;
  /** Chapter ids, in page order. */
  chapters: string[];
}

export const parts: PartInfo[] = [
  {
    id: 'misstankta',
    num: 1,
    path: { sv: '/misstankta/', en: '/en/suspects/' },
    title: { sv: 'Misstänkta för brott', en: 'Suspected of crime' },
    card: {
      sv: 'Hur vanligt det är att misstänkas för brott i olika grupper efter födelseland och föräldrarnas födelseland, 1985–2018.',
      en: 'How common it is to be suspected of crime in different groups by country of birth and parents’ country of birth, 1985–2018.',
    },
    chapters: ['kap1', 'kap2', 'kap5'],
  },
  {
    id: 'lagforda',
    num: 2,
    path: { sv: '/lagforda-och-domda/', en: '/en/convictions/' },
    title: { sv: 'Lagförda och dömda', en: 'Convicted' },
    card: {
      sv: 'Hur stor andel som lagförts för brott före 25 års ålder, och bakgrund bland dem som dömts för våldtäkt.',
      en: 'The share convicted of a crime before age 25, and the background of people convicted of rape.',
    },
    chapters: ['kap9', 'kap4'],
  },
  {
    id: 'fangelse',
    num: 3,
    path: { sv: '/fangelse-och-utvisning/', en: '/en/prison-and-deportation/' },
    title: { sv: 'Fängelse och utvisning', en: 'Prison and deportation' },
    card: {
      sv: 'Andelen utan svenskt medborgarskap bland intagna i fängelse, och hur många av de utvisningsdömda som utvisats.',
      en: 'The share without Swedish citizenship among people in prison, and how many people sentenced to deportation were deported.',
    },
    chapters: ['kap3', 'kap7'],
  },
  {
    id: 'brottsoffer',
    num: 4,
    path: { sv: '/brottsoffer/', en: '/en/victims/' },
    title: { sv: 'Brottsoffer', en: 'Victims of crime' },
    card: {
      sv: 'Hur ofta personer med utländsk och svensk bakgrund säger att de utsatts för brott, och offer och gärningspersoner vid dödligt våld.',
      en: 'How often people with a foreign and a Swedish background say they were victims of crime, and homicide victims and perpetrators.',
    },
    chapters: ['kap6', 'kap8'],
  },
];

/** Pages that are not parts: method and about. */
export const methodPath: Record<Lang, string> = { sv: '/metod/', en: '/en/method/' };
export const aboutPath: Record<Lang, string> = { sv: '/om/', en: '/en/about/' };

export function part(id: PartId): PartInfo {
  const p = parts.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown part ${id}`);
  return p;
}

/** The part a chapter belongs to. */
export function partOf(chapterId: string): PartInfo {
  const p = parts.find((x) => x.chapters.includes(chapterId));
  if (!p) throw new Error(`Chapter ${chapterId} is in no part`);
  return p;
}

/** Every page with a Swedish and an English version, for language links and the sitemap. */
export const pagePairs: Record<Lang, string>[] = [...parts.map((p) => p.path), methodPath, aboutPath];
