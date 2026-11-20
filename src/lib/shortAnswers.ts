// "Kort svar": the short answers to common search questions, defined once and shown both in their
// chapter (src/components/ShortAnswer.astro) and on the "Frågor och svar" page.
// Questions approved by the owner, November 2026. Every number is computed from the data files.
// "Invandrare" means born abroad only (defined on Metod); never used for citizenship,
// "utländsk bakgrund" or people born in Sweden.
// Build time only.
import { round } from './calc';
import { buildKap3, shortReportName } from './chapters/kap3';
import { buildKap4 } from './chapters/kap4';
import { crimes as ntuCrimes, pooled } from './chapters/kap6';
import { fact, totalRow } from './chapters/kap7';
import { homicideItem } from './chapters/kap8';
import { birthYears, firstBackgroundYear, kohortValue } from './chapters/kap10';
import { buildSuspicionShares, peakYear as sharePeakYear, shareGroup } from './chapters/kap1Shares';
import {
  loadBirthCohorts,
  loadDeportation,
  loadDeportationFacts,
  loadHomicide,
  loadNtu,
  loadOrigin,
  loadPopulation,
  loadPrison,
  loadRapeStudies,
  loadSuspicionShares,
  loadTableB6,
} from './data';
import { formatNumber } from './format';
import { tr, type Lang } from './i18n';
import { dataLabel } from './labels';
import { methodPath } from './parts';
import { SOURCES } from './sources';

/** A piece of text, or a link. */
export type Segment = string | { text: string; href: string };

export interface ShortAnswerItem {
  /** Anchor in the chapter, e.g. "kap3-svar". */
  id: string;
  chapterId: string;
  question: string;
  answer: Segment[];
  caveat: string;
  source: Segment[];
}

/** Segments as plain text, for structured data and Markdown. */
export function plainText(segments: Segment[]): string {
  return segments.map((s) => (typeof s === 'string' ? s : s.text)).join('');
}

const braSource = (lang: Lang, report: string, url: string, rest: string): Segment[] => [
  tr(lang, 'Källa: ', 'Source: '),
  { text: tr(lang, `Brå rapport ${report}`, `Brå report ${report}`), href: url },
  rest,
];

