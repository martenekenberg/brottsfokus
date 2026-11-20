// /data/datapackage.json and /en/data/datapackage.json: every CSV file on the site described as a
// Frictionless Tabular Data Package (https://datapackage.org), so tools can read the files with
// column types, units and sources. Built from the table page content and the data dictionary.
import { dataDate } from './dataDates';
import { dataDictionary } from './dataDictionary';
import { tablePage, tablePages, tablesIndexPath } from './dataPages';
import { tr, type Lang } from './i18n';
import { site, absoluteUrl } from './site';
import { tablePageContent } from './tablePageContent';

export function dataPackage(lang: Lang): Record<string, unknown> {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const resources = tablePages.map((t) => {
    const page = tablePage(t.chapterId, lang);
    const c = tablePageContent(t.chapterId, lang);
    return {
      name: page.slug,
      path: absoluteUrl(page.csvPath),
      title: c.h1,
      description: c.datasetDescription,
      homepage: absoluteUrl(page.path),
      format: 'csv',
      mediatype: 'text/csv',
      encoding: 'utf-8',
      dialect: { delimiter: ',', header: true },
      // Not part of the standard; kept as extra properties, which Data Package allows.
      temporalCoverage: c.temporalCoverage,
      lastModified: dataDate(c.dataFiles),
      sources: c.sources.map((s) => ({ title: s.label, path: s.url })),
      schema: {
        missingValues: [''],
        fields: dataDictionary(t.chapterId).map((col) => ({
          name: col.name[lang],
          type: col.type,
          description: col.description[lang],
          ...(col.unit ? { unit: col.unit[lang] } : {}),
        })),
      },
    };
  });
  return {
    $schema: 'https://datapackage.org/profiles/2.0/datapackage.json',
    name: lang === 'sv' ? 'brottsfokus' : 'brottsfokus-en',
    title: L(`${site.name}: tabeller och CSV-filer`, `${site.name}: tables and CSV files`),
    description: site.description[lang],
    homepage: absoluteUrl(tablesIndexPath(lang)),
    created: `${dataDate()}T00:00:00Z`,
    licenses: [{ name: 'CC-BY-4.0', path: site.dataLicense.url, title: 'Creative Commons Attribution 4.0' }],
    contributors: [{ title: site.name, path: site.url, roles: ['publisher'] }],
    resources,
  };
}
