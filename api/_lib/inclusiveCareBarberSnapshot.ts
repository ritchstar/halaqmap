const SAUDI_WEEK_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

export type InclusiveCareBarberSnapshot = {
  offered: boolean;
  priceSar: number | null;
  publicVisible: boolean;
  restrictDays: boolean;
  days: Record<string, boolean>;
  customerNote: string | null;
};

function sanitizeDays(raw: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const d of SAUDI_WEEK_DAYS) {
    out[d] = false;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return out;
  }
  const o = raw as Record<string, unknown>;
  for (const d of SAUDI_WEEK_DAYS) {
    if (Object.prototype.hasOwnProperty.call(o, d)) {
      out[d] = Boolean(o[d]);
    }
  }
  return out;
}

export function buildInclusiveCareSnapshotFromBarberRow(row: {
  inclusive_care_offered?: boolean | null;
  inclusive_care_price_sar?: unknown;
  inclusive_care_public_visible?: boolean | null;
  inclusive_care_restrict_days?: boolean | null;
  inclusive_care_days?: unknown;
  inclusive_care_customer_note?: string | null;
}): InclusiveCareBarberSnapshot {
  const rawPrice = row.inclusive_care_price_sar;
  const p = rawPrice != null && rawPrice !== '' ? Number(rawPrice) : NaN;
  return {
    offered: row.inclusive_care_offered === true,
    priceSar: Number.isFinite(p) && p > 0 ? Math.round(p * 100) / 100 : null,
    publicVisible: row.inclusive_care_public_visible !== false,
    restrictDays: row.inclusive_care_restrict_days === true,
    days: sanitizeDays(row.inclusive_care_days),
    customerNote: row.inclusive_care_customer_note != null ? String(row.inclusive_care_customer_note) : null,
  };
}
