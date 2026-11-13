// Every table on the table pages, in page order. Used by the number checklist,
// so it lists exactly what the pages show.
import { loadBra2005, loadOrigin, loadPopulation, loadPrison, loadRapeStudies, loadSuspectsByBackground, loadTableB6 } from './data';
import { buildKap1Data, crimeById } from './chapters/kap1';
import { rateTable, ratioTable } from './chapters/kap1Tables';
import { buildKap2Data } from './chapters/kap2';
import { b6Table, riskTable, totalCrime, TOTAL } from './chapters/kap2Tables';
import { buildKap3, kap3Tables } from './chapters/kap3';
import { kap4Tables } from './chapters/kap4Tables';
import { kap5Tables } from './chapters/kap5Tables';
import type { DataTable } from './tables';

export function allTables(): { chapterId: string; tables: DataTable[] }[] {
  const suspects = loadSuspectsByBackground();
  const kap1 = buildKap1Data(suspects);
  const total1 = crimeById(kap1, 'c00');

  const b6 = loadTableB6();
  const kap2 = buildKap2Data(loadOrigin(), new Map(suspects.map((r) => [r.crimeOrder, r.depth])), b6);

  const population = loadPopulation();
  const k4 = kap4Tables(loadRapeStudies(), population);

  return [
    { chapterId: 'kap1', tables: [rateTable(kap1, total1), ratioTable(kap1, total1), ...kap1.crimes.filter((c) => c.id !== 'c00').map((c) => rateTable(kap1, c))] },
    {
      chapterId: 'kap2',
      tables: [
        b6Table(b6, 'bakgrund', 'kap2-bakgrund', 'Brott totalt efter bakgrund (Brå tabell B6)'),
        riskTable(kap2, 'region', totalCrime(kap2, 'region'), 'kap2-region', 'Brott totalt efter födelseområde'),
        b6Table(b6, 'region', 'kap2-region-b6', 'Brott totalt efter födelseområde (Brå tabell B6)'),
        riskTable(kap2, 'land', totalCrime(kap2, 'land'), 'kap2-land', 'Brott totalt efter födelseland'),
        b6Table(b6, 'moder', 'kap2-moder', 'Brott totalt efter moderns födelseområde (Brå tabell B6)'),
        ...kap2.region.filter((c) => c.name !== TOTAL).map((c, i) => riskTable(kap2, 'region', c, `kap2-region-${i}`, `${c.name}, efter födelseområde`)),
        ...kap2.moder.filter((c) => c.name !== TOTAL).map((c, i) => riskTable(kap2, 'moder', c, `kap2-moder-${i}`, `${c.name}, efter moderns födelseområde`)),
      ],
    },
    { chapterId: 'kap3', tables: kap3Tables(buildKap3(loadPrison(), population)) },
    { chapterId: 'kap4', tables: [k4.background, k4.controls, k4.region, k4.prior, k4.population] },
    { chapterId: 'kap5', tables: kap5Tables(loadBra2005()) },
  ];
}
