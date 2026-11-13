// Chapter 5: Brå's older studies, 1985–89 and 1997–2001 (Brå 2005:17).
import type { Bra2005Row } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { formatPct, formatTimes } from '../format';
import { tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';

function value(rows: Bra2005Row[], chart: string, groupId: string, series: string): number {
  const r = rows.find((x) => x.chart === chart && x.groupId === groupId && x.series === series);
  if (!r) throw new Error(`Missing ${chart}/${groupId}/${series} in bra2005.csv`);
  return r.value;
}

/** Group names in the share chart, by group id. Swedish ones come from the file's own wording. */
const SHARE_GROUP_EN: Record<string, string> = {
  u2: 'Born in Sweden, two foreign-born parents',
  sv1: 'Born in Sweden, one foreign-born parent',
  sv2: 'Born in Sweden, two Swedish-born parents',
};

export interface Kap5 {
  riskForeignBorn: BarChartSpec;
  riskSwedishBorn: BarChartSpec;
  shares: BarChartSpec;
  crimes: BarChartSpec;
  /** Standardised excess risk 1997–2001, reported separately for one and two foreign-born parents. */
  standOneParent: number;
  standTwoParents: number;
  /** True if the excess risk for foreign-born was higher 1997–2001 than 1985–89 (used to check the headline). */
  foreignBornRiskRose: boolean;
}

export function buildKap5(rows: Bra2005Row[], lang: Lang): Kap5 {
  const ref = { value: 1, label: tr(lang, 'Jämförelsegrupp = 1', 'Comparison group = 1') };
  const times = (v: number) => formatTimes(v, 1, lang);
  const pct = (v: number, decimals: number) => formatPct(v, decimals, lang);

  const utr8589 = value(rows, 'period', 'utr', 'p8589');
  const utr9701 = value(rows, 'period', 'utr', 'p9701');
  const utrStand = value(rows, 'overrisk', 'utr', 'stand');
  const sv8589 = value(rows, 'period', 'sv12', 'p8589');
  const sv9701 = value(rows, 'period', 'sv12', 'p9701');
  // Both small multiples share one scale so their bars can be compared.
  const xMax = Math.ceil(Math.max(utr8589, utr9701, utrStand, sv8589, sv9701));
  const utrLabel = dataLabel('Utrikesfödda', lang);

  const riskForeignBorn: BarChartSpec = {
    lang,
    format: 'x1',
    xMax,
    ref,
    groups: [
      { label: '1985–89', bars: [{ label: '', value: utr8589, kind: 'focusLight' }] },
      { label: '1997–2001', bars: [{ label: '', value: utr9701, kind: 'focus' }] },
      {
        label: tr(lang, '1997–2001, standardiserad', '1997–2001, standardised'),
        bars: [{ label: '', value: utrStand, kind: 'focusMid' }],
      },
    ],
    ariaLabel:
      tr(
        lang,
        `Stapeldiagram. Överrisk för utrikesfödda: ${times(utr8589)} 1985–89, ${times(utr9701)} 1997–2001 ` +
          `och ${times(utrStand)} standardiserad 1997–2001.`,
        `Bar chart. Excess risk for born abroad: ${times(utr8589)} in 1985–89, ${times(utr9701)} in 1997–2001 ` +
          `and ${times(utrStand)} standardised in 1997–2001.`,
      ),
  };

  const riskSwedishBorn: BarChartSpec = {
    lang,
    format: 'x1',
    xMax,
    ref,
    groups: [
      { label: '1985–89', bars: [{ label: '', value: sv8589, kind: 'secondLight' }] },
      { label: '1997–2001', bars: [{ label: '', value: sv9701, kind: 'second' }] },
    ],
    ariaLabel: tr(
      lang,
      `Stapeldiagram. Överrisk för inrikesfödda med en eller två utrikesfödda föräldrar: ` +
        `${times(sv8589)} 1985–89 och ${times(sv9701)} 1997–2001.`,
      `Bar chart. Excess risk for born in Sweden with one or two foreign-born parents: ` +
        `${times(sv8589)} in 1985–89 and ${times(sv9701)} in 1997–2001.`,
    ),
  };

  const shareGroups = ['utr', 'u2', 'sv1', 'sv2'].map((id) => {
    const misst = rows.find((x) => x.chart === 'andel_misst' && x.groupId === id);
    if (!misst) throw new Error(`Missing andel_misst/${id}`);
    const groupLabel =
      id === 'utr'
        ? utrLabel
        : tr(lang, `Inrikesfödda, ${misst.group.toLowerCase()}`, SHARE_GROUP_EN[id]);
    return {
      label: groupLabel,
      bars: [
        { label: tr(lang, 'Andel av de misstänkta', 'Share of suspects'), value: misst.value, kind: 'focus' as const },
        {
          label: tr(lang, 'Andel av befolkningen', 'Share of population'),
          value: value(rows, 'befolkning', id, 'bef'),
          kind: 'comparison' as const,
        },
      ],
    };
  });
  const shares: BarChartSpec = {
    lang,
    groups: shareGroups,
    ariaLabel:
      tr(
        lang,
        'Stapeldiagram. Varje grupps andel av alla misstänkta 1997–2001 jämfört med dess andel av befolkningen. ',
        'Bar chart. Each group’s share of all suspects 1997–2001 compared with its share of the population. ',
      ) +
      shareGroups
        .map((g) =>
          tr(
            lang,
            `${g.label}: ${pct(g.bars[0].value, 1)} av de misstänkta, ${pct(g.bars[1].value, 1)} av befolkningen`,
            `${g.label}: ${pct(g.bars[0].value, 1)} of the suspects, ${pct(g.bars[1].value, 1)} of the population`,
          ),
        )
        .join('. ') +
      '.',
  };

  // "Samtliga brott" is shown elsewhere, so it is left out here.
  const crimeIds = [...new Set(rows.filter((r) => r.chart === 'brott' && r.groupId !== 'all').map((r) => r.groupId))];
  const crimeGroups = crimeIds.map((id) => {
    const name = rows.find((r) => r.chart === 'brott' && r.groupId === id)?.group ?? id;
    return {
      label: dataLabel(name, lang),
      bars: [
        { label: utrLabel, value: value(rows, 'brott', id, 'utr'), kind: 'focus' as const },
        {
          label: tr(lang, 'En eller två utrikesfödda föräldrar', 'One or two foreign-born parents'),
          value: value(rows, 'brott', id, 'barn'),
          kind: 'second' as const,
        },
        {
          label: tr(lang, 'Två inrikesfödda föräldrar', 'Two Swedish-born parents'),
          value: value(rows, 'brott', id, 'sv2'),
          kind: 'comparison' as const,
        },
      ],
    };
  });
  const crimes: BarChartSpec = {
    lang,
    format: 'pct2',
    hideBarLabels: true,
    groups: crimeGroups,
    ariaLabel:
      tr(
        lang,
        'Stapeldiagram. Andel misstänkta 1997–2001 för olika brottstyper bland utrikesfödda, inrikesfödda med en eller två ' +
          'utrikesfödda föräldrar och inrikesfödda med två inrikesfödda föräldrar. ',
        'Bar chart. Share of suspects 1997–2001 for each crime type among born abroad, born in Sweden with one or two ' +
          'foreign-born parents, and born in Sweden with two Swedish-born parents. ',
      ) +
      crimeGroups.map((g) => `${g.label}: ${g.bars.map((b) => pct(b.value, 2)).join(', ')}`).join('. ') +
      '.',
  };

  return {
    riskForeignBorn,
    riskSwedishBorn,
    shares,
    crimes,
    standOneParent: value(rows, 'overrisk', 'sv1', 'stand'),
    standTwoParents: value(rows, 'overrisk', 'u2', 'stand'),
    foreignBornRiskRose: utr9701 > utr8589,
  };
}
