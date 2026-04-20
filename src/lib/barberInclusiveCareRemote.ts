import { SAUDI_WEEK_DAY_LABELS } from '@/lib/saudiWorkingWeek';

const DEFAULT_ENDPOINT = '/api/barber-inclusive-care-update';

function endpoint(): string {
  return String(import.meta.env.VITE_BARBER_INCLUSIVE_CARE_URL || DEFAULT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export type BarberPortalInclusiveCareSnapshot = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  restrictDays: boolean;
  days: Record<string, boolean>;
  customerNote: string | null;
};

export type BarberInclusiveCareUpdatePayload = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  restrictDays: boolean;
  days: Record<string, boolean>;
  customerNote: string;
};

export function sanitizeInclusiveCareDays(input: Record<string, boolean>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const day of SAUDI_WEEK_DAY_LABELS) {
    out[day] = false;
  }
  for (const day of SAUDI_WEEK_DAY_LABELS) {
    if (Object.prototype.hasOwnProperty.call(input, day)) {
      out[day] = Boolean(input[day]);
    }
  }
  return out;
}

/** خريطة أسبوع كاملة (افتراضي: كل الأيام غير مؤشرة) — للنماذج في لوحة الحلاق */
export function defaultInclusiveCareDaysMap(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const day of SAUDI_WEEK_DAY_LABELS) {
    out[day] = false;
  }
  return out;
}

export function mergeInclusiveCareDaysFromSnapshot(
  snapshot?: Record<string, boolean> | null
): Record<string, boolean> {
  const base = defaultInclusiveCareDaysMap();
  if (!snapshot) return base;
  for (const day of SAUDI_WEEK_DAY_LABELS) {
    if (Object.prototype.hasOwnProperty.call(snapshot, day)) {
      base[day] = Boolean(snapshot[day]);
    }
  }
  return base;
}

export function inclusiveCareSnapshotFromBarberRow(row: {
  inclusive_care_offered?: boolean | null;
  inclusive_care_price_sar?: unknown;
  inclusive_care_public_visible?: boolean | null;
  inclusive_care_restrict_days?: boolean | null;
  inclusive_care_days?: unknown;
  inclusive_care_customer_note?: string | null;
}): BarberPortalInclusiveCareSnapshot {
  const rawPrice = row.inclusive_care_price_sar;
  const p = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
  let days: Record<string, boolean> = {};
  const d = row.inclusive_care_days;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    days = sanitizeInclusiveCareDays(d as Record<string, boolean>);
  }
  return {
    offered: row.inclusive_care_offered === true,
    priceSar: Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null,
    publicVisible: row.inclusive_care_public_visible !== false,
    restrictDays: row.inclusive_care_restrict_days === true,
    days,
    customerNote: row.inclusive_care_customer_note != null ? String(row.inclusive_care_customer_note) : null,
  };
}

export async function updateBarberInclusiveCareRemote(input: {
  barberId: string;
  email: string;
  payload: BarberInclusiveCareUpdatePayload;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار تحديث إعدادات الرعاية المُيسَّرة غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        offered: input.payload.offered,
        priceSar: input.payload.priceSar,
        publicVisible: input.payload.publicVisible,
        restrictDays: input.payload.restrictDays,
        days: sanitizeInclusiveCareDays(input.payload.days),
        customerNote: input.payload.customerNote.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}
