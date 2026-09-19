/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تسجيل مدرسة البلوت — عميل واجهة يتحدث مع /api/baloot-school-register
 * و/api/baloot-school-confirm-email فقط (بلا Supabase مباشرة من المتصفح).
 */
function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

const REGISTER_URL = String(
  import.meta.env.VITE_BALOOT_SCHOOL_REGISTER_URL || '/api/baloot-school-register',
).trim();
const CONFIRM_URL = String(
  import.meta.env.VITE_BALOOT_SCHOOL_CONFIRM_URL || '/api/baloot-school-confirm-email',
).trim();

export async function submitBalootSchoolRegistrationRemote(input: {
  fullName: string;
  email: string;
  /** حقل فخ للبوتات — يجب أن يبقى فارغاً */
  website?: string;
}): Promise<
  | { ok: true; registrationId: string; confirmEmailSent: boolean; alreadyRegistered: boolean }
  | { ok: false; error: string }
> {
  try {
    const resp = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        website: input.website ?? '',
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      registrationId?: string;
      confirmEmailSent?: boolean;
      alreadyRegistered?: boolean;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      registrationId: String(json.registrationId ?? ''),
      confirmEmailSent: json.confirmEmailSent === true,
      alreadyRegistered: json.alreadyRegistered === true,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function confirmBalootSchoolEmailRemote(
  token: string,
): Promise<
  | { ok: true; registrationId: string; fullName: string; messageAr: string }
  | { ok: false; error: string }
> {
  try {
    const resp = await fetch(CONFIRM_URL, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ token }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      registrationId?: string;
      fullName?: string;
      messageAr?: string;
    };
    // يجب أن يكون ok === true صراحةً — وإلا يظهر نجاح وهمي دون تحديث القاعدة.
    if (!resp.ok || json.ok !== true) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      registrationId: String(json.registrationId ?? ''),
      fullName: String(json.fullName ?? ''),
      messageAr: String(json.messageAr ?? 'تم تأكيد البريد.'),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export function balootSchoolRegisterErrorAr(code: string): string {
  switch (code) {
    case 'invalid_email':
      return 'البريد الإلكتروني غير صالح.';
    case 'missing_name':
      return 'أدخل اسمك الكامل.';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً.';
    case 'server_misconfigured':
      return 'الخدمة غير متاحة مؤقتاً. حاول لاحقاً.';
    default:
      return code || 'تعذّر إرسال طلب التسجيل.';
  }
}

export function balootSchoolConfirmErrorAr(code: string): string {
  switch (code) {
    case 'token_expired':
      return 'انتهت صلاحية رابط التأكيد (٤٨ ساعة). سجّل مجدداً بنفس البريد لإعادة الإرسال.';
    case 'email_mismatch':
    case 'invalid_token':
      return 'رابط التأكيد غير صالح. تأكد من نسخه كاملاً من رسالة البريد.';
    case 'registration_not_found':
      return 'لم نعثر على هذا التسجيل.';
    case 'invalid_status':
      return 'هذا التسجيل بحالة لا تسمح بالتأكيد الآن.';
    case 'missing_token':
      return 'رابط التأكيد غير مكتمل.';
    default:
      return code || 'تعذّر تأكيد البريد.';
  }
}
