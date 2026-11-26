// The site's parts, each its own page, plus the Metod and Om sidan pages.
// Decided by the owner on 19 November 2026: a front page plus one page per part.
// The order of `chapters` is the order on the page and gives each chapter its number ("1.2").
//
// A part about another country also has a page in that country's language (`path.da`, `path.fi`), and
// every text shown on it has a translation in that language. The part titles have Danish and Finnish names
// too, because the menu on those pages lists every part.
import { ALL_LANGS, isLocal, type BaseLang, type Lang, type Text } from './i18n';

export type PartId = 'misstankta' | 'lagforda' | 'fangelse' | 'brottsoffer' | 'danmark' | 'finland' | 'norge';

export interface PartInfo {
  id: PartId;
  num: number;
  /** The page in each language it exists in: always Swedish and English, and the country's language for a country part. */
  path: Text;
  title: Text;
  /**
   * One sentence on the front page card and under the part's headline. Rewritten to lead with the gap, like the chapter
   * headlines (owner's request, approved 20 November 2026). Each claim rests on a chapter headline check, so the build stops if the
   * data no longer supports it.
   */
  card: Text;
  /** The country the part's figures are about. Sweden unless stated. */
  country?: Text;
  /** Chapter ids, in page order. */
  chapters: string[];
  /**
   * Page title and description for search results and link previews. "{period}" is replaced by the
   * years the part's table pages cover (src/lib/partMeta.ts), so it follows the data.
   */
  meta: { title: Text; description: Text };
}

