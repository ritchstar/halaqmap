import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR } from '@/config/subscriptionPricing';
import type { UnifiedPaymentInput, UnifiedPaymentProvider } from './types';

function licenseSkuFromTier(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === 'gold') return 'gold_30';
  if (t === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

function buildMetadata(input: UnifiedPaymentInput): Record<string, unknown> {
  const qty = Math.min(12, Math.max(1, Math.trunc(input.licenseQuantity) || 1));
  const sku = licenseSkuFromTier(String(input.tier));
  const addon = input.digitalShiftAddonSelected === true;
  const addonHalalas = addon ? Math.round(DIGITAL_SHIFT_MONTHLY_ADDON_SAR * 100) * qty : 0;
  return {
    payment_gateway: 'MOYASAR',
    tier: String(input.tier),
    license_sku: sku,
    license_quantity: qty,
    expected_amount_halalas: input.amountHalalas,
    expected_currency: 'SAR',
    linked_barber_id: input.linkedBarberId || '',
    product: 'listing_license',
    product_type: 'Halaqmap Software Package',
    product_type_ar: 'حزمة رخصة لخدمات الإدراج',
    digital_shift_addon: addon,
    digital_shift_addon_halalas: addonHalalas,
    ...(input.requestId
      ? {
          request_id: input.requestId,
          requestId: input.requestId,
        }
      : {}),
  };
}

export const MoyasarProvider: UnifiedPaymentProvider = {
  code: 'MOYASAR',
  buildInitPayload(input) {
    const sku = licenseSkuFromTier(String(input.tier));
    const qty = Math.min(12, Math.max(1, Math.trunc(input.licenseQuantity) || 1));
    return {
      gateway: 'MOYASAR',
      description: `Halaqmap Software Package ×${qty} (${sku}) / ${input.requestId || input.barberName}`,
      metadata: buildMetadata(input),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'succeeded';
  },
};
