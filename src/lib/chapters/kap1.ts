// Chapter 1: suspects per 1,000 by background, 2007–2018 (Brå 2021:9, appendix 2).
// Shared by the build (default view) and the browser (crime type and view controls).
import type { SuspectsRow } from '../data';
import { ratioToComparison } from '../calc';
import { fmt, type LineChartSpec, type LineSeries } from '../charts/line';

export type GroupId = 'sv2' | 'sv1' | 'u2' | 'utr' | 'tot';
export type Mode = 'rate' | 'ratio';

export interface Kap1Crime {
  id: string;
  name: string;
  depth: number;
  /** Rate per 1,000 for each group, one value per year. null = no value. */
  values: Record<GroupId, (number | null)[]>;
}

export interface Kap1Data {
  years: number[];
  crimes: Kap1Crime[];
}

interface GroupStyle {
  label: string;
  endLabel: string;
  color: string;
  textColor: string;
  strokeWidth: number;
  dashed?: boolean;
}

export const GROUPS: Record<GroupId, GroupStyle> = {
  u2: {
    label: 'Inrikesfödda med två utrikesfödda föräldrar',
    endLabel: 'Inrikesfödda, två utrikesfödda föräldrar',
    color: '#C2410C',
    textColor: '#C2410C',
    strokeWidth: 2.5,
  },
  utr: {
    label: 'Utrikesfödda',
    endLabel: 'Utrikesfödda',
    color: '#1D4E89',
    textColor: '#1D4E89',
    strokeWidth: 2.5,
  },
  sv1: {
    label: 'Inrikesfödda med en utrikesfödd förälder',
    endLabel: 'Inrikesfödda, en utrikesfödd förälder',
    color: '#6B6B6B',
    textColor: '#6B6B6B',
    strokeWidth: 2,
  },
  sv2: {
    label: 'Inrikesfödda med två inrikesfödda föräldrar',
    endLabel: 'Inrikesfödda, två inrikesfödda föräldrar',
    color: '#121212',
    textColor: '#121212',
    strokeWidth: 2,
  },
  tot: {
    label: 'Hela befolkningen, 15 år och äldre',
    endLabel: 'Hela befolkningen',
    color: '#8A8A8A',
    textColor: '#5C5C5C',
    strokeWidth: 2,
    dashed: true,
  },
};

const RATE_ORDER: GroupId[] = ['u2', 'utr', 'sv1', 'sv2', 'tot'];
const RATIO_ORDER: GroupId[] = ['u2', 'utr', 'sv1'];

/** Build-time: reshape the CSV rows into one compact record per crime type. */
export function buildKap1Data(rows: SuspectsRow[]): Kap1Data {
  const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
  const byCrime = new Map<string, Kap1Crime & { order: number }>();
  for (const r of rows) {
    let c = byCrime.get(r.crimeId);
    if (!c) {
      const empty = () => years.map(() => null as number | null);
      c = {
        id: r.crimeId,
        name: r.crime,
        depth: r.depth,
        order: r.crimeOrder,
        values: { sv2: empty(), sv1: empty(), u2: empty(), utr: empty(), tot: empty() },
      };
      byCrime.set(r.crimeId, c);
    }
    c.values[r.group][years.indexOf(r.year)] = r.per1000;
  }
  const crimes = [...byCrime.values()]
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...c }) => c);
  return { years, crimes };
}

