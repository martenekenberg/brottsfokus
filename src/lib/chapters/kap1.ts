// Chapter 1: suspects per 1,000 by background, 2007–2018 (Brå 2021:9, appendix 2).
// Shared by the build (default view) and the browser (crime type and view controls).
import type { SuspectsRow } from '../data';
import { ratioToComparison } from '../calc';
import { fmt, type LineChartSpec, type LineSeries } from '../charts/line';
import { tr, missingText, type Lang } from '../i18n';
import { dataLabel } from '../labels';

export type GroupId = 'sv2' | 'sv1' | 'u2' | 'utr' | 'tot';
export type Mode = 'rate' | 'ratio';

export interface Kap1Crime {
  id: string;
  /** Swedish name from the data file (the key). Use crimeName() for the shown name. */
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
  label: Record<Lang, string>;
  endLabel: Record<Lang, string>;
  color: string;
  textColor: string;
  strokeWidth: number;
  dashed?: boolean;
}

export const GROUPS: Record<GroupId, GroupStyle> = {
  u2: {
    label: { sv: 'Inrikesfödda med två utrikesfödda föräldrar', en: 'Born in Sweden, two foreign-born parents' },
    endLabel: { sv: 'Inrikesfödda, två utrikesfödda föräldrar', en: 'Born in Sweden, two foreign-born parents' },
    color: '#C2410C',
    textColor: '#C2410C',
    strokeWidth: 2.5,
  },
  utr: {
    label: { sv: 'Utrikesfödda', en: 'Born abroad' },
    endLabel: { sv: 'Utrikesfödda', en: 'Born abroad' },
    color: '#1D4E89',
    textColor: '#1D4E89',
    strokeWidth: 2.5,
  },
  sv1: {
    label: { sv: 'Inrikesfödda med en utrikesfödd förälder', en: 'Born in Sweden, one foreign-born parent' },
    endLabel: { sv: 'Inrikesfödda, en utrikesfödd förälder', en: 'Born in Sweden, one foreign-born parent' },
    color: '#6B6B6B',
    textColor: '#6B6B6B',
    strokeWidth: 2,
  },
  sv2: {
    label: { sv: 'Inrikesfödda med två inrikesfödda föräldrar', en: 'Born in Sweden, two Swedish-born parents' },
    endLabel: { sv: 'Inrikesfödda, två inrikesfödda föräldrar', en: 'Born in Sweden, two Swedish-born parents' },
    color: '#121212',
    textColor: '#121212',
    strokeWidth: 2,
  },
  tot: {
    label: { sv: 'Hela befolkningen, 15 år och äldre', en: 'Whole population, aged 15 and over' },
    endLabel: { sv: 'Hela befolkningen', en: 'Whole population' },
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

/** The crime type's name in a language. */
export function crimeName(crime: Kap1Crime, lang: Lang): string {
  return dataLabel(crime.name, lang);
}

/** Lower-case first letter for use mid-sentence, e.g. "brott totalt". */
function lc(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function chartHeading(crime: Kap1Crime, mode: Mode, lang: Lang): string {
  const name = lc(crimeName(crime, lang));
  return mode === 'rate'
    ? tr(lang, `Misstänkta per 1 000 invånare, ${name}`, `Suspects per 1,000 residents, ${name}`)
    : tr(
        lang,
        `Andel misstänkta jämfört med inrikesfödda med två inrikesfödda föräldrar, ${name}`,
        `Suspects compared with born in Sweden, two Swedish-born parents, ${name}`,
      );
}

/** For screen readers: each group's first and last value, e.g. "Utrikesfödda: 40,1 år 2007 och 35,9 år 2018." */
function firstAndLast(series: LineSeries[], years: number[], lang: Lang): string {
  return series
    .map((s) => {
      const i = s.values.findIndex((v) => v !== null);
      if (i < 0) return `${s.label}: ${missingText(lang)}.`;
      let j = s.values.length - 1;
      while (s.values[j] === null) j--;
      const at = (v: number, y: number) => tr(lang, `${fmt(v, s.format, lang)} år ${y}`, `${fmt(v, s.format, lang)} in ${y}`);
      const a = at(s.values[i] as number, years[i]);
      return i === j
        ? `${s.label}: ${a}.`
        : `${s.label}: ${a} ${tr(lang, 'och', 'and')} ${at(s.values[j] as number, years[j])}.`;
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

export function buildKap1Spec(data: Kap1Data, crimeId: string, mode: Mode, lang: Lang): LineChartSpec {
  const crime = crimeById(data, crimeId);
  const { years } = data;
  const first = years[0];
  const last = years[years.length - 1];
  const name = lc(crimeName(crime, lang));

  if (mode === 'rate') {
    let max = 0;
    for (const g of RATE_ORDER) for (const v of crime.values[g]) if (v !== null && v > max) max = v;
    const format = max < 2 ? 'num2' : 'num1';
    const series: LineSeries[] = RATE_ORDER.map((g) => ({
      id: g,
      label: GROUPS[g].label[lang],
      endLabel: GROUPS[g].endLabel[lang],
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
      lang,
      years,
      series,
      yFormat: format,
      ariaLabel: tr(
        lang,
        `Linjediagram. Misstänkta per 1 000 invånare, ${name}, ${first} till ${last}, efter bakgrund och för hela befolkningen. `,
        `Line chart. Suspects per 1,000 residents, ${name}, ${first} to ${last}, by background and for the whole population. `,
      ) + firstAndLast(series, years, lang),
    };
  }

  const base = crime.values.sv2;
  const series: LineSeries[] = RATIO_ORDER.map((g) => ({
    id: g,
    label: GROUPS[g].label[lang],
    endLabel: GROUPS[g].endLabel[lang],
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
    label: tr(lang, `${GROUPS.sv2.label.sv} (jämförelsegrupp)`, `${GROUPS.sv2.label.en} (comparison group)`),
    endLabel: tr(lang, 'Två inrikesfödda föräldrar', 'Two Swedish-born parents'),
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
    lang,
    years,
    series,
    yFormat: 'x1',
    ariaLabel:
      tr(
        lang,
        `Linjediagram. Hur många gånger vanligare det var att misstänkas för ${name} än för inrikesfödda med två inrikesfödda föräldrar, ${first} till ${last}, efter bakgrund. `,
        `Line chart. How many times more likely it was to be suspected of ${name} than for born in Sweden with two Swedish-born parents, ${first} to ${last}, by background. `,
      ) + firstAndLast(series.filter((s) => s.id !== 'sv2-ref'), years, lang),
  };
}
