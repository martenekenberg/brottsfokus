import { loadPopulation, loadRapeStudies } from '../../lib/data';
import { kap4Tables } from '../../lib/chapters/kap4Tables';

export function GET() {
  return new Response(kap4Tables(loadRapeStudies(), loadPopulation()).csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
