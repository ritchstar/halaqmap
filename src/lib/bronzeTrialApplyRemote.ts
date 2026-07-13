function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

const APPLY_URL = String(import.meta.env.VITE_BRONZE_TRIAL_APPLY_URL || '/api/bronze-trial-apply').trim();
const CONFIRM_URL = String(
  import.meta.env.VITE_BRONZE_TRIAL_CONFIRM_URL || '/api/bronze-trial-confirm-email',
).trim();

export async function submitBronzeTrialApplicationRemote(input: {
  salonName: string;
  establishmentName: string;
  email: string;
  phone: string;
  whatsapp: string;
  cityAr: string;
  districtAr: string;
  regionAr?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  photoExteriorSignUrl: string;
  photoExterior2Url: string;
  photoInterior1Url: string;
  photoInterior2Url: string;
  uploadOrderId?: string;
  website?: string;
}): Promise<{ ok: true; applicationId: string; confirmEmailSent: boolean } | { ok: false; error: string }> {
  try {
    const resp = await fetch(APPLY_URL, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(input),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      applicationId?: string;
      confirmEmailSent?: boolean;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      applicationId: String(json.applicationId ?? ''),
      confirmEmailSent: json.confirmEmailSent === true,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function confirmBronzeTrialEmailRemote(
  token: string,
): Promise<{ ok: true; messageAr: string } | { ok: false; error: string }> {
  try {
    const resp = await fetch(CONFIRM_URL, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ token }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      messageAr?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      messageAr: String(json.messageAr ?? 'تم تأكيد البريد.'),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export function bronzeTrialApplyErrorAr(code: string): string {
  switch (code) {
    case 'invalid_email':
      return 'البريد غير صالح.';
    case 'missing_names':
      return 'أدخل اسم الصالون واسم المنشأة.';
    case 'missing_phone':
      return 'أدخل الجوال وواتساب.';
    case 'missing_location':
      return 'أدخل المدينة والحي.';
    case 'invalid_coordinates':
      return 'الإحداثيات غير صالحة — استخدم «حدد موقعي» أو أدخلها يدوياً.';
    case 'missing_photos':
      return 'ارفع الصور الأربع المطلوبة بروابط صالحة.';
    case 'application_already_exists':
      return 'يوجد طلب تجربة سابق بهذا البريد قيد المعالجة.';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    default:
      return code || 'تعذّر إرسال الطلب.';
  }
}
