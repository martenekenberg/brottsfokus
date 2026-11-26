// Writes the number checklists in docs/ from the data files, using the same
// calculation and formatting code as the site, so the lists cannot drift from it.
//   docs/sifferkontroll.csv          every number in the default views and in the text
//   docs/sifferkontroll_menyer.csv   every number reachable through the menus in chapters 1 and 2
//   docs/sifferkontroll_tabeller.csv every number on the table pages under /data/
// Run with: npm run sifferkontroll
import { writeFileSync } from 'node:fs';
import { foreignCitizenSharePct, populationSharePct, swedishBornTwoForeignParents } from '../src/lib/calc';
import { loadBra2005, loadOrigin, loadPopulation, loadPrison, loadRapeStudies, loadRiskFactors, loadSuspectsByBackground, loadSuspicionShares, loadTableB6 } from '../src/lib/data';
import { buildSuspicionShares, groupLabel, peakYear } from '../src/lib/chapters/kap1Shares';
import { buildRiskFactors, itemLabel } from '../src/lib/chapters/kap2Factors';
import { round } from '../src/lib/calc';
import { crimes as ntuCrimes, pooled as ntuPooled } from '../src/lib/chapters/kap6';
import { loadNtu, loadDeportation, loadDeportationFacts, loadHomicide, loadCohorts, loadBirthCohorts } from '../src/lib/data';
import { citizenshipGroups, offenceGroups, totalRow as deportTotalRow } from '../src/lib/chapters/kap7';
import { formatNumber as formatNumberIn, formatPct as formatPctIn, formatTimes as formatTimesIn } from '../src/lib/format';
import { buildKap1Data, buildKap1Spec as buildKap1SpecIn, GROUPS, type Mode } from '../src/lib/chapters/kap1';
import {
  buildKap2Data,
  buildKap2Spec as buildKap2SpecIn,
  smallestGroup,
  VIEW_LABEL,
  type Measure,
  type View,
} from '../src/lib/chapters/kap2';
import { buildKap4 as buildKap4In } from '../src/lib/chapters/kap4';
import { buildKap5 as buildKap5In } from '../src/lib/chapters/kap5';
import { barFmt as barFmtIn, type BarFormat } from '../src/lib/charts/bar';
import { dotFmt as dotFmtIn, type DotFormat } from '../src/lib/charts/dot';
import { fmt as fmtIn, type ValueFormat } from '../src/lib/charts/line';
import { buildKap11, DK_ORDER, groupLabel as dkGroupLabel, ratioToAll } from '../src/lib/chapters/kap11';
import { loadDkGuilty, loadDkIndex, loadDkPopulation, loadFiSuspects, loadNoCharged } from '../src/lib/data';
import { buildKap13, FI_CHART, fiLabel, fiPersons, fiRatio } from '../src/lib/chapters/kap13';
import { AGE_GROUPS, AGES, ageLabel, ageRatio, ageYear, shown } from '../src/lib/chapters/kap14';
import { buildNo, countryLabel, NO_CATEGORY_LABEL, NO_REGION_LABEL } from '../src/lib/chapters/kap15';
import { ADJ_LABEL, buildKap12, groupLabel as dk12GroupLabel } from '../src/lib/chapters/kap12';
import { tablePageContent as tablePageContentIn } from '../src/lib/tablePageContent';
import { tablePage as tablePageIn, tablePages } from '../src/lib/dataPages';
import { formatCell as formatCellIn } from '../src/lib/tables';
import type { Kap1Data } from '../src/lib/chapters/kap1';
import type { RapeStudyRow, PopulationRow, Bra2005Row } from '../src/lib/data';

// The checklist is in Swedish, so every formatter and builder below runs with the Swedish language.
const formatNumber = (value: number, decimals = 0) => formatNumberIn(value, decimals, 'sv');
const formatPct = (value: number, decimals = 0) => formatPctIn(value, decimals, 'sv');
const formatTimes = (value: number, decimals = 1) => formatTimesIn(value, decimals, 'sv');
const barFmt = (value: number, format: BarFormat = 'pct1') => barFmtIn(value, format, 'sv');
const dotFmt = (value: number, format: DotFormat) => dotFmtIn(value, format, 'sv');
const fmt = (value: number, format: ValueFormat) => fmtIn(value, format, 'sv');
const formatCell = (value: number, decimals: number) => formatCellIn(value, decimals, 'sv');
const buildKap1Spec = (data: Kap1Data, crimeId: string, mode: Mode) => buildKap1SpecIn(data, crimeId, mode, 'sv');
const buildKap2Spec = (data: Parameters<typeof buildKap2SpecIn>[0], view: View, crimeName: string, measure: Measure) =>
  buildKap2SpecIn(data, view, crimeName, measure, 'sv');
const buildKap4 = (rows: RapeStudyRow[], population: PopulationRow[]) => buildKap4In(rows, population, 'sv');
const buildKap5 = (rows: Bra2005Row[]) => buildKap5In(rows, 'sv');
const tablePageContent = (chapterId: string) => tablePageContentIn(chapterId, 'sv');
const tablePage = (chapterId: string) => tablePageIn(chapterId, 'sv');

