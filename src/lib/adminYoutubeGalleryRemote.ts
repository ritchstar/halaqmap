/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { PlatformYoutubePageId } from '@/config/platformYoutubeGallery';
import type { PlatformYoutubeBox } from '@/lib/platformYoutubeGallery';

export type AdminYoutubeGalleryPayload =
  | {
      ok: true;
      page: PlatformYoutubePageId;
      draftBoxes: PlatformYoutubeBox[];
      publishedBoxes: PlatformYoutubeBox[];
      publishedAt: string | null;
      updatedAt: string | null;
    }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/admin-youtube-gallery`;
}

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token?.trim()) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.trim()}`,
  };
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export async function fetchAdminYoutubeGallery(page: PlatformYoutubePageId): Promise<AdminYoutubeGalleryPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(`${endpoint()}?page=${encodeURIComponent(page)}`, { method: 'GET', headers });
    const json = (await res.json().catch(() => ({}))) as AdminYoutubeGalleryPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'تعذر التحميل.' };
    return json;
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}

export async function saveAdminYoutubeGallery(
  page: PlatformYoutubePageId,
  boxes: PlatformYoutubeBox[],
): Promise<AdminYoutubeGalleryPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'save', page, boxes }),
    });
    const json = (await res.json().catch(() => ({}))) as AdminYoutubeGalleryPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'تعذر الحفظ.' };
    return json;
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}

export async function publishAdminYoutubeGallery(page: PlatformYoutubePageId): Promise<AdminYoutubeGalleryPayload> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'no_session' };
  try {
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'publish', page }),
    });
    const json = (await res.json().catch(() => ({}))) as AdminYoutubeGalleryPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'تعذر النشر.' };
    return json;
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}
