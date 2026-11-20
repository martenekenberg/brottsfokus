// Checks for the "Läs också" links: every chapter has them, and every term link points to an anchor on Metod.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chapters } from '../src/lib/chapters';
import { TERMS, relatedChapterIds, relatedLinks } from '../src/lib/related';

test('every chapter has related links in both languages', () => {
  for (const c of chapters) {
    assert.ok(relatedChapterIds.includes(c.id), `${c.id} has no related links`);
    for (const lang of ['sv', 'en'] as const) assert.ok(relatedLinks(c.id, lang).terms.length > 0, `${c.id} ${lang}: no term links`);
  }
});

test('every term link has an anchor on Metod', () => {
  const method = readFileSync('src/components/Method.astro', 'utf8');
  for (const id of Object.keys(TERMS)) assert.ok(method.includes(`id: '${id}',`), `Metod has no term with id ${id}`);
});
