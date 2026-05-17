import type { ServerPaymentProvider, UnifiedPaymentRequest } from './types';

function licenseSkuFromTier(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === 'gold') return 'gold_30';
  if (t === 'diamond') return 'diamond_30';
  return 'bronze_30';
}

function buildMetadata(request: UnifiedPaymentRequest): Record<string, unknown> {
  const sku = licenseSkuFromTier(request.tier);
  return {
    payment_gateway: 'MOYASAR',
    tier: request.tier,
    license_sku: sku,
    expected_amount_halalas: request.amountHalalas,
    expected_currency: 'SAR',
    linked_barber_id: request.linkedBarberId || '',
    product: 'listing_license',
    product_type: 'Software Listing License',
    product_type_ar: 'ترخيص خدمات إدراج برمجية',
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
      description: `Halaqmap Software Listing License (${sku}) / ${request.requestId || request.barberName}`,
      metadata: buildMetadata(request),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'succeeded';
  },
};

