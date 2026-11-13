import type { Lang } from './i18n';

/**
 * Years as short ranges: [2014, 2015, 2018, 2019, 2020] -> "2014–2015 och 2018–2020" (sv)
 * or "2014–2015 and 2018–2020" (en). Used in notes that say which years have values.
 */
export function yearRanges(years: number[], lang: Lang): string {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      const end = sorted[i - 1];
      parts.push(start === end ? String(start) : `${start}–${end}`);
      start = sorted[i];
    }
  }
  if (parts.length <= 1) return parts.join('');
  const and = lang === 'en' ? ' and ' : ' och ';
  return `${parts.slice(0, -1).join(', ')}${and}${parts[parts.length - 1]}`;
}
