// Text and tables for the five table pages under /data/. The HTML page, the CSV file and
// the Markdown copy are all made from this, so they always say the same thing.
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
import { buildKap1Data, crimeById, type GroupId } from './chapters/kap1';
import { kap1Csv, rateTable, ratioTable } from './chapters/kap1Tables';
import { buildKap2Data, smallestGroup } from './chapters/kap2';
import { b6Table, kap2Csv, riskTable, totalCrime, TOTAL } from './chapters/kap2Tables';
import { buildKap3, kap3Tables, shortReportName } from './chapters/kap3';
import { kap4Tables } from './chapters/kap4Tables';
import { kap5Csv, kap5Tables } from './chapters/kap5Tables';
import { formatNumber } from './format';
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

const BRA_TERMS = 'Brå anger att publicerad forskning ska anges med Brå som källa.';

function kap1(): TablePageContent {
  const data = buildKap1Data(loadSuspectsByBackground());
  const first = data.years[0];
  const last = data.years[data.years.length - 1];
  const period = `${first}–${last}`;
  const total = crimeById(data, 'c00');
  const at = (g: GroupId, year: number) => {
    const v = total.values[g][data.years.indexOf(year)];
    if (v === null) throw new Error(`Chapter 1 table page: no value for ${g} ${year}`);
    return formatNumber(v, 1);
  };
  // Years where Brå gives no value for "övergrepp i rättssak", for the note.
  const interference = crimeById(data, 'c35');
  const missingYears = data.years.filter((_, i) => Object.values(interference.values).every((v) => v[i] === null));

  return {
    chapterId: 'kap1',
    h1: `Misstänkta för brott per 1 000 invånare efter bakgrund, ${period}`,
    shortTitle: `Misstänkta för brott efter bakgrund ${period}: tabell`,
    description: `Andel misstänkta för brott per 1 000 invånare ${period}, efter egen och föräldrarnas födelseland och för ${data.crimes.length} brottstyper, enligt Brå rapport 2021:9. Tabeller och CSV-fil.`,
    datasetDescription: `Personer 15 år och äldre som misstänktes för minst ett brott under året, per 1 000 invånare, ${period}. Fyra grupper efter egen och föräldrarnas födelseland samt hela befolkningen, för ${data.crimes.length} brottstyper. Från Brå rapport 2021:9, tabellbilaga 2. Inte justerat för ålder eller kön.`,
    temporalCoverage: `${first}/${last}`,
    keywords: ['misstänkta för brott', 'utrikesfödda', 'utländsk bakgrund', 'brottstyper', 'Brå 2021:9'],
    variableMeasured: ['Misstänkta per 1 000 invånare', 'Jämfört med inrikesfödda med två inrikesfödda föräldrar'],
    sources: [SOURCES.bra2021],
    credit: 'Brå',
    terms: BRA_TERMS,
    lead:
      `År ${last} misstänktes ${at('utr', last)} per 1 000 utrikesfödda för minst ett brott, enligt Brå. ` +
      `Bland inrikesfödda med två utrikesfödda föräldrar var det ${at('u2', last)} per 1 000, och bland ` +
      `inrikesfödda med två inrikesfödda föräldrar ${at('sv2', last)} per 1 000. ` +
      `År ${first} var talen ${at('utr', first)}, ${at('u2', first)} och ${at('sv2', first)}.`,
    note:
      'Misstänkt är inte samma sak som dömd. Talen gäller folkbokförda personer 15 år och äldre och är inte justerade för ' +
      'ålder eller kön. Grupperna med utländsk bakgrund har fler unga, som oftare misstänks. Med hänsyn till ålder, kön, ' +
      'inkomst, utbildning och kommuntyp minskar skillnaderna, men de finns kvar. Brå avrundar till två decimaler, så mycket ' +
      'ovanliga brott kan svänga mellan åren. Jämförelsen med två inrikesfödda föräldrar är uträknad från de avrundade talen.' +
      (missingYears.length ? ` ${interference.name.replace(/\s*\(.*\)$/, '')} saknas ${yearRanges(missingYears)}.` : ''),
    sections: [
      {
        heading: 'Brott totalt',
        tables: [rateTable(data, total), ratioTable(data, total)],
        after:
          'Jämförelsen är uträknad: gruppens tal delat med talet för inrikesfödda med två inrikesfödda föräldrar samma år. ' +
          '2,0 betyder dubbelt så vanligt.',
      },
      {
        heading: 'Alla brottstyper',
        intro: 'Misstänkta per 1 000 invånare för varje brottstyp.',
        tables: data.crimes.filter((c) => c.id !== 'c00').map((c) => rateTable(data, c)),
        collapsed: true,
      },
    ],
    csv: kap1Csv(data),
    dataFiles: ['misstankta_bakgrund_2007_2018.csv'],
  };
}

