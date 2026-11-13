// Markdown copies of the table pages and llms.txt. Same text and numbers as the HTML pages.
import { chapter } from './chapters';
import { tablePage, type TablePage } from './dataPages';
import { site, absoluteUrl, dayMonthYear } from './site';
import { formatCell, type DataTable } from './tables';
import type { TablePageContent } from './tablePageContent';

const plain = (s: string) => s.replace(/[  ]/g, ' ');
const cellText = (s: string) => plain(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function tableToMarkdown(t: DataTable): string {
  const head = [t.rowLabel, ...t.columns.map((c) => c.label)];
  const align = ['---', ...t.columns.map((c) => (c.kind === 'number' ? '---:' : '---'))];
  const rows = t.rows.map((r) => [
    r.key,
    ...r.cells.map((cell, i) => {
      const col = t.columns[i];
      if (typeof cell === 'string') return cell;
      if (Array.isArray(cell)) return cell.length ? cell.map((l) => `[${l.label}](${l.url})`).join('; ') : '–';
      if (cell === null || col.kind !== 'number') return '–';
      return formatCell(cell, col.decimals);
    }),
  ]);
  return [head, align, ...rows].map((r) => `| ${r.map(cellText).join(' | ')} |`).join('\n');
}

export function pageToMarkdown(p: TablePageContent, updated: string): string {
  const page = tablePage(p.chapterId);
  const out: string[] = [
    `# ${p.h1}`,
    '',
    p.lead,
    '',
    `**Läs så här.** ${p.note}`,
    '',
    'Streck (–) betyder att uppgift saknas.',
  ];
  for (const s of p.sections) {
    if (s.heading) out.push('', `## ${s.heading}`);
    if (s.intro) out.push('', s.intro);
    for (const t of s.tables) out.push('', `### ${t.caption}`, '', tableToMarkdown(t));
    if (s.after) out.push('', s.after);
  }
  out.push(
    '',
    '## Använda siffrorna',
    '',
    `Tabellerna får användas fritt enligt ${site.dataLicense.name} (${site.dataLicense.url}). Ange ${p.credit} som källa.${p.terms ? ` ${p.terms}` : ''}`,
    '',
    `CSV-fil med alla siffror: ${absoluteUrl(page.csvPath)}`,
    '',
    '## Källor',
    '',
    ...p.sources.map((s) => `- [${s.label}](${s.url})`),
    '',
    '---',
    '',
    `Från ${site.name}, ${absoluteUrl(page.path)}. Diagram: ${absoluteUrl(`/#${p.chapterId}`)}. Uppgifterna senast ändrade ${dayMonthYear(updated)}.`,
  );
  return plain(out.join('\n')) + '\n';
}

/** llms.txt (https://llmstxt.org): what the site is, its caveats, and links to the plain-text pages. */
export function llmsTxt(pages: { page: TablePage; content: TablePageContent }[]): string {
  const out: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'Sidan sammanställer offentlig statistik och forskning från Brå, SCB och Lunds universitet. Varje siffra har en källa. ' +
      'Sidan drar inga egna slutsatser och tar inte ställning.',
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
    ...pages.map(({ page, content }) => `- [${content.h1}](${absoluteUrl(page.mdPath)}): ${content.lead}`),
    '',
    '## Optional',
    '',
    `- [Startsidan med alla diagram](${site.url}): kapitel ${pages.map(({ page }) => chapter(page.chapterId).num).join(', ')}, metod och om sidan.`,
    `- [Alla tabeller som webbsidor](${absoluteUrl('/data/')})`,
  ];
  return plain(out.join('\n')) + '\n';
}
