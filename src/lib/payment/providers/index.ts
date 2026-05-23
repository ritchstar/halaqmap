import type { PaymentGatewayCode } from '@/config/paymentGateway';
import { MoyasarProvider } from './MoyasarProvider';
import { SABProvider } from './SABProvider';
import type { UnifiedPaymentProvider } from './types';

export function getUnifiedPaymentProvider(gateway: PaymentGatewayCode): UnifiedPaymentProvider {
  if (gateway === 'SAB') return SABProvider;
  return MoyasarProvider;
}

export { MoyasarProvider, SABProvider };
export type { UnifiedPaymentProvider, UnifiedPaymentInput, UnifiedPaymentInit } from './types';