const BRA2021 = 'https://bra.se/rapporter/arkiv/2021-08-25-misstankta-for-brott-bland-personer-med-inrikes-respektive-utrikes-bakgrund';
const BRA2005 = 'https://www.bra.se/download/18.cba82f7130f475a2f1800012697/2005_17_brottslighet_bland_personer_fodda_sverige_och_utlandet.pdf';
const SCB = 'https://www.scb.se/hitta-statistik/statistik-efter-amne/befolkning-och-levnadsforhallanden/befolkningens-sammansattning-och-utveckling/befolkningsstatistik/pong/tabell-och-diagram/sveriges-befolkning-i-sammandrag-1960-2025-korrigerad-2026-06-18/';
const K2021 = 'https://doi.org/10.1080/20961790.2020.1868681';
const K2026 = 'https://lup.lub.lu.se/record/d9a9d1f6-f428-4b57-abf2-5e0e9c7b84f5';
const STATED = 'Uppgift i källan';
const CALC = 'Uträknat';

// The site uses non-breaking spaces; plain spaces are easier to search for in a spreadsheet.
const plain = (s: string) => s.replace(/ /g, ' ');
const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const toCsv = (rows: string[][]) => rows.map((r) => r.map((c) => csvCell(plain(c))).join(',')).join('\n') + '\n';

const main: string[][] = [['Kapitel', 'Var på sidan', 'Vad', 'Värde på sidan', 'Källa', 'Typ', 'Länk']];
const add = (...cells: string[]) => main.push(cells);

const prison = loadPrison();
const population = loadPopulation();
const suspects = loadSuspectsByBackground();
const b6 = loadTableB6();
const kap1 = buildKap1Data(suspects);
const kap2 = buildKap2Data(loadOrigin(), new Map(suspects.map((r) => [r.crimeOrder, r.depth])), b6);
const rape = loadRapeStudies();
const kap4 = buildKap4(rape, population);
const bra2005 = loadBra2005();
const kap5 = buildKap5(bra2005);

// ---------- Key figures ----------
{
  const K = 'Siffror i korthet';
  const risk = (unit: string) => b6.find((r) => r.view === 'bakgrund' && r.unit === unit)!.risk;
  const utr = risk('Utrikesfödda');
  const u2 = risk('Inrikesfödda med två utrikesfödda föräldrar');
  add(K, 'Första siffran', 'Överrisk, utrikesfödda, 2015–2018', formatTimes(utr), `Brå 2021:9 tabellbilaga 1, tabell B6 (${formatNumber(utr, 2)})`, STATED, BRA2021);
  add(K, 'Andra siffran', 'Överrisk, inrikesfödda med två utrikesfödda föräldrar, 2015–2018', formatTimes(u2), `Brå 2021:9 tabellbilaga 1, tabell B6 (${formatNumber(u2, 2)})`, STATED, BRA2021);
  const lastYear = Math.max(...prison.map((r) => r.year));
  const p = prison.find((r) => r.year === lastYear && r.population === 'nyintagna' && r.group === 'totalt')!;
  add(K, 'Tredje siffran', `Nyintagna utan svenskt medborgarskap ${lastYear}`, formatPct(p.shareWithoutPct!), p.source, STATED, p.sourceUrl);
  const s = population.find((r) => r.year === lastYear)!;
  add(K, 'Tredje siffran, text', `Utländska medborgare i befolkningen ${lastYear}`, formatPct(foreignCitizenSharePct(s)!, 1), `SCB: ${formatNumber(s.utlandskaMedborgare!)} utländska medborgare / ${formatNumber(s.folkmangd)} invånare`, CALC, SCB);
}