export function crimeById(data: Kap1Data, id: string): Kap1Crime {
  const c = data.crimes.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown crime ${id}`);
  return c;
}

/** Lower-case first letter for use mid-sentence, e.g. "brott totalt". */
function lc(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function chartHeading(crime: Kap1Crime, mode: Mode): string {
  return mode === 'rate'
    ? `Misstänkta per 1 000 invånare, ${lc(crime.name)}`
    : `Andel misstänkta jämfört med inrikesfödda med två inrikesfödda föräldrar, ${lc(crime.name)}`;
}

/** For screen readers: each group's first and last value, e.g. "Utrikesfödda: 40,1 år 2007 och 35,9 år 2018." */
function firstAndLast(series: LineSeries[], years: number[]): string {
  return series
    .map((s) => {
      const i = s.values.findIndex((v) => v !== null);
      if (i < 0) return `${s.label}: uppgift saknas.`;
      let j = s.values.length - 1;
      while (s.values[j] === null) j--;
      const a = `${fmt(s.values[i] as number, s.format)} år ${years[i]}`;
      return i === j ? `${s.label}: ${a}.` : `${s.label}: ${a} och ${fmt(s.values[j] as number, s.format)} år ${years[j]}.`;
    })
    .join(' ');
}

/** True if every background group had a lower rate in the last year than in the first (used to check the headline). */
export function allGroupsFell(data: Kap1Data, crimeId: string): boolean {
  const crime = crimeById(data, crimeId);
  return (['sv2', 'sv1', 'u2', 'utr'] as GroupId[]).every((g) => {
    const v = crime.values[g];
    const a = v[0];
    const b = v[v.length - 1];
    return a !== null && b !== null && b < a;
  });
}

export function buildKap1Spec(data: Kap1Data, crimeId: string, mode: Mode): LineChartSpec {
  const crime = crimeById(data, crimeId);
  const { years } = data;
  const first = years[0];
  const last = years[years.length - 1];

  if (mode === 'rate') {
    let max = 0;
    for (const g of RATE_ORDER) for (const v of crime.values[g]) if (v !== null && v > max) max = v;
    const format = max < 2 ? 'num2' : 'num1';
    const series: LineSeries[] = RATE_ORDER.map((g) => ({
      id: g,
      label: GROUPS[g].label,
      endLabel: GROUPS[g].endLabel,
      endLabelShort: '',
      color: GROUPS[g].color,
      textColor: GROUPS[g].textColor,
      strokeWidth: GROUPS[g].strokeWidth,
      dashed: GROUPS[g].dashed,
      dotRadius: g === 'tot' ? 2.5 : 3,
      values: crime.values[g],
      format,
    }));
    return {
      years,
      series,
      yFormat: format,
      ariaLabel:
        `Linjediagram. Misstänkta per 1 000 invånare, ${lc(crime.name)}, ${first} till ${last}, ` +
        `efter bakgrund och för hela befolkningen. ${firstAndLast(series, years)}`,
    };
  }

  const base = crime.values.sv2;
  const series: LineSeries[] = RATIO_ORDER.map((g) => ({
    id: g,
    label: GROUPS[g].label,
    endLabel: GROUPS[g].endLabel,
    endLabelShort: '',
    color: GROUPS[g].color,
    textColor: GROUPS[g].textColor,
    strokeWidth: GROUPS[g].strokeWidth,
    dotRadius: 3,
    values: crime.values[g].map((v, i) => ratioToComparison(v, base[i])),
    format: 'x1',
  }));
  // The comparison group, drawn as the dashed black line at 1.
  series.push({
    id: 'sv2-ref',
    label: `${GROUPS.sv2.label} (jämförelsegrupp)`,
    endLabel: 'Två inrikesfödda föräldrar',
    endLabelShort: '',
    color: '#121212',
    textColor: '#121212',
    strokeWidth: 1.5,
    dashed: true,
    dotRadius: 0,
    values: base.map((v) => (v === null ? null : 1)),
    format: 'x1',
  });
  return {
    years,
    series,
    yFormat: 'x1',
    ariaLabel:
      `Linjediagram. Hur många gånger vanligare det var att misstänkas för ${lc(crime.name)} än för ` +
      `inrikesfödda med två inrikesfödda föräldrar, ${first} till ${last}, efter bakgrund. ` +
      firstAndLast(series.filter((s) => s.id !== 'sv2-ref'), years),
  };
}
