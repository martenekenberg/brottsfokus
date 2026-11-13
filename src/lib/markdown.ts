// Markdown copies of the table pages and llms.txt. Same text and numbers as the HTML pages.
import { chapter } from './chapters';
import { type TablePageUrls } from './dataPages';
import { localePath, tr, type Lang } from './i18n';
import { site, absoluteUrl, dayMonthYear } from './site';
import { formatCell, type DataTable } from './tables';
import type { TablePageContent } from './tablePageContent';

const plain = (s: string) => s.replace(/[  ]/g, ' ');
const cellText = (s: string) => plain(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function tableToMarkdown(t: DataTable, lang: Lang): string {
  const head = [t.rowLabel, ...t.columns.map((c) => c.label)];
  const align = ['---', ...t.columns.map((c) => (c.kind === 'number' ? '---:' : '---'))];
  const rows = t.rows.map((r) => [
    r.key,
    ...r.cells.map((cell, i) => {
      const col = t.columns[i];
      if (typeof cell === 'string') return cell;
      if (Array.isArray(cell)) return cell.length ? cell.map((l) => `[${l.label}](${l.url})`).join('; ') : '–';
      if (cell === null || col.kind !== 'number') return '–';
      return formatCell(cell, col.decimals, lang);
    }),
  ]);
  return [head, align, ...rows].map((r) => `| ${r.map(cellText).join(' | ')} |`).join('\n');
}

export function pageToMarkdown(p: TablePageContent, page: TablePageUrls, updated: string): string {
  const lang = p.lang;
  const out: string[] = [
    `# ${p.h1}`,
    '',
    p.lead,
    '',
    `**${tr(lang, 'Läs så här.', 'How to read this.')}** ${p.note}`,
    '',
    tr(lang, 'Streck (–) betyder att uppgift saknas.', 'A dash (–) means that no value is available.'),
  ];
  for (const s of p.sections) {
    if (s.heading) out.push('', `## ${s.heading}`);
    if (s.intro) out.push('', s.intro);
    for (const t of s.tables) out.push('', `### ${t.caption}`, '', tableToMarkdown(t, lang));
    if (s.after) out.push('', s.after);
  }
  out.push(
    '',
    `## ${tr(lang, 'Använda siffrorna', 'Using the figures')}`,
    '',
    tr(
      lang,
      `Tabellerna får användas fritt enligt ${site.dataLicense.name} (${site.dataLicense.url}). Ange ${p.credit} som källa.${p.terms ? ` ${p.terms}` : ''}`,
      `You may use the tables freely under ${site.dataLicense.name} (${site.dataLicense.url}). Name ${p.credit} as the source.${p.terms ? ` ${p.terms}` : ''}`,
    ),
    '',
    tr(lang, `CSV-fil med alla siffror: ${absoluteUrl(page.csvPath)}`, `CSV file with all the figures: ${absoluteUrl(page.csvPath)}`),
    '',
    `## ${tr(lang, 'Källor', 'Sources')}`,
    '',
    ...p.sources.map((s) => `- [${s.label}](${s.url})`),
    '',
    '---',
    '',
    tr(
      lang,
      `Från ${site.name}, ${absoluteUrl(page.path)}. Diagram: ${absoluteUrl(`${localePath(lang, '/')}#${p.chapterId}`)}. Uppgifterna senast ändrade ${dayMonthYear(updated, lang)}.`,
      `From ${site.name}, ${absoluteUrl(page.path)}. Chart: ${absoluteUrl(`${localePath(lang, '/')}#${p.chapterId}`)}. Data last changed ${dayMonthYear(updated, lang)}.`,
    ),
  );
  return plain(out.join('\n')) + '\n';
}

/**
 * llms.txt (https://llmstxt.org): what the site is, its caveats, and links to the plain-text
 * pages in both languages.
 */
export function llmsTxt(
  sv: { page: TablePageUrls; content: TablePageContent }[],
  en: { page: TablePageUrls; content: TablePageContent }[],
): string {
  const out: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description.sv}`,
    '',
    'Sidan sammanställer offentlig statistik och forskning från Brå, SCB och Lunds universitet. Varje siffra har en källa. ' +
      'Sidan drar inga egna slutsatser och tar inte ställning. Det finns också en engelsk version under /en/.',
    '',
    'Viktigt när siffrorna används:',
    '',
    '- Misstänkt för brott är inte samma sak som dömd.',
    '- Talen är inte justerade för ålder eller kön om inget annat anges. Ålder och kön förklarar en stor del av skillnaderna mellan grupperna.',
    '- Medborgarskap är inte födelseland. Fängelsestatistiken omfattar personer som inte bor i Sverige och inte finns i befolkningssiffrorna.',
    '- Studierna om våldtäkt gäller dömda, inte alla som begår brottet.',
    '- Brås studie från 2005 bygger på uppgifter som är över 20 år gamla.',
    '',
    '## Tabeller',
    '',
    ...sv.map(({ page, content }) => `- [${content.h1}](${absoluteUrl(page.mdPath)}): ${content.lead}`),
    '',
    '## English',
    '',
    'English versions of the same pages, with the same figures and caveats:',
    '',
    `- [Front page with all charts](${absoluteUrl('/en/')}): chapters ${sv.map(({ page }) => chapter(page.chapterId).num).join(', ')}, method and about this site.`,
    ...en.map(({ page, content }) => `- [${content.h1}](${absoluteUrl(page.mdPath)}): ${content.lead}`),
    '',
    '## Optional',
    '',
    `- [Startsidan med alla diagram](${site.url}): kapitel ${sv.map(({ page }) => chapter(page.chapterId).num).join(', ')}, metod och om sidan.`,
    `- [Alla tabeller som webbsidor](${absoluteUrl('/data/')})`,
    `- [All tables as web pages, in English](${absoluteUrl('/en/data/')})`,
  ];
  return plain(out.join('\n')) + '\n';
}
