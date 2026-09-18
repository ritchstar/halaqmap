/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * عميل دفع مدرسة الشطرنج الاحترافية — يتحدث مع /api/chess-school-pay فقط.
 */
const PAY_API_PATH = '/api/chess-school-pay';

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

function chessSchoolPayEndpoint(): string {
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${PAY_API_PATH}`;
  return PAY_API_PATH;
}

function payErrorAr(status: number, raw: unknown): string {
  const code = typeof raw === 'string' ? raw.trim() : '';
  switch (code) {
    case 'registration_not_found':
      return 'لم نعثر على هذا التسجيل. تأكد من الرابط أو سجّل من جديد.';
    case 'email_not_confirmed':
      return 'أكّد بريدك أولاً قبل إتمام الدفع.';
    case 'payment_not_completed':
      return 'الدفع لم يكتمل بعد. أعد المحاولة من النموذج.';
    case 'amount_mismatch':
    case 'metadata_mismatch':
      return 'تعذر مطابقة الدفع. تواصل معنا إن استمرت المشكلة.';
    case 'moyasar_disabled':
      return 'بوابة الدفع غير مهيأة حالياً. حاول لاحقاً.';
    default:
      break;
  }
  if (status === 404) return 'تعذر الوصول لمسار الدفع. حدّث الصفحة ثم أعد المحاولة.';
  if (status === 403 || status === 429) return 'رُفض الطلب مؤقتاً. حدّث الصفحة ثم أعد المحاولة.';
  return code || 'تعذر التحقق من الدفع. أعد المحاولة.';
}

async function postAction(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const res = await fetch(chessSchoolPayEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: payErrorAr(res.status, data.error) };
    }
    return { ok: true, ...(data as Record<string, unknown>) };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function fetchChessSchoolPay(registrationId: string) {
  return postAction({ action: 'get_public', registrationId });
}

export async function activateChessSchoolPay(registrationId: string, paymentId: string) {
  return postAction({ action: 'activate_paid', registrationId, paymentId });
}