// ---------- Chapter 1 ----------
{
  const K = '01 Över tid';
  const src = 'Brå 2021:9 tabellbilaga 2, brott totalt';
  const rate = buildKap1Spec(kap1, 'c00', 'rate');
  const n = kap1.years.length - 1;
  for (const s of rate.series) {
    for (const i of [0, n]) {
      const v = s.values[i];
      add(K, i === 0 ? 'Diagram, brott totalt (rubriken)' : 'Diagram, brott totalt', `${s.label}, ${kap1.years[i]}, per 1 000`, v === null ? 'saknas' : fmt(v, s.format), src, STATED, BRA2021);
    }
  }
  const total = kap1.crimes.find((c) => c.id === 'c00')!;
  const ratio = buildKap1Spec(kap1, 'c00', 'ratio');
  for (const s of ratio.series.filter((x) => x.id !== 'sv2-ref')) {
    const g = s.id as keyof typeof GROUPS;
    add(K, `Jämförelsevyn, ${kap1.years[n]}`, `${s.label} jämfört med två inrikesfödda föräldrar`, fmt(s.values[n]!, s.format), `Uträknat: ${formatNumber(total.values[g][n]!, 2)} / ${formatNumber(total.values.sv2[n]!, 2)}`, CALC, BRA2021);
  }
  for (const c of kap1.crimes) {
    const missing = kap1.years.filter((_, i) => c.values.sv2[i] === null);
    if (missing.length) add(K, 'Läs så här', `${c.name} saknas ${missing.join(' och ')}`, 'saknas', 'Brå 2021:9 tabellbilaga 2', STATED, BRA2021);
  }
  add(K, 'Brottstypsmenyn', 'Alla övriga brottstyper och år', 'se sifferkontroll_menyer.csv', 'Brå 2021:9 tabellbilaga 2', STATED, BRA2021);

  // Second chart: each group's share of all registered suspicions (Brå 2021:9 tabellbilaga 3).
  const D = 'Andra diagrammet, andel av brottsmisstankar';
  const shares = buildSuspicionShares(loadSuspicionShares());
  const rows = loadSuspicionShares();
  shares.groups.forEach((g) => {
    shares.years.forEach((y, i) => {
      const bra = rows.find((r) => r.groupId === g.id && r.year === y)!.pctBra;
      add(K, D, `${groupLabel(g, 'sv')}, ${y}`, formatPct(round(g.shares[i], 1), 1), `Uträknat: ${formatNumber(g.counts[i])} / ${formatNumber(shares.totals[i])} misstankar (tabell D1). Brås tabell D2 anger ${formatNumber(bra, 1)}`, CALC, BRA2021);
    });
  });
  const ej = shares.groups.find((g) => g.id === 'ej')!;
  const py = peakYear(shares, 'ej');
  add(K, `${D}, Läs så här`, `Icke folkbokförda, högsta andelen (${py})`, formatPct(round(ej.shares[shares.years.indexOf(py)], 1), 1), 'Uträknat från tabell D1, som ovan', CALC, BRA2021);
  for (const r of b6.filter((x) => x.view === 'bakgrund' && x.unit !== 'Totalt i populationen')) {
    add(K, `${D}, Läs så här`, `${r.unit}, andel av befolkningen 15+ den 31 december 2014`, formatPct(r.populationPct, 1), 'Brå 2021:9 tabellbilaga 1, tabell B6', STATED, BRA2021);
  }
  add(K, D, 'Obs: rapporttexten (s. 92) anger 24,3 procent för utrikesfödda 2007, men tabell D2 och antalen i D1 ger 23,6 (24,3 är värdet för 2008). Sidan följer tabellen.', '23,6 %', 'Brå 2021:9 tabellbilaga 3, tabell D1 och D2', STATED, BRA2021);
}

// ---------- Chapter 2 ----------
{
  const K = '02 Födelseområde';
  const region = kap2.region.find((c) => c.name === 'Brott totalt')!;
  const units = [...region.units].sort((a, b) => b.risk - a.risk);
  for (const u of units) {
    const t = b6.find((r) => r.view === 'region' && r.unit === u.label)!;
    add(K, 'Diagram, gånger vanligare', `${u.label}, ojusterat`, dotFmt(u.risk, 'x1'), `Brå 2021:9 tabellbilaga 1, tabell B6 anger ${formatNumber(t.risk, 2)}; sidan använder ${formatNumber(u.risk, 2)} (${formatNumber(u.per1000, 2)} / ${formatNumber(region.refPer1000, 2)} per 1 000)`, 'Uträknat i Brås fil', BRA2021);
    if (u.riskAdj !== null) {
      add(K, 'Diagram, gånger vanligare', `${u.label}, justerat`, dotFmt(u.riskAdj, 'x1'), `Brå 2021:9 tabellbilaga 1, tabell B7, kolumnen ålder, kön, disponibel inkomst och utbildning (filen anger ${formatNumber(u.riskAdj, 2)})`, 'Uträknat i Brås fil', BRA2021);
    }
  }
  add(K, 'Diagram, per 1 000', 'Jämförelsegruppen, inrikesfödda med två inrikesfödda föräldrar', dotFmt(region.refPer1000, 'num1'), 'Brå 2021:9 tabellbilaga 1', STATED, BRA2021);
  for (const u of units) {
    add(K, 'Andel av misstänkta', `${u.label}: andel av misstänkta / andel av befolkningen`, `${dotFmt(u.suspectsPct!, 'pct2')} / ${dotFmt(u.populationPct!, 'pct2')}`, 'Brå 2021:9 tabellbilaga 1, tabell B6', STATED, BRA2021);
  }
  const moder = kap2.moder.find((c) => c.name === 'Brott totalt')!;
  for (const u of [...moder.units].sort((a, b) => b.risk - a.risk)) {
    add(K, 'Moderns födelseområde, brott totalt', `${u.label}: överrisk; andel av misstänkta / befolkningen`, `${dotFmt(u.risk, 'x1')}; ${dotFmt(u.suspectsPct!, 'pct2')} / ${dotFmt(u.populationPct!, 'pct2')}`, 'Brå 2021:9 tabellbilaga 1, tabell B6, "Modern född i ett land i"', STATED, BRA2021);
  }
  const land = smallestGroup(kap2, 'land')!;
  const mother = smallestGroup(kap2, 'moder')!;
  add(K, 'Läs så här', `Minsta födelselandet (${land.label}), antal personer`, formatNumber(land.n), 'Brå 2021:9 tabellbilaga 1, tabell B9', STATED, BRA2021);
  add(K, 'Läs så här', `Minsta gruppen efter moderns födelseområde (${mother.label}), antal personer`, formatNumber(mother.n), 'Brå 2021:9 tabellbilaga 1, tabell B6', STATED, BRA2021);
  add(K, 'Menyerna', 'Födelseland, övriga brottstyper och per 1 000', 'se sifferkontroll_menyer.csv', 'Brå 2021:9 tabellbilaga 1', STATED, BRA2021);

  // Second chart: background next to other factors.
  for (const f of buildRiskFactors(loadRiskFactors(), b6)) {
    const where = f.kind === 'bakgrund' ? `${f.source} (${formatNumber(f.risk, 2)})` : `${f.source}, i rapportens text`;
    add(K, 'Andra diagrammet, andra faktorer', `${itemLabel(f, 'sv')} jämfört med ${f.comparison.toLowerCase()}`, barFmt(f.risk, 'x1'), where, STATED, BRA2021);
  }
}

