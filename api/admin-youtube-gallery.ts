/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسودة صناديق اليوتيوب ثم النشر. لا وصول عام.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  isPlatformYoutubePageId,
  parseYoutubeBoxes,
  parseYoutubeDraftBoxes,
  PLATFORM_YOUTUBE_GALLERY_TABLE,
} from './_lib/platformYoutubeGallery.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const ADMIN_PERMS = ['view_overview', 'manage_partner_marketing'] as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function persistError(error: { message?: string; code?: string } | null, fallback: string): string {
  const msg = String(error?.message || error?.code || '');
  if (/does not exist|schema cache|PGRST205|42P01/i.test(msg)) return 'جدول الصناديق غير مُعد بعد.';
  if (/permission denied|42501|row-level security|RLS/i.test(msg)) return 'صلاحية الحفظ غير مكتملة.';
  return fallback;
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function authorize(request: Request, headers: Record<string, string>) {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return { ok: false as const, response: json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers) };
  const auth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [...ADMIN_PERMS]);
  if (!auth.ok) {
    return { ok: false as const, response: json({ ok: false, error: 'غير مصرّح.' }, auth.status || 401, headers) };
  }
  const db = serviceClient();
  if (!db) return { ok: false as const, response: json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers) };
  return { ok: true as const, db, email: String(auth.actorEmail || '') };
}

async function readGallery(db: NonNullable<ReturnType<typeof serviceClient>>, page: string) {
  const { data, error } = await db
    .from(PLATFORM_YOUTUBE_GALLERY_TABLE)
    .select('draft_boxes, published_boxes, published_at, updated_at')
    .eq('page_id', page)
    .maybeSingle();
  if (error) return null;
  return {
    draftBoxes: parseYoutubeDraftBoxes(data?.draft_boxes),
    publishedBoxes: parseYoutubeBoxes(data?.published_boxes),
    publishedAt: typeof data?.published_at === 'string' ? data.published_at : null,
    updatedAt: typeof data?.updated_at === 'string' ? data.updated_at : null,
  };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const gate = await authorize(request, headers);
  if (!gate.ok) return gate.response;
  const page = new URL(request.url).searchParams.get('page') || '';
  if (!isPlatformYoutubePageId(page)) return json({ ok: false, error: 'صفحة غير معروفة.' }, 400, headers);
  const gallery = await readGallery(gate.db, page);
  if (!gallery) return json({ ok: false, error: 'تعذر القراءة.' }, 500, headers);
  return json({ ok: true, page, ...gallery }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const gate = await authorize(request, headers);
  if (!gate.ok) return gate.response;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'طلب غير صالح.' }, 400, headers);
  }
  const page = String(body.page || body.pageId || '');
  if (!isPlatformYoutubePageId(page)) return json({ ok: false, error: 'صفحة غير معروفة.' }, 400, headers);
  const action = String(body.action || 'save');
  if (action === 'save') {
    const draftBoxes = parseYoutubeDraftBoxes(body.boxes);
    const { error } = await gate.db
      .from(PLATFORM_YOUTUBE_GALLERY_TABLE)
      .upsert(
        {
          page_id: page,
          draft_boxes: draftBoxes,
          updated_at: new Date().toISOString(),
          updated_by: gate.email.slice(0, 120),
        },
        { onConflict: 'page_id' },
      );
    if (error) return json({ ok: false, error: persistError(error, 'تعذر الحفظ.') }, 500, headers);
  } else if (action === 'publish') {
    const current = await readGallery(gate.db, page);
    if (!current) return json({ ok: false, error: 'تعذر القراءة.' }, 500, headers);
    const publishedBoxes = parseYoutubeBoxes(current.draftBoxes);
    const { error } = await gate.db
      .from(PLATFORM_YOUTUBE_GALLERY_TABLE)
      .upsert(
        {
          page_id: page,
          draft_boxes: current.draftBoxes,
          published_boxes: publishedBoxes,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: gate.email.slice(0, 120),
        },
        { onConflict: 'page_id' },
      );
    if (error) return json({ ok: false, error: persistError(error, 'تعذر النشر.') }, 500, headers);
  } else {
    return json({ ok: false, error: 'إجراء غير معروف.' }, 400, headers);
  }
  const gallery = await readGallery(gate.db, page);
  if (!gallery) return json({ ok: false, error: 'تعذر القراءة.' }, 500, headers);
  return json({ ok: true, page, ...gallery }, 200, headers);
}
