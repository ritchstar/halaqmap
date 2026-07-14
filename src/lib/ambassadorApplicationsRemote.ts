import { getSupabaseClient } from '@/integrations/supabase/client';
import { AMBASSADOR_RULES_VERSION } from '@/config/ambassadorFieldRulesPolicy';

function applyEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/ambassador-apply`;
  return '/api/ambassador-apply';
}

function adminEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-ambassador-applications`;
  return '/api/admin-ambassador-applications';
}

async function adminBearer(accessToken: string): Promise<string | null> {
  const trimmed = String(accessToken ?? '').trim();
  if (trimmed) return trimmed;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}

export function ambassadorApplyErrorAr(code: string): string {
  switch (code) {
    case 'invalid_display_name':
      return 'الاسم الظاهر غير صالح.';
    case 'invalid_phone':
      return 'رقم الجوال غير صالح.';
    case 'invalid_coverage':
      return 'اكتب نطاقاً جغرافياً أوضح.';
    case 'invalid_experience':
      return 'اشرح خبرتك بجملة أوضح (20 حرفاً على الأقل).';
    case 'rules_not_accepted':
      return 'يجب الموافقة على وثيقة القواعد.';
    case 'phone_already_applied':
      return 'يوجد طلب نشط مسبقاً بنفس رقم الجوال.';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    default:
      return code || 'تعذّر إرسال الطلب.';
  }
}

export function ambassadorAdminErrorAr(code: string): string {
  switch (code) {
    case 'not_authenticated':
      return 'انتهت جلسة الأدمن — أعد تسجيل الدخول.';
    case 'forbidden':
    case 'unauthorized':
      return 'لا صلاحية لمراجعة السفراء.';
    case 'not_found':
      return 'الطلب غير موجود.';
    case 'not_pending_review':
      return 'الطلب ليس قيد المراجعة.';
    case 'reject_reason_required':
      return 'اكتب سبب الرفض قبل التنفيذ.';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    default:
      if (code.startsWith('http_')) return `خطأ من الخادم (${code.replace('http_', '')}).`;
      return code || 'تعذّر تنفيذ الإجراء.';
  }
}

export async function submitAmbassadorApplicationRemoteApi(input: {
  displayName: string;
  phone: string;
  email?: string;
  coverageArea: string;
  salesExperience: string;
  socialProofUrl?: string;
  socialProofLabel?: string;
}): Promise<
  | { ok: true; id: string; code: string; accountStatus: string }
  | { ok: false; error: string }
> {
  try {
    const resp = await fetch(applyEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        rulesVersion: AMBASSADOR_RULES_VERSION,
        website: '',
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      id?: string;
      code?: string;
      accountStatus?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      id: String(json.id ?? ''),
      code: String(json.code ?? ''),
      accountStatus: String(json.accountStatus ?? 'pending_review'),
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export type AmbassadorApplicationAdminRow = {
  id: string;
  code: string;
  display_name: string;
  phone: string;
  email: string | null;
  account_status: string;
  coverage_area: string | null;
  sales_experience: string | null;
  social_proof_url: string | null;
  social_proof_path: string | null;
  application_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_email: string | null;
  reject_reason: string | null;
  rules_version_accepted: string | null;
  rules_accepted_at: string | null;
  first_barber_close_at: string | null;
  created_at: string;
};

export async function adminListAmbassadorApplicationsRemote(input: {
  accessToken: string;
  status?: string;
}): Promise<
  | { ok: true; rows: AmbassadorApplicationAdminRow[] }
  | { ok: false; error: string }
> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  const url = input.status
    ? `${adminEndpoint()}?status=${encodeURIComponent(input.status)}`
    : adminEndpoint();
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      rows?: AmbassadorApplicationAdminRow[];
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminAmbassadorApplicationActionRemote(input: {
  accessToken: string;
  action: 'approve' | 'reject';
  applicationId: string;
  reason?: string;
}): Promise<{ ok: true; row?: AmbassadorApplicationAdminRow } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  try {
    const resp = await fetch(adminEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: input.action,
        applicationId: input.applicationId,
        reason: input.reason ?? '',
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      row?: AmbassadorApplicationAdminRow;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, row: json.row };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