// ---------- Chapter 3 ----------
{
  const K = '03 Fängelse';
  const name = { nyintagna: { totalt: 'Nyintagna, alla', man: 'Nyintagna män', kvinnor: 'Nyintagna kvinnor' }, '1okt': { totalt: 'Intagna 1 oktober', man: 'Intagna 1 oktober, män', kvinnor: 'Intagna 1 oktober, kvinnor' } };
  for (const r of prison) {
    if (r.shareWithoutPct === null) continue;
    if (r.shareComputed) {
      add(K, 'Diagram', `${name[r.population][r.group]}, ${r.year}, utan svenskt medborgarskap`, formatPct(r.shareWithoutPct), `Uträknat: ${formatNumber(r.personsWithout!)} / ${formatNumber(r.persons!)} (${r.source})`, CALC, r.sourceUrl);
    } else {
      add(K, 'Diagram', `${name[r.population][r.group]}, ${r.year}, utan svenskt medborgarskap`, formatPct(r.shareWithoutPct), r.source, STATED, r.sourceUrl);
    }
  }
  const first = Math.min(...prison.map((r) => r.year));
  const last = Math.max(...prison.map((r) => r.year));
  for (const s of population) {
    const share = foreignCitizenSharePct(s);
    if (s.year < first || s.year > last || share === null) continue;
    add(K, 'Diagram, streckad linje', `Utländska medborgare i befolkningen ${s.year}`, formatPct(share, 1), `SCB: ${formatNumber(s.utlandskaMedborgare!)} / ${formatNumber(s.folkmangd)}`, CALC, SCB);
  }
}

// ---------- Chapter 4 ----------
{
  const K = '04 Våldtäkt';
  const yearly = (count: (r: (typeof population)[number]) => number | null) =>
    [2000, 2005, 2010, 2015].map((y) => formatPct(populationSharePct(count(population.find((r) => r.year === y)!), population.find((r) => r.year === y)!.folkmangd)!, 2)).join(', ');
  const D = 'Diagram, dömda och kontrollgrupp 2000–2020';
  const P = 'Diagram, dömda och befolkningen 2000–2015';
  const [other, ...stated] = kap4.main.groups;
  add(K, D, `${other.label}, dömda / kontrollgrupp`, `${barFmt(other.bars[0].value)} / ${barFmt(other.bars[1].value)}`, `Khoshnood m.fl. 2026, tabell 1: 100 minus ${formatPct(kap4.sv2Convicted, 1)} resp. ${formatPct(kap4.sv2Controls, 1)}. Samma som summan av de tre övriga grupperna`, CALC, K2026);
  const ctrl = (id: string) => rape.find((r) => r.chart === 'kontroll' && r.itemId === id)!;
  ['utr', 'u2', 'sv1'].forEach((id, i) => {
    const g = stated[i];
    add(K, D, `${g.label}, dömda (n = ${formatNumber(ctrl(id).n!)}) / kontrollgrupp`, `${barFmt(g.bars[0].value)} / ${barFmt(g.bars[1].value)}`, `Khoshnood m.fl. 2026, ${ctrl(id).note}`, STATED, K2026);
  });
  add(K, 'Läs så här', 'Inrikesfödda med två inrikesfödda föräldrar, dömda 2000–2020 / kontrollgrupp', `${formatNumber(kap4.sv2Convicted, 1)} / ${formatNumber(kap4.sv2Controls, 1)}`, 'Khoshnood m.fl. 2026, tabell 1 (1 488 av 4 032 resp. 14 016 av 20 160)', STATED, K2026);
  add(K, 'Läs så här', `Män bland de dömda 2000–2020 (n = ${formatNumber(ctrl('man').n!)})`, formatNumber(kap4.menPct, 1), 'Khoshnood m.fl. 2026, tabell 1', STATED, K2026);
  const [utr, u2] = kap4.population2015.groups;
  const row = (id: string) => rape.find((r) => r.chart === 'bakgrund' && r.itemId === id)!;
  add(K, P, `Utrikesfödda, dömda 2000–2015 (n = ${row('utr').n})`, barFmt(utr.bars[0].value), `Khoshnood m.fl. 2021, ${row('utr').note}`, STATED, K2021);
  add(K, P, 'Utrikesfödda, befolkningen, snitt 2000/2005/2010/2015', barFmt(utr.bars[1].value), `SCB, uträknat: ${yearly((r) => r.utrikesFodda)}`, CALC, SCB);
  add(K, P, `Inrikesfödda med två utrikesfödda föräldrar, dömda 2000–2015 (n = ${row('u2').n})`, barFmt(u2.bars[0].value), `Khoshnood m.fl. 2021, ${row('u2').note}`, STATED, K2021);
  add(K, P, 'Inrikesfödda med två utrikesfödda föräldrar, befolkningen, snitt 2000/2005/2010/2015', barFmt(u2.bars[1].value), `SCB, uträknat: ${yearly(swedishBornTwoForeignParents)}`, CALC, SCB);
  for (const r of rape.filter((x) => x.chart === 'region').sort((a, b) => b.pct - a.pct)) {
    add(K, 'Mindre diagram', r.item, barFmt(r.pct), `Khoshnood m.fl. 2021, ${r.note}`, STATED, K2021);
  }
}

