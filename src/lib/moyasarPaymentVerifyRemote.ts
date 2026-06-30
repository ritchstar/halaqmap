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

  if (typeof window !== 'undefined') {
    const pageOrigin = window.location.origin.replace(/\/$/, '');
    const splitOrigin = registrationApiOrigin();
    if (splitOrigin) {
      try {
        const configured = new URL(splitOrigin).origin;
        if (configured !== pageOrigin) {
          return `${splitOrigin.replace(/\/$/, '')}/api/verify-moyasar-payment`;
        }
      } catch {
        // ignore invalid split origin
      }
    }
    return `${pageOrigin}/api/verify-moyasar-payment`;
  }

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

async function readJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    throw new Error(
      snippet
        ? `استجابة غير متوقعة من الخادم (${res.status}): ${snippet}`
        : `استجابة غير متوقعة من الخادم (${res.status}).`,
    );
  }
}

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
    let data: Record<string, unknown>;
    try {
      data = await readJsonResponse(res);
    } catch (parseError) {
      return {
        ok: false,
        error: 'invalid_response',
        hint: parseError instanceof Error ? parseError.message : 'تعذر قراءة استجابة خادم التحقق.',
        status: res.status,
      };
    }

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
  } catch (error) {
    return {
      ok: false,
      error: 'network',
      hint:
        error instanceof Error
          ? `تعذر الاتصال بخادم التحقق (${error.message}). تحقق من النطاق وPUBLIC_API_ALLOWED_ORIGINS وMOYSAR_SECRET_TEST_API_KEY على Vercel.`
          : 'تعذر الاتصال بخادم التحقق من الدفع.',
    };
  }
}
