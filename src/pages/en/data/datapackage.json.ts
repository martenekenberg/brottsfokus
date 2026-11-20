import { dataPackage } from '../../../lib/dataPackage';

export function GET() {
  return new Response(JSON.stringify(dataPackage('en'), null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