// ---------- Chapter 5 ----------
{
  const K = '05 Äldre studier';
  const table = (chart: string, id: string, series?: string) =>
    bra2005.find((r) => r.chart === chart && r.groupId === id && (series === undefined || r.series === series))!.sourceTable;
  const risk = [
    ['Utrikesfödda', kap5.riskForeignBorn, ['p8589', 'p9701', 'stand'], 'utr'],
    ['En eller två utrikesfödda föräldrar', kap5.riskSwedishBorn, ['p8589', 'p9701'], 'sv12'],
  ] as const;
  for (const [who, spec, series, id] of risk) {
    spec.groups.forEach((g, i) => {
      const t = series[i] === 'stand' ? table('overrisk', id, 'stand') : table('period', id, series[i]);
      add(K, 'Överrisk', `${who} ${g.label}`, barFmt(g.bars[0].value, 'x1'), `Brå 2005:17, ${t}`, STATED, BRA2005);
    });
  }
  add(K, 'Överrisk', 'Läs så här: en utrikesfödd förälder, standardiserad', formatNumber(kap5.standOneParent, 1), `Brå 2005:17, ${table('overrisk', 'sv1', 'stand')}`, STATED, BRA2005);
  add(K, 'Överrisk', 'Läs så här: två utrikesfödda föräldrar, standardiserad', formatNumber(kap5.standTwoParents, 1), `Brå 2005:17, ${table('overrisk', 'u2', 'stand')}`, STATED, BRA2005);
  ['utr', 'u2', 'sv1', 'sv2'].forEach((id, i) => {
    const g = kap5.shares.groups[i];
    add(K, 'Andel av misstänkta', `${g.label}: andel av misstänkta / andel av befolkningen`, `${barFmt(g.bars[0].value)} / ${barFmt(g.bars[1].value)}`, `Brå 2005:17, ${table('andel_misst', id)}; ${table('befolkning', id)}`, STATED, BRA2005);
  });
  for (const g of kap5.crimes.groups) {
    add(K, 'Brottstyper', `${g.label}: utrikesfödda / en eller två utrikesfödda föräldrar / två inrikesfödda föräldrar`, g.bars.map((b) => barFmt(b.value, 'pct2')).join(' / '), 'Brå 2005:17, Tabell 11', STATED, BRA2005);
  }
}

// ---------- Chapter 6 ----------
{
  const K = '06 Utsatta för brott';
  const NTU = 'https://bra.se/rapporter/arkiv/2024-05-21-utsatthet-for-brott-bland-personer-med-utlandsk-bakgrund';
  const ntu = loadNtu();
  for (const c of ntuCrimes(ntu)) {
    for (const [sex, who] of [['man', 'Män'], ['kvinnor', 'Kvinnor']] as const) {
      for (const [g, name] of [['utlandsk', 'utländsk bakgrund'], ['svensk', 'svensk bakgrund']] as const) {
        const r = ntuPooled(ntu, c.id, sex, g);
        add(K, `Diagram, ${who.toLowerCase()}`, `${c.name} ${c.period}, ${who.toLowerCase()} med ${name}`, barFmt(r.pct!, 'pct1'), `Brå NTU Kortanalys 2/2024, tabellbilaga ${r.sourceTable.toLowerCase()} (${formatNumber(r.pct!, 3)})`, STATED, NTU);
      }
    }
  }
}

