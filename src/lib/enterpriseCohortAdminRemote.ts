import { getSupabaseClient } from '@/integrations/supabase/client';
import {
  ANCHOR_COMMERCIAL,
  ANCHOR_LISTING_DAYS,
  ANCHOR_PARTNER_AL_ENWAN_SLUG,
  ANCHOR_PERKS_TIER_A,
  ANCHOR_PERKS_TIER_B,
  ANCHOR_PERKS_TIER_C_DEFERRED,
  ANCHOR_SEAT_QUOTA,
  ANCHOR_WALLET_SEED_HALALAS,
  AL_ENWAN_COHORT_NAME_AR,
} from '@/config/enterpriseAnchorPartner';

function cohortEndpoint(): string {
  const path = '/api/admin-enterprise-cohort';
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (!base) return path;
  try {
    if (typeof window !== 'undefined') {
      const baseOrigin = new URL(base).origin;
      // نفس الأصل → مسار نسبي (يتجنب إعادة توجيه apex→www التي تسقط Authorization)
      if (baseOrigin === window.location.origin) return path;
      if (
        baseOrigin === 'https://halaqmap.com' &&
        window.location.origin === 'https://www.halaqmap.com'
      ) {
        return path;
      }
    }
  } catch {
    /* ignore bad env URL */
  }
  return `${base}${path}`;
}

function clientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

async function adminBearer(accessToken: string): Promise<string | null> {
  const client = getSupabaseClient();
  // فضّل جلسة حيّة من العميل — التوكن المخزّن في state قد ينتهي أثناء بقاء اللوحة مفتوحة
  if (client) {
    const { data: sessionData } = await client.auth.getSession();
    const fresh = sessionData.session?.access_token?.trim();
    if (fresh) return fresh;
  }
  const trimmed = String(accessToken ?? '').trim();
  return trimmed || null;
}

