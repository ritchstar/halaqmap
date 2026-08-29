/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صناديق يوتيوب المنشورة. بلا إعلانات من المنصة.
 */
import { createClient } from '@supabase/supabase-js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  isPlatformYoutubePageId,
  parseYoutubeBoxes,
  publicYoutubeBoxes,
  PLATFORM_YOUTUBE_GALLERY_TABLE,
} from './_lib/platformYoutubeGallery.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
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

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: false, rateLimit: 40 });
  if (!secGuard.allowed) return secGuard.response;
  const page = new URL(request.url).searchParams.get('page') || '';
  if (!isPlatformYoutubePageId(page)) return json({ ok: false, error: 'صفحة غير معروفة.' }, 400, headers);
  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'تعذر الاتصال.' }, 503, headers);
  const { data, error } = await db
    .from(PLATFORM_YOUTUBE_GALLERY_TABLE)
    .select('published_boxes')
    .eq('page_id', page)
    .maybeSingle();
  if (error) return json({ ok: false, error: 'تعذر القراءة.' }, 500, headers);
  const boxes = publicYoutubeBoxes(parseYoutubeBoxes(data?.published_boxes));
  return json({ ok: true, page, boxes }, 200, headers);
}
