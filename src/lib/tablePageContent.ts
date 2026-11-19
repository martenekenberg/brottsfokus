// Text and tables for the five table pages under /data/ (and /en/data/). The HTML page, the CSV
// file and the Markdown copy are all made from this, so they always say the same thing.
// Build time only.
import {
  loadBra2005,
  loadOrigin,
  loadPopulation,
  loadPrison,
  loadRapeStudies,
  loadSuspectsByBackground,
  loadTableB6,
  loadSuspicionShares,
  loadRiskFactors,
  loadNtu,
  loadDeportation,
  loadDeportationFacts,
  loadHomicide,
  loadCohorts,
  loadBirthCohorts,
} from './data';
import { chapter } from './chapters';
import { buildKap1Data, crimeById, crimeName, type GroupId } from './chapters/kap1';
import { kap1Csv, rateTable, ratioTable } from './chapters/kap1Tables';
import { buildKap2Data, smallestGroup } from './chapters/kap2';
import { b6Table, kap2Csv, riskTable, totalCrime, TOTAL } from './chapters/kap2Tables';
import { buildKap3, kap3Context, kap3Tables, shortReportName } from './chapters/kap3';
import { buildSuspicionShares, sharesTables, shareGroup } from './chapters/kap1Shares';
import { buildRiskFactors, factorsTable } from './chapters/kap2Factors';
import { round } from './calc';
import { birthYears, firstBackgroundYear, kap10Csv, kohortTables, kohortValue } from './chapters/kap10';
import { cell as cohortCell, cohortTables, cohorts as cohortList, kap9Csv } from './chapters/kap9';
import { homicideItem, homicideTables, kap8Csv } from './chapters/kap8';
import { deportTables, fact, kap7Csv, notRegisteredSentence, suppressedGroups, totalRow } from './chapters/kap7';
import { backgroundTables, flagged, kap6Csv, pooled, regionTables, yearTables } from './chapters/kap6';
import { kap4Tables } from './chapters/kap4Tables';
import { kap5Csv, kap5Tables } from './chapters/kap5Tables';
import { formatNumber } from './format';
import { tr, type Lang } from './i18n';
import { dataLabel } from './labels';
import { SOURCES } from './sources';
import { tablesToCsv, type DataTable } from './tables';
import { yearRanges } from './years';

export interface Section {
  heading?: string;
  /** Plain text shown before the tables. */
  intro?: string;
  tables: DataTable[];
  /** Fold each table away under its title (HTML only; the Markdown copy shows them all). */
  collapsed?: boolean;
  /** Plain text shown after the tables. */
  after?: string;
}

export interface TablePageContent {
  chapterId: string;
  lang: Lang;
  h1: string;
  shortTitle: string;
  description: string;
  datasetDescription: string;
  temporalCoverage: string;
  keywords: string[];
  variableMeasured: string[];
  sources: { label: string; url: string }[];
  /** Who to name as source when reusing, e.g. "Brå och SCB". */
  credit: string;
  /** Extra sentence on the sources' own terms. */
  terms?: string;
  lead: string;
  note: string;
  sections: Section[];
  csv: string;
  /** Data files the page is built from; the page's date follows them. */
  dataFiles: string[];
}

const BRA_TERMS = (lang: Lang) =>
  tr(lang, 'Brå anger att publicerad forskning ska anges med Brå som källa.', 'Brå asks that published research names Brå as the source.');

function kap1(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 1) => formatNumber(v, d, lang);
  const data = buildKap1Data(loadSuspectsByBackground());
  const shares = buildSuspicionShares(loadSuspicionShares());
  const ej = shareGroup(shares, 'ej');
  const sharesFirst = shares.years[0];
  const sharesLast = shares.years[shares.years.length - 1];
  const first = data.years[0];
  const last = data.years[data.years.length - 1];
  const period = `${first}–${last}`;
  const total = crimeById(data, 'c00');
  const at = (g: GroupId, year: number) => {
    const v = total.values[g][data.years.indexOf(year)];
    if (v === null) throw new Error(`Chapter 1 table page: no value for ${g} ${year}`);
    return n(v, 1);
  };
  // Years where Brå gives no value for "övergrepp i rättssak", for the note.
  const interference = crimeById(data, 'c35');
  const missingYears = data.years.filter((_, i) => Object.values(interference.values).every((v) => v[i] === null));
  const interferenceName = crimeName(interference, lang).replace(/\s*\(.*\)$/, '');

  return {
    chapterId: 'kap1',
    lang,
    h1: T(
      `Misstänkta för brott per 1 000 invånare efter bakgrund, ${period}`,
      `Suspects per 1,000 residents by background, ${period}`,
    ),
    shortTitle: T(`Misstänkta för brott efter bakgrund ${period}: tabell`, `Suspects by background ${period}: table`),
    description: T(
      `Andel misstänkta för brott per 1 000 invånare ${period}, efter egen och föräldrarnas födelseland och för ${data.crimes.length} brottstyper, enligt Brå rapport 2021:9. Tabeller och CSV-fil.`,
      `Share of suspects per 1,000 residents, ${period}, by own and parents’ birth country and for ${data.crimes.length} crime types, according to Brå report 2021:9. Tables and CSV file.`,
    ),
    datasetDescription: T(
      `Personer 15 år och äldre som misstänktes för minst ett brott under året, per 1 000 invånare, ${period}. Fyra grupper efter egen och föräldrarnas födelseland samt hela befolkningen, för ${data.crimes.length} brottstyper. Från Brå rapport 2021:9, tabellbilaga 2. Inte justerat för ålder eller kön.`,
      `People aged 15 and over who were suspected of at least one crime during the year, per 1,000 residents, ${period}. Four groups by own and parents’ birth country, plus the whole population, for ${data.crimes.length} crime types. From Brå report 2021:9, table appendix 2. Not adjusted for age or sex.`,
    ),
    temporalCoverage: `${first}/${last}`,
    keywords: T(
      ['misstänkta för brott', 'utrikesfödda', 'utländsk bakgrund', 'brottstyper', 'Brå 2021:9'],
      ['suspected of crime', 'born abroad', 'foreign background', 'crime types', 'Brå 2021:9'],
    ),
    variableMeasured: T(
      ['Misstänkta per 1 000 invånare', 'Jämfört med inrikesfödda med två inrikesfödda föräldrar', 'Antal registrerade brottsmisstankar', 'Andel av alla brottsmisstankar'],
      ['Suspects per 1,000 residents', 'Compared with born in Sweden, two Swedish-born parents', 'Number of registered crime suspicions', 'Share of all crime suspicions'],
    ),
    sources: [SOURCES.bra2021],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `År ${last} misstänktes ${at('utr', last)} per 1 000 utrikesfödda för minst ett brott, enligt Brå. ` +
        `Bland inrikesfödda med två utrikesfödda föräldrar var det ${at('u2', last)} per 1 000, och bland ` +
        `inrikesfödda med två inrikesfödda föräldrar ${at('sv2', last)} per 1 000. ` +
        `År ${first} var talen ${at('utr', first)}, ${at('u2', first)} och ${at('sv2', first)}.`,
      `In ${last}, ${at('utr', last)} per 1,000 people born abroad were suspected of at least one crime, according to Brå. ` +
        `Among people born in Sweden with two foreign-born parents it was ${at('u2', last)} per 1,000, and among people born in ` +
        `Sweden with two Swedish-born parents ${at('sv2', last)} per 1,000. ` +
        `In ${first} the figures were ${at('utr', first)}, ${at('u2', first)} and ${at('sv2', first)}.`,
    ),
    note:
      T(
        'Misstänkt är inte samma sak som dömd. Talen gäller folkbokförda personer 15 år och äldre och är inte justerade för ' +
          'ålder eller kön. Grupperna med utländsk bakgrund har fler unga, som oftare misstänks. Med hänsyn till ålder, kön, ' +
          'inkomst, utbildning och kommuntyp minskar skillnaderna, men de finns kvar. Brå avrundar till två decimaler, så mycket ' +
          'ovanliga brott kan svänga mellan åren. Jämförelsen med två inrikesfödda föräldrar är uträknad från de avrundade talen.',
        'Suspected is not the same as convicted. The figures cover registered residents aged 15 and over and are not adjusted for ' +
          'age or sex. Groups with a foreign background have more young people, who are more often suspected. When age, sex, ' +
          'income, education and type of municipality are taken into account, the differences get smaller, but they remain. Brå ' +
          'rounds to two decimals, so rare crimes can change from year to year. The comparison with two Swedish-born parents is ' +
          'calculated from the rounded figures.',
      ) +
      (missingYears.length
        ? T(
            ` ${interferenceName} saknas ${yearRanges(missingYears, lang)}.`,
            ` ${interferenceName} is missing for ${yearRanges(missingYears, lang)}.`,
          )
        : ''),
    sections: [
      {
        heading: T('Brott totalt', 'All offences'),
        tables: [rateTable(data, total, lang), ratioTable(data, total, lang)],
        after: T(
          'Jämförelsen är uträknad: gruppens tal delat med talet för inrikesfödda med två inrikesfödda föräldrar samma år. ' +
            '2,0 betyder dubbelt så vanligt.',
          'The comparison is calculated: the group’s figure divided by the figure for born in Sweden with two Swedish-born parents ' +
            'the same year. 2.0 means twice as common.',
        ),
      },
      {
        heading: T('Alla brottstyper', 'All crime types'),
        intro: T('Misstänkta per 1 000 invånare för varje brottstyp.', 'Suspects per 1,000 residents for each crime type.'),
        tables: data.crimes.filter((c) => c.id !== 'c00').map((c) => rateTable(data, c, lang)),
        collapsed: true,
      },
      {
        heading: T('Andel av alla registrerade brottsmisstankar', 'Share of all registered crime suspicions'),
        intro: T(
          `Här räknas brottsmisstankar, inte personer: en person kan misstänkas för flera brott. Även misstankar mot personer som inte är folkbokförda i Sverige är med. De stod för ${n(round(ej.shares[0], 1))} procent av misstankarna ${sharesFirst} och ${n(round(ej.shares[ej.shares.length - 1], 1))} procent ${sharesLast}. Från Brå rapport 2021:9, tabellbilaga 3.`,
          `Suspicions are counted here, not people: one person can be suspected of several crimes. Suspicions against people not registered as living in Sweden are included. They accounted for ${n(round(ej.shares[0], 1))}% of suspicions in ${sharesFirst} and ${n(round(ej.shares[ej.shares.length - 1], 1))}% in ${sharesLast}. From Brå report 2021:9, table appendix 3.`,
        ),
        tables: sharesTables(shares, lang),
        after: T(
          'Andelen är uträknad: gruppens antal misstankar delat med alla misstankar samma år, gånger 100. Den stämmer med Brås egen tabell D2. ' +
            'Icke folkbokförda är personer med tillfällig vistelse i Sverige, och misstankar där det inte gått att se om personen var folkbokförd. ' +
            'De finns inte i befolkningsstatistiken, så deras andel kan inte jämföras med en andel av befolkningen.',
          'The share is calculated: the group’s number of suspicions divided by all suspicions the same year, times 100. It matches Brå’s own table D2. ' +
            'People not registered as living in Sweden are people staying in Sweden temporarily, plus suspicions where it was not possible to tell whether the person was registered. ' +
            'They are not in the population statistics, so their share cannot be compared with a share of the population.',
        ),
      },
    ],
    csv: kap1Csv(data, shares, lang),
    dataFiles: ['misstankta_bakgrund_2007_2018.csv', 'bra2021_brottsmisstankar.csv'],
  };
}

