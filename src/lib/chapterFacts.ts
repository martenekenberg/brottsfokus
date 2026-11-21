// "Om uppgifterna": for each chapter, the studies it shows, which years their figures cover and when
// they were published. Shown in a small panel under each chapter's intro, so the years the figures
// cover are never confused with the date the site was updated.
// Years are taken from the data where the data holds them; the rest match the chapter's source line.
// Build time only.
import { chapter, chapterHref } from './chapters';
import { buildKap1Data } from './chapters/kap1';
import { buildKap3 } from './chapters/kap3';
import { buildKap11 } from './chapters/kap11';
import { cohorts as backmanCohorts } from './chapters/kap9';
import { birthYears } from './chapters/kap10';
import { loadBirthCohorts, loadCohorts, loadDkGuilty, loadDkPopulation, loadPopulation, loadPrison, loadSuspectsByBackground } from './data';
import { tr, type Lang } from './i18n';
import { SOURCES } from './sources';

export interface StudyFact {
  /** Short name of the study or report, e.g. "Brå rapport 2021:9". */
  study: string;
  href: string;
  /** What the figures cover, e.g. "Brottsmisstankar 2007–2018". */
  covers: string;
  /** When it was published, e.g. "2021". */
  published: string;
}

export interface ChapterFacts {
  studies: StudyFact[];
  /** A newer study of the same kind shown elsewhere on the site, if there is one. */
  newer?: { text: string; links: { label: string; href: string }[] };
}

/** "1966–69" and "1990–93" -> "1966–1993". */
function cohortSpan(first: string, last: string): string {
  const start = first.split('–')[0];
  const [lastStart, lastEnd] = last.split('–');
  if (!/^\d{4}$/.test(start) || !/^\d{4}$/.test(lastStart) || !/^\d{2}$/.test(lastEnd)) {
    throw new Error(`Unexpected birth-year group "${first}" or "${last}"`);
  }
  return `${start}–${lastStart.slice(0, 2)}${lastEnd}`;
}

export function chapterFacts(id: string, lang: Lang): ChapterFacts {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const bra = (report: string) => L(`Brå rapport ${report}`, `Brå report ${report}`);
  switch (id) {
    case 'kap1': {
      const years = buildKap1Data(loadSuspectsByBackground()).years;
      const period = `${years[0]}–${years[years.length - 1]}`;
      return {
        studies: [{ study: bra('2021:9'), href: SOURCES.bra2021.url, covers: L(`Brottsmisstankar ${period}`, `Crime suspicions ${period}`), published: '2021' }],
      };
    }
    case 'kap2':
      return {
        studies: [{ study: bra('2021:9'), href: SOURCES.bra2021.url, covers: L('Brott begångna 2015–2018', 'Crimes committed 2015–2018'), published: '2021' }],
      };
    case 'kap5':
      return {
        studies: [
          {
            study: bra('2005:17'),
            href: SOURCES.bra2005.url,
            covers: L('Misstänkta 1985–1989 och 1997–2001', 'Suspects 1985–1989 and 1997–2001'),
            published: '2005',
          },
        ],
        newer: {
          text: L('Nyare studie av samma slag: Brå rapport 2021:9, i kapitel ', 'A newer study of the same kind: Brå report 2021:9, in chapters '),
          links: ['kap1', 'kap2'].map((c) => ({ label: chapter(c).num, href: chapterHref(c, lang) })),
        },
      };
    case 'kap9': {
      const kohort = loadBirthCohorts();
      const y25 = birthYears(kohort, 'fore25');
      const y20 = birthYears(kohort, 'fore20');
      const names = backmanCohorts(loadCohorts());
      const born = `${Math.min(y25[0], y20[0])}–${Math.max(y25[y25.length - 1], y20[y20.length - 1])}`;
      const bornBackman = cohortSpan(names[0], names[names.length - 1]);
      return {
        studies: [
          {
            study: bra('2025:21'),
            href: SOURCES.bra2025kohort.url,
            covers: L(`Födda ${born}, lagföringar till och med 2023`, `Born ${born}, convictions up to the end of 2023`),
            published: '2025',
          },
          {
            study: L('Bäckman m.fl. 2021', 'Bäckman et al. 2021'),
            href: SOURCES.backman2021.url,
            covers: L(`Födda ${bornBackman}`, `Born ${bornBackman}`),
            published: '2021',
          },
        ],
      };
    }
    case 'kap4':
      return {
        studies: [
          { study: L('Khoshnood m.fl. 2021', 'Khoshnood et al. 2021'), href: SOURCES.khoshnood2021.url, covers: L('Dömda 2000–2015', 'Convicted 2000–2015'), published: '2021' },
          { study: L('Khoshnood m.fl. 2026', 'Khoshnood et al. 2026'), href: SOURCES.khoshnood2026.url, covers: L('Dömda 2000–2020', 'Convicted 2000–2020'), published: '2026' },
        ],
      };
    case 'kap3': {
      const { firstYear, lastYear } = buildKap3(loadPrison(), loadPopulation());
      return {
        studies: [
          {
            study: L('Brå, statistik om kriminalvård', 'Brå, prison and probation statistics'),
            href: 'https://bra.se/statistik/statistik-om-rattsvasendet/kriminalvard',
            covers: L(`Intagna ${firstYear}–${lastYear}`, `Prisoners ${firstYear}–${lastYear}`),
            published: L('Varje år', 'Every year'),
          },
        ],
      };
    }
    case 'kap7':
      return {
        studies: [
          {
            study: bra('2026:15'),
            href: SOURCES.bra2026utvisning.url,
            covers: L('Lämnade anstalt 2013–2023, följda till och med 2024', 'Left prison 2013–2023, followed up to the end of 2024'),
            published: '2026',
          },
        ],
      };
    case 'kap6':
      return {
        studies: [
          {
            study: L('Brå, NTU Kortanalys 2/2024', 'Brå, NTU Kortanalys 2/2024'),
            href: SOURCES.ntu2024.url,
            covers: L('Brott 2016–2022, enkäter 2017–2023', 'Crimes in 2016–2022, surveys in 2017–2023'),
            published: '2024',
          },
        ],
      };
    case 'kap8':
      return {
        studies: [{ study: bra('2025:5'), href: SOURCES.bra2025dodligt.url, covers: L('Dödligt våld 2005–2021', 'Homicides 2005–2021'), published: '2025' }],
      };
    case 'kap11': {
      const { firstYear, lastYear } = buildKap11(loadDkGuilty(), loadDkPopulation());
      return {
        studies: [
          {
            study: L('Danmarks Statistik, Statistikbanken', 'Danmarks Statistik, Statbank'),
            href: SOURCES.dstStrfna10.url,
            covers: L(`Lagförda ${firstYear}–${lastYear}`, `Convicted ${firstYear}–${lastYear}`),
            published: L('Varje år', 'Every year'),
          },
        ],
      };
    }
    default:
      throw new Error(`No facts for chapter ${id}`);
  }
}
