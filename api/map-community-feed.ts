/**
 * GET /api/map-community-feed
 * Combined Map Community messages + YouTube video metadata.
 * Optional Authorization for hasNewPosts + read cursor context.
 * Query: ?badge=1 → lightweight badge-only response (auth required).
 */
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import {
  computeHasNewCommunityPosts,
  createServiceSupabase,
  verifyMapCommunityActor,
} from './_lib/mapCommunityAuth.js';
import { parseYoutubeVideoId } from './_lib/youtubeUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
};

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function formatDuration(seconds: number | null | undefined): string {
  const n = typeof seconds === 'number' && Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mm = String(Math.floor(n / 60)).padStart(2, '0');
  const ss = String(n % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatViews(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return json({ ok: false, error: 'Server not configured' }, 503, headers);
  }

  const supabase = createServiceSupabase(serverUrl, serviceRole);
  const urlObj = new URL(request.url);
  const badgeOnly = urlObj.searchParams.get('badge') === '1';

  const token = request.headers.get('authorization')?.trim() || '';
  const hasAuth = token.startsWith('Bearer ') && token.length > 'Bearer '.length + 8;
  let userId: string | null = null;

  if (hasAuth) {
    const actor = await verifyMapCommunityActor(request, supabase);
    if (actor.ok) userId = actor.userId;
  }

  if (badgeOnly) {
    if (!userId) {
      return json({ ok: false, error: 'Unauthorized' }, 401, { ...headers, 'Cache-Control': 'private, no-store' });
    }
    const hasNewPosts = await computeHasNewCommunityPosts(supabase, userId);
    return json(
      { ok: true, hasNewPosts, generatedAt: new Date().toISOString() },
      200,
      { ...headers, 'Cache-Control': 'private, no-store' },
    );
  }

  const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [messagesRes, videosRes, activeBarbersRes, weekVideosRes, weekQuestionsRes] = await Promise.all([
    supabase
      .from('map_community_messages')
      .select('id, author_display_name, author_role, content, created_at')
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })
      .limit(200),
    supabase
      .from('map_community_videos')
      .select('id, barber_display_name, title, youtube_url, duration_seconds, view_count, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(40),
    supabase.from('barbers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('map_community_videos')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .gte('created_at', sinceWeek),
    supabase
      .from('map_community_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_hidden', false)
      .gte('created_at', sinceWeek),
  ]);

  if (messagesRes.error || videosRes.error) {
    return json(
      {
        ok: false,
        error: messagesRes.error?.message || videosRes.error?.message || 'Feed query failed',
      },
      503,
      headers,
    );
  }

  const messages = (messagesRes.data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      author: String(r.author_display_name || 'عضو'),
      role: String(r.author_role || 'barber'),
      content: String(r.content || ''),
      timestamp: String(r.created_at || new Date().toISOString()),
    };
  });

  const videos = (videosRes.data ?? [])
    .map((row) => {
      const r = row as Record<string, unknown>;
      const youtubeUrl = String(r.youtube_url || '');
      const videoId = parseYoutubeVideoId(youtubeUrl);
      if (!videoId) return null;
      return {
        id: String(r.id),
        barberName: String(r.barber_display_name || 'حلاق ماب'),
        title: String(r.title || ''),
        youtubeUrl,
        youtubeVideoId: videoId,
        duration: formatDuration(r.duration_seconds as number | null),
        views: formatViews(Number(r.view_count) || 0),
        createdAt: String(r.created_at || new Date().toISOString()),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const hasNewPosts = userId ? await computeHasNewCommunityPosts(supabase, userId) : null;
  const generatedAt = new Date().toISOString();

  return json(
    {
      ok: true,
      generatedAt,
      messages,
      videos,
      stats: {
        activeBarbers: activeBarbersRes.count ?? 0,
        videosThisWeek: weekVideosRes.count ?? 0,
        professionalQuestions: weekQuestionsRes.count ?? 0,
      },
      hasNewPosts,
    },
    200,
    { ...headers, ...CACHE_HEADERS },
  );
}
