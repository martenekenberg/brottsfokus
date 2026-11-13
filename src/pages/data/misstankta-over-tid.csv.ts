import { loadSuspectsByBackground } from '../../lib/data';
import { buildKap1Data } from '../../lib/chapters/kap1';
import { kap1Csv } from '../../lib/chapters/kap1Tables';

export function GET() {
  return new Response(kap1Csv(buildKap1Data(loadSuspectsByBackground())), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