// ---------- Chapter 7 ----------
{
  const K = '07 Utvisning';
  const URL = 'https://bra.se/download/18.5d0a8fbf19ddcaf2a6cccb2/1777972068717/2026_15_Utvisningsd%C3%B6mda%20i%20brottm%C3%A5l.pdf';
  const rows = loadDeportation();
  const facts = loadDeportationFacts();
  const t = deportTotalRow(rows);
  add(K, 'Ingress', 'Antal som lämnade fängelset 2013–2023', formatNumber(t.n!), 'Brå 2026:15 tabell B1', STATED, URL);
  add(K, 'Rubrik, ingress, diagram (linje)', 'Andel utvisade, alla', formatPct(t.pctDeported!, 1), 'Brå 2026:15 tabell B1', STATED, URL);
  add(K, 'Andra diagrammet, ingress', 'Andel lagförda för nya brott, alla', formatPct(t.pctReconvicted!, 1), 'Brå 2026:15 tabell B1', STATED, URL);
  for (const f of facts) {
    add(K, 'Text', `${f.id}${f.year ? ` ${f.year}` : ''}`, formatNumber(f.value, Number.isInteger(f.value) ? 0 : 1), f.source, STATED, URL);
  }
  for (const r of citizenshipGroups(rows)) {
    add(K, 'Diagram, medborgarskap', `${r.group} (n = ${formatNumber(r.n!)})`, barFmt(r.pctDeported!, 'pct1'), 'Brå 2026:15 tabell B1 (och tabell 6)', STATED, URL);
  }
  for (const r of offenceGroups(rows)) {
    add(K, 'Andra diagrammet, huvudbrott', `${r.group}: utvisade / lagförda för nya brott`, `${barFmt(r.pctDeported!, 'pct1')} / ${barFmt(r.pctReconvicted!, 'pct1')}`, 'Brå 2026:15 tabell B1', STATED, URL);
  }
}

// ---------- Chapter 8 ----------
{
  const K = '08 Dödligt våld';
  const URL = 'https://bra.se/download/18.4dd364db195b26cb24b107f4/1742814210786/2025_5_Offer%20och%20g%C3%A4rningspersoner%20vid%20d%C3%B6dligt%20v%C3%A5ld.pdf';
  const f = (v: number | null) => (v === null ? 'anges inte' : formatNumber(v, Number.isInteger(v) ? 0 : 1));
  for (const r of loadHomicide().filter((x) => x.chart === 'bakgrund')) {
    add(K, r.chart === 'bakgrund' ? 'Diagram/text, bakgrund' : 'Andra diagrammet', `${r.item}: offer / gärningspersoner / befolkningen`, `${f(r.victims)} / ${f(r.perpetrators)} / ${f(r.population)}`, r.source, STATED, URL);
  }
  add(K, 'Källrad', 'Antal offer och gärningspersoner 2005–2021', '1 521 / 1 175', 'Brå 2025:5 s. 7', STATED, URL);
  add(K, 'Läs så här', 'Andel ouppklarade fall i kriminell miljö', 'omkring 70 %', 'Brå 2025:5 s. 8', STATED, URL);
}

// ---------- Chapter 9 ----------
{
  const K = '09 Lagförda före 25';
  const URL = 'https://doi.org/10.1080/2578983X.2021.1900038';
  const name = { utrikesfodd: 'utrikes födda', andra_gen: 'två utrikes födda föräldrar', native: 'minst en inrikes född förälder' } as const;
  for (const r of loadCohorts().filter((x) => x.measure === 'minst1')) {
    const where = r.table === 'alla' ? 'Diagram, alla' : 'Andra diagrammet, lägst inkomster';
    add(K, where, `${r.sex === 'man' ? 'Män' : 'Kvinnor'} födda ${r.cohort}, ${name[r.group]}`, barFmt(r.pct, 'pct1'), `Bäckman m.fl. 2021, tabell ${r.table === 'alla' ? 1 : 2}`, STATED, URL);
  }
}

// ---------- Chapter 10 ----------
{
  const K = '10 Födelseår';
  const URL = 'https://bra.se/rapporter/arkiv/2025-12-02-fodelsekohortstatistik';
  const name = { alla: 'alla', I20: 'två inrikesfödda föräldrar', I11: 'en utrikesfödd förälder', I02: 'två utrikesfödda föräldrar', Utr: 'utrikesfödda' } as const;
  for (const r of loadBirthCohorts().filter((x) => x.sex === 'samtliga')) {
    const where = r.measure === 'fore25' ? 'Diagram, före 25 år' : 'Andra diagrammet, före 20 år';
    add(K, where, `Födda ${r.birthYear}, ${name[r.group]}`, fmt(r.pct, 'pct1'), `Brå 2025:21 tabell ${r.measure === 'fore25' ? '1' : '4 (kolumnen 20 år)'}`, STATED, URL);
  }
}

// ---------- Chapter 5.1 (Denmark) ----------
{
  const K = '5.1 Lagförda i Danmark';
  const k = buildKap11(loadDkGuilty(), loadDkPopulation());
  const URL = 'https://www.statistikbanken.dk/STRFNA10';
  for (const o of ['straffelov', 'vold'] as const) {
    const where = o === 'straffelov' ? 'Diagram, brott mot strafflagen' : 'Andra diagrammet, våldsbrott';
    for (const g of DK_ORDER) {
      for (const y of [k.firstYear, k.lastYear]) {
        const i = k.years.indexOf(y);
        const jan = (yy: number) => k.populationJan1.get(yy)![g];
        add(K, where, `${dkGroupLabel(g, 'sv')}, ${y}, per 1 000`, fmt(k.rates[o][g][i], 'num1'),
          `STRFNA10: ${formatNumber(k.persons[o][g][i])} lagförda / medel av FOLK1E 1 jan ${y} (${formatNumber(jan(y))}) och ${y + 1} (${formatNumber(jan(y + 1))})`, CALC, URL);
      }
    }
    add(K, o === 'straffelov' ? 'Rubriken och inledningen' : 'Andra diagrammets rubrik', `Barn till invandrare, icke-västliga, gånger befolkningen ${k.lastYear}`, formatTimes(ratioToAll(k, o, 'eftk_ikkevest', k.lastYear)), 'Kvot mellan talen per 1 000 ovan', CALC, URL);
  }
  add(K, 'Inledningen', `Barn till invandrare, icke-västliga, gånger befolkningen ${k.firstYear}`, formatTimes(ratioToAll(k, 'straffelov', 'eftk_ikkevest', k.firstYear)), 'Kvot mellan talen per 1 000 ovan', CALC, URL);
}

