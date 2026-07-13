const REDEEM_ENDPOINT = String(
  import.meta.env.VITE_BRONZE_TRIAL_REDEEM_URL || '/api/bronze-trial-redeem',
).trim();

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export async function redeemBronzeTrialRemote(input: {
  code: string;
  requestId?: string;
  linkedBarberId?: string;
}): Promise<
  | {
      ok: true;
      barberId: string;
      validUntil: string;
      listingDaysGranted: number;
      messageAr: string;
    }
  | { ok: false; error: string }
> {
  try {
    const resp = await fetch(REDEEM_ENDPOINT, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        code: input.code,
        requestId: input.requestId || undefined,
        linkedBarberId: input.linkedBarberId || undefined,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      barberId?: string;
      validUntil?: string;
      listingDaysGranted?: number;
      messageAr?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      barberId: String(json.barberId ?? ''),
      validUntil: String(json.validUntil ?? ''),
      listingDaysGranted: Number(json.listingDaysGranted ?? 30),
      messageAr: String(json.messageAr ?? 'تم تفعيل التجربة.'),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export function bronzeTrialErrorMessageAr(code: string): string {
  switch (code) {
    case 'invalid_trial_code':
      return 'رمز التجربة غير صالح.';
    case 'trial_code_not_found':
      return 'رمز التجربة غير موجود.';
    case 'trial_code_already_used':
      return 'هذا الرمز مستخدَم مسبقاً.';
    case 'trial_code_revoked':
      return 'هذا الرمز ملغى.';
    case 'trial_bronze_only':
      return 'رمز التجربة للباقة البرونزية فقط — اختر البرونزي في الطلب.';
    case 'trial_already_used_for_barber':
      return 'سبق تفعيل تجربة برونزية لهذا الصالون.';
    case 'missing_registration_or_barber':
      return 'أكمل طلب التسجيل أولاً ثم أدخل الرمز.';
    case 'registration_not_found':
      return 'طلب التسجيل غير موجود.';
    case 'voucher_pepper_not_configured':
      return 'إعداد الخادم غير مكتمل — تواصل مع الدعم.';
    default:
      return 'تعذّر تفعيل رمز التجربة. حاول لاحقاً أو ادفع عبر ميسر.';
  }
}