function kap2(): TablePageContent {
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

  return {
    chapterId: 'kap2',
    h1: 'Misstänkta för brott efter födelseområde och födelseland, 2015–2018',
    shortTitle: 'Misstänkta för brott efter födelseområde 2015–2018: tabell',
    description:
      'Hur ofta personer misstänktes för brott 2015–2018 efter födelseområde, födelseland och moderns födelseområde, jämfört med inrikesfödda med två inrikesfödda föräldrar. Enligt Brå rapport 2021:9. Tabeller och CSV-fil.',
    datasetDescription:
      'Andel misstänkta för brott 2015–2018 bland folkbokförda 15 år och äldre, efter födelseområde, födelseland och, för inrikesfödda med två utrikesfödda föräldrar, moderns födelseområde. Misstänkta per 1 000, överrisk och justerad överrisk jämfört med inrikesfödda med två inrikesfödda föräldrar, samt andel av de misstänkta och av befolkningen. Från Brå rapport 2021:9, tabellbilaga 1.',
    temporalCoverage: '2015/2018',
    keywords: ['misstänkta för brott', 'födelseområde', 'födelseland', 'överrisk', 'utrikesfödda', 'Brå 2021:9'],
    variableMeasured: ['Misstänkta per 1 000', 'Överrisk', 'Justerad överrisk', 'Andel av de misstänkta', 'Andel av befolkningen'],
    sources: [SOURCES.bra2021],
    credit: 'Brå',
    terms: BRA_TERMS,
    lead:
      `Det var ${formatNumber(utr.risk, 1)} gånger så vanligt att utrikesfödda misstänktes för brott någon gång 2015–2018 ` +
      'som att inrikesfödda med två inrikesfödda föräldrar gjorde det, enligt Brå. För inrikesfödda med två utrikesfödda ' +
      `föräldrar var det ${formatNumber(u2.risk, 1)} gånger så vanligt. Bland födelseområdena var överrisken högst i gruppen ` +
      `”${top.label}” (${formatNumber(top.risk, 2)}) och lägst i gruppen ”${bottom.label}” (${formatNumber(bottom.risk, 2)}).`,
    note:
      'Misstänkt är inte samma sak som dömd. Gäller folkbokförda personer 15 år och äldre den 31 december 2014 som ' +
      'misstänktes för brott begångna 2015–2018. Alla som misstänktes någon gång under de fyra åren räknas, därför är ' +
      'talen högre än i kapitel 1. Överrisk är gruppens andel misstänkta delat med andelen bland inrikesfödda med två ' +
      'inrikesfödda föräldrar. Justerad överrisk är Brås beräkning om gruppen haft samma ålder, kön, inkomst och ' +
      'utbildning som jämförelsegruppen, inte en faktisk andel. Vissa grupper är små: det minsta födelselandet, ' +
      `${smallest.label}, har ${formatNumber(smallest.n)} personer.`,
    sections: [
      {
        heading: 'Efter bakgrund',
        tables: [b6Table(b6, 'bakgrund', 'kap2-bakgrund', 'Brott totalt 2015–2018 efter egen och föräldrarnas bakgrund (Brå tabell B6)')],
      },
      {
        heading: 'Efter födelseområde',
        tables: [
          riskTable(data, 'region', regionTotal, 'kap2-region', 'Brott totalt 2015–2018: utrikesfödda efter födelseområde, högst överrisk först'),
          b6Table(b6, 'region', 'kap2-region-b6', 'Brott totalt 2015–2018: antal och andelar efter födelseområde (Brå tabell B6)'),
        ],
      },
      {
        heading: 'Efter födelseland',
        tables: [riskTable(data, 'land', totalCrime(data, 'land'), 'kap2-land', 'Brott totalt 2015–2018: utrikesfödda efter födelseland, högst överrisk först')],
        after: 'Brå redovisar födelseländerna bara för brott totalt.',
      },
      {
        heading: 'Efter moderns födelseområde',
        tables: [
          b6Table(b6, 'moder', 'kap2-moder', 'Brott totalt 2015–2018: inrikesfödda med två utrikesfödda föräldrar efter moderns födelseområde (Brå tabell B6)'),
        ],
      },
      {
        heading: 'Alla brottstyper efter födelseområde',
        tables: data.region
          .filter((c) => c.name !== TOTAL)
          .map((c, i) => riskTable(data, 'region', c, `kap2-region-${i}`, `${c.name}, efter födelseområde`)),
        collapsed: true,
      },
      {
        heading: 'Alla brottstyper efter moderns födelseområde',
        intro: 'Inrikesfödda med två utrikesfödda föräldrar.',
        tables: data.moder
          .filter((c) => c.name !== TOTAL)
          .map((c, i) => riskTable(data, 'moder', c, `kap2-moder-${i}`, `${c.name}, efter moderns födelseområde`)),
        collapsed: true,
      },
    ],
    csv: kap2Csv(data, b6),
    dataFiles: ['misstankta_ursprung_2015_2018.csv', 'bra2021_tabell_b6.csv'],
  };
}

