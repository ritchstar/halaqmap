/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type StoreAffiliateAdminRow = {
  id: string;
  email: string;
  display_name: string;
  phone: string;
  city: string;
  channel_plan: string;
  experience: string;
  status: string;
  review_note: string;
  reviewed_at: string | null;
  reviewed_by: string;
  code: string;
  created_at: string;
  updated_at: string;
};

function adminEndpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/admin-store-affiliate`;
  return '/api/admin-store-affiliate';
}

async function adminBearer(accessToken: string): Promise<string | null> {
  const trimmed = String(accessToken ?? '').trim();
  if (trimmed) return trimmed;
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token || null;
}

export function storeAffiliateAdminErrorAr(code: string): string {
  switch (code) {
    case 'not_authenticated':
      return 'انتهت جلسة الأدمن — أعد تسجيل الدخول.';
    case 'forbidden':
    case 'unauthorized':
      return 'لا صلاحية لمراجعة مسوّقي المتجر.';
    case 'not_found':
      return 'الطلب غير موجود.';
    case 'not_pending_review':
      return 'الطلب ليس قيد المراجعة.';
    case 'reject_reason_required':
      return 'اكتب سبب الاعتذار قبل التنفيذ.';
    case 'missing_application_id':
      return 'معرّف الطلب ناقص.';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    default:
      if (code.startsWith('http_')) return `خطأ من الخادم (${code.replace('http_', '')}).`;
      return code || 'تعذّر تنفيذ الإجراء.';
  }
}

export async function adminListStoreAffiliatesRemote(input: {
  accessToken: string;
  status?: string;
}): Promise<{ ok: true; rows: StoreAffiliateAdminRow[] } | { ok: false; error: string }> {
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
      rows?: StoreAffiliateAdminRow[];
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, rows: Array.isArray(json.rows) ? json.rows : [] };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminStoreAffiliateActionRemote(input: {
  accessToken: string;
  action: 'approve' | 'decline';
  applicationId: string;
  reason?: string;
}): Promise<{ ok: true; row?: StoreAffiliateAdminRow } | { ok: false; error: string }> {
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
      row?: StoreAffiliateAdminRow;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, row: json.row };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
