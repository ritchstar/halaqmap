/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export type PaymentGatewayCode = 'MOYASAR' | 'SAB';

export function resolvePaymentGateway(): PaymentGatewayCode {
  const raw = String(import.meta.env.VITE_PAYMENT_GATEWAY || 'MOYASAR')
    .trim()
    .toUpperCase();
  return raw === 'SAB' ? 'SAB' : 'MOYASAR';
}