function kap3(): TablePageContent {
  const k = buildKap3(loadPrison(), loadPopulation());
  const tables = kap3Tables(k);
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
    h1: `Andel utan svenskt medborgarskap bland intagna i fängelse, ${period}`,
    shortTitle: `Fängelse och medborgarskap ${period}: tabell`,
    description: `Andel utan svenskt medborgarskap bland nyintagna och intagna i fängelse ${period} enligt Brå, jämfört med andelen utländska medborgare i befolkningen enligt SCB. Tabell och CSV-fil.`,
    datasetDescription: `Andel utan svenskt medborgarskap bland nyintagna i fängelse (alla, män och kvinnor) och bland intagna den 1 oktober, ${period}, enligt Brås statistik över kriminalvård. Jämförs med andelen utländska medborgare i befolkningen den 31 december enligt SCB. Medborgarskap är inte födelseland. År som Brå inte anger saknas och är tomma i filen.`,
    temporalCoverage: `${k.firstYear}/${k.lastYear}`,
    keywords: ['fängelse', 'kriminalvård', 'medborgarskap', 'utländska medborgare', 'nyintagna', 'Brå', 'SCB'],
    variableMeasured: variables,
    sources: [...k.sources.map((s) => ({ label: `Brå, ${shortReportName(s.label)}`, url: s.url })), SOURCES.scbSummary, SOURCES.scbCitizens],
    credit: 'Brå och SCB',
    terms: 'Brås statistik får enligt Brå användas fritt om Brå anges som källa. SCB publicerar under CC BY 4.0.',
    lead:
      `År ${last} saknade ${formatNumber(newAllLast)} procent av dem som togs in i fängelse svenskt medborgarskap, enligt Brå. ` +
      `Bland dem som satt i fängelse den 1 oktober ${last} var andelen ${formatNumber(oct1Last)} procent. ` +
      `I hela befolkningen var ${formatNumber(popLast, 1)} procent utländska medborgare, enligt SCB.`,
    note:
      'Medborgarskap är inte födelseland. Bland fängelsets utländska medborgare finns personer som inte bor i Sverige och ' +
      'inte räknas i befolkningen. Brå anger andelarna i hela procent. Streck (–) betyder att Brå inte anger något värde ' +
      `för året. För alla nyintagna saknas ${yearRanges(missingAll)}. Andelar för män och kvinnor finns för ` +
      `${yearRanges(withValue(k.newMen))} och för intagna den 1 oktober för ${yearRanges(withValue(k.onOct1))}.`,
    sections: [
      {
        tables: [shareTable],
        after:
          'Andelen utländska medborgare i befolkningen är uträknad: utländska medborgare delat med folkmängden, gånger 100, ' +
          'avrundat till en decimal. Underlaget finns i tabellen över befolkningen nedan.',
      },
      {
        heading: 'Antal personer',
        tables: [countTable],
        after: `Antalen gäller alla i gruppen, både med och utan svenskt medborgarskap. Här visas de för ${yearRanges(withValue(k.countNewAll))}.`,
      },
      { heading: 'Befolkningen', tables: [popTable] },
    ],
    csv: tablesToCsv(tables),
    dataFiles: ['intagna_medborgarskap.csv', 'scb_befolkning.csv'],
  };
}

