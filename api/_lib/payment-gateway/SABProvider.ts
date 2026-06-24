import type { ServerPaymentProvider, UnifiedPaymentRequest } from './types';

function buildMetadata(request: UnifiedPaymentRequest): Record<string, unknown> {
  const qty = Math.min(12, Math.max(1, Math.trunc(request.licenseQuantity ?? 1) || 1));
  return {
    payment_gateway: 'SAB',
    tier: request.tier,
    license_quantity: qty,
    expected_amount_halalas: request.amountHalalas,
    expected_currency: 'SAR',
    linked_barber_id: request.linkedBarberId || '',
    product: 'listing_license',
    product_type: 'Halaqmap Software Package',
    product_type_ar: 'حزمة رخصة لخدمات الإدراج',
    ...(request.digitalShiftAddonSelected ? { digital_shift_addon: true } : {}),
    ...(request.requestId
      ? {
          request_id: request.requestId,
          requestId: request.requestId,
        }
      : {}),
  };
}

export const SABProvider: ServerPaymentProvider = {
  code: 'SAB',
  createSessionPayload(request: UnifiedPaymentRequest) {
    return {
      gateway: 'SAB',
      currency: 'SAR',
      amount: request.amountHalalas,
      description: `Halaqmap Software Package ${request.tier} / ${request.requestId || request.barberName}`,
      metadata: buildMetadata(request),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'success' || s === 'succeeded' || s === 'paid' || s === 'captured';
  },
};

