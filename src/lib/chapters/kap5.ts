// Chapter 5: Brå's older studies, 1985–89 and 1997–2001 (Brå 2005:17).
import type { Bra2005Row } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { formatPct, formatTimes } from '../format';

function value(rows: Bra2005Row[], chart: string, groupId: string, series: string): number {
  const r = rows.find((x) => x.chart === chart && x.groupId === groupId && x.series === series);
  if (!r) throw new Error(`Missing ${chart}/${groupId}/${series} in bra2005.csv`);
  return r.value;
}

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

export function buildKap5(rows: Bra2005Row[]): Kap5 {
  const ref = { value: 1, label: 'Jämförelsegrupp = 1' };

  const utr8589 = value(rows, 'period', 'utr', 'p8589');
  const utr9701 = value(rows, 'period', 'utr', 'p9701');
  const utrStand = value(rows, 'overrisk', 'utr', 'stand');
  const sv8589 = value(rows, 'period', 'sv12', 'p8589');
  const sv9701 = value(rows, 'period', 'sv12', 'p9701');
  // Both small multiples share one scale so their bars can be compared.
  const xMax = Math.ceil(Math.max(utr8589, utr9701, utrStand, sv8589, sv9701));

  const riskForeignBorn: BarChartSpec = {
    format: 'x1',
    xMax,
    ref,
    groups: [
      { label: '1985–89', bars: [{ label: '', value: utr8589, kind: 'focusLight' }] },
      { label: '1997–2001', bars: [{ label: '', value: utr9701, kind: 'focus' }] },
      { label: '1997–2001, standardiserad', bars: [{ label: '', value: utrStand, kind: 'focusMid' }] },
    ],
    ariaLabel:
      `Stapeldiagram. Överrisk för utrikesfödda: ${formatTimes(utr8589)} 1985–89, ${formatTimes(utr9701)} 1997–2001 ` +
      `och ${formatTimes(utrStand)} standardiserad 1997–2001.`,
  };

  const riskSwedishBorn: BarChartSpec = {
    format: 'x1',
    xMax,
    ref,
    groups: [
      { label: '1985–89', bars: [{ label: '', value: sv8589, kind: 'secondLight' }] },
      { label: '1997–2001', bars: [{ label: '', value: sv9701, kind: 'second' }] },
    ],
    ariaLabel:
      `Stapeldiagram. Överrisk för inrikesfödda med en eller två utrikesfödda föräldrar: ` +
      `${formatTimes(sv8589)} 1985–89 och ${formatTimes(sv9701)} 1997–2001.`,
  };

  const shareGroups = ['utr', 'u2', 'sv1', 'sv2'].map((id) => {
    const misst = rows.find((x) => x.chart === 'andel_misst' && x.groupId === id);
    if (!misst) throw new Error(`Missing andel_misst/${id}`);
    return {
      label: id === 'utr' ? 'Utrikesfödda' : `Inrikesfödda, ${misst.group.toLowerCase()}`,
      bars: [
        { label: 'Andel av de misstänkta', value: misst.value, kind: 'focus' as const },
        { label: 'Andel av befolkningen', value: value(rows, 'befolkning', id, 'bef'), kind: 'comparison' as const },
      ],
    };
  });
  const shares: BarChartSpec = {
    groups: shareGroups,
    ariaLabel:
      'Stapeldiagram. Varje grupps andel av alla misstänkta 1997–2001 jämfört med dess andel av befolkningen. ' +
      shareGroups
        .map((g) => `${g.label}: ${formatPct(g.bars[0].value, 1)} av de misstänkta, ${formatPct(g.bars[1].value, 1)} av befolkningen`)
        .join('. ') +
      '.',
  };

  // "Samtliga brott" is shown elsewhere, so it is left out here.
  const crimeIds = [...new Set(rows.filter((r) => r.chart === 'brott' && r.groupId !== 'all').map((r) => r.groupId))];
  const crimeGroups = crimeIds.map((id) => {
    const name = rows.find((r) => r.chart === 'brott' && r.groupId === id)?.group ?? id;
    return {
      label: name,
      bars: [
        { label: 'Utrikesfödda', value: value(rows, 'brott', id, 'utr'), kind: 'focus' as const },
        { label: 'En eller två utrikesfödda föräldrar', value: value(rows, 'brott', id, 'barn'), kind: 'second' as const },
        { label: 'Två inrikesfödda föräldrar', value: value(rows, 'brott', id, 'sv2'), kind: 'comparison' as const },
      ],
    };
  });
  const crimes: BarChartSpec = {
    format: 'pct2',
    hideBarLabels: true,
    groups: crimeGroups,
    ariaLabel:
      'Stapeldiagram. Andel misstänkta 1997–2001 för olika brottstyper bland utrikesfödda, inrikesfödda med en eller två ' +
      'utrikesfödda föräldrar och inrikesfödda med två inrikesfödda föräldrar. ' +
      crimeGroups.map((g) => `${g.label}: ${g.bars.map((b) => formatPct(b.value, 2)).join(', ')}`).join('. ') +
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