function kap4(): TablePageContent {
  const rows = loadRapeStudies();
  const t = kap4Tables(rows, loadPopulation());
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
  const other = 'Utrikesfödda eller minst en utrikesfödd förälder (uträknat)';

  return {
    chapterId: 'kap4',
    h1: 'Dömda för våldtäkt efter bakgrund, 2000–2020',
    shortTitle: 'Dömda för våldtäkt efter bakgrund 2000–2020: tabell',
    description:
      'Andel utrikesfödda och personer med utrikesfödda föräldrar bland dömda för våldtäkt i Sverige 2000–2020, jämfört med befolkningen och en matchad kontrollgrupp. Två studier från Lunds universitet. Tabeller och CSV-fil.',
    datasetDescription:
      'Bakgrund bland personer dömda för våldtäkt eller försök till våldtäkt mot en kvinna 18 år eller äldre i Sverige. Andelar efter egen och föräldrarnas födelseland 2000–2015 jämfört med befolkningen enligt SCB, och 2000–2020 jämfört med en matchad kontrollgrupp. Från två registerstudier av Khoshnood m.fl., Lunds universitet.',
    temporalCoverage: '2000/2020',
    keywords: ['våldtäkt', 'dömda', 'utrikesfödda', 'utländsk bakgrund', 'Lunds universitet', 'Khoshnood'],
    variableMeasured: ['Andel av de dömda', 'Andel av kontrollgruppen', 'Andel av befolkningen'],
    sources: [SOURCES.khoshnood2021, SOURCES.khoshnood2026, SOURCES.scbSummary],
    credit: 'studierna från Lunds universitet och SCB',
    lead:
      `Av dem som dömdes för våldtäkt mot en kvinna 2000–2015 var ${formatNumber(utr.pct, 1)} procent utrikesfödda och ` +
      `${formatNumber(u2.pct, 1)} procent inrikesfödda med två utrikesfödda föräldrar, enligt en registerstudie från Lunds ` +
      `universitet. I befolkningen var andelarna i snitt ${formatNumber(t.popForeignBorn, 1)} och ` +
      `${formatNumber(t.popTwoForeignParents, 1)} procent. I en senare studie av dömda 2000–2020 var ` +
      `${formatNumber(utrC.pct, 1)} procent av de dömda utrikesfödda, jämfört med ${formatNumber(utrC.pctControls, 1)} procent ` +
      'i en kontrollgrupp med samma kön och födelseår.',
    note:
      `Studierna gäller dömda, inte alla som begår våldtäkt. De dömda är nästan bara män (${formatNumber(men.pct, 1)} procent ` +
      'i den senare studien), 15–60 år, medan befolkningens andel gäller alla åldrar och båda könen (snitt av 2000, 2005, ' +
      '2010 och 2015). Kontrollgruppen har samma kön och födelseår som de dömda. Den första studien anmäldes till ' +
      `Överklagandenämnden för etikprövning. Raden ”${other}” är uträknad som 100 minus andelen inrikesfödda med två ` +
      'inrikesfödda föräldrar. I den senare studien minskade sambandet efter justering för bland annat socioekonomi och ' +
      'tidigare brottslighet, men det fanns kvar.',
    sections: [
      {
        heading: 'Bakgrund bland dömda 2000–2015',
        tables: [t.background],
        after:
          'Jämförelsen med befolkningen görs bara för utrikesfödda och inrikesfödda med två utrikesfödda föräldrar. Det är de ' +
          'grupper som går att räkna fram ur SCB:s sammanställning som sidan använder.',
      },
      { heading: 'Dömda och kontrollgrupp 2000–2020', tables: [t.controls] },
      { heading: 'Födelseregion', tables: [t.region] },
      { heading: 'Tidigare domar och bistånd', tables: [t.prior] },
      {
        heading: 'Befolkningen',
        tables: [t.population],
        after:
          'Uträknat: inrikesfödda med två utrikesfödda föräldrar är personer med utländsk bakgrund minus utrikesfödda. Andelen ' +
          'är gruppen delat med folkmängden, gånger 100. Snittet är medelvärdet av de fyra åren, avrundat till en decimal.',
      },
    ],
    csv: t.csv,
    dataFiles: ['valdtakt_domda.csv', 'scb_befolkning.csv'],
  };
}

