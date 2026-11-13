// Chapter 4: people convicted of rape, two register studies from Lund University.
import type { PopulationRow, RapeStudyRow } from '../data';
import { complementPct, round, studyPopulationSharePct, swedishBornTwoForeignParents } from '../calc';
import type { BarChartSpec } from '../charts/bar';
import { formatPct } from '../format';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';

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

export function buildKap4(rows: RapeStudyRow[], population: PopulationRow[], lang: Lang): Kap4 {
  const pct = (v: number, decimals = 1) => formatPct(v, decimals, lang);
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

  const convictedLabel = tr(lang, `Dömda ${sv2.period}`, `Convicted ${sv2.period}`);
  const controlLabel = tr(lang, 'Matchad kontrollgrupp', 'Matched control group');
  const otherLabel = tr(lang, OTHER_LABEL, 'Born abroad or at least one foreign-born parent');
  const u2Label = tr(lang, 'Inrikesfödda, två utrikesfödda föräldrar', 'Born in Sweden, two foreign-born parents');
  const sv1Label = tr(lang, 'Inrikesfödda, en utrikesfödd förälder', 'Born in Sweden, one foreign-born parent');
  const utrLabel = dataLabel('Utrikesfödda', lang);

  // 2000–2020: each group among the convicted and among controls of the same sex and birth year.
  const pair = (label: string, value: number, valueControls: number | null) => {
    if (valueControls === null) throw new Error(`Missing control group share for ${label}`);
    return {
      label,
      bars: [
        { label: convictedLabel, value, kind: 'focus' as const },
        { label: controlLabel, value: valueControls, kind: 'comparison' as const },
      ],
    };
  };
  const [sv1c, u2c, utrc] = others;
  const main: BarChartSpec = {
    lang,
    groups: [
      pair(otherLabel, control.pct, control.pctControls),
      pair(utrLabel, utrc.pct, utrc.pctControls),
      pair(u2Label, u2c.pct, u2c.pctControls),
      pair(sv1Label, sv1c.pct, sv1c.pctControls),
    ],
    ariaLabel: '',
  };
  main.ariaLabel =
    tr(
      lang,
      `Stapeldiagram. Bakgrund bland dömda för våldtäkt ${sv2.period} jämfört med en matchad kontrollgrupp. `,
      `Bar chart. Background among people convicted of rape ${sv2.period}, compared with a matched control group. `,
    ) +
    main.groups
      .map((g) =>
        tr(
          lang,
          `${g.label}: ${pct(g.bars[0].value)} bland dömda, ${pct(g.bars[1].value)} i kontrollgruppen`,
          `${g.label}: ${pct(g.bars[0].value)} among convicted, ${pct(g.bars[1].value)} in the control group`,
        ),
      )
      .join('. ') +
    '.';

  // 2000–2015: the convicted compared with the whole population.
  const popLabel = tr(lang, 'Befolkningen, snitt 2000–2015', 'Population, average 2000–2015');
  const popPair = (label: string, row: RapeStudyRow, popValue: number) => ({
    label,
    bars: [
      { label: tr(lang, `Dömda ${row.period}`, `Convicted ${row.period}`), value: row.pct, kind: 'focus' as const },
      { label: popLabel, value: popValue, kind: 'comparison' as const },
    ],
  });
  const population2015: BarChartSpec = {
    lang,
    // Same scale as the chart above, so the bars can be compared.
    xMax: Math.max(...main.groups.flatMap((g) => g.bars.map((x) => x.value))),
    groups: [
      popPair(utrLabel, utr, popForeignBorn),
      popPair(u2Label, u2, popTwoForeignParents),
    ],
    ariaLabel: tr(
      lang,
      'Stapeldiagram. Bakgrund bland dömda för våldtäkt 2000–2015 jämfört med hela befolkningen. ',
      'Bar chart. Background among people convicted of rape 2000–2015, compared with the whole population. ',
    ) +
      tr(
        lang,
        `Utrikesfödda: ${pct(utr.pct)} bland dömda, ${pct(popForeignBorn)} i befolkningen. ` +
          `Inrikesfödda med två utrikesfödda föräldrar: ${pct(u2.pct)} bland dömda, ${pct(popTwoForeignParents)} i befolkningen.`,
        `Born abroad: ${pct(utr.pct)} among convicted, ${pct(popForeignBorn)} in the population. ` +
          `Born in Sweden with two foreign-born parents: ${pct(u2.pct)} among convicted, ${pct(popTwoForeignParents)} in the population.`,
      ),
  };

  const regionRows = rows.filter((r) => r.chart === 'region').sort((a, b) => b.pct - a.pct);
  const region: BarChartSpec = {
    lang,
    groups: regionRows.map((r) => ({ label: dataLabel(r.item, lang), bars: [{ label: '', value: r.pct, kind: 'focus' as const }] })),
    ariaLabel: tr(
      lang,
      'Stapeldiagram. Födelseregion bland utrikesfödda dömda för våldtäkt 2000–2015. ',
      'Bar chart. Birth region among born-abroad people convicted of rape 2000–2015. ',
    ) +
      regionRows.map((r) => `${dataLabel(r.item, lang)} ${pct(r.pct)}`).join(', ') +
      '.',
  };

  const priorRows = rows.filter((r) => r.chart === 'ovrigt');
  const prior: BarChartSpec = {
    lang,
    groups: priorRows.map((r) => ({ label: dataLabel(r.item, lang), bars: [{ label: '', value: r.pct, kind: 'focus' as const }] })),
    ariaLabel: tr(
      lang,
      'Stapeldiagram. Andel av alla dömda för våldtäkt 2000–2015 som tidigare dömts för brott eller haft ekonomiskt bistånd. ',
      'Bar chart. Share of all people convicted of rape 2000–2015 who had previously been convicted of a crime or received social assistance. ',
    ) +
      priorRows.map((r) => `${dataLabel(r.item, lang)} ${pct(r.pct)}`).join(', ') +
      '.',
  };

  return {
    main,
    population2015,
    menPct: pick(rows, 'kontroll', 'man').pct,
    region,
    prior,
    popForeignBorn,
    popTwoForeignParents,
    sv2Convicted: sv2.pct,
    sv2Controls: sv2.pctControls,
  };
}
