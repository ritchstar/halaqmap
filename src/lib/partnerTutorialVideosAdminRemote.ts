import { getSupabaseClient } from '@/integrations/supabase/client';

const API = '/api/partner-tutorial-videos-admin';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

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

export type TutorialVideoAdminRow = {
  id: string;
  title: string;
  description: string | null;
  object_path: string;
  sort_order: number;
  is_published: boolean;
  previewUrl: string | null;
};

export async function fetchTutorialVideosAdmin(): Promise<{ ok: true; rows: TutorialVideoAdminRow[] } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  return { ok: true, rows: Array.isArray(json.rows) ? (json.rows as TutorialVideoAdminRow[]) : [] };
}

export async function requestTutorialVideoSignedUpload(ext: string) {
  const h = await authHeaders();
  if (!h) return { ok: false as const, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'POST', headers: h, body: JSON.stringify({ action: 'signedUpload', ext }) });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false as const, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  return {
    ok: true as const,
    signedUrl: String(json.signedUrl || ''),
    path: String(json.path || ''),
    contentType: String(json.contentType || 'video/mp4'),
  };
}

export async function createTutorialVideo(input: { path: string; title: string; description?: string; sortOrder?: number }) {
  const h = await authHeaders();
  if (!h) return { ok: false as const, error: 'غير مسجّل' };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'create', path: input.path, title: input.title, description: input.description || '', sortOrder: input.sortOrder || 0 }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false as const, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  return { ok: true as const };
}

export async function updateTutorialVideo(input: { id: string; title?: string; description?: string; sortOrder?: number; isPublished?: boolean }) {
  const h = await authHeaders();
  if (!h) return { ok: false as const, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'POST', headers: h, body: JSON.stringify({ action: 'update', ...input }) });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false as const, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  return { ok: true as const };
}

export async function deleteTutorialVideo(id: string) {
  const h = await authHeaders();
  if (!h) return { ok: false as const, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'POST', headers: h, body: JSON.stringify({ action: 'delete', id }) });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false as const, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  return { ok: true as const };
}

