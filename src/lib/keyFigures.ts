// The three key figures at the top of the front page, and the prison report list for the source list.
// Computed from the same data and code as the chapters.
import { loadPopulation, loadPrison, loadTableB6 } from './data';
import { buildKap3, shortReportName } from './chapters/kap3';
import { formatNumber } from './format';
import { tr, type BaseLang as Lang } from './i18n';
import type { KeyFigure } from '../components/KeyFigures.astro';

/** Brå's yearly prison reports used in chapter 3, for the source list under Metod. */
export function prisonSources() {
  return buildKap3(loadPrison(), loadPopulation()).sources;
}

export function buildKeyFigures(lang: Lang): KeyFigure[] {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const n0 = (v: number) => formatNumber(v, 0, lang);
  const n1 = (v: number) => formatNumber(v, 1, lang);
  const kap3 = buildKap3(loadPrison(), loadPopulation());
  const { lastYear } = kap3;
  const newAllLast = kap3.newAll.get(lastYear);
  const popShareLast = kap3.popShare.get(lastYear);
  if (newAllLast == null || popShareLast == null) throw new Error(`Missing ${lastYear} values for the key figures`);
  // Brå's own risk values for 2015–2018 (table B6), as stated in the report.
  const tableB6 = loadTableB6();
  const b6Risk = (unit: string) => {
    const r = tableB6.find((x) => x.view === 'bakgrund' && x.unit === unit);
    if (!r) throw new Error(`Table B6: ${unit} missing`);
    return r.risk;
  };
  return [
    {
      value: n1(b6Risk('Utrikesfödda')),
      unit: '×',
      text: L(
        'så ofta misstänktes utrikesfödda för brott som inrikesfödda med två inrikesfödda föräldrar.',
        'the rate at which people born abroad were suspected of crime, compared with people born in Sweden with two Swedish-born parents.',
      ),
      source: L('Brå rapport 2021:9, 2015–2018', 'Brå report 2021:9, 2015–2018'),
    },
    {
      value: n1(b6Risk('Inrikesfödda med två utrikesfödda föräldrar')),
      unit: '×',
      text: L(
        'så ofta misstänktes inrikesfödda med två utrikesfödda föräldrar.',
        'the rate for people born in Sweden with two foreign-born parents.',
      ),
      source: L('Brå rapport 2021:9, 2015–2018', 'Brå report 2021:9, 2015–2018'),
    },
    {
      value: n0(newAllLast),
      unit: lang === 'en' ? '%' : ' %',
      text: L(
        `av de nyintagna i fängelse ${lastYear} saknade svenskt medborgarskap, mot ${n1(popShareLast)} procent av befolkningen.`,
        `of new prisoners in ${lastYear} were not Swedish citizens, against ${n1(popShareLast)}% of the population.`,
      ),
      source: `Brå, ${(kap3.sourcesByYear.get(lastYear) ?? []).map((s) => shortReportName(s.label)).join(', ') || lastYear}; SCB`,
    },
  ];
}
