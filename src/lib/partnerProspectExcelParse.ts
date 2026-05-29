import type { ScannedPartnerLead } from '@/lib/partnerProspectScanTypes';
import { inferDefaultCityFromProspectFilename } from '@/lib/partnerProspectFilenameRegion';
import { normalizePartnerProspectPhone } from '@/lib/partnerProspectPhone';

export type ExcelParseResult = {
  leads: ScannedPartnerLead[];
  skippedRows: number;
  defaultCity?: string;
  sheetName?: string;
};

type ColumnKey = 'name' | 'phone' | 'city' | 'region' | 'address';

const HEADER_ALIASES: Record<ColumnKey, string[]> = {
  name: [
    'اسم الصالون',
    'اسم المحل',
    'اسم الحلاق',
    'اسم',
    'name',
    'salon',
    'shop',
    'business',
    'store',
    'barber',
  ],
  phone: [
    'رقم الهاتف',
    'الهاتف',
    'جوال',
    'واتساب',
    'whatsapp',
    'phone',
    'mobile',
    'tel',
    'contact',
  ],
  city: ['المدينة', 'city', 'town'],
  region: ['الحي', 'المنطقة', 'حي', 'neighborhood', 'district', 'region', 'area', 'منطقة'],
  address: ['العنوان', 'address', 'street', 'location', 'موقع'],
};

function normalizeHeaderCell(raw: unknown): string {
  if (raw == null) return '';
  return String(raw)
    .replace(/\u200f|\u200e/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function matchColumnKey(header: string): ColumnKey | null {
  if (!header) return null;
  for (const [key, aliases] of Object.entries(HEADER_ALIASES) as [ColumnKey, string[]][]) {
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (header === a || header.includes(a) || a.includes(header)) return key;
    }
  }
  return null;
}

function detectColumnMap(headerRow: unknown[]): Partial<Record<ColumnKey, number>> {
  const map: Partial<Record<ColumnKey, number>> = {};
  headerRow.forEach((cell, index) => {
    const key = matchColumnKey(normalizeHeaderCell(cell));
    if (key && map[key] === undefined) map[key] = index;
  });
  return map;
}

function findHeaderRowIndex(rows: unknown[][]): number {
  let best = 0;
  let bestScore = -1;
  const maxScan = Math.min(rows.length, 12);
  for (let i = 0; i < maxScan; i++) {
    const row = rows[i] ?? [];
    const map = detectColumnMap(row);
    const score = (map.name !== undefined ? 2 : 0) + (map.phone !== undefined ? 3 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

function cellValue(row: unknown[], index: number | undefined): string {
  if (index === undefined) return '';
  const v = row[index];
  if (v == null) return '';
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v > 1e9) return String(Math.trunc(v));
    return String(v);
  }
  return String(v).replace(/\s+/g, ' ').trim();
}

function inferCityFromBlob(blob: string): string | undefined {
  const known = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف', 'بريدة', 'الأحساء'];
  return known.find((c) => blob.includes(c));
}

function rowToLead(
  row: unknown[],
  col: Partial<Record<ColumnKey, number>>,
  defaultCity?: string,
): ScannedPartnerLead | null {
  const name = cellValue(row, col.name) || cellValue(row, 0);
  const phoneRaw = cellValue(row, col.phone);
  const phone = normalizePartnerProspectPhone(phoneRaw);
  if (!phone) return null;

  const region = cellValue(row, col.region);
  const address = cellValue(row, col.address) || region;
  let city = cellValue(row, col.city);
  if (!city) city = inferCityFromBlob(`${region} ${address}`) ?? defaultCity ?? '';

  const cleanName = name.length >= 2 ? name.slice(0, 200) : 'محل حلاق';

  return {
    name: cleanName,
    phone,
    ...(city ? { city } : {}),
    ...(region ? { region } : {}),
    ...(address ? { address } : {}),
  };
}

async function loadXlsx() {
  return import('xlsx');
}

export async function parsePartnerProspectSpreadsheetFile(file: File): Promise<ExcelParseResult> {
  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const defaultCity = inferDefaultCityFromProspectFilename(file.name);

  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { leads: [], skippedRows: 0, defaultCity };
  }

  const sheet = workbook.Sheets[sheetName]!;
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }) as unknown[][];
  if (rows.length === 0) {
    return { leads: [], skippedRows: 0, defaultCity, sheetName };
  }

  const headerIdx = findHeaderRowIndex(rows);
  const col = detectColumnMap(rows[headerIdx] ?? []);

  if (col.phone === undefined) {
    const fallbackPhone = rows[headerIdx]?.findIndex((c) => {
      const h = normalizeHeaderCell(c);
      return h.includes('هاتف') || h.includes('phone') || h.includes('واتس');
    });
    if (fallbackPhone !== undefined && fallbackPhone >= 0) col.phone = fallbackPhone;
  }

  const byPhone = new Map<string, ScannedPartnerLead>();
  let skippedRows = 0;

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || row.every((c) => !String(c ?? '').trim())) {
      continue;
    }
    const lead = rowToLead(row as unknown[], col, defaultCity);
    if (!lead) {
      skippedRows += 1;
      continue;
    }
    if (!byPhone.has(lead.phone)) byPhone.set(lead.phone, lead);
  }

  return {
    leads: [...byPhone.values()],
    skippedRows,
    defaultCity,
    sheetName,
  };
}

export function isPartnerProspectSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime === 'application/vnd.ms-excel' ||
    mime === 'text/csv'
  ) {
    return true;
  }
  return /\.(xlsx|xls|csv|ods)$/i.test(name);
}
