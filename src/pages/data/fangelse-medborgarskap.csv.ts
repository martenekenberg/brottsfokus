import { loadPopulation, loadPrison } from '../../lib/data';
import { buildKap3, kap3Tables } from '../../lib/chapters/kap3';
import { tablesToCsv } from '../../lib/tables';

// The same tables as on /data/fangelse-medborgarskap/, joined by year.
export function GET() {
  const csv = tablesToCsv(kap3Tables(buildKap3(loadPrison(), loadPopulation())));
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
}
