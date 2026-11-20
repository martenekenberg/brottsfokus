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
  /**
   * One sentence on the front page card and under the part's headline. Rewritten to lead with the gap, like the chapter
   * headlines (owner's request, approved 20 November 2026). Each claim rests on a chapter headline check, so the build stops if the
   * data no longer supports it.
   */
  card: Record<Lang, string>;
  /** Chapter ids, in page order. */
  chapters: string[];
  /**
   * Page title and description for search results and link previews. "{period}" is replaced by the
   * years the part's table pages cover (src/lib/partMeta.ts), so it follows the data.
   */
  meta: { title: Record<Lang, string>; description: Record<Lang, string> };
}

export const parts: PartInfo[] = [
  {
    id: 'misstankta',
    num: 1,
    path: { sv: '/misstankta/', en: '/en/suspects/' },
    title: { sv: 'Misstänkta för brott', en: 'Suspected of crime' },
    card: {
      sv: 'Utrikesfödda och barn till invandrare misstänktes oftare för brott, i Brås studier från 1985 till 2018.',
      en: 'People born abroad and children of immigrants were suspected of crime more often, in Brå’s studies from 1985 to 2018.',
    },
    chapters: ['kap1', 'kap2', 'kap5'],
    meta: {
      title: { sv: 'Misstänkta för brott efter födelseland, {period}', en: 'Crime suspects in Sweden by country of birth, {period}' },
      description: {
        sv: 'Hur vanligt det är att misstänkas för brott i Sverige efter födelseland och föräldrarnas födelseland, {period}, jämfört med befolkningen. Siffror från Brå, med källor och tabeller.',
        en: 'How common it is to be suspected of crime in Sweden by country of birth and parents’ country of birth, {period}, compared with the population. Figures from Brå, with sources and tables.',
      },
    },
  },
  {
    id: 'lagforda',
    num: 2,
    path: { sv: '/lagforda-och-domda/', en: '/en/convictions/' },
    title: { sv: 'Lagförda och dömda', en: 'Convicted' },
    card: {
      sv: 'Utrikesfödda och barn till två invandrare lagfördes nästan dubbelt så ofta före 25 års ålder, och drygt hälften av de dömda för våldtäkt 2000–2020 var utrikesfödda.',
      en: 'People born abroad and children of two immigrants were convicted nearly twice as often before age 25, and just over half of those convicted of rape in 2000–2020 were born abroad.',
    },
    chapters: ['kap9', 'kap4'],
    meta: {
      // No period in the title: the chapters count birth years and conviction years, which do not add up to one period.
      title: { sv: 'Lagförda och dömda för brott efter bakgrund', en: 'Convictions in Sweden by background' },
      description: {
        sv: 'Andelen som lagförts för brott före 25 års ålder efter bakgrund, och bakgrund bland dömda för våldtäkt jämfört med befolkningen. Siffror från Brå, SCB och vetenskapliga studier, med källor och tabeller.',
        en: 'The share convicted of a crime before age 25 by background, and the background of people convicted of rape compared with the population. Figures from Brå, SCB and research studies, with sources and tables.',
      },
    },
  },
  {
    id: 'fangelse',
    num: 3,
    path: { sv: '/fangelse-och-utvisning/', en: '/en/prison-and-deportation/' },
    title: { sv: 'Fängelse och utvisning', en: 'Prison and deportation' },
    card: {
      sv: 'Bland dem som togs in i fängelse 2025 var andelen utan svenskt medborgarskap nästan tre gånger så stor som i befolkningen. Under hälften av de utvisningsdömda hade utvisats.',
      en: 'Among people taken into prison in 2025, the share without Swedish citizenship was nearly three times that in the population. Less than half of those sentenced to deportation had been deported.',
    },
    chapters: ['kap3', 'kap7'],
    meta: {
      title: { sv: 'Fängelse och utvisning efter medborgarskap, {period}', en: 'Prison and deportation in Sweden by citizenship, {period}' },
      description: {
        sv: 'Andelen utan svenskt medborgarskap bland intagna i fängelse jämfört med befolkningen, och hur många utvisningsdömda som utvisats. Siffror från Brå och SCB för åren {period}, med källor och tabeller.',
        en: 'The share without Swedish citizenship among people in prison compared with the population, and how many people sentenced to deportation were deported. Figures from Brå and SCB for {period}, with sources and tables.',
      },
    },
  },
  {
    id: 'brottsoffer',
    num: 4,
    path: { sv: '/brottsoffer/', en: '/en/victims/' },
    title: { sv: 'Brottsoffer', en: 'Victims of crime' },
    card: {
      sv: 'Personer med utländsk bakgrund uppgav oftare att de utsatts för de flesta brott. Vid dödligt våld var deras andel av både offer och gärningspersoner mer än dubbelt så stor som i befolkningen.',
      en: 'People with a foreign background more often said they had been victims of most crimes. In homicides, their share of both victims and perpetrators was more than twice that of the population.',
    },
    chapters: ['kap6', 'kap8'],
    meta: {
      title: { sv: 'Brottsoffer och dödligt våld efter bakgrund, {period}', en: 'Crime victims and homicide in Sweden by background, {period}' },
      description: {
        sv: 'Hur ofta personer med utländsk och svensk bakgrund uppger att de utsatts för brott, och bakgrund bland offer och gärningspersoner vid dödligt våld. Siffror från Brå för åren {period}, med källor och tabeller.',
        en: 'How often people with a foreign and a Swedish background say they were victims of crime, and the background of homicide victims and perpetrators. Figures from Brå for {period}, with sources and tables.',
      },
    },
  },
];

/** Pages that are not parts: method and about. */
export const methodPath: Record<Lang, string> = { sv: '/metod/', en: '/en/method/' };
export const aboutPath: Record<Lang, string> = { sv: '/om/', en: '/en/about/' };
/** "Frågor och svar": the short answers and common questions about the terms (item 7 of the SEO plan, November 2026). */
export const faqPath: Record<Lang, string> = { sv: '/fragor-och-svar/', en: '/en/faq/' };

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
export const pagePairs: Record<Lang, string>[] = [...parts.map((p) => p.path), faqPath, methodPath, aboutPath];
