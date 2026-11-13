// Chapter 4: people convicted of rape, two register studies from Lund University.
import type { PopulationRow, RapeStudyRow } from '../data';
import { studyPopulationSharePct, swedishBornTwoForeignParents } from '../calc';
import type { BarChartSpec } from '../charts/bar';
import { formatPct } from '../format';

function pick(rows: RapeStudyRow[], chart: RapeStudyRow['chart'], id: string): RapeStudyRow {
  const r = rows.find((x) => x.chart === chart && x.itemId === id);
  if (!r) throw new Error(`Missing ${chart}/${id} in valdtakt_domda.csv`);
  return r;
}

export interface Kap4 {
  main: BarChartSpec;
  region: BarChartSpec;
  prior: BarChartSpec;
  /** Values used in the copy. */
  popForeignBorn: number;
  popTwoForeignParents: number;
}

export function buildKap4(rows: RapeStudyRow[], population: PopulationRow[]): Kap4 {
  const control = pick(rows, 'kontroll', 'other');
  if (control.pctControls === null) throw new Error('Missing control group share');
  const utr = pick(rows, 'bakgrund', 'utr');
  const u2 = pick(rows, 'bakgrund', 'u2');
  const popForeignBorn = studyPopulationSharePct(population, (r) => r.utrikesFodda);
  const popTwoForeignParents = studyPopulationSharePct(population, swedishBornTwoForeignParents);

  const main: BarChartSpec = {
    groups: [
      {
        label: 'Utländsk bakgrund',
        bars: [
          { label: `Dömda ${control.period}`, value: control.pct, kind: 'focus' },
          { label: 'Matchad kontrollgrupp', value: control.pctControls, kind: 'comparison' },
        ],
      },
      {
        label: 'Utrikesfödda',
        bars: [
          { label: `Dömda ${utr.period}`, value: utr.pct, kind: 'focus' },
          { label: 'Befolkningen, snitt 2000–2015', value: popForeignBorn, kind: 'comparison' },
        ],
      },
      {
        label: 'Inrikesfödda, två utrikesfödda föräldrar',
        bars: [
          { label: `Dömda ${u2.period}`, value: u2.pct, kind: 'focus' },
          { label: 'Befolkningen, snitt 2000–2015', value: popTwoForeignParents, kind: 'comparison' },
        ],
      },
    ],
    ariaLabel:
      'Stapeldiagram. Andel med utländsk bakgrund bland dömda för våldtäkt jämfört med kontrollgrupp och befolkning. ' +
      `Utländsk bakgrund: ${formatPct(control.pct, 1)} bland dömda ${control.period}, ${formatPct(control.pctControls, 1)} i kontrollgruppen. ` +
      `Utrikesfödda: ${formatPct(utr.pct, 1)} bland dömda ${utr.period}, ${formatPct(popForeignBorn, 1)} i befolkningen. ` +
      `Inrikesfödda med två utrikesfödda föräldrar: ${formatPct(u2.pct, 1)} bland dömda, ${formatPct(popTwoForeignParents, 1)} i befolkningen.`,
  };

  const regionRows = rows.filter((r) => r.chart === 'region').sort((a, b) => b.pct - a.pct);
  const region: BarChartSpec = {
    groups: regionRows.map((r) => ({ label: r.item, bars: [{ label: '', value: r.pct, kind: 'focus' as const }] })),
    ariaLabel:
      'Stapeldiagram. Födelseregion bland utrikesfödda dömda för våldtäkt 2000–2015. ' +
      regionRows.map((r) => `${r.item} ${formatPct(r.pct, 1)}`).join(', ') +
      '.',
  };

  const priorRows = rows.filter((r) => r.chart === 'ovrigt');
  const prior: BarChartSpec = {
    groups: priorRows.map((r) => ({ label: r.item, bars: [{ label: '', value: r.pct, kind: 'focus' as const }] })),
    ariaLabel:
      'Stapeldiagram. Andel av alla dömda för våldtäkt 2000–2015 som tidigare dömts för brott eller haft ekonomiskt bistånd. ' +
      priorRows.map((r) => `${r.item} ${formatPct(r.pct, 1)}`).join(', ') +
      '.',
  };

  return { main, region, prior, popForeignBorn, popTwoForeignParents };
}
