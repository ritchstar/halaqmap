/**
 * التحقق من دفع ميسر عبر السيرفر (يحمي مفتاح السرّ).
 */

function registrationApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '')
    .trim()
    .replace(/\/$/, '');
}

function supabaseVerifyEndpoint(): string | null {
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/functions/v1/verify-moyasar-payment`;
}

/**
 * على نشر Preview (نطاق `*.vercel.app`) نبقى على نفس الأصل الحالي، ونتجاهل
 * أصل الإنتاج المُهيّأ (VITE_REGISTRATION_API_ORIGIN / VITE_VERIFY_MOYSAR_PAYMENT_URL)
 * لأن الطلب عبر الأصول (cross-origin) نحو الإنتاج يُرفض بـ CORS («Failed to fetch»).
 */
function isVercelPreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.toLowerCase().endsWith('.vercel.app');
}

function vercelVerifyEndpoint(): string {
  if (typeof window !== 'undefined' && isVercelPreviewHost()) {
    return `${window.location.origin.replace(/\/$/, '')}/api/verify-moyasar-payment`;
  }

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

function verifyEndpoints(): string[] {
  const endpoints: string[] = [];
  // (1) مسار نسبي نفس-الأصل أولاً — مناعة تامة ضد CORS واختلاف النطاق مهما كان
  //     أصل الصفحة (معاينة/إنتاج). fetch يحلّه على أصل الصفحة الحالي دائماً.
  if (typeof window !== 'undefined') {
    endpoints.push('/api/verify-moyasar-payment');
  }
  // (2) عنوان Vercel المطلق (للـ SSR أو الأصل المُهيّأ صراحةً).
  endpoints.push(vercelVerifyEndpoint());
  // (3) دالة Supabase Edge كملاذ أخير (عبر الأصول — قد تتطلب CORS).
  const supabase = supabaseVerifyEndpoint();
  if (supabase) endpoints.push(supabase);
  return [...new Set(endpoints)];
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
  const retryDelaysMs = [0, 2000, 4000, 6000, 10000];
  let lastResult: VerifyMoyasarPaymentResult = {
    ok: false,
    error: 'network',
    hint: 'تعذر الاتصال بخادم التحقق من الدفع.',
  };

  for (let attempt = 0; attempt < retryDelaysMs.length; attempt += 1) {
    if (retryDelaysMs[attempt]! > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]!));
    }
    lastResult = await verifyMoyasarPaymentRemoteOnce(paymentId, opts);
    if (!lastResult.ok) return lastResult;
    if (lastResult.paid) return lastResult;
    const status = String(lastResult.status || '').toLowerCase();
    if (status === 'failed' || status === 'voided' || status === 'refunded') return lastResult;
    if (!['', 'initiated', 'pending', 'authorized', 'processing'].includes(status)) return lastResult;
  }

  return lastResult;
}

async function verifyMoyasarPaymentRemoteOnce(
  paymentId: string,
  opts?: { expectedAmountHalalas?: number; expectedCurrency?: string },
): Promise<VerifyMoyasarPaymentResult> {
  const q = new URLSearchParams({ paymentId: paymentId.trim() });
  if (opts?.expectedAmountHalalas != null && Number.isFinite(opts.expectedAmountHalalas)) {
    q.set('expectedAmount', String(Math.floor(opts.expectedAmountHalalas)));
  }
  if (opts?.expectedCurrency) {
    q.set('expectedCurrency', opts.expectedCurrency.trim().toUpperCase());
  }
  const query = q.toString();

  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  let lastFailure: VerifyMoyasarPaymentResult = {
    ok: false,
    error: 'network',
    hint: 'تعذر الاتصال بخادم التحقق من الدفع.',
  };

  for (const base of verifyEndpoints()) {
    const url = `${base}?${query}`;
    const headers: Record<string, string> = {};
    if (base.includes('/functions/v1/verify-moyasar-payment') && anonKey) {
      headers.apikey = anonKey;
      headers.Authorization = `Bearer ${anonKey}`;
    }

    try {
      const res = await fetch(url, { method: 'GET', credentials: 'omit', headers });
      let data: Record<string, unknown>;
      try {
        data = await readJsonResponse(res);
      } catch (parseError) {
        lastFailure = {
          ok: false,
          error: 'invalid_response',
          hint: parseError instanceof Error ? parseError.message : 'تعذر قراءة استجابة خادم التحقق.',
          status: res.status,
        };
        continue;
      }

      if (!res.ok) {
        const err = String(data.error || 'request_failed');
        const hint = data.hint != null ? String(data.hint) : undefined;
        const message = data.message != null ? String(data.message) : undefined;
        lastFailure = { ok: false, error: err, hint, message, status: res.status };
        if (res.status === 502 || err === 'upstream_network' || err === 'invalid_response') {
          continue;
        }
        return lastFailure;
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
      lastFailure = {
        ok: false,
        error: 'network',
        hint:
          error instanceof Error
            ? `تعذر الاتصال بخادم التحقق (${error.message}).`
            : 'تعذر الاتصال بخادم التحقق من الدفع.',
      };
    }
  }

  return lastFailure;
}
