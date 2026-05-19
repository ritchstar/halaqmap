import type { ServerPaymentProvider, UnifiedPaymentRequest } from './types';

function licenseSkuFromTier(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === 'gold') return 'gold_30';
  if (t === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

function buildMetadata(request: UnifiedPaymentRequest): Record<string, unknown> {
  const sku = licenseSkuFromTier(request.tier);
  const qty = Math.min(12, Math.max(1, Math.trunc(request.licenseQuantity ?? 1)));
  const addon = request.digitalShiftAddonSelected === true;
  const addonHalalas = addon ? 2500 * qty : 0;
  return {
    payment_gateway: 'MOYASAR',
    tier: request.tier,
    license_sku: sku,
    license_quantity: qty,
    expected_amount_halalas: request.amountHalalas,
    expected_currency: 'SAR',
    linked_barber_id: request.linkedBarberId || '',
    product: 'listing_license',
    product_type: 'Halaqmap Software Package',
    product_type_ar: 'حزمة برمجية لخدمات الإدراج',
    digital_shift_addon: addon,
    digital_shift_addon_halalas: addonHalalas,
    ...(request.requestId
      ? {
          request_id: request.requestId,
          requestId: request.requestId,
        }
      : {}),
  };
}

export const MoyasarProvider: ServerPaymentProvider = {
  code: 'MOYASAR',
  createSessionPayload(request) {
    const sku = licenseSkuFromTier(request.tier);
    return {
      gateway: 'MOYASAR',
      currency: 'SAR',
      amount: request.amountHalalas,
      description: `Halaqmap Software Package (${sku}) / ${request.requestId || request.barberName}`,
      metadata: buildMetadata(request),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'succeeded';
  },
};

