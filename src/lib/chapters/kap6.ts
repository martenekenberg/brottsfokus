// Chapter 6: self-reported victimisation by Swedish and foreign background, from Brå's crime survey
// (NTU Kortanalys 2/2024). Shared by the main page (charts), the table page and the number checklist.
import type { NtuRow, NtuSex } from '../data';
import type { BarChartSpec } from '../charts/bar';
import { formatPct } from '../format';
import { tr, type BaseLang as Lang } from '../i18n';
import { dataLabel } from '../labels';
import { csvNumber, longCsv, type DataTable } from '../tables';

/** Crime types in Brå's order. */
export interface Kap6Crime {
  id: string;
  /** Swedish name from the data file. */
  name: string;
  /** Years the pooled value covers, e.g. "2016–2022". */
  period: string;
}

export const GROUP_LABEL: Record<'utlandsk' | 'svensk', Record<Lang, string>> = {
  utlandsk: { sv: 'Utländsk bakgrund', en: 'Foreign background' },
  svensk: { sv: 'Svensk bakgrund', en: 'Swedish background' },
};

/** Group names in CSV column names. */
const GROUP_CSV: Record<'utlandsk' | 'svensk', Record<Lang, string>> = {
  utlandsk: { sv: 'utlandsk_bakgrund', en: 'foreign_background' },
  svensk: { sv: 'svensk_bakgrund', en: 'swedish_background' },
};
const SEX_CSV: Record<NtuSex, Record<Lang, string>> = {
  samtliga: { sv: 'samtliga', en: 'everyone' },
  man: { sv: 'man', en: 'men' },
  kvinnor: { sv: 'kvinnor', en: 'women' },
};

const SEX_LABEL: Record<NtuSex, Record<Lang, string>> = {
  samtliga: { sv: 'Samtliga', en: 'Everyone' },
  man: { sv: 'Män', en: 'Men' },
  kvinnor: { sv: 'Kvinnor', en: 'Women' },
};

export function sexLabel(sex: NtuSex, lang: Lang): string {
  return SEX_LABEL[sex][lang];
}

export function crimes(rows: NtuRow[]): Kap6Crime[] {
  const seen = new Map<string, Kap6Crime>();
  for (const r of rows) {
    if (r.view === 'bakgrund' && !seen.has(r.crimeId)) seen.set(r.crimeId, { id: r.crimeId, name: r.crime, period: r.period });
  }
  return [...seen.values()];
}

/** One pooled value. Fails if the row is missing, so a gap is never filled in silently. */
export function pooled(rows: NtuRow[], crimeId: string, sex: NtuSex, group: string): NtuRow {
  const r = rows.find((x) => x.view !== 'ar' && x.crimeId === crimeId && x.sex === sex && x.group === group);
  if (!r) throw new Error(`ntu_utsatthet.csv: no pooled row for ${crimeId} ${sex} ${group}`);
  return r;
}

function value(r: NtuRow): number {
  if (r.pct === null) throw new Error(`ntu_utsatthet.csv: ${r.crimeId} ${r.sex} ${r.group} has no value`);
  return r.pct;
}

/**
 * Crime types and sexes where people with a Swedish background reported being victims more often.
 * Compared on the values as shown (one decimal). Used to check the headline.
 */
export function swedishHigher(rows: NtuRow[]): { crimeId: string; sex: NtuSex }[] {
  const out: { crimeId: string; sex: NtuSex }[] = [];
  for (const c of crimes(rows)) {
    for (const sex of ['man', 'kvinnor'] as NtuSex[]) {
      const f = Math.round(value(pooled(rows, c.id, sex, 'utlandsk')) * 10);
      const s = Math.round(value(pooled(rows, c.id, sex, 'svensk')) * 10);
      if (s >= f) out.push({ crimeId: c.id, sex });
    }
  }
  return out;
}