function kap2(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 0) => formatNumber(v, d, lang);
  const depthByOrder = new Map(loadSuspectsByBackground().map((r) => [r.crimeOrder, r.depth]));
  const b6 = loadTableB6();
  const data = buildKap2Data(loadOrigin(), depthByOrder, b6);
  const factors = buildRiskFactors(loadRiskFactors(), b6);
  const regionTotal = totalCrime(data, 'region');
  const sorted = [...regionTotal.units].sort((a, b) => b.risk - a.risk);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const bg = (unit: string) => {
    const r = b6.find((x) => x.view === 'bakgrund' && x.unit === unit);
    if (!r) throw new Error(`Table B6: ${unit} missing`);
    return r;
  };
  const utr = bg('Utrikesfödda');
  const u2 = bg('Inrikesfödda med två utrikesfödda föräldrar');
  const smallest = smallestGroup(data, 'land');
  if (!smallest) throw new Error('Chapter 2: group sizes missing');
  const smallestName = dataLabel(smallest.label, lang);
  const crimeTitle = (name: string) => `${dataLabel(name, lang)}`;

  return {
    chapterId: 'kap2',
    lang,
    h1: T(
      'Misstänkta för brott efter födelseområde och födelseland, 2015–2018',
      'Suspects by birth region and birth country, 2015–2018',
    ),
    shortTitle: T('Misstänkta för brott efter födelseområde 2015–2018: tabell', 'Suspects by birth region 2015–2018: table'),
    description: T(
      'Hur ofta personer misstänktes för brott 2015–2018 efter födelseområde, födelseland och moderns födelseområde, jämfört med inrikesfödda med två inrikesfödda föräldrar. Enligt Brå rapport 2021:9. Tabeller och CSV-fil.',
      'How often people were suspected of crime in 2015–2018, by birth region, birth country and mother’s birth region, compared with born in Sweden with two Swedish-born parents. According to Brå report 2021:9. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Andel misstänkta för brott 2015–2018 bland folkbokförda 15 år och äldre, efter födelseområde, födelseland och, för inrikesfödda med två utrikesfödda föräldrar, moderns födelseområde. Misstänkta per 1 000, överrisk och justerad överrisk jämfört med inrikesfödda med två inrikesfödda föräldrar, samt andel av de misstänkta och av befolkningen. Från Brå rapport 2021:9, tabellbilaga 1.',
      'Share of registered residents aged 15 and over who were suspected of crime in 2015–2018, by birth region, birth country and, for born in Sweden with two foreign-born parents, mother’s birth region. Suspects per 1,000, excess risk and adjusted excess risk compared with born in Sweden with two Swedish-born parents, and share of suspects and of the population. From Brå report 2021:9, table appendix 1.',
    ),
    temporalCoverage: '2015/2018',
    keywords: T(
      ['misstänkta för brott', 'födelseområde', 'födelseland', 'överrisk', 'utrikesfödda', 'Brå 2021:9'],
      ['suspected of crime', 'birth region', 'birth country', 'excess risk', 'born abroad', 'Brå 2021:9'],
    ),
    variableMeasured: T(
      ['Misstänkta per 1 000', 'Överrisk', 'Justerad överrisk', 'Andel av de misstänkta', 'Andel av befolkningen', 'Överrisk för andra faktorer'],
      ['Suspects per 1,000', 'Excess risk', 'Adjusted excess risk', 'Share of suspects', 'Share of population', 'Excess risk for other factors'],
    ),
    sources: [SOURCES.bra2021],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Det var ${n(utr.risk, 1)} gånger så vanligt att utrikesfödda misstänktes för brott någon gång 2015–2018 ` +
        'som att inrikesfödda med två inrikesfödda föräldrar gjorde det, enligt Brå. För inrikesfödda med två utrikesfödda ' +
        `föräldrar var det ${n(u2.risk, 1)} gånger så vanligt. Bland födelseområdena var överrisken högst i gruppen ` +
        `”${dataLabel(top.label, lang)}” (${n(top.risk, 2)}) och lägst i gruppen ”${dataLabel(bottom.label, lang)}” (${n(bottom.risk, 2)}).`,
      `Born-abroad people were ${n(utr.risk, 1)} times as likely to be suspected of a crime at any time in 2015–2018 as born in ` +
        `Sweden with two Swedish-born parents, according to Brå. For born in Sweden with two foreign-born parents it was ` +
        `${n(u2.risk, 1)} times as likely. Among birth regions, excess risk was highest for “${dataLabel(top.label, lang)}” ` +
        `(${n(top.risk, 2)}) and lowest for “${dataLabel(bottom.label, lang)}” (${n(bottom.risk, 2)}).`,
    ),
    note: T(
      'Misstänkt är inte samma sak som dömd. Gäller folkbokförda personer 15 år och äldre den 31 december 2014 som ' +
        'misstänktes för brott begångna 2015–2018. Alla som misstänktes någon gång under de fyra åren räknas, därför är ' +
        `talen högre än i kapitel ${chapter('kap1').num}. Överrisk är gruppens andel misstänkta delat med andelen bland inrikesfödda med två ` +
        'inrikesfödda föräldrar. Justerad överrisk är Brås beräkning om gruppen haft samma ålder, kön, inkomst och ' +
        'utbildning som jämförelsegruppen, inte en faktisk andel. Vissa grupper är små: det minsta födelselandet, ' +
        `${smallestName}, har ${n(smallest.n)} personer.`,
      'Suspected is not the same as convicted. Covers registered residents aged 15 and over on 31 December 2014 who were ' +
        'suspected of crimes committed in 2015–2018. Everyone who was suspected at any time during the four years is counted, so ' +
        `the figures are higher than in chapter ${chapter('kap1').num}. Excess risk is the group’s share of suspects divided by the share among born ` +
        'in Sweden with two Swedish-born parents. Adjusted excess risk is Brå’s calculation of what the group would look like with ' +
        'the same age, sex, income and education as the comparison group, not an actual share. Some groups are small: the smallest ' +
        `birth country, ${smallestName}, has ${n(smallest.n)} people.`,
    ),
    sections: [
      {
        heading: T('Efter bakgrund', 'By background'),
        tables: [
          b6Table(
            b6,
            'bakgrund',
            'kap2-bakgrund',
            T(
              'Brott totalt 2015–2018 efter egen och föräldrarnas bakgrund (Brå tabell B6)',
              'All offences 2015–2018 by own and parents’ background (Brå table B6)',
            ),
            lang,
          ),
        ],
      },
      {
        heading: T('Bakgrund och andra faktorer', 'Background and other factors'),
        intro: T(
          'Brå jämför i samma rapport överriskerna efter bakgrund med andra faktorer. Varje rad jämför en grupp med sin egen jämförelsegrupp.',
          'In the same report, Brå compares the excess risks by background with other factors. Each row compares one group with its own comparison group.',
        ),
        tables: [factorsTable(factors, lang)],
        after: T(
          'Varje faktor är mätt för sig. Faktorerna hänger ihop, så de kan inte läggas ihop. Ingen av siffrorna är justerad för ålder. ' +
            'Försörjningsstöd gäller om familjen fick det någon gång 2014. Brå anger överriskerna för försörjningsstöd, utbildning och kön i rapportens text, inte i en tabell.',
          'Each factor is measured on its own. The factors are linked, so they cannot be added together. None of the figures is adjusted for age. ' +
            'Social assistance means the family received it at some point in 2014. Brå gives the excess risks for social assistance, education and sex in the text of the report, not in a table.',
        ),
      },
      {
        heading: T('Efter födelseområde', 'By birth region'),
        tables: [
          riskTable(
                        'region',
            regionTotal,
            'kap2-region',
            T(
              'Brott totalt 2015–2018: utrikesfödda efter födelseområde, högst överrisk först',
              'All offences 2015–2018: born abroad by birth region, highest excess risk first',
            ),
            lang,
          ),
          b6Table(
            b6,
            'region',
            'kap2-region-b6',
            T(
              'Brott totalt 2015–2018: antal och andelar efter födelseområde (Brå tabell B6)',
              'All offences 2015–2018: numbers and shares by birth region (Brå table B6)',
            ),
            lang,
          ),
        ],
      },
      {
        heading: T('Efter födelseland', 'By birth country'),
        tables: [
          riskTable(
                        'land',
            totalCrime(data, 'land'),
            'kap2-land',
            T(
              'Brott totalt 2015–2018: utrikesfödda efter födelseland, högst överrisk först',
              'All offences 2015–2018: born abroad by birth country, highest excess risk first',
            ),
            lang,
          ),
        ],
        after: T(
          'Brå redovisar födelseländerna bara för brott totalt.',
          'Brå reports birth countries for all offences only.',
        ),
      },
      {
        heading: T('Efter moderns födelseområde', 'By mother’s birth region'),
        tables: [
          b6Table(
            b6,
            'moder',
            'kap2-moder',
            T(
              'Brott totalt 2015–2018: inrikesfödda med två utrikesfödda föräldrar efter moderns födelseområde (Brå tabell B6)',
              'All offences 2015–2018: born in Sweden with two foreign-born parents by mother’s birth region (Brå table B6)',
            ),
            lang,
          ),
        ],
      },
      {
        heading: T('Alla brottstyper efter födelseområde', 'All crime types by birth region'),
        tables: data.region
          .filter((c) => c.name !== TOTAL)
          .map((c, i) =>
            riskTable(
                            'region',
              c,
              `kap2-region-${i}`,
              T(`${crimeTitle(c.name)}, efter födelseområde`, `${crimeTitle(c.name)}, by birth region`),
              lang,
            ),
          ),
        collapsed: true,
      },
      {
        heading: T('Alla brottstyper efter moderns födelseområde', 'All crime types by mother’s birth region'),
        intro: T('Inrikesfödda med två utrikesfödda föräldrar.', 'Born in Sweden with two foreign-born parents.'),
        tables: data.moder
          .filter((c) => c.name !== TOTAL)
          .map((c, i) =>
            riskTable(
                            'moder',
              c,
              `kap2-moder-${i}`,
              T(`${crimeTitle(c.name)}, efter moderns födelseområde`, `${crimeTitle(c.name)}, by mother’s birth region`),
              lang,
            ),
          ),
        collapsed: true,
      },
    ],
    csv: kap2Csv(data, b6, factors, lang),
    dataFiles: ['misstankta_ursprung_2015_2018.csv', 'bra2021_tabell_b6.csv', 'bra2021_riskfaktorer.csv'],
  };
}

function kap3(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 0) => formatNumber(v, d, lang);
  const pct = (v: number, d = 0) => T(`${n(v, d)} procent`, `${n(v, d)}%`);
  const k = buildKap3(loadPrison(), loadPopulation());
  const tables = kap3Tables(k, lang);
  const [shareTable, countTable, popTable] = tables;
  const last = k.lastYear;
  const newAllLast = k.newAll.get(last);
  const oct1Last = k.onOct1.get(last);
  const popLast = k.popShare.get(last);
  if (newAllLast == null || oct1Last == null || popLast == null) throw new Error(`Missing ${last} values for the chapter 3 table page`);
  const withValue = (m: Map<number, number | null>) => k.years.filter((y) => m.get(y) != null);
  const missingAll = k.years.filter((y) => k.newAll.get(y) == null);
  const period = `${k.firstYear}–${k.lastYear}`;
  const variables = [...new Set(tables.flatMap((t) => t.columns).filter((c) => c.kind === 'number').map((c) => c.label))];

  return {
    chapterId: 'kap3',
    lang,
    h1: T(
      `Andel utan svenskt medborgarskap bland intagna i fängelse, ${period}`,
      `Share without Swedish citizenship among people in prison, ${period}`,
    ),
    shortTitle: T(`Fängelse och medborgarskap ${period}: tabell`, `Prison and citizenship ${period}: table`),
    description: T(
      `Andel utan svenskt medborgarskap bland nyintagna och intagna i fängelse ${period} enligt Brå, jämfört med andelen utländska medborgare i befolkningen enligt SCB. Tabell och CSV-fil.`,
      `Share without Swedish citizenship among new prisoners and people in prison, ${period}, according to Brå, compared with the share of foreign citizens in the population according to SCB. Table and CSV file.`,
    ),
    datasetDescription: T(
      `Andel utan svenskt medborgarskap bland nyintagna i fängelse (alla, män och kvinnor) och bland intagna den 1 oktober, ${period}, enligt Brås statistik över kriminalvård. Jämförs med andelen utländska medborgare i befolkningen den 31 december enligt SCB. Medborgarskap är inte födelseland. År som Brå inte anger saknas och är tomma i filen.`,
      `Share without Swedish citizenship among new prisoners (all, men and women) and among people in prison on 1 October, ${period}, according to Brå’s statistics on the prison service. Compared with the share of foreign citizens in the population on 31 December according to SCB. Citizenship is not the same as country of birth. Years that Brå does not report are missing and empty in the file.`,
    ),
    temporalCoverage: `${k.firstYear}/${k.lastYear}`,
    keywords: T(
      ['fängelse', 'kriminalvård', 'medborgarskap', 'utländska medborgare', 'nyintagna', 'Brå', 'SCB'],
      ['prison', 'prison service', 'citizenship', 'foreign citizens', 'new prisoners', 'Brå', 'SCB'],
    ),
    variableMeasured: variables,
    sources: [...k.sources.map((s) => ({ label: `Brå, ${shortReportName(s.label)}`, url: s.url })), SOURCES.scbSummary, SOURCES.scbCitizens],
    credit: T('Brå och SCB', 'Brå and SCB'),
    terms: T(
      'Brås statistik får enligt Brå användas fritt om Brå anges som källa. SCB publicerar under CC BY 4.0.',
      'According to Brå, its statistics may be used freely if Brå is named as the source. SCB publishes under CC BY 4.0.',
    ),
    lead: T(
      `År ${last} saknade ${pct(newAllLast)} av dem som togs in i fängelse svenskt medborgarskap, enligt Brå. ` +
        `Bland dem som satt i fängelse den 1 oktober ${last} var andelen ${pct(oct1Last)}. ` +
        `I hela befolkningen var ${pct(popLast, 1)} utländska medborgare, enligt SCB.`,
      `In ${last}, ${pct(newAllLast)} of the people taken into prison did not have Swedish citizenship, according to Brå. ` +
        `Among those in prison on 1 October ${last}, the share was ${pct(oct1Last)}. ` +
        `In the whole population, ${pct(popLast, 1)} were foreign citizens, according to SCB.`,
    ),
    note: T(
      'Medborgarskap är inte födelseland. Bland fängelsets utländska medborgare finns personer som inte bor i Sverige och ' +
        'inte räknas i befolkningen. Brå anger andelarna i hela procent. Streck (–) betyder att Brå inte anger något värde ' +
        `för året. För alla nyintagna saknas ${yearRanges(missingAll, lang)}. Andelar för män och kvinnor finns för ` +
        `${yearRanges(withValue(k.newMen), lang)} och för intagna den 1 oktober för ${yearRanges(withValue(k.onOct1), lang)}.`,
      'Citizenship is not the same as country of birth. Among the foreign citizens in prison are people who do not live in ' +
        'Sweden and are not counted in the population. Brå gives the shares in whole percent. A dash (–) means that Brå gives no ' +
        `value for that year. For all new prisoners, values are missing for ${yearRanges(missingAll, lang)}. Shares for men and women ` +
        `are available for ${yearRanges(withValue(k.newMen), lang)}, and for people in prison on 1 October for ${yearRanges(withValue(k.onOct1), lang)}.`,
    ) + ' ' + kap3Context(k, lang),
    sections: [
      {
        tables: [shareTable],
        after: T(
          'Andelen utländska medborgare i befolkningen är uträknad: utländska medborgare delat med folkmängden, gånger 100, ' +
            'avrundat till en decimal. Underlaget finns i tabellen över befolkningen nedan.',
          'The share of foreign citizens in the population is calculated: foreign citizens divided by the total population, times 100, ' +
            'rounded to one decimal. The figures are in the population table below.',
        ),
      },
      {
        heading: T('Antal personer', 'Number of people'),
        tables: [countTable],
        after: T(
          `Antalen gäller alla i gruppen, både med och utan svenskt medborgarskap. Här visas de för ${yearRanges(withValue(k.countNewAll), lang)}.`,
          `The numbers cover everyone in each group, with and without Swedish citizenship. They are shown here for ${yearRanges(withValue(k.countNewAll), lang)}.`,
        ),
      },
      { heading: T('Befolkningen', 'Population'), tables: [popTable] },
    ],
    csv: tablesToCsv(tables, lang),
    dataFiles: ['intagna_medborgarskap.csv', 'scb_befolkning.csv'],
  };
}

function kap4(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 1) => formatNumber(v, d, lang);
  const pct = (v: number, d = 1) => T(`${n(v, d)} procent`, `${n(v, d)}%`);
  const rows = loadRapeStudies();
  const t = kap4Tables(rows, loadPopulation(), lang);
  const pick = (chart: string, id: string) => {
    const r = rows.find((x) => x.chart === chart && x.itemId === id);
    if (!r) throw new Error(`valdtakt_domda.csv: ${chart}/${id} missing`);
    return r;
  };
  const utr = pick('bakgrund', 'utr');
  const u2 = pick('bakgrund', 'u2');
  const utrC = pick('kontroll', 'utr');
  const men = pick('kontroll', 'man');
  if (utrC.pctControls === null) throw new Error('valdtakt_domda.csv: control share missing');
  const other = T('Utrikesfödda eller minst en utrikesfödd förälder (uträknat)', 'Born abroad or at least one foreign-born parent (calculated)');

  return {
    chapterId: 'kap4',
    lang,
    h1: T('Dömda för våldtäkt efter bakgrund, 2000–2020', 'Convicted for rape by background, 2000–2020'),
    shortTitle: T('Dömda för våldtäkt efter bakgrund 2000–2020: tabell', 'Convicted for rape by background 2000–2020: table'),
    description: T(
      'Andel utrikesfödda och personer med utrikesfödda föräldrar bland dömda för våldtäkt i Sverige 2000–2020, jämfört med befolkningen och en matchad kontrollgrupp. Två studier från Lunds universitet. Tabeller och CSV-fil.',
      'Share of born-abroad people and people with foreign-born parents among those convicted of rape in Sweden in 2000–2020, compared with the population and a matched control group. Two studies from Lund University. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Bakgrund bland personer dömda för våldtäkt eller försök till våldtäkt mot en kvinna 18 år eller äldre i Sverige. Andelar efter egen och föräldrarnas födelseland 2000–2015 jämfört med befolkningen enligt SCB, och 2000–2020 jämfört med en matchad kontrollgrupp. Från två registerstudier av Khoshnood m.fl., Lunds universitet.',
      'Background among people convicted of rape or attempted rape against a woman aged 18 or older in Sweden. Shares by own and parents’ birth country in 2000–2015 compared with the population according to SCB, and in 2000–2020 compared with a matched control group. From two register studies by Khoshnood et al., Lund University.',
    ),
    temporalCoverage: '2000/2020',
    keywords: T(
      ['våldtäkt', 'dömda', 'utrikesfödda', 'utländsk bakgrund', 'Lunds universitet', 'Khoshnood'],
      ['rape', 'convicted', 'born abroad', 'foreign background', 'Lund University', 'Khoshnood'],
    ),
    variableMeasured: T(
      ['Andel av de dömda', 'Andel av kontrollgruppen', 'Andel av befolkningen'],
      ['Share of convicted', 'Share of control group', 'Share of population'],
    ),
    sources: [SOURCES.khoshnood2021, SOURCES.khoshnood2026, SOURCES.scbSummary],
    credit: T('studierna från Lunds universitet och SCB', 'the studies from Lund University and SCB'),
    lead: T(
      `Av dem som dömdes för våldtäkt mot en kvinna 2000–2015 var ${pct(utr.pct)} utrikesfödda och ` +
        `${pct(u2.pct)} inrikesfödda med två utrikesfödda föräldrar, enligt en registerstudie från Lunds ` +
        `universitet. I befolkningen, alla åldrar och båda könen, var andelarna i snitt ${n(t.popForeignBorn)} och ` +
        `${pct(t.popTwoForeignParents)}. De dömda var nästan bara män 15–60 år. I en senare studie av dömda 2000–2020 var ` +
        `${pct(utrC.pct)} av de dömda utrikesfödda, jämfört med ${pct(utrC.pctControls)} ` +
        'i en kontrollgrupp med samma kön och födelseår.',
      `Of those convicted of rape against a woman in 2000–2015, ${pct(utr.pct)} were born abroad and ${pct(u2.pct)} were born ` +
        `in Sweden with two foreign-born parents, according to a register study from Lund University. In the population, all ages ` +
        `and both sexes, the shares were on average ${pct(t.popForeignBorn)} and ${pct(t.popTwoForeignParents)}. The convicted were almost all ` +
        `men aged 15–60. In a later study of those convicted ` +
        `in 2000–2020, ${pct(utrC.pct)} of the convicted were born abroad, compared with ${pct(utrC.pctControls)} in a control ` +
        'group of the same sex and birth year.',
    ),
    note: T(
      `Studierna gäller dömda, inte alla som begår våldtäkt. De dömda är nästan bara män (${pct(men.pct)} ` +
        'i den senare studien), 15–60 år, medan befolkningens andel gäller alla åldrar och båda könen (snitt av 2000, 2005, ' +
        '2010 och 2015). Kontrollgruppen har samma kön och födelseår som de dömda. Den första studien anmäldes till ' +
        `Överklagandenämnden för etikprövning. Raden ”${other}” är uträknad som 100 minus andelen inrikesfödda med två ` +
        'inrikesfödda föräldrar. I den senare studien minskade sambandet efter justering för bland annat socioekonomi och ' +
        'tidigare brottslighet, men det fanns kvar.',
      `The studies cover people who were convicted, not everyone who commits rape. The convicted are almost all men (${pct(men.pct)} ` +
        'in the later study), aged 15–60, while the population share covers all ages and both sexes (average of 2000, 2005, 2010 ' +
        'and 2015). The control group has the same sex and birth year as the convicted. The first study was reported to the ' +
        'Swedish appeals board for ethical review (Överklagandenämnden för etikprövning). The row “' +
        `${other}” is calculated as 100 minus the share born in Sweden with two Swedish-born parents. In the later study, the link ` +
        'weakened after adjusting for socioeconomic factors and earlier crime, among other things, but it remained.',
    ),
    sections: [
      {
        heading: T('Bakgrund bland dömda 2000–2015', 'Background among convicted 2000–2015'),
        tables: [t.background],
        after: T(
          'Jämförelsen med befolkningen görs bara för utrikesfödda och inrikesfödda med två utrikesfödda föräldrar. Det är de ' +
            'grupper som går att räkna fram ur SCB:s sammanställning som sidan använder.',
          'The comparison with the population is only made for born-abroad people and for people born in Sweden with two foreign-born ' +
            'parents. These are the groups that can be calculated from the SCB summary table the site uses.',
        ),
      },
      { heading: T('Dömda och kontrollgrupp 2000–2020', 'Convicted and control group 2000–2020'), tables: [t.controls] },
      { heading: T('Födelseregion', 'Birth region'), tables: [t.region] },
      { heading: T('Tidigare domar och bistånd', 'Previous convictions and social assistance'), tables: [t.prior] },
      {
        heading: T('Befolkningen', 'Population'),
        tables: [t.population],
        after: T(
          'Uträknat: inrikesfödda med två utrikesfödda föräldrar är personer med utländsk bakgrund minus utrikesfödda. Andelen ' +
            'är gruppen delat med folkmängden, gånger 100. Snittet är medelvärdet av de fyra åren, avrundat till en decimal.',
          'Calculated: born in Sweden with two foreign-born parents are people with a foreign background minus those born abroad. The ' +
            'share is the group divided by the total population, times 100. The average is the mean of the four years, rounded to one decimal.',
        ),
      },
    ],
    csv: t.csv,
    dataFiles: ['valdtakt_domda.csv', 'scb_befolkning.csv'],
  };
}

function kap5(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const rows = loadBra2005();
  const [period, risk, shares, region, crimes] = kap5Tables(rows, lang);
  const v = (chart: string, id: string, series: string) => {
    const r = rows.find((x) => x.chart === chart && x.groupId === id && x.series === series);
    if (!r) throw new Error(`bra2005.csv: ${chart}/${id}/${series} missing`);
    return formatNumber(r.value, 1, lang);
  };

  return {
    chapterId: 'kap5',
    lang,
    h1: T(
      'Misstänkta för brott efter bakgrund 1985–89 och 1997–2001, Brå 2005:17',
      'Suspects by background 1985–89 and 1997–2001, Brå 2005:17',
    ),
    shortTitle: T('Brå 2005:17, misstänkta efter bakgrund: tabell', 'Brå 2005:17, suspects by background: table'),
    description: T(
      'Överrisk att misstänkas för brott för utrikesfödda och inrikesfödda med utrikesfödda föräldrar 1985–89 och 1997–2001, efter födelseregion och brottstyp. Från Brå rapport 2005:17. Tabeller och CSV-fil.',
      'Excess risk of being suspected of crime for born-abroad people and people born in Sweden with foreign-born parents, 1985–89 and 1997–2001, by birth region and crime type. From Brå report 2005:17. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Siffror ur Brå rapport 2005:17: överrisk att misstänkas för brott 1985–89 och 1997–2001, andel misstänkta ojusterat och standardiserat för kön, ålder, utbildning och förvärvsinkomst, andel av de misstänkta och av befolkningen efter bakgrund och födelseregion, samt andel misstänkta för tio brottstyper. Folkbokförda personer.',
      'Figures from Brå report 2005:17: excess risk of being suspected of crime in 1985–89 and 1997–2001, share of suspects unadjusted and standardised for sex, age, education and income, share of suspects and of the population by background and birth region, and share of suspects for ten crime types. Registered residents.',
    ),
    temporalCoverage: '1985/2001',
    keywords: T(
      ['misstänkta för brott', 'överrisk', 'utrikesfödda', 'Brå 2005:17', 'födelseregion'],
      ['suspected of crime', 'excess risk', 'born abroad', 'Brå 2005:17', 'birth region'],
    ),
    variableMeasured: T(
      ['Överrisk', 'Standardiserad överrisk', 'Andel misstänkta', 'Andel av de misstänkta', 'Andel av befolkningen', 'Överrepresentation'],
      ['Excess risk', 'Standardised excess risk', 'Share of suspects', 'Share of the suspects', 'Share of population', 'Overrepresentation'],
    ),
    sources: [SOURCES.bra2005],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Det var ${v('period', 'utr', 'p9701')} gånger så vanligt att utrikesfödda misstänktes för brott 1997–2001 som att ` +
        `inrikesfödda med två inrikesfödda föräldrar gjorde det, enligt Brå. 1985–89 var överrisken ${v('period', 'utr', 'p8589')}. ` +
        `Med hänsyn till kön, ålder, utbildning och inkomst var överrisken ${v('overrisk', 'utr', 'stand')} för 1997–2001.`,
      `Born-abroad people were ${v('period', 'utr', 'p9701')} times as likely to be suspected of crime in 1997–2001 as people born ` +
        `in Sweden with two Swedish-born parents, according to Brå. In 1985–89 the excess risk was ${v('period', 'utr', 'p8589')}. ` +
        `Taking sex, age, education and income into account, the excess risk was ${v('overrisk', 'utr', 'stand')} for 1997–2001.`,
    ),
    note: T(
      'Siffrorna är över 20 år gamla. Misstänkt är inte samma sak som dömd. Överrisk är andelen misstänkta i gruppen delat ' +
        'med andelen bland inrikesfödda med två inrikesfödda föräldrar, som därför har överrisken 1,0. Överrepresentation är ' +
        'gruppens andel av de misstänkta delat med dess andel av befolkningen. Uppgifterna för 1985–89 kommer från Brå 1996 ' +
        'och redovisas i tabell 8 i Brå 2005:17. Några brottstyper i Brås tabell 11 gick inte att läsa ur PDF-filen och saknas.',
      'The figures are over 20 years old. Suspected is not the same as convicted. Excess risk is the share of suspects in the ' +
        'group divided by the share among people born in Sweden with two Swedish-born parents, who therefore have an excess risk of ' +
        '1.0. Overrepresentation is the group’s share of the suspects divided by its share of the population. The figures for ' +
        '1985–89 come from Brå 1996 and are shown in table 8 in Brå 2005:17. Some crime types in Brå’s table 11 could not be read ' +
        'from the PDF file and are missing.',
    ),
    sections: [
      { heading: T('Överrisk över tid', 'Excess risk over time'), tables: [period] },
      {
        heading: T('Ojusterat och standardiserat', 'Unadjusted and standardised'),
        tables: [risk],
        after: T(
          'Standardiserad betyder att Brå tagit hänsyn till skillnader i kön, ålder, utbildning och förvärvsinkomst.',
          'Standardised means that Brå has taken into account differences in sex, age, education and income.',
        ),
      },
      { heading: T('Andel av de misstänkta och av befolkningen', 'Share of suspects and of the population'), tables: [shares] },
      { heading: T('Efter födelseregion', 'By birth region'), tables: [region] },
      { heading: T('Efter brottstyp', 'By crime type'), tables: [crimes] },
    ],
    csv: kap5Csv(rows, lang),
    dataFiles: ['bra2005.csv'],
  };
}

