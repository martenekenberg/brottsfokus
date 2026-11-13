// When the data behind a page last changed. Build time only.
// The dates are recorded by `npm run datadates`. The build stops if a data file has
// changed since then, so a page never shows a stale date.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import recorded from './dataDates.json';

const DATA_DIR = join(process.cwd(), 'data');
const dates = recorded as Record<string, { date: string; sha256: string }>;
let checked = false;

function check() {
  if (checked) return;
  for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith('.csv'))) {
    const sha256 = createHash('sha256').update(readFileSync(join(DATA_DIR, file))).digest('hex');
    if (dates[file]?.sha256 !== sha256) {
      throw new Error(`data/${file} has changed since its date was recorded. Run: npm run datadates`);
    }
  }
  checked = true;
}

/** Latest change date (ISO, e.g. "2026-11-13") among the given data files; all files if none are given. */
export function dataDate(files: string[] = Object.keys(dates)): string {
  check();
  return files
    .map((f) => {
      const d = dates[f]?.date;
      if (!d) throw new Error(`No recorded date for data/${f}. Run: npm run datadates`);
      return d;
    })
    .sort()
    .at(-1) as string;
}
