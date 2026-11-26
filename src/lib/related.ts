// "Läs också": links from each chapter to related chapters, with a short note on how they
// relate, and to the terms on Metod that the chapter relies on (item 8 of the SEO plan, November 2026).
// The chapter that "Nästa" already points to is left out, so no link appears twice.
// On a country page the links lead to the English pages, so the labels say so.
import { chapter, chapterHref, nextLink } from './chapters';
import { linkLang, pick, type Lang, type Text } from './i18n';
import { methodPath } from './parts';

/** Terms on Metod, by the anchor they have there ("begrepp-<id>"). tests/related.test.ts checks they exist. */
export const TERMS: Record<string, Text> = {
  misstankt: { sv: 'Misstänkt, inte dömd', en: 'Suspected, not convicted' },
  bakgrund: { sv: 'Bakgrund', en: 'Background' },
  invandrare: { sv: 'Invandrare', en: 'Immigrants' },
  folkbokford: { sv: 'Folkbokförd', en: 'Registered as living in Sweden' },
  medborgarskap: { sv: 'Medborgarskap', en: 'Citizenship' },
  utsatt: { sv: 'Utsatt för brott', en: 'Victim of crime' },
  overrisk: { sv: 'Överrisk', en: 'Excess risk' },
  befolkningen: { sv: 'Jämförelse med befolkningen', en: 'Comparison with the population', da: 'Sammenligning med befolkningen', fi: 'Vertailu koko väestöön', nb: 'Sammenligning med befolkningen' },
  'ursprung-dk': { sv: 'Ursprung i Danmark', en: 'Origin in Denmark', da: 'Herkomst i Danmark' },
  'lagford-dk': { sv: 'Lagförd i Danmark', en: 'Convicted in Denmark', da: 'Dømt i Danmark' },
  'index-dk': { sv: 'Kriminalitetsindex', en: 'Crime index', da: 'Kriminalitetsindeks' },
  'bakgrund-fi': { sv: 'Bakgrund i Finland', en: 'Origin in Finland', fi: 'Syntyperä Suomessa' },
  'misstankt-fi': { sv: 'Misstänkt i Finland', en: 'Suspected in Finland', fi: 'Rikoksesta epäilty Suomessa' },
  'siktet-no': { sv: 'Misstänkt (siktad) i Norge', en: 'Charged in Norway', nb: 'Siktet i Norge' },
  'bakgrunn-no': { sv: 'Invandringsbakgrund i Norge', en: 'Immigrant background in Norway', nb: 'Innvandringsbakgrunn i Norge' },
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
      { id: 'kap11', note: { sv: 'lagförda i Danmark, efter Danmarks Statistiks grupper', en: 'convicted in Denmark, by Danmarks Statistik’s groups' } },
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
  kap11: {
    chapters: [
      { id: 'kap9', note: { sv: 'lagförda i Sverige före 25 års ålder, efter bakgrund', en: 'convicted in Sweden before age 25, by background', da: 'dømt i Sverige før 25 år efter baggrund', fi: 'tuomitut Ruotsissa ennen 25 vuoden ikää taustan mukaan' } },
      { id: 'kap1', note: { sv: 'misstänkta i Sverige, efter bakgrund', en: 'suspected in Sweden, by background', da: 'mistænkt i Sverige efter baggrund', fi: 'epäillyt Ruotsissa taustan mukaan' } },
      { id: 'kap13', note: { sv: 'misstänkta i Finland, efter bakgrund', en: 'suspected in Finland, by origin', da: 'mistænkt i Finland efter herkomst' } },
    ],
    terms: ['ursprung-dk', 'lagford-dk', 'befolkningen'],
  },
  kap12: {
    chapters: [
      { id: 'kap11', note: { sv: 'samma grupper år för år, utan justering', en: 'the same groups year by year, unadjusted', da: 'de samme grupper år for år, ikke justeret' } },
      { id: 'kap2', note: { sv: 'Brås justerade överrisker för Sverige, 2015–2018', en: 'Brå’s adjusted excess risks for Sweden, 2015–2018', da: 'Brås justerede overrisici for Sverige, 2015–2018', fi: 'Brån vakioidut ylisuuret riskit Ruotsissa, 2015–2018' } },
    ],
    terms: ['index-dk', 'ursprung-dk', 'lagford-dk'],
  },
  kap13: {
    chapters: [
      { id: 'kap1', note: { sv: 'misstänkta i Sverige, efter bakgrund', en: 'suspected in Sweden, by background', fi: 'epäillyt Ruotsissa taustan mukaan' } },
      { id: 'kap11', note: { sv: 'lagförda i Danmark, efter ursprung', en: 'convicted in Denmark, by origin', fi: 'tuomitut Tanskassa syntyperän mukaan' } },
    ],
    terms: ['bakgrund-fi', 'misstankt-fi', 'befolkningen'],
  },
  kap14: {
    chapters: [
      { id: 'kap13', note: { sv: 'samma grupper år för år, alla åldrar', en: 'the same groups year by year, all ages', fi: 'samat ryhmät vuosittain, kaikki ikäryhmät' } },
      { id: 'kap12', note: { sv: 'Danmark, justerat för ålder', en: 'Denmark, adjusted for age', fi: 'Tanska, iän mukaan vakioituna' } },
      { id: 'kap2', note: { sv: 'Brås justerade överrisker för Sverige, 2015–2018', en: 'Brå’s adjusted excess risks for Sweden, 2015–2018', fi: 'Brån vakioidut ylisuuret riskit Ruotsissa, 2015–2018' } },
    ],
    terms: ['bakgrund-fi', 'misstankt-fi'],
  },
  kap15: {
    chapters: [
      { id: 'kap1', note: { sv: 'misstänkta i Sverige, efter bakgrund', en: 'suspected in Sweden, by background', nb: 'mistenkte i Sverige etter bakgrunn' } },
      { id: 'kap13', note: { sv: 'misstänkta i Finland, efter bakgrund', en: 'suspected in Finland, by origin', nb: 'mistenkte i Finland etter bakgrunn' } },
      { id: 'kap11', note: { sv: 'lagförda i Danmark, efter ursprung', en: 'convicted in Denmark, by origin', nb: 'domfelte i Danmark etter opprinnelse' } },
    ],
    terms: ['siktet-no', 'bakgrunn-no', 'befolkningen'],
  },
  kap16: {
    chapters: [
      { id: 'kap15', note: { sv: 'samma källa, efter invandringsbakgrund och världsdel', en: 'the same source, by immigrant background and world region', nb: 'samme kilde, etter innvandringsbakgrunn og verdensdel' } },
      { id: 'kap2', note: { sv: 'misstänkta i Sverige efter födelseland, 2015–2018', en: 'suspected in Sweden by country of birth, 2015–2018', nb: 'mistenkte i Sverige etter fødeland, 2015–2018' } },
    ],
    terms: ['siktet-no', 'bakgrunn-no'],
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
      .map((c) => ({ href: chapterHref(c.id, lang), num: chapter(c.id).num, label: pick(chapter(c.id).kicker, lang), note: pick(c.note, lang) })),
    terms: r.terms.map((t) => ({ href: `${methodPath[linkLang(lang)]}#begrepp-${t}`, label: pick(TERMS[t], lang) })),
  };
}

/** Chapter ids that have related links, for the tests. */
export const relatedChapterIds = Object.keys(RELATED);
