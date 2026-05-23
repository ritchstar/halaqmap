/**
 * يطابق منطق `api/_lib/barberInclusiveCareUpsertRetry.ts` — إعادة محاولة upsert بدون حقول الرعاية الشاملة
 * إذا كانت أعمدة inclusive_care غير منشورة في Supabase بعد.
 */

const INCLUSIVE_CARE_UPSERT_KEYS = [
  'inclusive_care_offered',
  'inclusive_care_price_sar',
  'inclusive_care_public_visible',
  'inclusive_care_restrict_days',
  'inclusive_care_days',
  'inclusive_care_customer_note',
] as const;

export function stripInclusiveCareKeysFromBarberUpsertRow(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  for (const k of INCLUSIVE_CARE_UPSERT_KEYS) {
    delete out[k];
  }
  return out;
}

export function isBarberUpsertMissingInclusiveCareColumnError(message: string): boolean {
  const m = message.toLowerCase();
  if (!m.includes('inclusive_care')) return false;
  return (
    m.includes('schema cache') ||
    m.includes('could not find') ||
    m.includes('does not exist') ||
    (m.includes('column') && m.includes('barbers'))
  );
}
