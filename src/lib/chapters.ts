// Chapter list, shared by the chapter kickers, the part pages, the table pages and the "Next" links.
// Which part a chapter is in, and its number ("1.2"), come from src/lib/parts.ts.
import { linkLang, pick, tr, type Lang, type Text } from './i18n';
import { aboutPath, methodPath, parts, partOf, partPath } from './parts';

export interface ChapterInfo {
  id: string;
  /** Part number and place in the part, e.g. "1.2". */
  num: string;
  navLabel: Text;
  kicker: Text;
  nextLabel: Text;
}

const labels: Omit<ChapterInfo, 'num'>[] = [
  {
    id: 'kap1',
    navLabel: { sv: 'Över tid', en: 'Over time' },
    kicker: { sv: 'Misstänkta över tid', en: 'Suspects over time', da: 'Mistænkte i Sverige over tid', fi: 'Epäillyt Ruotsissa ajan mittaan', nb: 'Mistenkte i Sverige over tid' },
    nextLabel: { sv: 'Över tid', en: 'Over time' },
  },
  {
    id: 'kap2',
    navLabel: { sv: 'Födelseområde', en: 'Birth region' },
    kicker: { sv: 'Födelseområde', en: 'Birth region', da: 'Fødeområde, Sverige', fi: 'Syntymäalue, Ruotsi', nb: 'Fødeområde, Sverige' },
    nextLabel: { sv: 'Födelseområde', en: 'Birth region' },
  },
  {
    id: 'kap3',
    navLabel: { sv: 'Fängelse', en: 'Prison' },
    kicker: { sv: 'Fängelse', en: 'Prison' },
    nextLabel: { sv: 'Fängelse', en: 'Prison' },
  },
  {
    id: 'kap4',
    navLabel: { sv: 'Våldtäkt', en: 'Rape' },
    kicker: { sv: 'Våldtäkt', en: 'Rape' },
    nextLabel: { sv: 'Våldtäkt', en: 'Rape' },
  },
  {
    id: 'kap5',
    navLabel: { sv: 'Äldre studier', en: 'Older studies' },
    kicker: { sv: 'Brås äldre studier', en: 'Brå’s older studies' },
    nextLabel: { sv: 'Brås äldre studier', en: 'Brå’s older studies' },
  },
  {
    id: 'kap6',
    navLabel: { sv: 'Brottsoffer', en: 'Victims' },
    kicker: { sv: 'Utsatta för brott', en: 'Victims of crime' },
    nextLabel: { sv: 'Utsatta för brott', en: 'Victims of crime' },
  },
  {
    id: 'kap7',
    navLabel: { sv: 'Utvisning', en: 'Deportation' },
    kicker: { sv: 'Utvisning på grund av brott', en: 'Deportation for crime' },
    nextLabel: { sv: 'Utvisning', en: 'Deportation' },
  },
  {
    id: 'kap8',
    navLabel: { sv: 'Dödligt våld', en: 'Homicide' },
    kicker: { sv: 'Dödligt våld', en: 'Homicide' },
    nextLabel: { sv: 'Dödligt våld', en: 'Homicide' },
  },
  {
    id: 'kap9',
    navLabel: { sv: 'Före 25 år', en: 'Before 25' },
    kicker: { sv: 'Lagförda före 25 års ålder', en: 'Convicted before age 25', da: 'Dømt i Sverige før 25 år', fi: 'Tuomitut Ruotsissa ennen 25 vuoden ikää', nb: 'Domfelt i Sverige før 25 år' },
    nextLabel: { sv: 'Lagförda före 25 års ålder', en: 'Convicted before age 25' },
  },
  {
    id: 'kap11',
    navLabel: { sv: 'Lagförda i Danmark', en: 'Convicted in Denmark' },
    kicker: { sv: 'Lagförda i Danmark', en: 'Convicted in Denmark', da: 'Dømte i Danmark', fi: 'Tuomitut Tanskassa', nb: 'Domfelte i Danmark' },
    nextLabel: { sv: 'Lagförda i Danmark', en: 'Convicted in Denmark', da: 'Dømte i Danmark', fi: 'Tuomitut Tanskassa' },
  },
  {
    id: 'kap12',
    navLabel: { sv: 'Justerat för ålder', en: 'Adjusted for age' },
    kicker: { sv: 'Justerat för ålder och sociala förhållanden', en: 'Adjusted for age and social factors', da: 'Justeret for alder og sociale forhold', fi: 'Tanska: iän ja sosiaalisten tekijöiden mukaan vakioituna' },
    nextLabel: { sv: 'Justerat för ålder och sociala förhållanden', en: 'Adjusted for age and social factors', da: 'Justeret for alder og sociale forhold' },
  },
  {
    id: 'kap13',
    navLabel: { sv: 'Misstänkta i Finland', en: 'Suspects in Finland' },
    kicker: { sv: 'Misstänkta i Finland', en: 'Suspects in Finland', da: 'Mistænkte i Finland', fi: 'Rikoksesta epäillyt Suomessa', nb: 'Mistenkte i Finland' },
    nextLabel: { sv: 'Misstänkta i Finland', en: 'Suspects in Finland', da: 'Mistænkte i Finland', fi: 'Rikoksesta epäillyt Suomessa' },
  },
  {
    id: 'kap14',
    navLabel: { sv: 'Efter ålder', en: 'By age' },
    kicker: { sv: 'Efter ålder', en: 'By age', fi: 'Ikäryhmittäin' },
    nextLabel: { sv: 'Efter ålder', en: 'By age', fi: 'Ikäryhmittäin' },
  },
  {
    id: 'kap15',
    navLabel: { sv: 'Misstänkta i Norge', en: 'Charged in Norway' },
    kicker: { sv: 'Misstänkta i Norge', en: 'Charged in Norway', da: 'Sigtede i Norge', fi: 'Syytetyt Norjassa', nb: 'Siktede i Norge' },
    nextLabel: { sv: 'Misstänkta i Norge', en: 'Charged in Norway', da: 'Sigtede i Norge', fi: 'Syytetyt Norjassa', nb: 'Siktede i Norge' },
  },
  {
    id: 'kap16',
    navLabel: { sv: 'Efter land', en: 'By country' },
    kicker: { sv: 'Efter födelseland', en: 'By country of birth', nb: 'Etter landbakgrunn' },
    nextLabel: { sv: 'Efter födelseland', en: 'By country of birth', nb: 'Etter landbakgrunn' },
  },
];

