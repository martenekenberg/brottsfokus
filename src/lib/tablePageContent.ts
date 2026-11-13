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
} from './data';
import { buildKap1Data, crimeById, crimeName, type GroupId } from './chapters/kap1';
import { kap1Csv, rateTable, ratioTable } from './chapters/kap1Tables';
import { buildKap2Data, smallestGroup } from './chapters/kap2';
import { b6Table, kap2Csv, riskTable, totalCrime, TOTAL } from './chapters/kap2Tables';
import { buildKap3, kap3Tables, shortReportName } from './chapters/kap3';
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
      ['Misstänkta per 1 000 invånare', 'Jämfört med inrikesfödda med två inrikesfödda föräldrar'],
      ['Suspects per 1,000 residents', 'Compared with born in Sweden, two Swedish-born parents'],
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
    ],
    csv: kap1Csv(data, lang),
    dataFiles: ['misstankta_bakgrund_2007_2018.csv'],
  };
}

function kap2(lang: Lang): TablePageContent {
  const T = <X,>(sv: X, en: X): X => tr(lang, sv, en);
  const n = (v: number, d = 0) => formatNumber(v, d, lang);
  const depthByOrder = new Map(loadSuspectsByBackground().map((r) => [r.crimeOrder, r.depth]));
  const b6 = loadTableB6();
  const data = buildKap2Data(loadOrigin(), depthByOrder, b6);
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
      ['Misstänkta per 1 000', 'Överrisk', 'Justerad överrisk', 'Andel av de misstänkta', 'Andel av befolkningen'],
      ['Suspects per 1,000', 'Excess risk', 'Adjusted excess risk', 'Share of suspects', 'Share of population'],
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
        'talen högre än i kapitel 1. Överrisk är gruppens andel misstänkta delat med andelen bland inrikesfödda med två ' +
        'inrikesfödda föräldrar. Justerad överrisk är Brås beräkning om gruppen haft samma ålder, kön, inkomst och ' +
        'utbildning som jämförelsegruppen, inte en faktisk andel. Vissa grupper är små: det minsta födelselandet, ' +
        `${smallestName}, har ${n(smallest.n)} personer.`,
      'Suspected is not the same as convicted. Covers registered residents aged 15 and over on 31 December 2014 who were ' +
        'suspected of crimes committed in 2015–2018. Everyone who was suspected at any time during the four years is counted, so ' +
        'the figures are higher than in chapter 1. Excess risk is the group’s share of suspects divided by the share among born ' +
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
    csv: kap2Csv(data, b6, lang),
    dataFiles: ['misstankta_ursprung_2015_2018.csv', 'bra2021_tabell_b6.csv'],
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
    ),
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
        `universitet. I befolkningen var andelarna i snitt ${n(t.popForeignBorn)} och ` +
        `${pct(t.popTwoForeignParents)}. I en senare studie av dömda 2000–2020 var ` +
        `${pct(utrC.pct)} av de dömda utrikesfödda, jämfört med ${pct(utrC.pctControls)} ` +
        'i en kontrollgrupp med samma kön och födelseår.',
      `Of those convicted of rape against a woman in 2000–2015, ${pct(utr.pct)} were born abroad and ${pct(u2.pct)} were born ` +
        `in Sweden with two foreign-born parents, according to a register study from Lund University. In the population, the ` +
        `shares were on average ${pct(t.popForeignBorn)} and ${pct(t.popTwoForeignParents)}. In a later study of those convicted ` +
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

const BUILDERS: Record<string, (lang: Lang) => TablePageContent> = { kap1, kap2, kap3, kap4, kap5 };
const cache = new Map<string, TablePageContent>();

/** The text and tables for one table page in one language. */
export function tablePageContent(chapterId: string, lang: Lang): TablePageContent {
  const build = BUILDERS[chapterId];
  if (!build) throw new Error(`No table page content for ${chapterId}`);
  const key = `${chapterId}/${lang}`;
  if (!cache.has(key)) cache.set(key, build(lang));
  return cache.get(key) as TablePageContent;
}
