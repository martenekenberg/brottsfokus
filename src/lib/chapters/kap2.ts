// Chapter 2: suspects by birth region, birth country and mother's birth region,
// 2015–2018 (Brå 2021:9, appendix 1). Shared by the build and the browser.
import type { OriginRow } from '../data';
import type { DotChartSpec, DotRow } from '../charts/dot';
import { formatNumber } from '../format';

export type View = 'region' | 'land' | 'moder';
export type Measure = 'risk' | 'rate';

/** The comparison group's id in the file. */
const COMPARISON = 'sv2';

export interface Kap2Unit {
  id: string;
  label: string;
  region: string;
  n: number | null;
  per1000: number;
  risk: number;
  riskAdj: number | null;
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

export const VIEW_LABEL: Record<View, string> = {
  region: 'Födelseområde',
  land: 'Födelseland',
  moder: 'Moderns födelseområde',
};

/** Build-time: group the CSV rows by view and crime type. `depthByOrder` indents the crime menu. */
export function buildKap2Data(rows: OriginRow[], depthByOrder: Map<number, number>): Kap2Data {
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
      });
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

function lc(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function hasAdjusted(crime: Kap2Crime): boolean {
  return crime.units.some((u) => u.riskAdj !== null);
}

export function chartHeading(view: View, crime: Kap2Crime, measure: Measure): string {
  const who =
    view === 'moder'
      ? 'Inrikesfödda med två utrikesfödda föräldrar, efter moderns födelseområde'
      : view === 'land'
        ? 'Utrikesfödda efter födelseland'
        : 'Utrikesfödda efter födelseområde';
  const what =
    measure === 'risk'
      ? 'gånger vanligare att misstänkas än inrikesfödda med två inrikesfödda föräldrar'
      : 'misstänkta per 1 000';
  return `${who}: ${what}, ${lc(crime.name)}, 2015–2018`;
}

function detail(view: View, u: Kap2Unit): string | undefined {
  if (view === 'land') {
    const size = u.n === null ? '' : `, ${formatNumber(u.n)} personer i gruppen`;
    return u.region ? `Födelseområde: ${u.region}${size}` : undefined;
  }
  if (view === 'moder') return 'Inrikesfödda med två utrikesfödda föräldrar, modern född här';
  return undefined;
}

export function buildKap2Spec(data: Kap2Data, view: View, crimeName: string, measure: Measure): DotChartSpec {
  const crime = crimeFor(data, view, crimeName);
  // Highest first. Risk and rate give the same order, since risk = rate / comparison rate.
  const units = [...crime.units].sort((a, b) => b.risk - a.risk);
  const adjusted = measure === 'risk' && hasAdjusted(crime);
  const rows: DotRow[] = units.map((u) => ({
    id: u.id,
    label: u.label,
    detail: detail(view, u),
    primary: measure === 'risk' ? u.risk : u.per1000,
    secondary: adjusted ? u.riskAdj : null,
  }));
  const refLabel = 'Inrikesfödda med två inrikesfödda föräldrar';
  return {
    rows,
    primaryLabel: measure === 'risk' ? 'Ojusterat' : 'Misstänkta per 1 000',
    secondaryLabel: adjusted ? 'Justerat för ålder, kön, inkomst och utbildning' : undefined,
    format: measure === 'risk' ? 'x1' : 'num1',
    ref: { value: measure === 'risk' ? 1 : crime.refPer1000, label: refLabel },
    ariaLabel:
      `Punktdiagram. ${chartHeading(view, crime, measure)}. ${rows.length} grupper sorterade med högst värde först. ` +
      `Högst: ${rows[0]?.label}. Lägst: ${rows[rows.length - 1]?.label}.`,
  };
}
