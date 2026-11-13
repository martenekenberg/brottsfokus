// Chapter 4: people convicted of rape, two register studies from Lund University.
import type { PopulationRow, RapeStudyRow } from '../data';
import { complementPct, round, studyPopulationSharePct, swedishBornTwoForeignParents } from '../calc';
import type { BarChartSpec } from '../charts/bar';
import { formatPct } from '../format';

function pick(rows: RapeStudyRow[], chart: RapeStudyRow['chart'], id: string): RapeStudyRow {
  const r = rows.find((x) => x.chart === chart && x.itemId === id);
  if (!r) throw new Error(`Missing ${chart}/${id} in valdtakt_domda.csv`);
  return r;
}

/** Everyone who is not Swedish-born with two Swedish-born parents. */
const OTHER_LABEL = 'Utrikesfödda eller minst en utrikesfödd förälder';

export interface Kap4 {
  main: BarChartSpec;
  region: BarChartSpec;
  prior: BarChartSpec;
  /** Values used in the copy. */
  popForeignBorn: number;
  popTwoForeignParents: number;
  /** Share who are Swedish-born with two Swedish-born parents, 2000–2020: convicted and controls. */
  sv2Convicted: number;
  sv2Controls: number;
}

export function buildKap4(rows: RapeStudyRow[], population: PopulationRow[]): Kap4 {
  // The 2000–2020 study (table 1) has four groups and no "unknown" group. The top bar shows
  // everyone who is not Swedish-born with two Swedish-born parents: 100 minus that group's share.
  const sv2 = pick(rows, 'kontroll', 'sv2');
  if (sv2.pctControls === null) throw new Error('Missing control group share');
  const control = { period: sv2.period, pct: complementPct(sv2.pct), pctControls: complementPct(sv2.pctControls) };
  // Check: the three other groups in table 1 must add up to the same share.
  const others = ['sv1', 'u2', 'utr'].map((id) => pick(rows, 'kontroll', id));
  const sum = (f: (r: RapeStudyRow) => number | null) => round(others.reduce((a, r) => a + (f(r) ?? NaN), 0), 1);
  if (sum((r) => r.pct) !== control.pct || sum((r) => r.pctControls) !== control.pctControls) {
    throw new Error('valdtakt_domda.csv: the kontroll groups do not add up to 100 percent');
  }
  const utr = pick(rows, 'bakgrund', 'utr');
  const u2 = pick(rows, 'bakgrund', 'u2');
  const popForeignBorn = studyPopulationSharePct(population, (r) => r.utrikesFodda);
  const popTwoForeignParents = studyPopulationSharePct(population, swedishBornTwoForeignParents);

  const main: BarChartSpec = {
    groups: [
      {
        label: OTHER_LABEL,
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
      `${OTHER_LABEL}: ${formatPct(control.pct, 1)} bland dömda ${control.period}, ${formatPct(control.pctControls, 1)} i kontrollgruppen. ` +
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

  return { main, region, prior, popForeignBorn, popTwoForeignParents, sv2Convicted: sv2.pct, sv2Controls: sv2.pctControls };
}
