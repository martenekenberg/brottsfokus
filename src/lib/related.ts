// "Läs också": links from each chapter to related chapters, with a short note on how they
// relate, and to the terms on Metod that the chapter relies on (item 8 of the SEO plan, November 2026).
// The chapter that "Nästa" already points to is left out, so no link appears twice.
import { chapter, chapterHref, nextLink } from './chapters';
import { tr, type Lang } from './i18n';
import { methodPath } from './parts';

type Text = { sv: string; en: string };

/** Terms on Metod, by the anchor they have there ("begrepp-<id>"). tests/related.test.ts checks they exist. */
export const TERMS: Record<string, Text> = {
  misstankt: { sv: 'Misstänkt, inte dömd', en: 'Suspected, not convicted' },
  bakgrund: { sv: 'Bakgrund', en: 'Background' },
  invandrare: { sv: 'Invandrare', en: 'Immigrants' },
  folkbokford: { sv: 'Folkbokförd', en: 'Registered as living in Sweden' },
  medborgarskap: { sv: 'Medborgarskap', en: 'Citizenship' },
  utsatt: { sv: 'Utsatt för brott', en: 'Victim of crime' },
  overrisk: { sv: 'Överrisk', en: 'Excess risk' },
  befolkningen: { sv: 'Jämförelse med befolkningen', en: 'Comparison with the population' },
};

interface Related {
  chapters: { id: string; note: Text }[];
  terms: (keyof typeof TERMS)[];
}

const RELATED: Record<string, Related> = {
  kap1: {
    chapters: [
      { id: 'kap2', note: { sv: 'samma rapport, efter födelseområde och födelseland', en: 'the same report, by birth region and birth country' } },
      { id: 'kap9', note: { sv: 'lagförda, inte bara misstänkta', en: 'convicted, not only suspected' } },
      { id: 'kap3', note: { sv: 'intagna i fängelse, efter medborgarskap', en: 'prisoners, by citizenship' } },
      { id: 'kap6', note: { sv: 'utsatta för brott, efter bakgrund', en: 'victims of crime, by background' } },
    ],
    terms: ['misstankt', 'bakgrund', 'invandrare', 'folkbokford'],
  },
  kap2: {
    chapters: [
      { id: 'kap1', note: { sv: 'samma rapport, utvecklingen år för år', en: 'the same report, year by year' } },
      { id: 'kap5', note: { sv: 'Brås äldre studie av samma slag, 1985–2001', en: 'Brå’s older study of the same kind, 1985–2001' } },
      { id: 'kap9', note: { sv: 'lagförda, inte bara misstänkta', en: 'convicted, not only suspected' } },
    ],
    terms: ['overrisk', 'bakgrund', 'invandrare'],
  },
  kap5: {
    chapters: [
      { id: 'kap2', note: { sv: 'nyare studie av samma slag, 2015–2018', en: 'a newer study of the same kind, 2015–2018' } },
      { id: 'kap1', note: { sv: 'misstänkta år för år, 2007–2018', en: 'suspects year by year, 2007–2018' } },
    ],
    terms: ['overrisk', 'misstankt'],
  },
  kap9: {
    chapters: [
      { id: 'kap1', note: { sv: 'misstänkta, efter samma slags bakgrundsgrupper', en: 'suspects, by the same kind of background groups' } },
      { id: 'kap3', note: { sv: 'intagna i fängelse, efter medborgarskap', en: 'prisoners, by citizenship' } },
    ],
    terms: ['misstankt', 'bakgrund', 'invandrare'],
  },
  kap4: {
    chapters: [
      { id: 'kap6', note: { sv: 'utsatta för sexualbrott, efter bakgrund och kön', en: 'victims of sexual offences, by background and sex' } },
      { id: 'kap9', note: { sv: 'alla lagförda före 25 års ålder', en: 'everyone convicted before age 25' } },
    ],
    terms: ['bakgrund', 'invandrare', 'befolkningen'],
  },
  kap3: {
    chapters: [
      { id: 'kap1', note: { sv: 'misstänkta, också de som inte är folkbokförda', en: 'suspects, including people not registered in Sweden' } },
      { id: 'kap9', note: { sv: 'lagförda efter födelsebakgrund', en: 'convicted, by birth background' } },
    ],
    terms: ['medborgarskap', 'folkbokford', 'befolkningen'],
  },
  kap7: {
    chapters: [
      { id: 'kap3', note: { sv: 'alla intagna i fängelse, efter medborgarskap', en: 'all prisoners, by citizenship' } },
    ],
    terms: ['medborgarskap'],
  },
  kap6: {
    chapters: [
      { id: 'kap4', note: { sv: 'dömda för våldtäkt, efter bakgrund', en: 'people convicted of rape, by background' } },
      { id: 'kap1', note: { sv: 'misstänkta för brott, efter bakgrund', en: 'suspects of crime, by background' } },
    ],
    terms: ['utsatt', 'bakgrund'],
  },
  kap8: {
    chapters: [
      { id: 'kap6', note: { sv: 'utsatta för andra brott, efter bakgrund', en: 'victims of other crimes, by background' } },
      { id: 'kap1', note: { sv: 'misstänkta för brott, efter bakgrund', en: 'suspects of crime, by background' } },
    ],
    terms: ['bakgrund', 'befolkningen'],
  },
};

export interface RelatedLinks {
  chapters: { href: string; num: string; label: string; note: string }[];
  terms: { href: string; label: string }[];
}

export function relatedLinks(id: string, lang: Lang): RelatedLinks {
  const r = RELATED[id];
  if (!r) throw new Error(`No related links for chapter ${id}`);
  const nextHref = nextLink(id, lang).href;
  return {
    chapters: r.chapters
      .filter((c) => c.id !== id && !nextHref.endsWith(`#${c.id}`))
      .map((c) => ({ href: chapterHref(c.id, lang), num: chapter(c.id).num, label: chapter(c.id).kicker[lang], note: c.note[lang] })),
    terms: r.terms.map((t) => ({ href: `${methodPath[lang]}#begrepp-${t}`, label: tr(lang, TERMS[t].sv, TERMS[t].en) })),
  };
}

/** Chapter ids that have related links, for the tests. */
export const relatedChapterIds = Object.keys(RELATED);