function adminHeaders(token: string, jsonBody = false): Record<string, string> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (jsonBody) headers['Content-Type'] = 'application/json';
  const url = clientSupabaseUrl();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export function enterpriseCohortAdminErrorAr(code: string): string {
  const normalized = String(code || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  switch (normalized) {
    case 'not_authenticated':
      return 'انتهت جلسة الأدمن — أعد تسجيل الدخول.';
    case 'unauthorized':
      return 'انتهت صلاحية الجلسة أو لم يُرسل التوكن — حدّث الصفحة وأعد الدخول إلى لوحة التحكم.';
    case 'forbidden':
      return 'لا صلاحية لإدارة الشريك المرجعي (مطلوب review_payments أو manage_partner_billing).';
    case 'network_error':
      return 'تعذّر الاتصال بالخادم.';
    case 'cohort_not_found':
      return 'لم يُعثر على مجموعة الشريك المرجعي — طبّق الهجرة 143.';
    case 'seat_not_found':
      return 'المقعد غير موجود.';
    case 'seat_already_activated':
      return 'هذا المقعد مفعّل مسبقاً.';
    case 'seat_revoked':
    case 'seat_already_revoked':
      return 'المقعد ملغى.';
    case 'barber_not_found':
      return 'الحلاق غير موجود.';
    case 'invalid_barber_id':
      return 'معرّف الحلاق غير صالح.';
    case 'email_mismatch':
      return 'بريد الحلاق لا يطابق البريد المربوط بالمقعد.';
    case 'barber_already_has_active_seat':
      return 'هذا الحلاق لديه مقعد مفعّل مسبقاً في نفس المجموعة.';
    case 'cohort_not_active':
      return 'مجموعة الشريك المرجعي غير نشطة.';
    case 'product_not_found':
      return 'منتج diamond_180 غير موجود في كتالوج الرخص.';
    case 'unknown_action':
      return 'إجراء غير معروف.';
    default:
      if (normalized.startsWith('http_')) return `خطأ من الخادم (${normalized.replace('http_', '')}).`;
      return code || 'تعذّر تنفيذ الطلب.';
  }
}

export type EnterpriseCohortSummary = {
  id: string;
  slug: string;
  name_ar: string;
  seat_quota: number;
  listing_days_granted: number;
  wallet_seed_halalas: number;
  status: string;
  marketing_case_study_allowed: boolean;
  perks_tier_a?: unknown;
  perks_tier_b?: unknown;
  perks_tier_c_deferred?: unknown;
  conversion_policy?: string;
  wallet_funding_policy?: string;
  notes?: string | null;
};

export type EnterpriseSeatSummary = {
  id: string;
  seat_index: number;
  branch_label: string | null;
  bound_email: string | null;
  status: string;
  barber_id: string | null;
  activated_at: string | null;
  expires_at: string | null;
  activated_by_admin_email: string | null;
};

export type HqSeatReport = {
  seatId: string;
  seatIndex: number;
  branchLabel: string | null;
  status: string;
  barberId: string | null;
  barberName: string | null;
  barberEmail: string | null;
  boundEmail: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  expiryWarning: boolean;
  shiftEnabled: boolean | null;
  walletBalanceHalalas: number | null;
  activeInstructions: number | null;
  anchorBadge: boolean;
};

export const ENTERPRISE_ANCHOR_UI = {
  slug: ANCHOR_PARTNER_AL_ENWAN_SLUG,
  nameAr: AL_ENWAN_COHORT_NAME_AR,
  seats: ANCHOR_SEAT_QUOTA,
  days: ANCHOR_LISTING_DAYS,
  walletSeedHalalas: ANCHOR_WALLET_SEED_HALALAS,
  walletSeedSar: ANCHOR_WALLET_SEED_HALALAS / 100,
  commercial: ANCHOR_COMMERCIAL,
  perksA: ANCHOR_PERKS_TIER_A,
  perksB: ANCHOR_PERKS_TIER_B,
  perksC: ANCHOR_PERKS_TIER_C_DEFERRED,
} as const;

export async function adminLoadEnterpriseCohortRemote(input: {
  accessToken: string;
  slug?: string;
  view?: 'overview' | 'hq';
}): Promise<
  | {
      ok: true;
      cohorts: EnterpriseCohortSummary[];
      cohort: EnterpriseCohortSummary;
      seats?: EnterpriseSeatSummary[];
      hqSeats?: HqSeatReport[];
      summary?: {
        reserved: number;
        assigned: number;
        activated: number;
        expired: number;
        revoked: number;
        expiringSoon: number;
      };
    }
  | { ok: false; error: string }
> {
  const token = await adminBearer(input.accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };

  const qs = new URLSearchParams();
  qs.set('slug', input.slug || ANCHOR_PARTNER_AL_ENWAN_SLUG);
  if (input.view === 'hq') qs.set('view', 'hq');

  try {
    const resp = await fetch(`${cohortEndpoint()}?${qs.toString()}`, {
      method: 'GET',
      headers: adminHeaders(token),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      cohorts?: EnterpriseCohortSummary[];
      cohort?: EnterpriseCohortSummary;
      seats?: EnterpriseSeatSummary[] | HqSeatReport[];
      summary?: {
        reserved: number;
        assigned: number;
        activated: number;
        expired: number;
        revoked: number;
        expiringSoon: number;
      };
    };
    if (!resp.ok || json.ok === false || !json.cohort) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return {
      ok: true,
      cohorts: json.cohorts ?? [json.cohort],
      cohort: json.cohort,
      seats: input.view === 'hq' ? undefined : (json.seats as EnterpriseSeatSummary[] | undefined),
      hqSeats:
        input.view === 'hq'
          ? ((json.seats as unknown as HqSeatReport[] | undefined) ?? [])
          : undefined,
      summary: json.summary,
    };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

async function postAction(
  accessToken: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  const token = await adminBearer(accessToken);
  if (!token) return { ok: false, error: 'not_authenticated' };
  try {
    const resp = await fetch(cohortEndpoint(), {
      method: 'POST',
      headers: adminHeaders(token, true),
      body: JSON.stringify(body),
    });
    const json = (await resp.json().catch(() => ({}))) as Record<string, unknown> & {
      ok?: boolean;
      error?: string;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: String(json.error || `http_${resp.status}`) };
    }
    return { ok: true, data: json };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function adminAssignEnterpriseSeatRemote(input: {
  accessToken: string;
  seatId: string;
  boundEmail?: string;
  branchLabel?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await postAction(input.accessToken, {
    action: 'assign_seat',
    seatId: input.seatId,
    boundEmail: input.boundEmail,
    branchLabel: input.branchLabel,
  });
  if (!r.ok) return r;
  return { ok: true };
}

export async function adminActivateEnterpriseSeatRemote(input: {
  accessToken: string;
  seatId: string;
  barberId: string;
  requireEmailMatch?: boolean;
}): Promise<
  | { ok: true; validUntil?: string; listingDaysGranted?: number }
  | { ok: false; error: string }
> {
  const r = await postAction(input.accessToken, {
    action: 'activate_seat',
    seatId: input.seatId,
    barberId: input.barberId,
    requireEmailMatch: input.requireEmailMatch !== false,
  });
  if (!r.ok) return r;
  return {
    ok: true,
    validUntil: r.data.validUntil ? String(r.data.validUntil) : undefined,
    listingDaysGranted:
      r.data.listingDaysGranted != null ? Number(r.data.listingDaysGranted) : undefined,
  };
}

export async function adminRevokeEnterpriseSeatRemote(input: {
  accessToken: string;
  seatId: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await postAction(input.accessToken, {
    action: 'revoke_seat',
    seatId: input.seatId,
    reason: input.reason,
  });
  if (!r.ok) return r;
  return { ok: true };
}