/** Grouped bars for one sex: foreign background (filled blue) and Swedish background (outlined grey), per crime type. */
export function buildKap6Spec(rows: NtuRow[], sex: 'man' | 'kvinnor', xMax: number, lang: Lang): BarChartSpec {
  const list = crimes(rows);
  const groups = list.map((c) => ({
    label: dataLabel(c.name, lang) + (c.period === '2016–2022' ? '' : ` (${c.period})`),
    bars: [
      { label: GROUP_LABEL.utlandsk[lang], value: value(pooled(rows, c.id, sex, 'utlandsk')), kind: 'focus' as const },
      { label: GROUP_LABEL.svensk[lang], value: value(pooled(rows, c.id, sex, 'svensk')), kind: 'comparison' as const },
    ],
  }));
  const pct = (v: number) => formatPct(v, 1, lang);
  return {
    lang,
    format: 'pct1',
    hideBarLabels: true,
    xMax,
    groups,
    ariaLabel:
      tr(
        lang,
        `Stapeldiagram. ${sexLabel(sex, 'sv')}: andel som uppger att de utsatts för olika brott under ett år, med utländsk och svensk bakgrund, 2016–2022. `,
        `Bar chart. ${sexLabel(sex, 'en')}: share who say they were victims of different crimes during a year, with foreign and Swedish background, 2016–2022. `,
      ) +
      groups
        .map((g) =>
          tr(lang, `${g.label}: ${pct(g.bars[0].value)} och ${pct(g.bars[1].value)}`, `${g.label}: ${pct(g.bars[0].value)} and ${pct(g.bars[1].value)}`),
        )
        .join('. ') +
      '.',
  };
}

/** Shared end of the scale for the two small multiples, so their bars can be compared. */
export function sharedMax(rows: NtuRow[]): number {
  let max = 0;
  for (const r of rows) if (r.view === 'bakgrund' && r.sex !== 'samtliga' && r.pct !== null) max = Math.max(max, r.pct);
  return Math.ceil(max);
}

const FLAG_TEXT: Record<Lang, Record<'x' | '.', string>> = {
  sv: { x: 'för få svar', '.': 'inga fall' },
  en: { x: 'too few answers', '.': 'no cases' },
};

/** Pooled shares with confidence intervals, one table per sex. */
export function backgroundTables(rows: NtuRow[], lang: Lang): DataTable[] {
  return (['samtliga', 'man', 'kvinnor'] as NtuSex[]).map((sex) => ({
    id: `kap6-bakgrund-${sex}`,
    caption: tr(lang, `${sexLabel(sex, 'sv')}: andel utsatta (%), alla år sammanslagna`, `${sexLabel(sex, 'en')}: share who were victims (%), all years pooled`),
    rowLabel: tr(lang, 'Brottstyp', 'Crime type'),
    rowCsv: tr(lang, 'brottstyp', 'crime_type'),
    columns: [
      { kind: 'text' as const, label: tr(lang, 'År', 'Years'), csv: tr(lang, 'ar', 'years') },
      ...(['utlandsk', 'svensk'] as const).flatMap((g) => [
        { kind: 'number' as const, label: GROUP_LABEL[g][lang], csv: `${GROUP_CSV[g][lang]}_pct`, decimals: 1 },
        { kind: 'number' as const, label: tr(lang, 'Lägre gräns', 'Lower limit'), csv: `${GROUP_CSV[g][lang]}_${tr(lang, 'ki95_lag', 'ci95_low')}`, decimals: 1 },
        { kind: 'number' as const, label: tr(lang, 'Övre gräns', 'Upper limit'), csv: `${GROUP_CSV[g][lang]}_${tr(lang, 'ki95_hog', 'ci95_high')}`, decimals: 1 },
      ]),
    ],
    rows: crimes(rows).map((c) => {
      const f = pooled(rows, c.id, sex, 'utlandsk');
      const s = pooled(rows, c.id, sex, 'svensk');
      return { key: dataLabel(c.name, lang), cells: [c.period, f.pct, f.ciLow, f.ciHigh, s.pct, s.ciLow, s.ciHigh] };
    }),
  }));
}

export const REGIONS = ['Afrika', 'Asien', 'Europa', 'Latinamerika och Karibien', 'Nordamerika', 'Oceanien', 'Sovjetunionen'];

