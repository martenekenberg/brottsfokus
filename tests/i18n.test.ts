// Checks for the English version: every label from the data files has an English name,
// the language paths line up, and English numbers use the English format.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBra2005, loadOrigin, loadRapeStudies, loadSuspectsByBackground, loadTableB6 } from '../src/lib/data';
import { dataLabel } from '../src/lib/labels';
import { alternatePath, tablePage } from '../src/lib/dataPages';
import { localePath } from '../src/lib/i18n';
import { formatNumber, formatPct, formatTimes } from '../src/lib/format';

test('every label from the data files has an English name', () => {
  const labels = new Set<string>();
  for (const r of loadSuspectsByBackground()) labels.add(r.crime);
  for (const r of loadOrigin()) {
    labels.add(r.crime);
    labels.add(r.unit);
    if (r.region) labels.add(r.region);
  }
  for (const r of loadTableB6()) labels.add(r.unit);
  for (const r of loadRapeStudies()) labels.add(r.item);
  for (const r of loadBra2005()) labels.add(r.group);
  const missing = [...labels].filter((sv) => {
    try {
      dataLabel(sv, 'en');
      return false;
    } catch {
      return true;
    }
  });
  assert.deepEqual(missing, []);
});

test('language paths: English pages live under /en/', () => {
  assert.equal(localePath('en', '/'), '/en/');
  assert.equal(localePath('en', '/data/'), '/en/data/');
  assert.equal(localePath('sv', '/data/'), '/data/');
  assert.equal(tablePage('kap1', 'en').path, '/en/data/suspects-over-time/');
  assert.equal(tablePage('kap1', 'sv').path, '/data/misstankta-over-tid/');
});

test('alternatePath points to the same page in the other language', () => {
  assert.equal(alternatePath('/', 'sv'), '/en/');
  assert.equal(alternatePath('/en/', 'en'), '/');
  assert.equal(alternatePath('/data/', 'sv'), '/en/data/');
  assert.equal(alternatePath('/data/misstankta-over-tid/', 'sv'), '/en/data/suspects-over-time/');
  assert.equal(alternatePath('/en/data/suspects-over-time/', 'en'), '/data/misstankta-over-tid/');
});

test('English numbers: comma thousands, dot decimals, no space before %', () => {
  assert.equal(formatNumber(1234567, 0, 'en'), '1,234,567');
  assert.equal(formatNumber(2.5, 1, 'en'), '2.5');
  assert.equal(formatPct(22, 0, 'en'), '22%');
  assert.equal(formatTimes(2.5, 1, 'en'), '2.5×');
});
