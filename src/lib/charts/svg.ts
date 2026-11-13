// Small helpers shared by the chart renderers and their browser scripts.

/** Escape text for use in SVG/HTML content and attribute values. */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const FONT = 'font-family="Inter Variable, Inter, Arial, sans-serif"';