/** World region of background, one table per crime type, for everyone, men and women. */
export function regionTables(rows: NtuRow[], lang: Lang): DataTable[] {
  return crimes(rows).map((c) => ({
    id: `kap6-region-${c.id}`,
    caption: tr(lang, `${dataLabel(c.name, 'sv')}: andel utsatta (%) efter världsdel, ${c.period}`, `${dataLabel(c.name, 'en')}: share who were victims (%) by world region, ${c.period}`),
    rowLabel: tr(lang, 'Bakgrund', 'Background'),
    rowCsv: tr(lang, 'bakgrund', 'background'),
    columns: (['samtliga', 'man', 'kvinnor'] as NtuSex[]).map((sex) => ({ kind: 'number' as const, label: sexLabel(sex, lang), csv: `${SEX_CSV[sex][lang]}_pct`, decimals: 1 })),
    rows: [
      ...(['svensk', 'utlandsk'] as const).map((g) => ({
        key: GROUP_LABEL[g][lang],
        cells: (['samtliga', 'man', 'kvinnor'] as NtuSex[]).map((sex) => pooled(rows, c.id, sex, g).pct),
      })),
      ...REGIONS.map((reg) => ({
        key: dataLabel(reg, lang),
        cells: (['samtliga', 'man', 'kvinnor'] as NtuSex[]).map((sex) => pooled(rows, c.id, sex, reg).pct),
      })),
    ],
  }));
}

/** One value per year for everyone, men and women, with each background. */
export function yearTables(rows: NtuRow[], lang: Lang): DataTable[] {
  return crimes(rows).map((c) => {
    const years = [...new Set(rows.filter((r) => r.view === 'ar' && r.crimeId === c.id).map((r) => r.period))].sort();
    const cols = (['samtliga', 'man', 'kvinnor'] as NtuSex[]).flatMap((sex) => (['utlandsk', 'svensk'] as const).map((g) => ({ sex, g })));
    return {
      id: `kap6-ar-${c.id}`,
      caption: tr(lang, `${dataLabel(c.name, 'sv')}: andel utsatta (%) per år`, `${dataLabel(c.name, 'en')}: share who were victims (%) by year`),
      rowLabel: tr(lang, 'År', 'Year'),
      rowCsv: tr(lang, 'ar', 'year'),
      columns: cols.map(({ sex, g }) => ({
        kind: 'number' as const,
        label: `${sexLabel(sex, lang)}, ${GROUP_LABEL[g][lang].toLowerCase()}`,
        csv: `${SEX_CSV[sex][lang]}_${GROUP_CSV[g][lang]}_pct`,
        decimals: 1,
      })),
      rows: years.map((y) => ({
        key: y,
        cells: cols.map(({ sex, g }) => rows.find((r) => r.view === 'ar' && r.crimeId === c.id && r.sex === sex && r.group === g && r.period === y)?.pct ?? null),
      })),
    };
  });
}

/** Every value in the data file in one long CSV, with Brå's markers explained. */
export function kap6Csv(rows: NtuRow[], lang: Lang): string {
  const view: Record<NtuRow['view'], Record<Lang, string>> = {
    bakgrund: { sv: 'bakgrund', en: 'background' },
    varldsdel: { sv: 'varldsdel', en: 'world_region' },
    ar: { sv: 'per_ar', en: 'by_year' },
  };
  const group = (g: string) => (g === 'utlandsk' || g === 'svensk' ? GROUP_LABEL[g][lang] : dataLabel(g, lang));
  const header = [
    tr(lang, 'vy', 'view'),
    tr(lang, 'brottstyp', 'crime_type'),
    tr(lang, 'kon', 'sex'),
    tr(lang, 'bakgrund', 'background'),
    tr(lang, 'ar', 'years'),
    tr(lang, 'andel_utsatta_pct', 'share_victims_pct'),
    tr(lang, 'ki95_lag', 'ci95_low'),
    tr(lang, 'ki95_hog', 'ci95_high'),
    tr(lang, 'anmarkning', 'remark'),
  ];
  const out = rows.map((r) => [
    view[r.view][lang],
    dataLabel(r.crime, lang),
    sexLabel(r.sex, lang),
    group(r.group),
    r.period,
    csvNumber(r.pct, 2),
    csvNumber(r.ciLow, 2),
    csvNumber(r.ciHigh, 2),
    r.flag ? FLAG_TEXT[lang][r.flag] : '',
  ]);
  return longCsv(header, out);
}

/** Flagged cells in the world region tables, for the note. */
export function flagged(rows: NtuRow[]): NtuRow[] {
  return rows.filter((r) => r.view === 'varldsdel' && r.flag !== '');
}
