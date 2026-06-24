/**
 * إنشاء جلسة دفع SAB (OPPWA) عبر الخادم.
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function createCheckoutEndpoint(): string {
  const explicit = String(import.meta.env.VITE_SAB_CREATE_CHECKOUT_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/sab-create-checkout`;
  return '/api/sab-create-checkout';
}

export type SabCreateCheckoutInput = {
  tier: string;
  amountHalalas: number;
  licenseQuantity: number;
  digitalShiftAddonSelected: boolean;
  barberName: string;
  requestId: string;
  linkedBarberId: string;
  shopperResultUrl: string;
};

export type SabCreateCheckoutResult =
  | {
      ok: true;
      checkoutId: string;
      widgetScriptUrl: string;
      shopperResultUrl: string;
      amountDisplay: string;
      currency: string;
      integrity: string | null;
    }
  | { ok: false; error: string; hint?: string; detail?: string | null };

export async function createSabCheckoutRemote(
  input: SabCreateCheckoutInput,
): Promise<SabCreateCheckoutResult> {
  const url = createCheckoutEndpoint();
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok || data.ok !== true) {
      return {
        ok: false,
        error: String(data.error || 'request_failed'),
        hint: data.hint != null ? String(data.hint) : undefined,
        detail: data.detail != null ? String(data.detail) : null,
      };
    }
    return {
      ok: true,
      checkoutId: String(data.checkoutId || ''),
      widgetScriptUrl: String(data.widgetScriptUrl || ''),
      shopperResultUrl: String(data.shopperResultUrl || input.shopperResultUrl),
      amountDisplay: String(data.amountDisplay || ''),
      currency: String(data.currency || 'SAR'),
      integrity: data.integrity != null ? String(data.integrity) : null,
    };
  } catch {
    return { ok: false, error: 'network', hint: 'تعذر الاتصال بخادم إنشاء جلسة الدفع.' };
  }
}

function verifyEndpoint(): string {
  const explicit = String(import.meta.env.VITE_VERIFY_SAB_PAYMENT_URL || '').trim();
  if (explicit) return explicit;
  const origin = registrationApiOrigin();
  if (origin) return `${origin}/api/verify-sab-payment`;
  return '/api/verify-sab-payment';
}

export type VerifySabPaymentResult =
  | {
      ok: true;
      paid: boolean;
      status: string;
      id: string;
      amount: number | null;
      currency: string | null;
      amount_format: string | null;
      resultCode: string | null;
      resultDescription: string | null;
    }
  | { ok: false; error: string; hint?: string; message?: string; status?: number };

export async function verifySabPaymentRemote(
  paymentId: string,
  opts?: { resourcePath?: string; expectedAmountHalalas?: number; expectedCurrency?: string },
): Promise<VerifySabPaymentResult> {
  const base = verifyEndpoint();
  const q = new URLSearchParams();
  const id = paymentId.trim();
  if (id) q.set('id', id);
  if (opts?.resourcePath) q.set('resourcePath', opts.resourcePath);
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
      return {
        ok: false,
        error: String(data.error || 'request_failed'),
        hint: data.hint != null ? String(data.hint) : undefined,
        message: data.detail != null ? String(data.detail) : undefined,
        status: res.status,
      };
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
      amount_format: data.amount_format != null ? String(data.amount_format) : null,
      resultCode: data.resultCode != null ? String(data.resultCode) : null,
      resultDescription: data.resultDescription != null ? String(data.resultDescription) : null,
    };
  } catch {
    return { ok: false, error: 'network', hint: 'تعذر الاتصال بخادم التحقق من الدفع.' };
  }
}

export function buildSabShopperResultUrl(paymentPath: string, query: Record<string, string>): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const q = new URLSearchParams(query);
  q.set('gateway', 'sab');
  const path = paymentPath.startsWith('/') ? paymentPath : `/${paymentPath}`;
  return `${origin}${path}?${q.toString()}`;
}
