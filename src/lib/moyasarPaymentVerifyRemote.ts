/**
 * التحقق من دفع ميسر عبر السيرفر (يحمي مفتاح السرّ).
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function verifyEndpoint(): string {
  const explicit = String(import.meta.env.VITE_VERIFY_MOYSAR_PAYMENT_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/verify-moyasar-payment`;
  return '/api/verify-moyasar-payment';
}

export type VerifyMoyasarPaymentResult =
  | {
      ok: true;
      paid: boolean;
      status: string;
      id: string;
      amount: number | null;
      currency: string | null;
      fee: number | null;
      description: string | null;
      amount_format: string | null;
    }
  | { ok: false; error: string; hint?: string; message?: string; status?: number };

export async function verifyMoyasarPaymentRemote(
  paymentId: string,
  opts?: { expectedAmountHalalas?: number; expectedCurrency?: string },
): Promise<VerifyMoyasarPaymentResult> {
  const base = verifyEndpoint();
  const q = new URLSearchParams({ id: paymentId.trim() });
  if (opts?.expectedAmountHalalas != null && Number.isFinite(opts.expectedAmountHalalas)) {
    q.set('expectedAmount', String(Math.floor(opts.expectedAmountHalalas)));
  }
  if (opts?.expectedCurrency) {
    q.set('expectedCurrency', opts.expectedCurrency.trim().toUpperCase());
  }
  const url = `${base}?${q.toString()}`;

  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit' });
    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const err = String(data.error || 'request_failed');
      const hint = data.hint != null ? String(data.hint) : undefined;
      const message = data.message != null ? String(data.message) : undefined;
      return { ok: false, error: err, hint, message, status: res.status };
    }

    if (data.ok !== true) {
      return { ok: false, error: String(data.error || 'unknown') };
    }

    return {
      ok: true,
      paid: data.paid === true,
      status: String(data.status || ''),
      id: String(data.id || paymentId),
      amount: typeof data.amount === 'number' ? data.amount : null,
      currency: data.currency != null ? String(data.currency) : null,
      fee: typeof data.fee === 'number' ? data.fee : null,
      description: data.description != null ? String(data.description) : null,
      amount_format: data.amount_format != null ? String(data.amount_format) : null,
    };
  } catch {
    return { ok: false, error: 'network', hint: 'تعذر الاتصال بخادم التحقق من الدفع.' };
  }
}