function kap6(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const rows = loadNtu();
  const p = (crime: string, sex: 'man' | 'kvinnor', g: string) => {
    const v = pooled(rows, crime, sex, g).pct;
    if (v === null) throw new Error(`NTU: no value for ${crime} ${sex} ${g}`);
    return T(`${formatNumber(v, 1, 'sv')} procent`, `${formatNumber(v, 1, 'en')}%`);
  };
  const hidden = flagged(rows);
  const count = (list: typeof hidden, flag: 'x' | '.') => {
    const n = list.filter((r) => r.flag === flag).length;
    return T(n === 1 ? 'ett värde' : `${n} värden`, n === 1 ? 'one value is' : `${n} values are`);
  };

  return {
    chapterId: 'kap6',
    lang,
    h1: T('Utsatta för brott efter utländsk och svensk bakgrund, 2016–2022', 'Victims of crime by foreign and Swedish background, 2016–2022'),
    shortTitle: T('Utsatta för brott efter bakgrund 2016–2022: tabell', 'Victims of crime by background 2016–2022: table'),
    description: T(
      'Andel som uppger att de utsatts för nio typer av brott, efter utländsk och svensk bakgrund, kön och världsdel, enligt Brås Nationella trygghetsundersökning 2017–2023. Tabeller och CSV-fil.',
      'Share who say they were victims of nine types of crime, by foreign and Swedish background, sex and world region, according to Brå’s Swedish Crime Survey 2017–2023. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Självrapporterad utsatthet för brott bland personer 16–84 år, enligt Nationella trygghetsundersökningen (NTU) 2017–2023. Andel (%) utsatta med 95 procents konfidensintervall, efter utländsk och svensk bakgrund, kön och världsdel, alla år sammanslagna och per år. Från Brå, NTU Kortanalys 2/2024, tabellbilaga.',
      'Self-reported victimisation among people aged 16–84, according to the Swedish Crime Survey (NTU) 2017–2023. Share (%) who were victims, with 95 percent confidence intervals, by foreign and Swedish background, sex and world region, all years pooled and by year. From Brå, NTU Kortanalys 2/2024, table appendix.',
    ),
    temporalCoverage: '2016/2022',
    keywords: T(
      ['utsatthet för brott', 'brottsoffer', 'NTU', 'utländsk bakgrund', 'Brå'],
      ['victimisation', 'crime victims', 'NTU', 'foreign background', 'Brå'],
    ),
    variableMeasured: T(['Andel utsatta för brott', 'Konfidensintervall (95 %)'], ['Share who were victims of crime', 'Confidence interval (95%)']),
    sources: [SOURCES.ntu2024],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Bland män med utländsk bakgrund uppgav ${p('misshandel', 'man', 'utlandsk')} att de utsatts för misshandel under ett år, ` +
        `jämfört med ${p('misshandel', 'man', 'svensk')} bland män med svensk bakgrund, enligt Brås trygghetsundersökning 2016–2022. ` +
        `För sexualbrott mot kvinnor var det omvänt: ${p('sexualbrott', 'kvinnor', 'utlandsk')} bland kvinnor med utländsk bakgrund och ` +
        `${p('sexualbrott', 'kvinnor', 'svensk')} bland kvinnor med svensk bakgrund.`,
      `Among men with a foreign background, ${p('misshandel', 'man', 'utlandsk')} said they had been assaulted during a year, ` +
        `compared with ${p('misshandel', 'man', 'svensk')} among men with a Swedish background, according to Brå’s crime survey 2016–2022. ` +
        `For sexual offences against women it was the other way round: ${p('sexualbrott', 'kvinnor', 'utlandsk')} among women with a ` +
        `foreign background and ${p('sexualbrott', 'kvinnor', 'svensk')} among women with a Swedish background.`,
    ),
    note: T(
      'Svaren kommer från en enkät och gäller även brott som aldrig anmälts. Utländsk bakgrund betyder här att personen själv eller ' +
        'en eller båda föräldrarna är födda utomlands, vilket skiljer sig från sidans andra kapitel. Inte justerat för ålder eller ' +
        'andra skillnader mellan grupperna. Alla tillfrågade svarar inte, och Brå väger svaren så att de ska spegla befolkningen. ' +
        'Lägre och övre gräns är ett 95 procents konfidensintervall. Trakasserier gäller 2019–2022. ' +
        `I tabellerna efter världsdel saknas ${count(hidden, 'x')} därför att gruppen hade färre än 100 svarande, som Brå inte redovisar, ` +
        `och ${count(hidden, '.')} därför att inga fall fanns. De visas med streck.`,
      'The answers come from a survey and include crimes that were never reported. Foreign background here means that the person, ' +
        'or one or both parents, was born abroad, which differs from the site’s other chapters. Not adjusted for age or other ' +
        'differences between the groups. Not everyone who is asked answers, and Brå weights the answers so that they reflect the ' +
        'population. Lower and upper limit is a 95 percent confidence interval. Harassment covers 2019–2022. ' +
        `In the tables by world region, ${count(hidden, 'x')} missing because the group had fewer than 100 respondents, which Brå does not report, ` +
        `and ${count(hidden, '.')} missing because there were no cases. They are shown as a dash.`,
    ),
    sections: [
      { heading: T('Utländsk och svensk bakgrund', 'Foreign and Swedish background'), tables: backgroundTables(rows, lang) },
      {
        heading: T('Efter världsdel', 'By world region'),
        intro: T(
          'Världsdel för personens eget födelseland, eller för den utrikesfödda förälderns, eller moderns om båda är födda utomlands. ' +
            'Sovjetunionen avser länder i före detta Sovjetunionen. Alla år sammanslagna.',
          'World region of the person’s own birth country, or of the foreign-born parent’s, or the mother’s if both were born abroad. ' +
            'Former Soviet Union means countries of the former Soviet Union. All years pooled.',
        ),
        tables: regionTables(rows, lang),
        collapsed: true,
      },
      { heading: T('Per år', 'By year'), tables: yearTables(rows, lang), collapsed: true },
    ],
    csv: kap6Csv(rows, lang),
    dataFiles: ['ntu_utsatthet.csv'],
  };
}

function kap7(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 1) => formatNumber(v, d, lang);
  const rows = loadDeportation();
  const facts = loadDeportationFacts();
  const total = totalRow(rows);
  const yr = (y: number) => n(fact(facts, 'verkstalld_inom_1_ar', y), 0);
  const hidden = suppressedGroups(rows).map((r) => dataLabel(r.group, lang));

  return {
    chapterId: 'kap7',
    lang,
    h1: T('Utvisningsdömda som lämnade fängelset 2013–2023: utvisade och nya brott', 'People sentenced to deportation who left prison in 2013–2023: deported and new crimes'),
    shortTitle: T('Utvisning på grund av brott 2013–2024: tabell', 'Deportation for crime 2013–2024: table'),
    description: T(
      'Andel av de utvisningsdömda som lämnade fängelset 2013–2023 som utvisats eller lagförts för nya brott i Sverige, efter kön, ålder, huvudbrott och medborgarskap, enligt Brå rapport 2026:15. Tabeller och CSV-fil.',
      'Share of people sentenced to deportation who left prison in 2013–2023 who were deported or convicted of new crimes in Sweden, by sex, age, main offence and citizenship, according to Brå report 2026:15. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Alla med utvisningsbeslut i en fängelsedom som lämnade anstalt 2013–2023, uppföljda till och med 2024: andel som utvisats, andel utvisade inom ett år, andel som lagförts för nya brott i Sverige och andel lagförda för brott inom ett år, samt antal personer. Från Brå rapport 2026:15, bilaga 1 tabell B1.',
      'Everyone with a deportation order in a prison sentence who left prison in 2013–2023, followed up to the end of 2024: share deported, share deported within a year, share convicted of new crimes in Sweden and share convicted of a crime within a year, and the number of people. From Brå report 2026:15, appendix 1 table B1.',
    ),
    temporalCoverage: '2013/2024',
    keywords: T(
      ['utvisning', 'utvisning på grund av brott', 'verkställighet', 'återfall', 'medborgarskap', 'Brå 2026:15'],
      ['deportation', 'deportation for crime', 'enforcement', 'reoffending', 'citizenship', 'Brå 2026:15'],
    ),
    variableMeasured: T(
      ['Andel utvisade', 'Andel utvisade inom 1 år', 'Andel lagförda för nya brott', 'Antal personer'],
      ['Share deported', 'Share deported within 1 year', 'Share convicted of new crimes', 'Number of people'],
    ),
    sources: [SOURCES.bra2026utvisning],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Av ${n(total.n as number, 0)} personer som dömts till fängelse och utvisning och lämnade anstalten 2013–2023 hade ${n(total.pctDeported as number)} procent ` +
        `utvisats till och med 2024, enligt Brå. ${n(total.pctReconvicted as number)} procent lagfördes för nya brott i Sverige. Andelen som utvisades ` +
        `inom ett år var ${yr(2013)} procent bland dem som lämnade fängelset 2013, ${yr(2019)} procent 2019 och ${yr(2023)} procent 2023.`,
      `Of ${n(total.n as number, 0)} people sentenced to prison and deportation who left prison in 2013–2023, ${n(total.pctDeported as number)}% had been ` +
        `deported by the end of 2024, according to Brå. ${n(total.pctReconvicted as number)}% were convicted of new crimes in Sweden. The share deported ` +
        `within a year was ${yr(2013)}% among those who left prison in 2013, ${yr(2019)}% in 2019 and ${yr(2023)}% in 2023.`,
    ),
    note: T(
      'Medborgarskap är inte alltid landet personen utvisas till. ' + notRegisteredSentence(rows, 'sv') + ' De som lämnade fängelset tidigt i perioden har följts längre, därför ' +
        'finns också andelar inom ett år, som är jämförbara mellan åren. Nya brott gäller lagföringar i Sverige för brott efter fängelset. ' +
        'Brå redovisar inte uppgifter som bygger på färre än 4 personer, och döljer då också gruppens storlek. De visas med streck. ' +
        `Helt dolda grupper: ${hidden.join(', ')}. Små grupper kan ändras mycket av enstaka personer.`,
      'Citizenship is not always the country a person is deported to. ' + notRegisteredSentence(rows, 'en') + ' Those who left prison early in the period have been followed for longer, ' +
        'which is why shares within one year are also given; they can be compared between years. New crimes means convictions in Sweden for ' +
        'crimes after prison. Brå does not report figures based on fewer than 4 people, and then also hides the size of the group. They are ' +
        `shown as a dash. Fully hidden groups: ${hidden.join(', ')}. Small groups can change a lot because of single people.`,
    ),
    sections: [
      { tables: deportTables(rows, lang) },
    ],
    csv: kap7Csv(rows, lang),
    dataFiles: ['utvisning_b1.csv', 'utvisning_text.csv'],
  };
}

