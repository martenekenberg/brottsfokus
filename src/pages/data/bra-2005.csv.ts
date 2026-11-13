import { loadBra2005 } from '../../lib/data';
import { kap5Csv } from '../../lib/chapters/kap5Tables';

export function GET() {
  return new Response(kap5Csv(loadBra2005()), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
