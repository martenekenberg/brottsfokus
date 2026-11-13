import { loadOrigin, loadSuspectsByBackground, loadTableB6 } from '../../lib/data';
import { buildKap2Data } from '../../lib/chapters/kap2';
import { kap2Csv } from '../../lib/chapters/kap2Tables';

export function GET() {
  const depthByOrder = new Map(loadSuspectsByBackground().map((r) => [r.crimeOrder, r.depth]));
  const b6 = loadTableB6();
  const csv = kap2Csv(buildKap2Data(loadOrigin(), depthByOrder, b6), b6);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
