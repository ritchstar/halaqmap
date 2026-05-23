export type PaymentGatewayCode = 'MOYASAR' | 'SAB';

export type UnifiedPaymentRequest = {
  tier: string;
  amountHalalas: number;
  licenseQuantity?: number;
  digitalShiftAddonSelected?: boolean;
  barberName: string;
  requestId?: string;
  linkedBarberId?: string;
};

export type UnifiedPaymentSession = {
  gateway: PaymentGatewayCode;
  currency: 'SAR';
  amount: number;
  description: string;
  metadata: Record<string, unknown>;
};

export type ServerPaymentProvider = {
  code: PaymentGatewayCode;
  createSessionPayload: (request: UnifiedPaymentRequest) => UnifiedPaymentSession;
  isSuccessStatus: (status: string) => boolean;
};