// ---------- Chapter 5.2 (Denmark, crime index) ----------
{
  const K = '5.2 Kriminalitetsindex, Danmark';
  const URL = 'https://www.dst.dk/da/Statistik/udgivelser/VisPub?cid=54707';
  const k12 = buildKap12(loadDkIndex());
  for (const r of k12.rows.filter((x) => x.offence === 'alle' && x.table !== '6.9')) {
    // The age-adjusted value is in both 6.5 and 6.7; list it once, from 6.5.
    if (r.table === '6.7' && r.adjustment === 'alder') continue;
    const where = r.sex === 'man' ? 'Diagram, män' : 'Andra diagrammet, kvinnor';
    add(K, where, `${dk12GroupLabel(r.group, 'sv')}, ${ADJ_LABEL[r.adjustment].sv.toLowerCase()}, ${r.year}`, r.index === null ? 'saknas' : formatNumber(r.index), `Indvandrere i Danmark 2025, tabell ${r.table}, s. ${r.page}`, STATED, URL);
  }
  for (const s of ['man', 'kvinnor'] as const) {
    const r = k12.rows.find((x) => x.sex === s && x.group === 'eftk_ikkevest' && x.adjustment === 'alder' && x.offence === 'straffelov')!;
    add(K, 'Läs så här', `Barn till invandrare, icke-västliga, ${s === 'man' ? 'män' : 'kvinnor'}, strafflagen, ålder`, formatNumber(r.index!), `Indvandrere i Danmark 2025, tabell 6.9, s. ${r.page}`, STATED, URL);
  }
}

// ---------- Chapters 6.1 and 6.2 (Finland) ----------
{
  const URL = 'https://pxdata.stat.fi/PxWeb/pxweb/sv/StatFin/StatFin__rpk/13zk.px/';
  const k = buildKap13(loadFiSuspects());
  const stated = (y: number, o: Parameters<typeof fiPersons>[2], sex: 'alla' | 'man' | 'kvinnor' = 'alla', age: Parameters<typeof fiPersons>[4] = 'alla') => {
    const r = k.rows.find((x) => x.year === y && x.origin === o && x.sex === sex && x.age === age)!;
    return `13zk: ${formatNumber(r.persons)} misstänkta, ${formatNumber(r.per10000!, 1)} per 10 000 (delat med 10)`;
  };
  const K1 = '6.1 Misstänkta i Finland';
  for (const o of FI_CHART) {
    for (const y of [k.firstYear, k.lastYear]) {
      const r = k.rows.find((x) => x.year === y && x.origin === o && x.sex === 'alla' && x.age === 'alla')!;
      add(K1, 'Diagram och inledningen', `${fiLabel(o, 'sv')}, ${y}, per 1 000`, fmt(r.per10000! / 10, 'num1'), stated(y, o), STATED, URL);
    }
  }
  add(K1, 'Rubriken', `Utländsk bakgrund födda utomlands, gånger befolkningen ${k.lastYear}`, formatTimes(fiRatio(k, k.lastYear, 'utl_fodd_utl')), 'Kvot mellan talen per 1 000 ovan', CALC, URL);
  add(K1, 'Inledningen', `Utländsk bakgrund födda utomlands, gånger befolkningen ${k.firstYear}`, formatTimes(fiRatio(k, k.firstYear, 'utl_fodd_utl')), 'Kvot mellan talen per 1 000 ovan', CALC, URL);
  const K2 = '6.2 Efter ålder, Finland';
  const y = ageYear(k);
  for (const s of ['man', 'kvinnor'] as const) {
    const where = s === 'man' ? 'Diagram, män' : 'Andra diagrammet, kvinnor';
    for (const a of AGES) {
      for (const o of AGE_GROUPS) {
        const r = k.rows.find((x) => x.year === y && x.origin === o && x.sex === s && x.age === a)!;
        add(K2, where, `${fiLabel(o, 'sv')}, ${ageLabel(a, 'sv')}, ${y}, per 1 000`, shown(k, s, a, o) ? fmt(r.per10000! / 10, 'num1') : 'visas inte (färre än 20)', stated(y, o, s, a), STATED, URL);
      }
      for (const o of ['utl_fodd_utl', 'utl_fodd_fi'] as const) {
        if (shown(k, s, a, o)) add(K2, where === 'Diagram, män' ? 'Rubriken och inledningen' : 'Andra diagrammets rubrik', `${fiLabel(o, 'sv')}, ${s === 'man' ? 'män' : 'kvinnor'} ${ageLabel(a, 'sv')}, gånger finländsk bakgrund`, formatTimes(ageRatio(k, s, a, o)), 'Kvot mellan talen per 1 000 ovan', CALC, URL);
      }
    }
  }
}

