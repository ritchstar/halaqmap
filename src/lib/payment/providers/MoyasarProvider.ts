import type { UnifiedPaymentInput, UnifiedPaymentProvider } from './types';

function buildMetadata(input: UnifiedPaymentInput): Record<string, unknown> {
  return {
    payment_gateway: 'MOYASAR',
    tier: String(input.tier),
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

export const MoyasarProvider: UnifiedPaymentProvider = {
  code: 'MOYASAR',
  buildInitPayload(input) {
    return {
      gateway: 'MOYASAR',
      description: `Halaqmap subscription ${input.tier} / ${input.requestId || input.barberName || 'barber'}`,
      metadata: buildMetadata(input),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'succeeded';
  },
};

