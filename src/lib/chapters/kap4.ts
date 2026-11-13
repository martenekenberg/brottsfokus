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
  /** 2000–2020: convicted and matched controls. */
  main: BarChartSpec;
  /** 2000–2015: convicted and the whole population. */
  population2015: BarChartSpec;
  region: BarChartSpec;
  prior: BarChartSpec;
  /** Values used in the copy. */
  popForeignBorn: number;
  popTwoForeignParents: number;
  /** Share who are Swedish-born with two Swedish-born parents, 2000–2020: convicted and controls. */
  sv2Convicted: number;
  sv2Controls: number;
  /** Share of men among the convicted 2000–2020. */
  menPct: number;
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

  // 2000–2020: each group among the convicted and among controls of the same sex and birth year.
  const pair = (label: string, pct: number, pctControls: number | null) => {
    if (pctControls === null) throw new Error(`Missing control group share for ${label}`);
    return {
      label,
      bars: [
        { label: `Dömda ${sv2.period}`, value: pct, kind: 'focus' as const },
        { label: 'Matchad kontrollgrupp', value: pctControls, kind: 'comparison' as const },
      ],
    };
  };
  const [sv1c, u2c, utrc] = others;
  const main: BarChartSpec = {
    groups: [
      pair(OTHER_LABEL, control.pct, control.pctControls),
      pair('Utrikesfödda', utrc.pct, utrc.pctControls),
      pair('Inrikesfödda, två utrikesfödda föräldrar', u2c.pct, u2c.pctControls),
      pair('Inrikesfödda, en utrikesfödd förälder', sv1c.pct, sv1c.pctControls),
    ],
    ariaLabel: '',
  };
  main.ariaLabel =
    `Stapeldiagram. Bakgrund bland dömda för våldtäkt ${sv2.period} jämfört med en matchad kontrollgrupp. ` +
    main.groups.map((g) => `${g.label}: ${formatPct(g.bars[0].value, 1)} bland dömda, ${formatPct(g.bars[1].value, 1)} i kontrollgruppen`).join('. ') +
    '.';

  // 2000–2015: the convicted compared with the whole population.
  const popPair = (label: string, row: RapeStudyRow, pop: number) => ({
    label,
    bars: [
      { label: `Dömda ${row.period}`, value: row.pct, kind: 'focus' as const },
      { label: 'Befolkningen, snitt 2000–2015', value: pop, kind: 'comparison' as const },
    ],
  });
  const population2015: BarChartSpec = {
    // Same scale as the chart above, so the bars can be compared.
    xMax: Math.max(...main.groups.flatMap((g) => g.bars.map((x) => x.value))),
    groups: [
      popPair('Utrikesfödda', utr, popForeignBorn),
      popPair('Inrikesfödda, två utrikesfödda föräldrar', u2, popTwoForeignParents),
    ],
    ariaLabel:
      'Stapeldiagram. Bakgrund bland dömda för våldtäkt 2000–2015 jämfört med hela befolkningen. ' +
      `Utrikesfödda: ${formatPct(utr.pct, 1)} bland dömda, ${formatPct(popForeignBorn, 1)} i befolkningen. ` +
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

  return { main, population2015, menPct: pick(rows, 'kontroll', 'man').pct, region, prior, popForeignBorn, popTwoForeignParents, sv2Convicted: sv2.pct, sv2Controls: sv2.pctControls };
}
