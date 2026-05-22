import type { SubscriptionTier } from '@/lib';
import type { PaymentGatewayCode } from '@/config/paymentGateway';

export type UnifiedPaymentInput = {
  tier: SubscriptionTier;
  amountHalalas: number;
  /** عدد بطاقات حزم الرخصة (1–12) */
  licenseQuantity: number;
  /** المناوب الرقمي — ماسي +25 ر.س/بطاقة */
  digitalShiftAddonSelected?: boolean;
  barberName: string;
  requestId: string;
  linkedBarberId: string;
};

export type UnifiedPaymentInit = {
  gateway: PaymentGatewayCode;
  description: string;
  metadata: Record<string, unknown>;
};

export type UnifiedPaymentProvider = {
  code: PaymentGatewayCode;
  buildInitPayload: (input: UnifiedPaymentInput) => UnifiedPaymentInit;
  isSuccessStatus: (status: string) => boolean;
};