/** All chapters in reading order: part by part, in each part's order. */
export const chapters: ChapterInfo[] = parts.flatMap((p) =>
  p.chapters.map((id, i) => {
    const l = labels.find((x) => x.id === id);
    if (!l) throw new Error(`Part ${p.id} lists unknown chapter ${id}`);
    return { ...l, num: `${p.num}.${i + 1}` };
  }),
);
if (chapters.length !== labels.length) throw new Error('Every chapter must be in exactly one part');

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

/** Link to a chapter on its part's page, e.g. "/misstankta/#kap2". From a country page, chapters on other pages link to the English page. */
export function chapterHref(id: string, lang: Lang): string {
  const c = chapter(id);
  return `${partPath(partOf(c.id), lang)}#${c.id}`;
}

/**
 * The "Nästa" link at the end of a chapter: the next chapter on the same page, else the next part's
 * page, and after the last part the method page.
 */
export function nextLink(id: string, lang: Lang): { href: string; label: string } {
  const p = partOf(id);
  const i = p.chapters.indexOf(id);
  if (i < p.chapters.length - 1) {
    const next = chapter(p.chapters[i + 1]);
    return { href: `#${next.id}`, label: pick(next.nextLabel, lang) };
  }
  const np = parts[parts.indexOf(p) + 1];
  if (np) return { href: partPath(np, lang), label: pick(np.title, lang) };
  return {
    href: methodPath[linkLang(lang)],
    label: tr(lang, 'Metod och begrepp', 'Method and terms', { da: 'Metode og begreber (på engelsk)', fi: 'Menetelmät ja käsitteet (englanniksi)', nb: 'Metode og begreper (på engelsk)' }),
  };
}

export { aboutPath, methodPath };
