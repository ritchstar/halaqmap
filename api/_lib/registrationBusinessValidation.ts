export type RegistrationTier = 'bronze' | 'gold' | 'diamond';

const TIER_SET = new Set<RegistrationTier>(['bronze', 'gold', 'diamond']);

export function normalizeRegistrationTier(raw: unknown): RegistrationTier | null {
  const t = String(raw ?? '').trim().toLowerCase();
  if (TIER_SET.has(t as RegistrationTier)) return t as RegistrationTier;
  return null;
}

export function clampRegistrationLicenseQuantity(raw: unknown): number {
  const n =
    typeof raw === 'number' && Number.isFinite(raw)
      ? Math.trunc(raw)
      : Number.parseInt(String(raw ?? '1').trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

export function normalizeRegistrationDigitalShiftAddon(raw: unknown): boolean {
  return raw === true || raw === 'true' || raw === 1 || raw === '1';
}

export function isDigitalShiftAddonAllowedForTier(
  tier: RegistrationTier,
  selected: boolean,
): boolean {
  return tier === 'diamond' && selected;
}

export type RegistrationBusinessValidationResult =
  | { ok: true; tier: RegistrationTier; listingLicenseQuantity: number; digitalShiftAddonSelected: boolean }
  | { ok: false; error: string; code: string };

/** تحقق من حقول الطلب التجارية قبل الحفظ — لا يعتمد على الواجهة فقط */
export function validateRegistrationBusinessPayload(
  payload: Record<string, unknown>,
): RegistrationBusinessValidationResult {
  const tier = normalizeRegistrationTier(payload.tier);
  if (!tier) {
    return { ok: false, error: 'الباقة المختارة غير صالحة.', code: 'invalid_tier' };
  }

  const listingLicenseQuantity = clampRegistrationLicenseQuantity(payload.listingLicenseQuantity);
  const addonRaw = normalizeRegistrationDigitalShiftAddon(payload.digitalShiftAddonSelected);
  const digitalShiftAddonSelected = isDigitalShiftAddonAllowedForTier(tier, addonRaw);

  if (addonRaw && !digitalShiftAddonSelected) {
    return {
      ok: false,
      error: 'الإضافة البرمجية المتقدمة متاحة للباقة الماسية فقط.',
      code: 'invalid_digital_shift_addon',
    };
  }

  return { ok: true, tier, listingLicenseQuantity, digitalShiftAddonSelected };
}

export type RegistrationPaymentMatchResult =
  | { ok: true }
  | { ok: false; code: string; detail: Record<string, unknown> };

/** مطابقة metadata الدفع مع payload التسجيل عند وجود request_id */
export function validateRegistrationPaymentMatch(
  registrationPayload: Record<string, unknown> | null | undefined,
  paymentMeta: {
    tier: RegistrationTier | null;
    licenseQuantity: number;
    digitalShiftAddon: boolean;
  },
): RegistrationPaymentMatchResult {
  if (!registrationPayload || typeof registrationPayload !== 'object') {
    return { ok: true };
  }

  const regTier = normalizeRegistrationTier(registrationPayload.tier);
  const regQty = clampRegistrationLicenseQuantity(registrationPayload.listingLicenseQuantity);
  const regAddon = isDigitalShiftAddonAllowedForTier(
    regTier ?? 'bronze',
    normalizeRegistrationDigitalShiftAddon(registrationPayload.digitalShiftAddonSelected),
  );

  if (regTier && paymentMeta.tier && regTier !== paymentMeta.tier) {
    return {
      ok: false,
      code: 'registration_payment_tier_mismatch',
      detail: { registrationTier: regTier, paymentTier: paymentMeta.tier },
    };
  }

  if (regQty !== paymentMeta.licenseQuantity) {
    return {
      ok: false,
      code: 'registration_payment_qty_mismatch',
      detail: { registrationQty: regQty, paymentQty: paymentMeta.licenseQuantity },
    };
  }

  if (regAddon !== paymentMeta.digitalShiftAddon) {
    return {
      ok: false,
      code: 'registration_payment_addon_mismatch',
      detail: { registrationAddon: regAddon, paymentAddon: paymentMeta.digitalShiftAddon },
    };
  }

  return { ok: true };
}
