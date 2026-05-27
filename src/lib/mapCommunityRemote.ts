import { getSupabaseClient } from '@/integrations/supabase/client';

export type MapCommunityMessageDto = {
  id: string;
  author: string;
  role: 'barber' | 'ai' | 'system' | 'admin' | string;
  content: string;
  timestamp: string;
};

export type MapCommunityVideoDto = {
  id: string;
  barberName: string;
  title: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  duration: string;
  views: string;
  gradient?: string;
};

export type MapCommunityFeedResponse = {
  ok: boolean;
  generatedAt?: string;
  messages?: MapCommunityMessageDto[];
  videos?: MapCommunityVideoDto[];
  stats?: {
    activeBarbers: number;
    videosThisWeek: number;
    professionalQuestions: number;
  };
  hasNewPosts?: boolean | null;
  error?: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const client = getSupabaseClient();
  if (!client) return headers;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export async function fetchMapCommunityFeedRemote(): Promise<
  { ok: true; body: MapCommunityFeedResponse } | { ok: false; status?: number; error: string }
> {
  try {
    const res = await fetch('/api/map-community-feed', {
      method: 'GET',
      headers: await authHeaders(),
    });
    const body = (await res.json().catch(() => ({}))) as MapCommunityFeedResponse;
    if (!res.ok || body.ok !== true) {
      return {
        ok: false,
        status: res.status,
        error: String(body.error || `HTTP ${res.status}`),
      };
    }
    return { ok: true, body };
  } catch {
    return { ok: false, error: 'تعذر تحميل مجتمع ماب.' };
  }
}

export async function fetchMapCommunityBadgeRemote(): Promise<{ ok: true; hasNewPosts: boolean } | { ok: false }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false };
  const { data } = await client.auth.getSession();
  if (!data.session?.access_token) return { ok: false };

  try {
    const res = await fetch('/api/map-community-feed?badge=1', {
      method: 'GET',
      headers: await authHeaders(),
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; hasNewPosts?: boolean };
    if (body.ok !== true) return { ok: false };
    return { ok: true, hasNewPosts: Boolean(body.hasNewPosts) };
  } catch {
    return { ok: false };
  }
}

export async function postMapCommunityMessageRemote(input: {
  content: string;
  silentView?: boolean;
}): Promise<
  | { ok: true; message: MapCommunityMessageDto }
  | { ok: false; moderated?: boolean; reply?: string; error?: string }
> {
  try {
    const res = await fetch('/api/map-community-message', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        content: input.content,
        silentView: input.silentView === true,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      moderated?: boolean;
      reply?: string;
      error?: string;
      message?: MapCommunityMessageDto;
    };
    if (body.moderated && body.reply) {
      return { ok: false, moderated: true, reply: body.reply };
    }
    if (!res.ok || body.ok !== true || !body.message) {
      return { ok: false, error: String(body.error || `HTTP ${res.status}`) };
    }
    return { ok: true, message: body.message };
  } catch {
    return { ok: false, error: 'تعذر إرسال الرسالة.' };
  }
}

export async function markMapCommunityReadRemote(): Promise<{ ok: boolean }> {
  try {
    const res = await fetch('/api/map-community-read', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({}),
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return { ok: body.ok === true };
  } catch {
    return { ok: false };
  }
}
