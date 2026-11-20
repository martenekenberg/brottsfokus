// The data dictionary must describe every column of every CSV file, in order, in both languages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataDictionary } from '../src/lib/dataDictionary';
import { tablePages } from '../src/lib/dataPages';
import { tablePageContent } from '../src/lib/tablePageContent';

/** First line of a CSV file, split on commas outside quotes. */
function header(csv: string): string[] {
  return csv.split('\n')[0].split(',').map((h) => h.replace(/^"|"$/g, ''));
}

for (const p of tablePages) {
  for (const lang of ['sv', 'en'] as const) {
    test(`data dictionary matches the ${lang} CSV for ${p.chapterId}`, () => {
      const names = dataDictionary(p.chapterId).map((c) => c.name[lang]);
      assert.deepEqual(names, header(tablePageContent(p.chapterId, lang).csv));
    });
  }
}

test('every column has a description in both languages', () => {
  for (const p of tablePages) {
    for (const c of dataDictionary(p.chapterId)) {
      assert.ok(c.description.sv.length > 2 && c.description.en.length > 2, `${p.chapterId} ${c.name.sv}`);
      assert.ok(!c.description.sv.includes('—') && !c.description.en.includes('—'), `${p.chapterId} ${c.name.sv}: em dash`);
    }
  }
});
