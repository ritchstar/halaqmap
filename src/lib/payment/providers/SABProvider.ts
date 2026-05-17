import type { UnifiedPaymentInput, UnifiedPaymentProvider } from './types';

function buildMetadata(input: UnifiedPaymentInput): Record<string, unknown> {
  const qty = Math.min(12, Math.max(1, Math.trunc(input.licenseQuantity) || 1));
  return {
    payment_gateway: 'SAB',
    tier: String(input.tier),
    license_quantity: qty,
    expected_amount_halalas: input.amountHalalas,
    expected_currency: 'SAR',
    ...(input.requestId
      ? {
          request_id: input.requestId,
          requestId: input.requestId,
        }
      : {}),
    linked_barber_id: input.linkedBarberId || '',
    product: 'subscription_monthly',
  };
}

export const SABProvider: UnifiedPaymentProvider = {
  code: 'SAB',
  buildInitPayload(input) {
    return {
      gateway: 'SAB',
      description: `Halaqmap SAB subscription ${input.tier} / ${input.requestId || input.barberName || 'barber'}`,
      metadata: buildMetadata(input),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'success' || s === 'succeeded' || s === 'paid' || s === 'captured';
  },
};

