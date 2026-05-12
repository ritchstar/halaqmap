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

export type PlatformResourceSnapshot = {
  generated_at: string;
  registration_uploads: RegistrationUploadsSnapshot;
  partner_promo: PartnerPromoSnapshot;
  logs: {
    search_activity_logs_count: number;
    payment_security_events_count: number;
  };
};

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
    logs: {
      search_activity_logs_count: num(logs?.search_activity_logs_count),
      payment_security_events_count: num(logs?.payment_security_events_count),
    },
  };
}

export async function fetchPlatformResourceSnapshot(): Promise<
  { ok: true; data: PlatformResourceSnapshot } | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { data, error } = await client.rpc('get_platform_resource_snapshot');
  if (error) {
    return {
      ok: false,
      error:
        error.message +
        ' — إن ظهرت لأول مرة، نفّذ ترحيل 66_platform_resource_snapshot_and_purge.sql عبر supabase db push.',
    };
  }
  const parsed = parseSnapshot(data);
  if (!parsed) return { ok: false, error: 'استجابة غير متوقعة من get_platform_resource_snapshot' };
  return { ok: true, data: parsed };
}

export async function adminPurgeRegistrationStorageRemote(): Promise<
  { ok: true; result: Record<string, unknown> } | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const { data, error } = await client.rpc('admin_purge_registration_storage_objects');
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: (data ?? {}) as Record<string, unknown> };
}

export async function adminPurgePartnerPromoStorageRemote(): Promise<
  { ok: true; result: Record<string, unknown> } | { ok: false; error: string }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const { data, error } = await client.rpc('admin_purge_partner_promo_storage_objects');
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: (data ?? {}) as Record<string, unknown> };
}

export async function adminPurgeOldPlatformLogsRemote(
  days: number
): Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  const { data, error } = await client.rpc('admin_purge_old_platform_logs', { p_days: days });
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: (data ?? {}) as Record<string, unknown> };
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
