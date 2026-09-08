/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';

export type RegistrationUploadsSnapshot = {
  object_count: number;
  approx_bytes: number;
  banner_object_count: number;
};

export type PartnerPromoSnapshot = {
  object_count: number;
  approx_bytes: number;
};

export type BarberPortfolioSnapshot = {
  object_count: number;
  approx_bytes: number;
};

export type PlatformResourceSnapshot = {
  generated_at: string;
  registration_uploads: RegistrationUploadsSnapshot;
  partner_promo: PartnerPromoSnapshot;
  barber_portfolio: BarberPortfolioSnapshot;
  logs: {
    search_activity_logs_count: number;
    payment_security_events_count: number;
  };
};

const API = '/api/admin-platform-resources';

function apiOrigin(): string {
  return String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
}

function endpoint(): string {
  const base = apiOrigin();
  return base ? `${base}${API}` : API;
}

function clientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

async function adminAuthHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const url = clientSupabaseUrl();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

function parseSnapshot(raw: unknown): PlatformResourceSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const reg = o.registration_uploads as Record<string, unknown> | undefined;
  const pr = o.partner_promo as Record<string, unknown> | undefined;
  const bp = o.barber_portfolio as Record<string, unknown> | undefined;
  const logs = o.logs as Record<string, unknown> | undefined;
  return {
    generated_at: typeof o.generated_at === 'string' ? o.generated_at : new Date().toISOString(),
    registration_uploads: {
      object_count: num(reg?.object_count),
      approx_bytes: num(reg?.approx_bytes),
      banner_object_count: num(reg?.banner_object_count),
    },
    partner_promo: {
      object_count: num(pr?.object_count),
      approx_bytes: num(pr?.approx_bytes),
    },
    barber_portfolio: {
      object_count: num(bp?.object_count),
      approx_bytes: num(bp?.approx_bytes),
    },
    logs: {
      search_activity_logs_count: num(logs?.search_activity_logs_count),
      payment_security_events_count: num(logs?.payment_security_events_count),
    },
  };
}

async function postPurge(
  op: 'purge_registration' | 'purge_promo' | 'purge_logs',
  days?: number,
): Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }> {
  const headers = await adminAuthHeaders();
  if (!headers) return { ok: false, error: 'يجب تسجيل الدخول كمدير' };

  try {
    const resp = await fetch(endpoint(), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(days != null ? { op, days } : { op }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      data?: Record<string, unknown>;
    };
    if (!resp.ok || json.ok === false) {
      return { ok: false, error: json.error || `HTTP ${resp.status}` };
    }
    return { ok: true, result: (json.data ?? {}) as Record<string, unknown> };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم' };
  }
}

export async function fetchPlatformResourceSnapshot(): Promise<
  { ok: true; data: PlatformResourceSnapshot } | { ok: false; error: string }
> {
  const headers = await adminAuthHeaders();
  if (!headers) return { ok: false, error: 'يجب تسجيل الدخول كمدير' };

  try {
    const resp = await fetch(endpoint(), {
      method: 'GET',
      headers,
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      data?: unknown;
    };
    if (!resp.ok || json.ok === false) {
      return {
        ok: false,
        error:
          (json.error || `HTTP ${resp.status}`) +
          ' — تأكد من نشر ترحيل 205 ومسار /api/admin-platform-resources.',
      };
    }
    const parsed = parseSnapshot(json.data);
    if (!parsed) return { ok: false, error: 'استجابة غير متوقعة من get_platform_resource_snapshot' };
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم' };
  }
}

export async function adminPurgeRegistrationStorageRemote(): Promise<
  { ok: true; result: Record<string, unknown> } | { ok: false; error: string }
> {
  return postPurge('purge_registration');
}

export async function adminPurgePartnerPromoStorageRemote(): Promise<
  { ok: true; result: Record<string, unknown> } | { ok: false; error: string }
> {
  return postPurge('purge_promo');
}

export async function adminPurgeOldPlatformLogsRemote(
  days: number,
): Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }> {
  return postPurge('purge_logs', days);
}

/** حصة تخزين افتراضية للعرض (غيّرها عبر VITE_SUPABASE_STORAGE_QUOTA_GB في البناء) */
export function getConfiguredStorageQuotaGb(): number {
  const raw = String(import.meta.env.VITE_SUPABASE_STORAGE_QUOTA_GB || '').trim();
  const n = raw ? Number.parseFloat(raw) : 8;
  return Number.isFinite(n) && n > 0 ? n : 8;
}

export function formatBytesArabic(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${Math.round(bytes)} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} ميجابايت`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجابايت`;
}