function kap5(): TablePageContent {
  const rows = loadBra2005();
  const [period, risk, shares, region, crimes] = kap5Tables(rows);
  const v = (chart: string, id: string, series: string) => {
    const r = rows.find((x) => x.chart === chart && x.groupId === id && x.series === series);
    if (!r) throw new Error(`bra2005.csv: ${chart}/${id}/${series} missing`);
    return formatNumber(r.value, 1);
  };

  return {
    chapterId: 'kap5',
    h1: 'Misstänkta för brott efter bakgrund 1985–89 och 1997–2001, Brå 2005:17',
    shortTitle: 'Brå 2005:17, misstänkta efter bakgrund: tabell',
    description:
      'Överrisk att misstänkas för brott för utrikesfödda och inrikesfödda med utrikesfödda föräldrar 1985–89 och 1997–2001, efter födelseregion och brottstyp. Från Brå rapport 2005:17. Tabeller och CSV-fil.',
    datasetDescription:
      'Siffror ur Brå rapport 2005:17: överrisk att misstänkas för brott 1985–89 och 1997–2001, andel misstänkta ojusterat och standardiserat för kön, ålder, utbildning och förvärvsinkomst, andel av de misstänkta och av befolkningen efter bakgrund och födelseregion, samt andel misstänkta för tio brottstyper. Folkbokförda personer.',
    temporalCoverage: '1985/2001',
    keywords: ['misstänkta för brott', 'överrisk', 'utrikesfödda', 'Brå 2005:17', 'födelseregion'],
    variableMeasured: ['Överrisk', 'Standardiserad överrisk', 'Andel misstänkta', 'Andel av de misstänkta', 'Andel av befolkningen', 'Överrepresentation'],
    sources: [SOURCES.bra2005],
    credit: 'Brå',
    terms: BRA_TERMS,
    lead:
      `Det var ${v('period', 'utr', 'p9701')} gånger så vanligt att utrikesfödda misstänktes för brott 1997–2001 som att ` +
      `inrikesfödda med två inrikesfödda föräldrar gjorde det, enligt Brå. 1985–89 var överrisken ${v('period', 'utr', 'p8589')}. ` +
      `Med hänsyn till kön, ålder, utbildning och inkomst var överrisken ${v('overrisk', 'utr', 'stand')} för 1997–2001.`,
    note:
      'Siffrorna är över 20 år gamla. Misstänkt är inte samma sak som dömd. Överrisk är andelen misstänkta i gruppen delat ' +
      'med andelen bland inrikesfödda med två inrikesfödda föräldrar, som därför har överrisken 1,0. Överrepresentation är ' +
      'gruppens andel av de misstänkta delat med dess andel av befolkningen. Uppgifterna för 1985–89 kommer från Brå 1996 ' +
      'och redovisas i tabell 8 i Brå 2005:17. Några brottstyper i Brås tabell 11 gick inte att läsa ur PDF-filen och saknas.',
    sections: [
      { heading: 'Överrisk över tid', tables: [period] },
      {
        heading: 'Ojusterat och standardiserat',
        tables: [risk],
        after: 'Standardiserad betyder att Brå tagit hänsyn till skillnader i kön, ålder, utbildning och förvärvsinkomst.',
      },
      { heading: 'Andel av de misstänkta och av befolkningen', tables: [shares] },
      { heading: 'Efter födelseregion', tables: [region] },
      { heading: 'Efter brottstyp', tables: [crimes] },
    ],
    csv: kap5Csv(rows),
    dataFiles: ['bra2005.csv'],
  };
}

const BUILDERS: Record<string, () => TablePageContent> = { kap1, kap2, kap3, kap4, kap5 };
const cache = new Map<string, TablePageContent>();

export function tablePageContent(chapterId: string): TablePageContent {
  const build = BUILDERS[chapterId];
  if (!build) throw new Error(`No table page content for ${chapterId}`);
  if (!cache.has(chapterId)) cache.set(chapterId, build());
  return cache.get(chapterId) as TablePageContent;
}
