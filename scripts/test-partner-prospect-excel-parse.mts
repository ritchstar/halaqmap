/**
 * Smoke test for Excel lead parser (no fixture files required).
 * Run: npx --yes tsx scripts/test-partner-prospect-excel-parse.mts
 */
import * as XLSX from 'xlsx';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Dynamic import path mirrors Vite alias — use relative import for Node
const { parsePartnerProspectSpreadsheetFile } = await import('../src/lib/partnerProspectExcelParse.ts');
const { inferDefaultCityFromProspectFilename } = await import('../src/lib/partnerProspectFilenameRegion.ts');

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(inferDefaultCityFromProspectFilename('halaqmap_buraydah_barbers_FINAL_d3b95.xlsx') === 'بريدة', 'slug buraydah');
assert(inferDefaultCityFromProspectFilename('halaqmap_alahsa_barbers_FINAL_6d7efea.xlsx') === 'الأحساء', 'slug alahsa');

const tmpPath = join(tmpdir(), 'halaqmap_buraydah_barbers_FINAL_test.xlsx');
const wb = XLSX.utils.book_new();
const data = [
  ['اسم الصالون', 'الحي / المنطقة', 'رقم الهاتف'],
  ['صالون روعة', 'حي المنتزه – بريدة', '0564428062'],
  ['محل تجريبي', 'الربوة', '966501234567'],
];
const ws = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, 'leads');
XLSX.writeFile(wb, tmpPath);

const buf = await import('node:fs/promises').then((fs) => fs.readFile(tmpPath));
const file = new File([buf], 'halaqmap_buraydah_barbers_FINAL_test.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

const result = await parsePartnerProspectSpreadsheetFile(file);
assert(result.leads.length === 2, `expected 2 leads, got ${result.leads.length}`);
assert(result.leads[0]?.phone === '966564428062', 'phone normalize 05');
assert(result.defaultCity === 'بريدة', 'default city from filename');
assert(result.leads.some((l) => l.name.includes('روعة')), 'salon name');

unlinkSync(tmpPath);
console.log('partner-prospect-excel-parse: ok');
