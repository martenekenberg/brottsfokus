// Chapter 2: suspects by birth region, birth country and mother's birth region,
// 2015–2018 (Brå 2021:9, appendix 1). Shared by the build and the browser.
import type { B6Row, OriginRow } from '../data';
import { dotFmt, type DotChartSpec, type DotRow } from '../charts/dot';
import { formatNumber } from '../format';
import { missingText, tr, type Lang } from '../i18n';
import { dataLabel } from '../labels';

export type View = 'region' | 'land' | 'moder';
export type Measure = 'risk' | 'rate' | 'share';

/** The comparison group's id in the file. */
const COMPARISON = 'sv2';

export interface Kap2Unit {
  id: string;
  /** Swedish name from the data file. Use dataLabel() for the shown name. */
  label: string;
  region: string;
  n: number | null;
  per1000: number;
  risk: number;
  riskAdj: number | null;
  /** Share of all suspects and share of the population, in percent (brott totalt only, table B6). */
  suspectsPct: number | null;
  populationPct: number | null;
}

export interface Kap2Crime {
  name: string;
  order: number;
  depth: number;
  /** Comparison group's rate per 1,000 for this crime. */
  refPer1000: number;
  units: Kap2Unit[];
}

export type Kap2Data = Record<View, Kap2Crime[]>;

export const VIEW_LABEL: Record<View, Record<Lang, string>> = {
  region: { sv: 'Födelseområde', en: 'Birth region' },
  land: { sv: 'Födelseland', en: 'Birth country' },
  moder: { sv: 'Moderns födelseområde', en: 'Mother’s birth region' },
};

export const TOTAL = 'Brott totalt';

/**
 * Build-time: group the CSV rows by view and crime type. `depthByOrder` indents the crime menu.
 * `b6` (Brå table B6) adds each group's share of suspects and of the population for brott totalt,
 * and brott totalt for the mother's-region view, which the appendix 1 file does not include.
 */
export function buildKap2Data(rows: OriginRow[], depthByOrder: Map<number, number>, b6: B6Row[]): Kap2Data {
  const out: Kap2Data = { region: [], land: [], moder: [] };
  for (const view of ['region', 'land', 'moder'] as View[]) {
    const crimes = new Map<string, Kap2Crime>();
    for (const r of rows) {
      if (r.view !== view) continue;
      let c = crimes.get(r.crime);
      if (!c) {
        c = { name: r.crime, order: r.crimeOrder, depth: depthByOrder.get(r.crimeOrder) ?? 0, refPer1000: NaN, units: [] };
        crimes.set(r.crime, c);
      }
      if (r.unitId === COMPARISON) {
        c.refPer1000 = r.per1000;
        continue;
      }
      c.units.push({
        id: r.unitId,
        label: r.unit,
        region: r.region,
        n: r.n,
        per1000: r.per1000,
        risk: r.risk,
        riskAdj: r.riskAdj,
        suspectsPct: null,
        populationPct: null,
      });
    }
    if (view === 'moder' && !crimes.has(TOTAL)) {
      // Brott totalt by mother's birth region comes from table B6 only.
      const ids = new Map(rows.filter((r) => r.view === 'moder').map((r) => [r.unit, r.unitId]));
      const sv2 = b6.find((r) => r.view === 'bakgrund' && r.unit === 'Inrikesfödda med två inrikesfödda föräldrar');
      if (!sv2) throw new Error('Table B6: comparison group missing');
      crimes.set(TOTAL, {
        name: TOTAL,
        order: 0,
        depth: 0,
        refPer1000: sv2.pctSuspected * 10,
        units: b6
          .filter((r) => r.view === 'moder')
          .map((r) => ({
            id: ids.get(r.unit) ?? r.unit,
            label: r.unit,
            region: r.unit,
            n: r.populationN,
            per1000: r.pctSuspected * 10,
            risk: r.risk,
            riskAdj: null,
            suspectsPct: null,
            populationPct: null,
          })),
      });
    }
    // Shares of suspects and population (brott totalt, region and mother's region views).
    const total = crimes.get(TOTAL);
    if (total && view !== 'land') {
      for (const u of total.units) {
        const b = b6.find((r) => r.view === view && r.unit === u.label);
        if (!b) throw new Error(`Table B6: no row for ${view} / ${u.label}`);
        u.suspectsPct = b.suspectsPct;
        u.populationPct = b.populationPct;
      }
    }
    for (const c of crimes.values()) {
      if (Number.isNaN(c.refPer1000)) throw new Error(`No comparison group for ${view} / ${c.name}`);
    }
    out[view] = [...crimes.values()].sort((a, b) => a.order - b.order);
  }
  return out;
}

