/**
 * حقول مسموح بها فقط في upsert الحلاق عبر /api/approve-barber (حماية من Mass Assignment).
 * يُستثنى rating_invite_token (يُدار من الخادم) وأي أعمدة غير مصرّحة.
 */

const APPROVE_BARBER_UPSERT_KEYS = new Set([
  'id',
  'member_number',
  'user_id',
  'name',
  'email',
  'phone',
  'latitude',
  'longitude',
  'address',
  'city',
  'tier',
  'rating',
  'total_reviews',
  'profile_image',
  'cover_image',
  'bio',
  'experience_years',
  'specialties',
  'inclusive_care_offered',
  'inclusive_care_price_sar',
  'inclusive_care_public_visible',
  'inclusive_care_restrict_days',
  'inclusive_care_days',
  'inclusive_care_customer_note',
  'is_active',
  'is_verified',
]);

export type WhitelistBarberRowResult =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; disallowedKeys: string[] };

export function whitelistBarberUpsertRow(input: Record<string, unknown>): WhitelistBarberRowResult {
  const disallowedKeys: string[] = [];
  const row: Record<string, unknown> = {};

  for (const key of Object.keys(input)) {
    if (APPROVE_BARBER_UPSERT_KEYS.has(key)) {
      row[key] = input[key];
    } else {
      disallowedKeys.push(key);
    }
  }

  if (disallowedKeys.length > 0) {
    return { ok: false, disallowedKeys };
  }
  return { ok: true, row };
}
