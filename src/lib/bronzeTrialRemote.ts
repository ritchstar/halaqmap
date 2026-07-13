import { getSupabaseClient } from '@/integrations/supabase/client';

function trialCodesEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-bronze-trial-codes`;
  return '/api/admin-bronze-trial-codes';
}

async function adminBearer(accessToken: string): Promise<string | null> {
  const trimmed = String(accessToken ?? '').trim();
  if (trimmed) return trimmed;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: sessionData } = await client.auth.getSession();
  return sessionData.session?.access_token || null;
}

export function bronzeTrialAdminErrorAr(code: string): string {
  switch (code) {
    case 'voucher_pepper_not_configured':
      return 'إعداد الخادم ناقص: أضف LISTING_LICENSE_VOUCHER_PEPPER في Vercel (16 حرفاً فأكثر) ثم أعد النشر.';
    case 'not_authenticated':
      return 'انتهت جلسة الأدمن — أعد تسجيل الدخول.';
    case 'unauthorized':
    case 'forbidden':
      return 'لا صلاحية لتوليد أكواد التجربة (مطلوب review_payments أو manage_partner_billing).';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    case 'code_insert_failed':
      return 'فشل حفظ الكود في القاعدة.';
    default:
      if (code.startsWith('http_')) return `خطأ من الخادم (${code.replace('http_', '')}).`;
      return code || 'تعذّر توليد الأكواد.';
  }
}

export async function adminIssueBronzeTrialCodesRemote(input: {
  accessToken: string;
  count: number;
  note?: string;
}): Promise<{ ok: true; codes: string[]; count: number; hint?: string } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(trialCodesEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ count: input.count, note: input.note ?? '' }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      codes?: string[];
      count?: number;
      hint?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      codes: Array.isArray(json.codes) ? json.codes : [],
      count: Number(json.count ?? 0),
      hint: json.hint,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export type BronzeTrialCodeRow = {
  id: string;
  status: string;
  created_at: string;
  created_by_admin_email: string | null;
  note: string | null;
  redeemed_at: string | null;
  redeemed_barber_id: string | null;
  redeemed_registration_request_id: string | null;
};

export async function adminListBronzeTrialCodesRemote(input: {
  accessToken: string;
}): Promise<{ ok: true; rows: BronzeTrialCodeRow[] } | { ok: false; error: string }> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  try {
    const resp = await fetch(trialCodesEndpoint(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      rows?: BronzeTrialCodeRow[];
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
