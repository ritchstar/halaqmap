import { MoyasarProvider } from './MoyasarProvider';
import { SABProvider } from './SABProvider';
import type { PaymentGatewayCode, ServerPaymentProvider } from './types';

export function resolveServerPaymentGateway(): PaymentGatewayCode {
  const raw = String(process.env.PAYMENT_GATEWAY || 'MOYASAR')
    .trim()
    .toUpperCase();
  return raw === 'SAB' ? 'SAB' : 'MOYASAR';
}

export function getServerPaymentProvider(): ServerPaymentProvider {
  const gateway = resolveServerPaymentGateway();
  return gateway === 'SAB' ? SABProvider : MoyasarProvider;
}

export { MoyasarProvider, SABProvider };
export type { PaymentGatewayCode, UnifiedPaymentRequest, UnifiedPaymentSession } from './types';