function kap8(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number | null, d = 0) => formatNumber(v as number, d, lang);
  const rows = loadHomicide();
  const utl = homicideItem(rows, 'utl');
  const lag = homicideItem(rows, 'lagford');

  return {
    chapterId: 'kap8',
    lang,
    h1: T('Offer och gärningspersoner vid dödligt våld jämfört med befolkningen, 2005–2021', 'Homicide victims and perpetrators compared with the population, 2005–2021'),
    shortTitle: T('Dödligt våld 2005–2021, offer och gärningspersoner: tabell', 'Homicide 2005–2021, victims and perpetrators: table'),
    description: T(
      'Bakgrund, inkomst, arbete, boende och tidigare lagföringar bland offer och gärningspersoner vid dödligt våld 2005–2021, jämfört med befolkningen, enligt Brå rapport 2025:5. Tabeller och CSV-fil.',
      'Background, income, work, housing and earlier convictions among homicide victims and perpetrators in 2005–2021, compared with the population, according to Brå report 2025:5. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Andelar (%) bland 1 521 offer och 1 175 gärningspersoner vid dödligt våld i Sverige 2005–2021 och i befolkningen: utländsk bakgrund, utrikes födda, inrikes födda med två inrikes födda föräldrar, lagförda för brott året före, inkomst i lägsta tiondelen, boende i område med stora socioekonomiska utmaningar, ensamstående med barn och förvärvsarbetande. Uppgifter som Brå anger i texten eller på figurer i rapport 2025:5.',
      'Shares (%) among 1,521 victims and 1,175 perpetrators of homicide in Sweden in 2005–2021 and in the population: foreign background, born abroad, born in Sweden with two Swedish-born parents, convicted of a crime in the year before, income in the lowest tenth, living in an area with major socio-economic challenges, single parents and people in employment. Figures that Brå gives in the text or on figures in report 2025:5.',
    ),
    temporalCoverage: '2005/2021',
    keywords: T(
      ['dödligt våld', 'brottsoffer', 'gärningspersoner', 'utländsk bakgrund', 'socioekonomi', 'Brå 2025:5'],
      ['homicide', 'crime victims', 'perpetrators', 'foreign background', 'socio-economic', 'Brå 2025:5'],
    ),
    variableMeasured: T(['Andel bland offer', 'Andel bland gärningspersoner', 'Andel i befolkningen'], ['Share among victims', 'Share among perpetrators', 'Share in the population']),
    sources: [SOURCES.bra2025dodligt],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Av offren för dödligt våld i Sverige 2005–2021 hade ${n(utl.victims)} procent utländsk bakgrund, och av gärningspersonerna ${n(utl.perpetrators)} procent, ` +
        `enligt Brå. I befolkningen var andelen ${n(utl.population)} procent. ${n(lag.victims)} procent av offren och ${n(lag.perpetrators)} procent av ` +
        `gärningspersonerna hade lagförts för brott året före, mot ${n(lag.population, 1)} procent i befolkningen.`,
      `Of homicide victims in Sweden in 2005–2021, ${n(utl.victims)}% had a foreign background, and of perpetrators ${n(utl.perpetrators)}%, according to Brå. ` +
        `In the population the share was ${n(utl.population)}%. ${n(lag.victims)}% of victims and ${n(lag.perpetrators)}% of perpetrators had been convicted of ` +
        `a crime in the year before, against ${n(lag.population, 1)}% of the population.`,
    ),
    note: T(
      'Utländsk bakgrund betyder utrikes född eller inrikes född med två utrikes födda föräldrar. Gärningspersoner finns bara för uppklarade fall, och ' +
        'omkring 70 procent av fallen i kriminell miljö är ouppklarade. Bara personer med svenskt personnummer ingår. Inte justerat för ålder eller kön. ' +
        'Inkomster från brott syns inte i registren. Befolkningens andel är ett snitt för perioden. Brå anger hela procent utom för befolkningens ' +
        'lagföringar, och tabellen visar en decimal. Brå redovisar resten av resultaten i diagram utan siffror, så de finns inte här.',
      'Foreign background means born abroad, or born in Sweden with two foreign-born parents. Perpetrators are only known for solved cases, and about 70% of ' +
        'cases in criminal milieus are unsolved. Only people with a Swedish personal identity number are included. Not adjusted for age or sex. Income from crime ' +
        'does not show in the registers. The population share is an average for the period. Brå gives whole percentages except for the population’s ' +
        'convictions, and the table shows one decimal. Brå shows the rest of its results in charts without numbers, so they are not included here.',
    ),
    sections: [{ tables: homicideTables(rows, lang) }],
    csv: kap8Csv(rows, lang),
    dataFiles: ['dodligt_vald.csv'],
  };
}

function kap9(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const rows = loadCohorts();
  const list = cohortList(rows);
  const first = list[0];
  const last = list[list.length - 1];
  const v = (c: string, g: 'utrikesfodd' | 'andra_gen' | 'native') => formatNumber(cohortCell(rows, 'alla', 'man', c, g).pct, 1, lang);

  return {
    chapterId: 'kap9',
    lang,
    h1: T('Lagförda före 25 års ålder efter bakgrund, födda 1966–1993', 'Convicted before age 25 by background, born 1966–1993'),
    shortTitle: T('Lagförda före 25 år, födda 1966–1993: tabell', 'Convicted before 25, born 1966–1993: table'),
    description: T(
      'Andel som lagförts för brott före 25 års ålder bland alla födda 1966–1993, efter bakgrund, kön och födelseår, och bland dem som växte upp i familjer med lägst inkomster. Från Bäckman m.fl. 2021. Tabeller och CSV-fil.',
      'Share convicted of a crime before age 25 among everyone born in 1966–1993, by background, sex and birth year, and among those who grew up in the lowest-income families. From Bäckman et al. 2021. Tables and CSV file.',
    ),
    datasetDescription: T(
      'Alla födda 1966–1993 som var folkbokförda i Sverige från 15 till 24 års ålder, i grupper om fyra födelseår: andel (%) som lagförts minst en gång respektive upprepat före 25 års ålder, relativ risk jämfört med inrikes födda med minst en inrikes född förälder, och antal personer. För alla och för dem som växte upp i den tiondel av familjerna som hade lägst inkomster. Tabell 1 och 2 i Bäckman, Estrada, Nilsson och Sivertsson 2021, Nordic Journal of Criminology (CC BY 4.0).',
      'Everyone born in 1966–1993 who was registered as living in Sweden from age 15 to 24, in groups of four birth years: share (%) convicted at least once and repeatedly before age 25, relative risk compared with people born in Sweden with at least one Swedish-born parent, and number of people. For everyone and for those who grew up in the tenth of families with the lowest incomes. Tables 1 and 2 in Bäckman, Estrada, Nilsson and Sivertsson 2021, Nordic Journal of Criminology (CC BY 4.0).',
    ),
    temporalCoverage: '1990/2017',
    keywords: T(
      ['lagförda', 'unga', 'utrikes födda', 'andra generationen', 'låg inkomst', 'födelsekohorter'],
      ['convicted', 'young people', 'born abroad', 'second generation', 'low income', 'birth cohorts'],
    ),
    variableMeasured: T(['Andel lagförda före 25 års ålder', 'Relativ risk', 'Antal personer'], ['Share convicted before age 25', 'Relative risk', 'Number of people']),
    sources: [SOURCES.backman2021],
    credit: T('Bäckman, Estrada, Nilsson och Sivertsson 2021', 'Bäckman, Estrada, Nilsson and Sivertsson 2021'),
    terms: T('Artikeln är publicerad med öppen tillgång under CC BY 4.0.', 'The article is published open access under CC BY 4.0.'),
    lead: T(
      `Av männen födda ${last} hade ${v(last, 'utrikesfodd')} procent av de utrikes födda, ${v(last, 'andra_gen')} procent av de inrikes födda med två utrikes ` +
        `födda föräldrar och ${v(last, 'native')} procent av övriga lagförts för brott före 25 års ålder, enligt en studie från Stockholms universitet. ` +
        `Bland männen födda ${first} var andelarna ${v(first, 'utrikesfodd')}, ${v(first, 'andra_gen')} och ${v(first, 'native')} procent.`,
      `Of men born in ${last}, ${v(last, 'utrikesfodd')}% of those born abroad, ${v(last, 'andra_gen')}% of those born in Sweden with two foreign-born parents ` +
        `and ${v(last, 'native')}% of the others had been convicted of a crime before age 25, according to a study from Stockholm University. ` +
        `Among men born in ${first}, the shares were ${v(first, 'utrikesfodd')}%, ${v(first, 'andra_gen')}% and ${v(first, 'native')}%.`,
    ),
    note: T(
      'Varje grupp följs från 15 till 24 års ålder. Bara personer som var folkbokförda i Sverige hela den tiden ingår. Lagförd betyder dom, ' +
        'strafföreläggande eller åtalsunderlåtelse. Upprepat betyder minst fyra lagföringar för män och minst två för kvinnor, som i artikeln. ' +
        'Relativ risk är artikelns egen, uträknad från oavrundade andelar, så den kan skilja sig något från en kvot av de avrundade andelarna. ' +
        'Lägst inkomster: föräldrarnas sammanlagda arbetsinkomst låg i den lägsta tiondelen minst två av tre år när personen var 15–17 år.',
      'Each group is followed from age 15 to 24. Only people registered as living in Sweden for that whole time are included. Convicted means a court ' +
        'sentence, a summary penalty or a waiver of prosecution. Repeatedly means at least four convictions for men and at least two for women, as in the ' +
        'article. Relative risk is the article’s own, calculated from unrounded shares, so it can differ slightly from a ratio of the rounded shares. ' +
        'Lowest incomes: the parents’ combined income from work was in the lowest tenth in at least two of three years when the person was 15–17.',
    ),
    sections: [
      { heading: T('Alla', 'Everyone'), tables: cohortTables(rows, lang).filter((t) => t.id.startsWith('kap9-alla')) },
      {
        heading: T('Familjer med lägst inkomster', 'Lowest-income families'),
        tables: cohortTables(rows, lang).filter((t) => t.id.startsWith('kap9-laginkomst')),
      },
    ],
    csv: kap9Csv(rows, lang),
    dataFiles: ['backman_lagforda_fore_25.csv'],
  };
}

function kap10(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const rows = loadBirthCohorts();
  const years = birthYears(rows, 'fore25');
  const bg = firstBackgroundYear(rows, 'fore25');
  const last = years[years.length - 1];
  const v = (g: 'alla' | 'I20' | 'Utr' | 'I02', y: number) => formatNumber(kohortValue(rows, 'fore25', 'samtliga', g, y) as number, 1, lang);
  const tables = kohortTables(rows, lang);

  return {
    chapterId: 'kap10',
    lang,
    h1: T(`Lagförda före 25 och 20 års ålder efter födelseår och bakgrund, födda ${years[0]}–2003`, `Convicted before age 25 and 20 by birth year and background, born ${years[0]}–2003`),
    shortTitle: T('Lagförda efter födelseår: tabell', 'Convicted by birth year: table'),
    description: T(
      'Andel av varje födelseår som lagförts för brott före 25 och före 20 års ålder, efter kön och födelsebakgrund, enligt Brås officiella födelsekohortstatistik (rapport 2025:21). Tabeller och CSV-fil.',
      'Share of each birth year convicted of a crime before age 25 and before age 20, by sex and birth background, according to Brå’s official birth cohort statistics (report 2025:21). Tables and CSV file.',
    ),
    datasetDescription: T(
      'Andel (%) av alla folkbokförda födda ett visst år som lagförts för brott minst en gång före 25 års ålder (födda 1958–1998) och före 20 års ålder (födda 1958–2003), för kvinnor och män tillsammans och var för sig. Efter födelsebakgrund för födda från 1984: inrikesfödda med två, en eller ingen inrikesfödd förälder samt utrikesfödda. Brå rapport 2025:21, tabell 1 och tabell 4.',
      'Share (%) of everyone registered in Sweden and born in a given year who was convicted of a crime at least once before age 25 (born 1958–1998) and before age 20 (born 1958–2003), for women and men together and separately. By birth background for those born from 1984: born in Sweden with two, one or no Swedish-born parents, and born abroad. Brå report 2025:21, table 1 and table 4.',
    ),
    temporalCoverage: '1958/2023',
    keywords: T(
      ['födelsekohort', 'lagförda', 'unga', 'utrikesfödda', 'födelsebakgrund', 'Brå 2025:21'],
      ['birth cohort', 'convicted', 'young people', 'born abroad', 'birth background', 'Brå 2025:21'],
    ),
    variableMeasured: T(['Andel lagförda före 25 års ålder', 'Andel lagförda före 20 års ålder'], ['Share convicted before age 25', 'Share convicted before age 20']),
    sources: [SOURCES.bra2025kohort],
    credit: 'Brå',
    terms: BRA_TERMS(lang),
    lead: T(
      `Av dem som föddes ${years[0]} hade ${v('alla', years[0])} procent lagförts för brott före 25 års ålder, och av dem som föddes ${last} ${v('alla', last)} procent, ` +
        `enligt Brå. För födda ${bg} var andelen ${v('Utr', bg)} procent bland utrikesfödda och ${v('I20', bg)} procent bland inrikesfödda med två ` +
        `inrikesfödda föräldrar. För födda ${last} var andelarna ${v('Utr', last)} och ${v('I20', last)} procent.`,
      `Of those born in ${years[0]}, ${v('alla', years[0])}% had been convicted of a crime before age 25, and of those born in ${last}, ${v('alla', last)}%, ` +
        `according to Brå. For those born in ${bg}, the share was ${v('Utr', bg)}% among people born abroad and ${v('I20', bg)}% among people born in ` +
        `Sweden with two Swedish-born parents. For those born in ${last}, the shares were ${v('Utr', last)}% and ${v('I20', last)}%.`,
    ),
    note: T(
      'Bara den som var folkbokförd i Sverige vid 15 års ålder och när beslutet kom räknas, så den som invandrat efter 15 års ålder är inte med. ' +
        'Lagförd betyder dom i tingsrätt, strafföreläggande eller åtalsunderlåtelse. Den som senare friats i högre rätt räknas också. ' +
        `Siffror efter födelsebakgrund finns bara för födda från ${bg}, eftersom ` +
        'Brå saknar folkmängd efter bakgrund för tidigare år. Tomma celler betyder att uppgift saknas. Inte justerat för till exempel familjens inkomst.',
      'Only people registered in Sweden at age 15 and when the decision was made are counted, so people who moved to Sweden after age 15 are not included. ' +
        'Convicted means a district court judgment, a summary penalty or a waiver of prosecution. People later acquitted by a higher court are still counted. ' +
        `Figures by birth background only exist for those born from ${bg}, ` +
        'because Brå has no population figures by background for earlier years. Empty cells mean no value. Not adjusted for, for example, family income.',
    ),
    sections: [
      { heading: T('Före 25 års ålder', 'Before age 25'), tables: tables.filter((t) => t.id.startsWith('kap10-fore25')) },
      { heading: T('Före 20 års ålder', 'Before age 20'), tables: tables.filter((t) => t.id.startsWith('kap10-fore20')), collapsed: true },
    ],
    csv: kap10Csv(rows, lang),
    dataFiles: ['bra_fodelsekohorter.csv'],
  };
}

const BUILDERS: Record<string, (lang: Lang) => TablePageContent> = { kap1, kap2, kap3, kap4, kap5, kap6, kap7, kap8, kap9, kap10 };
const cache = new Map<string, TablePageContent>();

/** The text and tables for one table page in one language. */
export function tablePageContent(chapterId: string, lang: Lang): TablePageContent {
  const build = BUILDERS[chapterId];
  if (!build) throw new Error(`No table page content for ${chapterId}`);
  const key = `${chapterId}/${lang}`;
  if (!cache.has(key)) cache.set(key, build(lang));
  return cache.get(key) as TablePageContent;
}