export const parts: PartInfo[] = [
  {
    id: 'misstankta',
    num: 1,
    path: { sv: '/misstankta/', en: '/en/suspects/' },
    title: { sv: 'Misstänkta för brott', en: 'Suspected of crime', da: 'Mistænkt for kriminalitet', fi: 'Rikoksesta epäillyt', nb: 'Mistenkt for lovbrudd' },
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
    title: { sv: 'Lagförda och dömda', en: 'Convicted', da: 'Dømte', fi: 'Tuomitut', nb: 'Domfelte' },
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
    title: { sv: 'Fängelse och utvisning', en: 'Prison and deportation', da: 'Fængsel og udvisning', fi: 'Vankila ja maasta karkottaminen', nb: 'Fengsel og utvisning' },
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
    title: { sv: 'Brottsoffer', en: 'Victims of crime', da: 'Ofre for kriminalitet', fi: 'Rikoksen uhrit', nb: 'Ofre for lovbrudd' },
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
  {
    // Added at the owner's request, 21 November 2026. Card copy approved by the owner, 21 November 2026.
    id: 'danmark',
    num: 5,
    path: { sv: '/danmark/', en: '/en/denmark/', da: '/da/danmark/' },
    title: { sv: 'Danmark', en: 'Denmark', da: 'Danmark', fi: 'Tanska', nb: 'Danmark' },
    country: { sv: 'Danmark', en: 'Denmark', da: 'Danmark' },
    card: {
      sv: 'Barn till invandrare från icke-västliga länder lagfördes för brott fyra gånger så ofta som befolkningen i Danmark, enligt Danmarks Statistik. Danska siffror, för jämförelse.',
      en: 'In Denmark, descendants of immigrants from non-Western countries were convicted of crimes four times as often as the population, according to Danmarks Statistik. Danish figures, for comparison.',
      da: 'Efterkommere af indvandrere fra ikke-vestlige lande blev dømt for kriminalitet fire gange så ofte som befolkningen i Danmark, ifølge Danmarks Statistik. Danske tal, til sammenligning med Sverige.',
    },
    chapters: ['kap11', 'kap12'],
    meta: {
      title: { sv: 'Brott och ursprung i Danmark, {period}', en: 'Crime and origin in Denmark, {period}', da: 'Kriminalitet og herkomst i Danmark, {period}' },
      description: {
        sv: 'Hur vanligt det är att lagföras för brott i Danmark efter ursprung, {period}: invandrare och barn till invandrare från västliga och icke-västliga länder, jämfört med befolkningen, också med hänsyn till ålder, inkomst och utbildning. Siffror från Danmarks Statistik, med källor och tabeller.',
        en: 'How common it is to be convicted of crime in Denmark by origin, {period}: immigrants and descendants from Western and non-Western countries, compared with the population, also taking age, income and education into account. Figures from Danmarks Statistik, with sources and tables.',
        da: 'Hvor ofte personer i Danmark bliver dømt for kriminalitet efter herkomst, {period}: indvandrere og efterkommere fra vestlige og ikke-vestlige lande sammenlignet med befolkningen, også når der tages højde for alder, indkomst og uddannelse. Tal fra Danmarks Statistik, med kilder.',
      },
    },
  },
  {
    // Added at the owner's request, 26 November 2026. Card copy approved by the owner, 26 November 2026.
    id: 'finland',
    num: 6,
    path: { sv: '/finland/', en: '/en/finland/', fi: '/fi/suomi/' },
    title: { sv: 'Finland', en: 'Finland', da: 'Finland', fi: 'Suomi', nb: 'Finland' },
    country: { sv: 'Finland', en: 'Finland', fi: 'Suomi' },
    card: {
      sv: 'Personer med utländsk bakgrund som är födda utomlands misstänktes för brott 1,4 gånger så ofta som befolkningen i Finland 2025, enligt Statistikcentralen. Finska siffror, för jämförelse.',
      en: 'In Finland, people with a foreign background born abroad were suspected of crime 1.4 times as often as the population in 2025, according to Statistics Finland. Finnish figures, for comparison.',
      fi: 'Ulkomailla syntyneitä ulkomaalaistaustaisia epäiltiin rikoksesta 1,4 kertaa niin usein kuin koko väestöä Suomessa vuonna 2025, Tilastokeskuksen mukaan. Suomalaisia lukuja, vertailuksi Ruotsiin.',
    },
    chapters: ['kap13', 'kap14'],
    meta: {
      title: { sv: 'Brott och bakgrund i Finland, {period}', en: 'Crime and origin in Finland, {period}', fi: 'Rikollisuus ja syntyperä Suomessa, {period}' },
      description: {
        sv: 'Hur vanligt det är att misstänkas för brott i Finland efter bakgrund, {period}: personer med utländsk och finländsk bakgrund, födda i Finland och utomlands, jämfört med befolkningen och efter ålder. Siffror från Statistikcentralen, med källor och tabeller.',
        en: 'How common it is to be suspected of crime in Finland by origin, {period}: people with a foreign and a Finnish background, born in Finland and abroad, compared with the population and by age. Figures from Statistics Finland, with sources and tables.',
        fi: 'Kuinka yleistä on tulla epäillyksi rikoksesta Suomessa syntyperän mukaan, {period}: ulkomaalais- ja suomalaistaustaiset, Suomessa ja ulkomailla syntyneet, verrattuna koko väestöön ja ikäryhmittäin. Tilastokeskuksen lukuja ja lähteet.',
      },
    },
  },
  {
    // Added at the owner's request, 26 November 2026. Card copy approved by the owner, 26 November 2026.
    id: 'norge',
    num: 7,
    path: { sv: '/norge/', en: '/en/norway/', nb: '/nb/norge/' },
    title: { sv: 'Norge', en: 'Norway', da: 'Norge', fi: 'Norja', nb: 'Norge' },
    country: { sv: 'Norge', en: 'Norway', nb: 'Norge' },
    card: {
      sv: 'Invandrare misstänktes för brott 1,8 gånger så ofta som övriga befolkningen i Norge 2021–2023, enligt SSB. Norska siffror, för jämförelse.',
      en: 'In Norway, immigrants were charged with offences 1.8 times as often as the rest of the population in 2021–2023, according to Statistics Norway. Norwegian figures, for comparison.',
      nb: 'Innvandrere ble siktet for lovbrudd 1,8 ganger så ofte som befolkningen ellers i Norge i 2021–2023, ifølge SSB. Norske tall, til sammenligning med Sverige.',
    },
    chapters: ['kap15', 'kap16'],
    meta: {
      title: { sv: 'Brott och invandringsbakgrund i Norge, {period}', en: 'Crime and immigrant background in Norway, {period}', nb: 'Lovbrudd og innvandringsbakgrunn i Norge, {period}' },
      description: {
        sv: 'Hur vanligt det är att misstänkas (siktas) för brott i Norge efter invandringsbakgrund och landbakgrund, {period}, jämfört med övriga befolkningen, också för män 15–24 år. Siffror från SSB, med källor och tabeller.',
        en: 'How common it is to be charged with an offence in Norway by immigrant background and country background, {period}, compared with the rest of the population, also for men aged 15–24. Figures from Statistics Norway, with sources and tables.',
        nb: 'Hvor vanlig det er å bli siktet for lovbrudd i Norge etter innvandringsbakgrunn og landbakgrunn, {period}, sammenlignet med befolkningen ellers, også for menn 15–24 år. Tall fra SSB, med kilder.',
      },
    },
  },
];

/** Pages that are not parts: method and about. Only in Swedish and English. */
export const methodPath: Record<BaseLang, string> = { sv: '/metod/', en: '/en/method/' };
export const aboutPath: Record<BaseLang, string> = { sv: '/om/', en: '/en/about/' };
/** "Frågor och svar": the short answers and common questions about the terms (item 7 of the SEO plan, November 2026). */
export const faqPath: Record<BaseLang, string> = { sv: '/fragor-och-svar/', en: '/en/faq/' };

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

/** Every page with a Swedish and an English version, and its country-language version if any, for language links and the sitemap. */
export const pagePairs: Text[] = [...parts.map((p) => p.path), faqPath, methodPath, aboutPath];

/** The languages a part page exists in, in menu order. */
export function partLangs(p: PartInfo): Lang[] {
  return ALL_LANGS.filter((l) => p.path[l] !== undefined);
}

/** The path of a part page in a language. On a country page, other parts link to their English page. */
export function partPath(p: PartInfo, lang: Lang): string {
  const own = p.path[lang];
  if (own !== undefined) return own;
  if (!isLocal(lang)) throw new Error(`Part ${p.id} has no ${lang} page`);
  return p.path.en;
}

/** The parts that have a page in a country language, for the static paths of /da/, /fi/ and /nb/. */
export function localParts(lang: Lang): PartInfo[] {
  return parts.filter((p) => isLocal(lang) && p.path[lang] !== undefined);
}
