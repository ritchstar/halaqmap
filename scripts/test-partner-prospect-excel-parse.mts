/**
 * Smoke test for Excel lead parser (no fixture files required).
 * Run: npx --yes tsx scripts/test-partner-prospect-excel-parse.mts
 */
import * as XLSX from 'xlsx';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { parsePartnerProspectSpreadsheetFile } = await import('../src/lib/partnerProspectExcelParse.ts');
const { inferDefaultCityFromProspectFilename } = await import('../src/lib/partnerProspectFilenameRegion.ts');

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(inferDefaultCityFromProspectFilename('halaqmap_buraydah_barbers_FINAL_d3b95.xlsx') === 'بريدة', 'slug buraydah');
assert(inferDefaultCityFromProspectFilename('halaqmap_alahsa_barbers_FINAL_6d7efea.xlsx') === 'الأحساء', 'slug alahsa');

async function runFile(name: string, data: unknown[][]) {
  const tmpPath = join(tmpdir(), name);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'leads');
  XLSX.writeFile(wb, tmpPath);
  const buf = await import('node:fs/promises').then((fs) => fs.readFile(tmpPath));
  const file = new File([buf], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const result = await parsePartnerProspectSpreadsheetFile(file);
  unlinkSync(tmpPath);
  return result;
}

// Buraydah simple export
const buraydah = await runFile('halaqmap_buraydah_barbers_FINAL_test.xlsx', [
  ['اسم الصالون', 'الحي / المنطقة', 'رقم الهاتف'],
  ['صالون روعة', 'حي المنتزه – بريدة', '0564428062'],
  ['محل تجريبي', 'الربوة', '966501234567'],
]);
assert(buraydah.leads.length === 2, `buraydah: expected 2 leads, got ${buraydah.leads.length}`);
assert(buraydah.leads[0]?.phone === '966564428062', 'phone normalize 05');
assert(buraydah.defaultCity === 'بريدة', 'default city from filename');

const ahsa = await runFile('halaqmap_alahsa_barbers_FINAL_6d7efea.xlsx', [
  ['حلاق ماب - قائمة صالونات الأحساء', '', '', '', '', '', '', '', '', ''],
  [
    'م',
    'اسم الصالون',
    'الحي',
    'العنوان',
    'رقم الهاتف',
    'يدعم واتساب؟',
    'رابط واتساب',
    'المصدر',
    'رابط المصدر',
    'ملاحظات',
  ],
  [
    1,
    'صالون مستر باربر',
    'حي العامرية، الهفوف',
    'شارع الأمير ماجد',
    '+966537599099',
    'نعم',
    'https://wa.me/966537599099',
    'Fresha',
    '',
    '',
  ],
  [
    2,
    'صالون أرضي',
    'المبرز',
    'عنوان',
    '+966112345678',
    'أرضي',
    '',
    'Fresha',
    '',
    'أرضي - ليس واتساب',
  ],
  [
    3,
    'صالون زاوية الرجل',
    'المبرز',
    '9H3P+74Q',
    '+966501112233',
    'نعم',
    'https://wa.me/966501112233',
    'Fresha',
    '',
    '',
  ],
]);

assert(ahsa.leads.length === 2, `ahsa: expected 2 leads (skip landline), got ${ahsa.leads.length}`);
assert(ahsa.defaultCity === 'الأحساء', 'ahsa default city');
const hofuf = ahsa.leads.find((l) => l.name.includes('مستر باربر'));
assert(hofuf?.city === 'الأحساء', 'city from الهفوف hint');
assert(hofuf?.region?.includes('العامرية'), 'neighborhood preserved');
assert(!ahsa.leads.some((l) => l.name.includes('أرضي')), 'landline row skipped');

console.log('partner-prospect-excel-parse: ok');
