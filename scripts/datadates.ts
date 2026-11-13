// Records when each data file last changed, in src/lib/dataDates.json.
// The table pages and the sitemap use these dates, so a deploy that changes no data
// does not tell search engines that the pages changed.
// Run with: npm run datadates (after changing any file in data/).
// A file whose contents are unchanged keeps its date. A changed file gets the date of
// its last commit, or today if the change is not committed yet.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'src/lib/dataDates.json';
type Entry = { date: string; sha256: string };
const old: Record<string, Entry> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf-8')) : {};
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf-8' }).trim();

const out: Record<string, Entry> = {};
for (const file of readdirSync('data').filter((f) => f.endsWith('.csv')).sort()) {
  const path = `data/${file}`;
  const sha256 = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (old[file]?.sha256 === sha256) {
    out[file] = old[file];
    continue;
  }
  const uncommitted = git('status', '--porcelain', '--', path) !== '';
  const date = uncommitted ? today : git('log', '-1', '--format=%cs', '--', path) || today;
  out[file] = { date, sha256 };
  console.log(`${file}: ${date}`);
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`${OUT} written (${Object.keys(out).length} files)`);
