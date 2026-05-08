import type { ServerPaymentProvider, UnifiedPaymentRequest } from './types';

function buildMetadata(request: UnifiedPaymentRequest): Record<string, unknown> {
  return {
    payment_gateway: 'MOYASAR',
    tier: request.tier,
    expected_amount_halalas: request.amountHalalas,
    expected_currency: 'SAR',
    linked_barber_id: request.linkedBarberId || '',
    product: 'subscription_monthly',
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
    return {
      gateway: 'MOYASAR',
      currency: 'SAR',
      amount: request.amountHalalas,
      description: `Halaqmap subscription ${request.tier} / ${request.requestId || request.barberName}`,
      metadata: buildMetadata(request),
    };
  },
  isSuccessStatus(status: string) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'success' || s === 'succeeded';
  },
};

