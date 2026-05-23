/**
 * إرسال بريد ملخص الطلب ورابط الدفع عبر API الخادم (Resend).
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function endpoint(): string {
  const explicit = String(import.meta.env.VITE_SEND_REGISTRATION_PAYMENT_SUMMARY_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/send-registration-payment-summary`;
  return '/api/send-registration-payment-summary';
}

export type SendRegistrationPaymentSummaryResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string; detail?: string; status?: number };

export async function sendRegistrationPaymentSummaryRemote(input: {
  orderId: string;
  email: string;
  shopName: string;
  tier: string;
  paymentMethod: 'monthly' | 'bank_transfer';
}): Promise<SendRegistrationPaymentSummaryResult> {
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify({
        orderId: input.orderId.trim(),
        email: input.email.trim(),
        shopName: input.shopName.trim(),
        tier: input.tier.trim().toLowerCase(),
        paymentMethod: input.paymentMethod,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        error: String(data.error || 'request_failed'),
        detail: data.detail != null ? String(data.detail) : undefined,
        status: res.status,
      };
    }
    if (data.ok !== true) {
      return { ok: false, error: String(data.error || 'unknown') };
    }
    return { ok: true, messageId: data.messageId != null ? String(data.messageId) : undefined };
  } catch {
    return { ok: false, error: 'network', detail: 'تعذر الاتصال بالخادم.' };
  }
}