export function crimeFor(data: Kap2Data, view: View, name: string): Kap2Crime {
  return data[view].find((c) => c.name === name) ?? data[view][0];
}

/** The crime type's name in a language. */
export function crimeLabel(name: string, lang: Lang): string {
  return dataLabel(name, lang);
}

function lc(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** True only when every group has both shares, so a missing value is never drawn as 0. */
export function hasShares(crime: Kap2Crime): boolean {
  return crime.units.length > 0 && crime.units.every((u) => u.suspectsPct !== null && u.populationPct !== null);
}

/** Number of people in the smallest group of a view (brott totalt). Null if the file gives no sizes. */
export function smallestGroup(data: Kap2Data, view: View): { label: string; n: number } | null {
  let best: { label: string; n: number } | null = null;
  for (const u of crimeFor(data, view, TOTAL).units) {
    if (u.n !== null && (best === null || u.n < best.n)) best = { label: u.label, n: u.n };
  }
  return best;
}

export function hasAdjusted(crime: Kap2Crime): boolean {
  return crime.units.some((u) => u.riskAdj !== null);
}

export function chartHeading(view: View, crime: Kap2Crime, measure: Measure, lang: Lang): string {
  const who =
    view === 'moder'
      ? tr(lang, 'Inrikesfödda med två utrikesfödda föräldrar, efter moderns födelseområde', 'Born in Sweden, two foreign-born parents, by mother’s birth region')
      : view === 'land'
        ? tr(lang, 'Utrikesfödda efter födelseland', 'Born abroad, by birth country')
        : tr(lang, 'Utrikesfödda efter födelseområde', 'Born abroad, by birth region');
  const what =
    measure === 'risk'
      ? tr(
          lang,
          'gånger vanligare att misstänkas än inrikesfödda med två inrikesfödda föräldrar',
          'how many times more likely to be suspected than born in Sweden with two Swedish-born parents',
        )
      : measure === 'share'
        ? tr(lang, 'andel av alla misstänkta och andel av befolkningen', 'share of all suspects and share of the population')
        : tr(lang, 'misstänkta per 1 000', 'suspects per 1,000');
  return `${who}: ${what}, ${lc(crimeLabel(crime.name, lang))}, 2015–2018`;
}

function detail(view: View, u: Kap2Unit, lang: Lang): string | undefined {
  if (view === 'land') {
    const size = u.n === null ? '' : tr(lang, `, ${formatNumber(u.n, 0, lang)} personer i gruppen`, `, ${formatNumber(u.n, 0, lang)} people in the group`);
    return u.region ? tr(lang, `Födelseområde: ${dataLabel(u.region, lang)}${size}`, `Birth region: ${dataLabel(u.region, lang)}${size}`) : undefined;
  }
  if (view === 'moder') {
    return tr(lang, 'Inrikesfödda med två utrikesfödda föräldrar, modern född här', 'Born in Sweden, two foreign-born parents, mother born in this region');
  }
  return undefined;
}

export function buildKap2Spec(data: Kap2Data, view: View, crimeName: string, measure: Measure, lang: Lang): DotChartSpec {
  const crime = crimeFor(data, view, crimeName);
  // Highest first, by the value that is shown. (Risk and rate can differ in order by a
  // hair, because Brå rounds both.) The share view keeps the risk order.
  const units = [...crime.units].sort((a, b) =>
    measure === 'rate' ? b.per1000 - a.per1000 || b.risk - a.risk : b.risk - a.risk || b.per1000 - a.per1000,
  );
  const refLabel = tr(lang, 'Inrikesfödda med två inrikesfödda föräldrar', 'Born in Sweden, two Swedish-born parents');
  const heading = chartHeading(view, crime, measure, lang);
  if (measure === 'share' && hasShares(crime)) {
    const rows: DotRow[] = units.map((u) => ({
      id: u.id,
      label: dataLabel(u.label, lang),
      detail: detail(view, u, lang),
      primary: u.suspectsPct as number, // hasShares() has checked that no value is missing
      secondary: u.populationPct,
    }));
    const pct = (v: number) => tr(lang, `${formatNumber(v, 2, lang)} procent`, `${formatNumber(v, 2, lang)}%`);
    return {
      lang,
      rows,
      primaryLabel: tr(lang, 'Andel av alla misstänkta', 'Share of all suspects'),
      secondaryLabel: tr(lang, 'Andel av befolkningen', 'Share of population'),
      secondaryStyle: 'population',
      format: 'pct2',
      ariaLabel:
        tr(lang, 'Punktdiagram. ', 'Dot plot. ') +
        `${heading}. ` +
        tr(lang, `${rows.length} grupper, sorterade efter överrisk. `, `${rows.length} groups, sorted by excess risk. `) +
        rows
          .map((r) =>
            tr(
              lang,
              `${r.label}: ${pct(r.primary)} av de misstänkta, ${r.secondary === null ? missingText(lang) : pct(r.secondary)} av befolkningen`,
              `${r.label}: ${pct(r.primary)} of the suspects, ${r.secondary === null ? missingText(lang) : pct(r.secondary)} of the population`,
            ),
          )
          .join('. ') +
        '.',
    };
  }
  const adjusted = measure === 'risk' && hasAdjusted(crime);
  const rows: DotRow[] = units.map((u) => ({
    id: u.id,
    label: dataLabel(u.label, lang),
    detail: detail(view, u, lang),
    primary: measure === 'rate' ? u.per1000 : u.risk,
    secondary: adjusted ? u.riskAdj : null,
  }));
  const refValue = measure === 'rate' ? crime.refPer1000 : 1;
  const rateFormat = measure === 'rate' ? 'num1' : 'x1';
  return {
    lang,
    rows,
    primaryLabel:
      measure === 'rate' ? tr(lang, 'Misstänkta per 1 000', 'Suspects per 1,000') : tr(lang, 'Ojusterat', 'Unadjusted'),
    secondaryLabel: adjusted
      ? tr(lang, 'Justerat för ålder, kön, inkomst och utbildning', 'Adjusted for age, sex, income and education')
      : undefined,
    format: rateFormat,
    ref: { value: refValue, label: refLabel },
    ariaLabel:
      tr(lang, 'Punktdiagram. ', 'Dot plot. ') +
      `${heading}. ` +
      tr(
        lang,
        `${rows.length} grupper sorterade med högst värde först. `,
        `${rows.length} groups, sorted with the highest value first. `,
      ) +
      (measure === 'rate'
        ? tr(lang, `Jämförelsegruppen: ${dotFmt(crime.refPer1000, 'num1', lang)}. `, `Comparison group: ${dotFmt(crime.refPer1000, 'num1', lang)}. `)
        : '') +
      rows
        .map((r) => {
          const first = dotFmt(r.primary, rateFormat, lang);
          return r.secondary === null
            ? `${r.label}: ${first}`
            : tr(
                lang,
                `${r.label}: ${first}, justerat ${dotFmt(r.secondary, 'x1', lang)}`,
                `${r.label}: ${first}, adjusted ${dotFmt(r.secondary, 'x1', lang)}`,
              );
        })
        .join('. ') +
      '.',
  };
}
