import { getSupabaseClient } from '@/integrations/supabase/client';

const ADMIN_API = '/api/partner-promo-admin';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

export type PartnerPromoAdminStatus = {
  ok: boolean;
  enabled: boolean;
  videoUrl: string | null;
  objectPath: string | null;
  updatedAt: string | null;
  error?: string;
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-client-supabase-url': getClientSupabaseUrl(),
  };
}

export async function fetchPartnerPromoAdminStatus(): Promise<PartnerPromoAdminStatus> {
  const h = await authHeaders();
  if (!h) return { ok: false, enabled: false, videoUrl: null, objectPath: null, updatedAt: null, error: 'غير مسجّل' };
  const res = await fetch(ADMIN_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      enabled: false,
      videoUrl: null,
      objectPath: null,
      updatedAt: null,
      error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    enabled: Boolean(json.enabled),
    videoUrl: typeof json.videoUrl === 'string' && json.videoUrl.trim() ? String(json.videoUrl) : null,
    objectPath: typeof json.objectPath === 'string' && json.objectPath.trim() ? String(json.objectPath) : null,
    updatedAt: typeof json.updatedAt === 'string' && json.updatedAt.trim() ? String(json.updatedAt) : null,
  };
}

export async function requestPartnerPromoSignedUpload(ext: string): Promise<
  | { ok: true; signedUrl: string; path: string; contentType: string }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(ADMIN_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'signedUpload', ext }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  const signedUrl = typeof json.signedUrl === 'string' ? json.signedUrl : '';
  const path = typeof json.path === 'string' ? json.path : '';
  const contentType = typeof json.contentType === 'string' ? json.contentType : 'video/mp4';
  if (!signedUrl || !path) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, signedUrl, path, contentType };
}

export async function commitPartnerPromoUpload(path: string): Promise<PartnerPromoAdminStatus> {
  const h = await authHeaders();
  if (!h) return { ok: false, enabled: false, videoUrl: null, objectPath: null, updatedAt: null, error: 'غير مسجّل' };
  const res = await fetch(ADMIN_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'commit', path }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      enabled: false,
      videoUrl: null,
      objectPath: null,
      updatedAt: null,
      error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    enabled: Boolean(json.enabled),
    videoUrl: typeof json.videoUrl === 'string' && json.videoUrl.trim() ? String(json.videoUrl) : null,
    objectPath: typeof json.objectPath === 'string' && json.objectPath.trim() ? String(json.objectPath) : null,
    updatedAt: typeof json.updatedAt === 'string' && json.updatedAt.trim() ? String(json.updatedAt) : null,
  };
}

export async function setPartnerPromoEnabled(enabled: boolean): Promise<PartnerPromoAdminStatus> {
  const h = await authHeaders();
  if (!h) return { ok: false, enabled: false, videoUrl: null, objectPath: null, updatedAt: null, error: 'غير مسجّل' };
  const res = await fetch(ADMIN_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'setEnabled', enabled }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      enabled: false,
      videoUrl: null,
      objectPath: null,
      updatedAt: null,
      error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    enabled: Boolean(json.enabled),
    videoUrl: typeof json.videoUrl === 'string' && json.videoUrl.trim() ? String(json.videoUrl) : null,
    objectPath: typeof json.objectPath === 'string' && json.objectPath.trim() ? String(json.objectPath) : null,
    updatedAt: typeof json.updatedAt === 'string' && json.updatedAt.trim() ? String(json.updatedAt) : null,
  };
}

export async function clearPartnerPromoVideo(): Promise<PartnerPromoAdminStatus> {
  const h = await authHeaders();
  if (!h) return { ok: false, enabled: false, videoUrl: null, objectPath: null, updatedAt: null, error: 'غير مسجّل' };
  const res = await fetch(ADMIN_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'clear' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      enabled: false,
      videoUrl: null,
      objectPath: null,
      updatedAt: null,
      error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    enabled: Boolean(json.enabled),
    videoUrl: typeof json.videoUrl === 'string' && json.videoUrl.trim() ? String(json.videoUrl) : null,
    objectPath: typeof json.objectPath === 'string' && json.objectPath.trim() ? String(json.objectPath) : null,
    updatedAt: typeof json.updatedAt === 'string' && json.updatedAt.trim() ? String(json.updatedAt) : null,
  };
}