// ---------- Chapters 7.1 and 7.2 (Norway) ----------
{
  const URL = 'https://www.ssb.no/sosiale-forhold-og-kriminalitet/kriminalitet-og-rettsvesen/statistikk/etterforskede-lovbrudd/artikler/siktelser-og-siktede-personer-etter-innvandringsbakgrunn';
  const d = buildNo(loadNoCharged());
  const name = (r: (typeof d.rows)[number]) => {
    const cat = r.category === 'ovrige' || r.category === 'innvandrere' || r.category === 'norskfodte' ? NO_CATEGORY_LABEL[r.category].sv : r.category;
    if (r.level === 'bakgrunn') return cat;
    if (r.level === 'region') return `${cat}, ${NO_REGION_LABEL[r.group as keyof typeof NO_REGION_LABEL].sv}`;
    return `${cat}, ${countryLabel(r.group, 'sv')}`;
  };
  for (const r of d.rows.filter((x) => x.per1000 !== null)) {
    const K = r.level === 'land' ? '7.2 Efter födelseland, Norge' : '7.1 Misstänkta i Norge';
    add(K, 'Diagram och text', `${name(r)}, per 1 000, ${d.period}`, fmt(r.per1000!, 'num1'), `SSB tabell 3, flik "Tab 3 siktede per 1 000" (gånger övriga: ${formatNumber(r.ratio!, 2)})`, STATED, URL);
    if (r.men15_24Per1000 !== null && r.level !== 'land') {
      add(K, 'Andra diagrammet, män 15–24 år', `${name(r)}, män 15–24 år, per 1 000`, fmt(r.men15_24Per1000, 'num1'), `SSB tabell 3, kolumn N (gånger övriga: ${formatNumber(r.men15_24Ratio!, 2)})`, STATED, URL);
    }
  }
}

writeFileSync('docs/sifferkontroll.csv', toCsv(main));

// ---------- Every value behind the menus ----------
const menu: string[][] = [['Kapitel', 'Vy', 'Brottstyp', 'Grupp', 'År', 'Per 1 000', 'Gånger vanligare', 'Justerat', 'Källa']];
for (const c of kap1.crimes) {
  const rate = buildKap1Spec(kap1, c.id, 'rate');
  const ratio = buildKap1Spec(kap1, c.id, 'ratio');
  for (const s of rate.series) {
    const r = ratio.series.find((x) => x.id === s.id);
    kap1.years.forEach((year, i) => {
      const v = s.values[i];
      const q = r ? r.values[i] : null;
      menu.push(['01 Över tid', 'Bakgrund', c.name, s.label, String(year), v === null ? 'saknas' : fmt(v, s.format), q === null ? '' : fmt(q, 'x1'), '', 'Brå 2021:9 tabellbilaga 2 (gånger vanligare: uträknat)']);
    });
  }
}
for (const view of ['region', 'land', 'moder'] as View[]) {
  for (const c of kap2[view]) {
    const rate = buildKap2Spec(kap2, view, c.name, 'rate');
    const risk = buildKap2Spec(kap2, view, c.name, 'risk');
    menu.push(['02 Födelseområde', VIEW_LABEL[view].sv, c.name, 'Inrikesfödda med två inrikesfödda föräldrar (jämförelsegrupp)', '2015–2018', dotFmt(c.refPer1000, 'num1'), dotFmt(1, 'x1'), '', 'Brå 2021:9 tabellbilaga 1']);
    for (const row of risk.rows) {
      const per1000 = rate.rows.find((x) => x.id === row.id)!.primary;
      menu.push(['02 Födelseområde', VIEW_LABEL[view].sv, c.name, row.label, '2015–2018', dotFmt(per1000, 'num1'), dotFmt(row.primary, 'x1'), row.secondary === null ? '' : dotFmt(row.secondary, 'x1'), 'Brå 2021:9 tabellbilaga 1']);
    }
  }
}
writeFileSync('docs/sifferkontroll_menyer.csv', toCsv(menu));

// ---------- Every value on the table pages ----------
const tableRows: string[][] = [['Sida', 'Tabell', 'Rad', 'Kolumn', 'Värde på sidan']];
for (const { chapterId } of tablePages) {
  const tables = tablePageContent(chapterId).sections.flatMap((s) => s.tables);
  const path = tablePage(chapterId).path;
  for (const t of tables) {
    for (const r of t.rows) {
      r.cells.forEach((cell, i) => {
        const col = t.columns[i];
        if (col.kind !== 'number') return;
        const shown = typeof cell === 'number' ? formatCell(cell, col.decimals) : 'saknas';
        tableRows.push([path, t.caption, r.key, col.label, shown]);
      });
    }
  }
}
writeFileSync('docs/sifferkontroll_tabeller.csv', toCsv(tableRows));
console.log(`docs/sifferkontroll.csv: ${main.length - 1} rows, docs/sifferkontroll_menyer.csv: ${menu.length - 1} rows, docs/sifferkontroll_tabeller.csv: ${tableRows.length - 1} rows`);