function build(lang: Lang): ShortAnswerItem[] {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const n0 = (v: number) => formatNumber(v, 0, lang);
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const immigrants: Segment = { text: L('invandrare', 'immigrants'), href: `${methodPath[lang]}#begrepp-invandrare` };
  const items: ShortAnswerItem[] = [];

  // ---------- 1.1: suspicions against people not registered in Sweden ----------
  {
    const shares = buildSuspicionShares(loadSuspicionShares());
    const first = shares.years[0];
    const last = shares.years[shares.years.length - 1];
    const ej = shareGroup(shares, 'ej');
    const peak = sharePeakYear(shares, 'ej');
    const v = (i: number) => n1(round(ej.shares[i], 1));
    items.push({
      id: 'kap1-svar',
      chapterId: 'kap1',
      question: L(
        'Hur stor andel av brottsmisstankarna gäller personer som inte är folkbokförda i Sverige?',
        'What share of crime suspicions concern people not registered as living in Sweden?',
      ),
      answer: [
        L(
          `Personer som inte var folkbokförda i Sverige stod för ${v(shares.years.length - 1)} procent av alla registrerade brottsmisstankar ${last}, mot ${v(0)} procent ${first}. Högst var andelen ${peak}, ${v(shares.years.indexOf(peak))} procent.`,
          `People not registered as living in Sweden accounted for ${v(shares.years.length - 1)}% of all registered crime suspicions in ${last}, against ${v(0)}% in ${first}. The share was highest in ${peak}, at ${v(shares.years.indexOf(peak))}%.`,
        ),
      ],
      caveat: L(
        'Det gäller misstankar, inte personer, och misstänkt är inte dömd. De som inte är folkbokförda finns inte i befolkningsstatistiken, så andelen kan inte jämföras med befolkningen.',
        'This counts suspicions, not people, and suspected is not convicted. People who are not registered are not in the population statistics, so the share cannot be compared with the population.',
      ),
      source: braSource(lang, '2021:9', SOURCES.bra2021.url, L(', tabellbilaga 3, tabell D1 och D2.', ', table appendix 3, tables D1 and D2.')),
    });
  }

  // ---------- 1.2: immigrants, children of immigrants, and Brå's adjustment ----------
  {
    const tableB6 = loadTableB6();
    const b6 = (unit: string) => {
      const r = tableB6.find((x) => x.view === 'bakgrund' && x.unit === unit);
      if (!r) throw new Error(`Short answer 1.2: table B6 has no ${unit}`);
      return r;
    };
    const utr = b6('Utrikesfödda');
    const u2 = b6('Inrikesfödda med två utrikesfödda föräldrar');
    const sv1 = b6('Inrikesfödda med en inrikes- och en utrikesfödd förälder');
    const sv2 = b6('Inrikesfödda med två inrikesfödda föräldrar');
    const b6Source = braSource(
      lang,
      '2021:9',
      SOURCES.bra2021.url,
      L(', tabellbilaga 1, tabell B6. Folkbokförda 15 år och äldre.', ', table appendix 1, table B6. Registered residents aged 15 and over.'),
    );
    items.push({
      id: 'kap2-svar-invandrare',
      chapterId: 'kap2',
      question: L('Hur mycket vanligare är det att invandrare misstänks för brott?', 'How much more likely are immigrants to be suspected of crime in Sweden?'),
      answer: [
        L('Utrikesfödda, alltså ', 'People born abroad, that is '),
        immigrants,
        L(
          `, misstänktes för brott ${n1(utr.risk)} gånger så ofta som inrikesfödda med två inrikesfödda föräldrar: ${n1(utr.pctSuspected)} mot ${n1(sv2.pctSuspected)} procent misstänktes för minst ett brott under 2015–2018.`,
          `, were suspected of crime ${n1(utr.risk)} times as often as people born in Sweden with two Swedish-born parents: ${n1(utr.pctSuspected)}% against ${n1(sv2.pctSuspected)}% were suspected of at least one crime in 2015–2018.`,
        ),
      ],
      caveat: L(
        'Misstänkt är inte dömd. Inte justerat för ålder, kön eller inkomst. Med hänsyn till dem blir skillnaden mindre, men den finns kvar.',
        'Suspected is not convicted. Not adjusted for age, sex or income. Taking them into account makes the difference smaller, but it remains.',
      ),
      source: b6Source,
    });
    items.push({
      id: 'kap2-svar-barn',
      chapterId: 'kap2',
      question: L('Hur vanligt är det att barn till invandrare misstänks för brott?', 'How common is it for children of immigrants to be suspected of crime?'),
      answer: [
        L(
          `Inrikesfödda med två utrikesfödda föräldrar misstänktes för brott ${n1(u2.risk)} gånger så ofta som de med två inrikesfödda föräldrar: ${n1(u2.pctSuspected)} mot ${n1(sv2.pctSuspected)} procent under 2015–2018. Med en utrikesfödd förälder var det ${n1(sv1.risk)} gånger så vanligt (${n1(sv1.pctSuspected)} procent).`,
          `People born in Sweden with two foreign-born parents were suspected of crime ${n1(u2.risk)} times as often as those with two Swedish-born parents: ${n1(u2.pctSuspected)}% against ${n1(sv2.pctSuspected)}% in 2015–2018. With one foreign-born parent it was ${n1(sv1.risk)} times as common (${n1(sv1.pctSuspected)}%).`,
        ),
      ],
      caveat: L(
        'De är födda i Sverige och räknas inte som invandrare här. Misstänkt är inte dömd. Inte justerat för ålder, kön eller inkomst.',
        'They were born in Sweden and are not counted as immigrants here. Suspected is not convicted. Not adjusted for age, sex or income.',
      ),
      source: b6Source,
    });

    // Brå's risk by birth region, before and after its adjustment for age, sex, income and education.
    const regions = loadOrigin()
      .filter((r) => r.view === 'region' && r.crimeOrder === 0 && r.unitId !== 'sv2')
      .map((r) => {
        if (r.riskAdj === null) throw new Error(`Short answer 1.2: no adjusted risk for ${r.unit}`);
        return { unit: r.unit, risk: r.risk, adj: r.riskAdj };
      });
    if (regions.length < 10) throw new Error('Short answer 1.2: birth regions missing');
    // The caveat in 1.2 says the differences remain after adjustment. Stop the build if most regions fall to 1 or below.
    if (!(regions.filter((r) => r.adj > 1).length > regions.length / 2)) throw new Error('Short answer 1.2 no longer matches the data');
    const lower = regions.filter((r) => r.adj < r.risk).length;
    const stillAbove = regions.filter((r) => r.adj > 1).length;
    const top = [...regions].sort((a, b) => b.risk - a.risk)[0];
    const adjMin = Math.min(...regions.map((r) => r.adj));
    const adjMax = Math.max(...regions.map((r) => r.adj));
    items.push({
      id: 'kap2-svar-justerat',
      chapterId: 'kap2',
      question: L('Hur mycket av skillnaden beror på ålder, kön och inkomst?', 'How much of the difference is due to age, sex and income?'),
      answer: [
        L(
          `Brå har räknat om överrisken som om varje födelseområde hade samma ålder, kön, inkomst och utbildning som inrikesfödda med två inrikesfödda föräldrar. Den blev då lägre för ${lower} av ${regions.length} områden och låg mellan ${n1(adjMin)} och ${n1(adjMax)}. För ${stillAbove} av dem fanns en överrisk kvar. För födda i ${dataLabel(top.unit, lang)} blev den ${n1(top.adj)} i stället för ${n1(top.risk)}.`,
          `Brå recalculated the excess risk as if each birth region had the same age, sex, income and education as people born in Sweden with two Swedish-born parents. It then became lower for ${lower} of ${regions.length} regions and ranged from ${n1(adjMin)} to ${n1(adjMax)}. For ${stillAbove} of them an excess risk remained. For people born in ${dataLabel(top.unit, lang)} it became ${n1(top.adj)} instead of ${n1(top.risk)}.`,
        ),
      ],
      caveat: L(
        'Det justerade talet är Brås beräkning, inte en faktisk andel. Brå anger det per födelseområde, inte för alla utrikesfödda tillsammans. Överrisk 1 betyder lika vanligt som i jämförelsegruppen.',
        'The adjusted figure is Brå’s calculation, not an actual share. Brå gives it by birth region, not for everyone born abroad together. An excess risk of 1 means as common as in the comparison group.',
      ),
      source: braSource(lang, '2021:9', SOURCES.bra2021.url, L(', tabellbilaga 1. Brott begångna 2015–2018.', ', table appendix 1. Crimes committed in 2015–2018.')),
    });
  }

  // ---------- 2.1: convicted before age 25 (Brå 2025:21) ----------
  {
    const kohort = loadBirthCohorts();
    const years = birthYears(kohort, 'fore25');
    const first = years[0];
    const last = years[years.length - 1];
    const bg = firstBackgroundYear(kohort, 'fore25');
    const kv = (g: 'alla' | 'I20' | 'I02' | 'Utr', y: number) => {
      const v = kohortValue(kohort, 'fore25', 'samtliga', g, y);
      if (v === null) throw new Error(`Short answer 2.1: no value for ${g} ${y}`);
      return n1(v);
    };
    items.push({
      id: 'kap9-svar',
      chapterId: 'kap9',
      question: L('Hur många lagförs för brott före 25 års ålder, och har det förändrats?', 'How many people in Sweden are convicted of a crime before age 25, and has it changed?'),
      answer: [
        L(
          `Av dem som föddes ${first} hade ${kv('alla', first)} procent lagförts för brott före 25 års ålder, av dem som föddes ${last} ${kv('alla', last)} procent. Andelen har minskat i alla bakgrundsgrupper sedan födelseåret ${bg}, men skillnaderna finns kvar. Bland födda ${last} var den ${kv('Utr', last)} procent för utrikesfödda, ${kv('I02', last)} procent för inrikesfödda med två utrikesfödda föräldrar och ${kv('I20', last)} procent för dem med två inrikesfödda föräldrar.`,
          `Of those born in ${first}, ${kv('alla', first)}% had been convicted of a crime before age 25; of those born in ${last}, ${kv('alla', last)}%. The share has fallen in every background group since birth year ${bg}, but the differences remain. Among those born in ${last}, it was ${kv('Utr', last)}% for people born abroad, ${kv('I02', last)}% for people born in Sweden with two foreign-born parents and ${kv('I20', last)}% for those with two Swedish-born parents.`,
        ),
      ],
      caveat: L(
        'Gäller bara personer som var folkbokförda i Sverige vid 15 års ålder och när de lagfördes. Lagförd räknar även tingsrättsdomar som senare ändrats. Inte justerat för inkomst eller andra skillnader.',
        'Covers only people registered in Sweden at age 15 and when convicted. Convicted includes district court judgments later overturned. Not adjusted for income or other differences.',
      ),
      source: braSource(lang, '2025:21', SOURCES.bra2025kohort.url, L(', tabell 1 och 4.', ', tables 1 and 4.')),
    });
  }

  // ---------- 2.2: rape ----------
  {
    const rows = loadRapeStudies();
    const kap4 = buildKap4(rows, loadPopulation(), lang);
    const utr2015 = rows.find((r) => r.chart === 'bakgrund' && r.itemId === 'utr');
    if (!utr2015) throw new Error('Short answer 2.2: no 2000–2015 value for people born abroad');
    items.push({
      id: 'kap4-svar',
      chapterId: 'kap4',
      question: L('Hur stor andel av de dömda för våldtäkt är invandrare?', 'What share of people convicted of rape in Sweden are immigrants?'),
      answer: [
        L('Utrikesfödda, alltså ', 'People born abroad, that is '),
        immigrants,
        L(
          `, var ${n1(kap4.utrConvicted)} procent av dem som dömdes för våldtäkt mot en kvinna ${kap4.period}, mot ${n1(kap4.utrControls)} procent i en kontrollgrupp med samma kön och födelseår. I en tidigare studie av dömda ${utr2015.period} var andelen ${n1(utr2015.pct)} procent, när ${n1(kap4.popForeignBorn)} procent av befolkningen var utrikesfödda.`,
          `, were ${n1(kap4.utrConvicted)}% of those convicted of rape against a woman in ${kap4.period}, against ${n1(kap4.utrControls)}% in a control group of the same sex and birth year. In an earlier study of people convicted in ${utr2015.period}, the share was ${n1(utr2015.pct)}%, when ${n1(kap4.popForeignBorn)}% of the population were born abroad.`,
        ),
      ],
      caveat: L(
        'Studierna gäller dömda, inte alla som begår våldtäkt. De dömda är nästan bara män 15–60 år, medan befolkningens andel gäller alla åldrar och båda könen.',
        'The studies cover people who were convicted, not everyone who commits rape. The convicted are almost all men aged 15–60, while the population share covers all ages and both sexes.',
      ),
      source: [
        L('Källor: ', 'Sources: '),
        { text: L('Khoshnood m.fl. 2026', 'Khoshnood et al. 2026'), href: SOURCES.khoshnood2026.url },
        ', ',
        { text: L('Khoshnood m.fl. 2021', 'Khoshnood et al. 2021'), href: SOURCES.khoshnood2021.url },
        L('; SCB, befolkningen den 31 december.', '; SCB, population on 31 December.'),
      ],
    });
  }

  // ---------- 3.1: prison ----------
  {
    const kap3 = buildKap3(loadPrison(), loadPopulation());
    const y = kap3.lastYear;
    const newAll = kap3.newAll.get(y);
    const oct1 = kap3.onOct1.get(y);
    const pop = kap3.popShare.get(y);
    if (newAll == null || oct1 == null || pop == null) throw new Error(`Short answer 3.1: missing ${y} values`);
    const sources = kap3.sourcesByYear.get(y) ?? [];
    if (sources.length === 0) throw new Error(`Short answer 3.1: no source for ${y}`);
    items.push({
      id: 'kap3-svar',
      chapterId: 'kap3',
      question: L('Hur stor andel av fångarna saknar svenskt medborgarskap?', 'What share of prisoners in Sweden are not Swedish citizens?'),
      answer: [
        L(
          `Av dem som togs in i fängelse ${y} saknade ${n0(newAll)} procent svenskt medborgarskap, och av dem som satt i fängelse den 1 oktober ${n0(oct1)} procent. I hela befolkningen var ${n1(pop)} procent utländska medborgare.`,
          `Of those taken into prison in ${y}, ${n0(newAll)}% were not Swedish citizens, and of those in prison on 1 October, ${n0(oct1)}%. In the whole population, ${n1(pop)}% were foreign citizens.`,
        ),
      ],
      caveat: L(
        'Medborgarskap är inte födelseland: många som är födda utomlands är svenska medborgare. En del av de intagna bor inte i Sverige och finns inte med i befolkningen.',
        'Citizenship is not country of birth: many people born abroad are Swedish citizens. Some prisoners do not live in Sweden and are not part of the population figures.',
      ),
      source: [
        L('Källa: Brå, ', 'Source: Brå, '),
        ...sources.flatMap((s, i): Segment[] => [...(i > 0 ? [', '] : []), { text: shortReportName(s.label), href: s.url }]),
        L('; SCB, befolkningen den 31 december.', '; SCB, population on 31 December.'),
      ],
    });
  }

  // ---------- 3.2: deportation ----------
  {
    const total = totalRow(loadDeportation());
    const facts = loadDeportationFacts();
    const within = (year: number) => n0(fact(facts, 'verkstalld_inom_1_ar', year));
    items.push({
      id: 'kap7-svar',
      chapterId: 'kap7',
      question: L('Hur många av dem som döms till utvisning blir utvisade?', 'How many people sentenced to deportation are actually deported?'),
      answer: [
        L(
          `Av ${n0(total.n as number)} personer som dömts till fängelse och utvisning och lämnade anstalten 2013–2023 hade ${n1(total.pctDeported as number)} procent utvisats i slutet av 2024. Andelen som utvisades inom ett år var ${within(2013)} procent för dem som släpptes 2013 och ${within(2023)} procent för dem som släpptes 2023.`,
          `Of ${n0(total.n as number)} people sentenced to prison and deportation who left prison in 2013–2023, ${n1(total.pctDeported as number)}% had been deported by the end of 2024. The share deported within a year was ${within(2013)}% for those released in 2013 and ${within(2023)}% for those released in 2023.`,
        ),
      ],
      caveat: L(
        'De som lämnade fängelset tidigt i perioden har följts längre. Brå nämner möjliga förklaringar, som svårigheter att fastställa identitet, men drar inga säkra slutsatser om orsaker.',
        'Those who left prison early in the period have been followed for longer. Brå mentions possible explanations, such as difficulties in establishing identity, but draws no firm conclusions about causes.',
      ),
      source: braSource(lang, '2026:15', SOURCES.bra2026utvisning.url, L(', bilaga 1 tabell B1 och s. 5.', ', appendix 1 table B1 and p. 5.')),
    });
  }

  // ---------- 4.1: victims (the one exception is checked by the chapter headline) ----------
  {
    const ntu = loadNtu();
    const pct = (crimeId: string, sex: 'man' | 'kvinnor', group: string) => {
      const v = pooled(ntu, crimeId, sex, group).pct;
      if (v === null) throw new Error(`Short answer 4.1: no value for ${crimeId} ${sex} ${group}`);
      return n1(v);
    };
    const count = ntuCrimes(ntu).length;
    items.push({
      id: 'kap6-svar',
      chapterId: 'kap6',
      question: L('Utsätts personer med utländsk bakgrund oftare för brott?', 'Are people with a foreign background more often victims of crime?'),
      answer: [
        L(
          `Ja, enligt Brås trygghetsundersökning. Män med utländsk bakgrund uppgav oftare än män med svensk bakgrund att de utsatts, för alla ${count} brottstyper. Kvinnor gjorde det för alla utom sexualbrott, där ${pct('sexualbrott', 'kvinnor', 'utlandsk')} procent med utländsk och ${pct('sexualbrott', 'kvinnor', 'svensk')} procent med svensk bakgrund uppgav att de utsatts. Svaren gäller brott 2016–2022.`,
          `Yes, according to Brå’s crime survey. Men with a foreign background more often than men with a Swedish background said they had been victims, for all ${count} crime types. Women did so for all but sexual offences, where ${pct('sexualbrott', 'kvinnor', 'utlandsk')}% with a foreign and ${pct('sexualbrott', 'kvinnor', 'svensk')}% with a Swedish background said they had been victims. The answers cover crimes in 2016–2022.`,
        ),
      ],
      caveat: L(
        'Utländsk bakgrund räknar här också inrikesfödda med en utrikesfödd förälder. Enkät till personer 16–84 år, även brott som aldrig anmälts. Inte justerat för ålder.',
        'A foreign background here also includes people born in Sweden with one foreign-born parent. A survey of people aged 16–84, including crimes never reported. Not adjusted for age.',
      ),
      source: [L('Källa: ', 'Source: '), { text: 'Brå, NTU Kortanalys 2/2024', href: SOURCES.ntu2024.url }, L(', tabellbilaga.', ', table appendix.')],
    });
  }

  // ---------- 4.2: homicide ----------
  {
    const homicide = loadHomicide();
    const utl = homicideItem(homicide, 'utl');
    const weighted = homicideItem(homicide, 'viktat');
    items.push({
      id: 'kap8-svar',
      chapterId: 'kap8',
      question: L(
        'Hur stor andel av offren och gärningspersonerna vid dödligt våld har utländsk bakgrund?',
        'What share of homicide victims and perpetrators in Sweden have a foreign background?',
      ),
      answer: [
        L(
          `Av offren för dödligt våld i Sverige 2005–2021 hade ${n0(utl.victims as number)} procent utländsk bakgrund och av gärningspersonerna ${n0(utl.perpetrators as number)} procent, mot ${n0(utl.population as number)} procent av befolkningen. Utländsk bakgrund betyder här utrikesfödd eller inrikesfödd med två utrikesfödda föräldrar.`,
          `Of homicide victims in Sweden in 2005–2021, ${n0(utl.victims as number)}% had a foreign background and of perpetrators ${n0(utl.perpetrators as number)}%, against ${n0(utl.population as number)}% of the population. A foreign background here means born abroad, or born in Sweden with two foreign-born parents.`,
        ),
      ],
      caveat: L(
        `Gärningspersoner saknas i ouppklarade fall, oftast i kriminell miljö. Med Brås viktade värden hade ${n0(weighted.perpetrators as number)} procent av gärningspersonerna utländsk bakgrund. Inte justerat för ålder eller kön.`,
        `Perpetrators are missing in unsolved cases, most often in criminal milieus. With Brå’s weighted values, ${n0(weighted.perpetrators as number)}% of perpetrators had a foreign background. Not adjusted for age or sex.`,
      ),
      source: braSource(lang, '2025:5', SOURCES.bra2025dodligt.url, L(', s. 13 och 76–79.', ', p. 13 and 76–79.')),
    });
  }

  return items;
}

const cache = new Map<Lang, ShortAnswerItem[]>();

/** All short answers in a language, in the order of the chapters. */
export function shortAnswers(lang: Lang): ShortAnswerItem[] {
  if (!cache.has(lang)) cache.set(lang, build(lang));
  return cache.get(lang) as ShortAnswerItem[];
}

/** The short answers shown in one chapter. */
export function chapterShortAnswers(chapterId: string, lang: Lang): ShortAnswerItem[] {
  return shortAnswers(lang).filter((a) => a.chapterId === chapterId);
}
