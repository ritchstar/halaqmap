/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة موافقة الشريك عبر رابط البريد — قراءة ومعاينة ثم قبول/رفض.
 * لا يُرجع بريداً ولا معرّف صالون.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  FAZAA_LISTING_CONSENT_TABLE,
  FAZAA_LISTING_CONSENT_VERSION,
  findConsentByToken,
  isSafeHttpsBannerUrl,
  publicConsentPreview,
} from './_lib/fazaaListingConsent.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function client() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function readToken(request: Request, body?: { c?: unknown; token?: unknown }): string {
  if (body) return String(body.token ?? body.c ?? '').trim();
  const url = new URL(request.url);
  return (url.searchParams.get('c') || url.searchParams.get('token') || '').trim();
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-fazaa-listing-consent');
  if (guard.ok === false) return Response.json(guard.json, { status: guard.status, headers });
  const sec = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 20 });
  if (!sec.allowed) return sec.response;

  const token = readToken(request);
  if (!token) return Response.json({ ok: false, error: 'missing_token' }, { status: 400, headers });
  const supabase = client();
  if (!supabase) return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });

  const row = await findConsentByToken(supabase, token);
  if (!row) return Response.json({ ok: false, error: 'not_found' }, { status: 404, headers });
  return Response.json({ ok: true, preview: publicConsentPreview(row) }, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-fazaa-listing-consent');
  if (guard.ok === false) return Response.json(guard.json, { status: guard.status, headers });
  const sec = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 8 });
  if (!sec.allowed) return sec.response;

  let body: { c?: unknown; token?: unknown; action?: unknown; accepted?: unknown; consentVersion?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty */
  }
  const token = readToken(request, body);
  const action = String(body.action || '').trim();
  if (!token) return Response.json({ ok: false, error: 'missing_token' }, { status: 400, headers });
  if (action !== 'accept' && action !== 'decline') {
    return Response.json({ ok: false, error: 'invalid_action' }, { status: 400, headers });
  }

  const supabase = client();
  if (!supabase) return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });

  const row = await findConsentByToken(supabase, token);
  if (!row) return Response.json({ ok: false, error: 'not_found' }, { status: 404, headers });
  const preview = publicConsentPreview(row);
  if (preview.status !== 'pending') {
    return Response.json({ ok: false, error: preview.status === 'expired' ? 'expired' : 'used' }, { status: 409, headers });
  }

  const now = new Date().toISOString();
  const forwarded = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '';
  const ua = (request.headers.get('user-agent') || '').slice(0, 240);

  if (action === 'decline') {
    const { error } = await supabase
      .from(FAZAA_LISTING_CONSENT_TABLE)
      .update({ status: 'declined', declined_at: now, updated_at: now })
      .eq('id', row.id)
      .eq('status', 'pending');
    if (error) return Response.json({ ok: false, error: 'update_failed' }, { status: 500, headers });
    return Response.json({ ok: true, status: 'declined' }, { headers });
  }

  if (body.accepted !== true) {
    return Response.json({ ok: false, error: 'consent_required' }, { status: 400, headers });
  }
  if (String(body.consentVersion || '') !== FAZAA_LISTING_CONSENT_VERSION) {
    return Response.json({ ok: false, error: 'version_mismatch' }, { status: 400, headers });
  }

  const { data: barber } = await supabase
    .from('barbers')
    .select('cover_image, featured_images, name, is_active')
    .eq('id', row.barber_id)
    .maybeSingle();
  const cover = isSafeHttpsBannerUrl(barber?.cover_image as string)
    ? String(barber?.cover_image)
    : Array.isArray(barber?.featured_images) && isSafeHttpsBannerUrl(String(barber?.featured_images[0] || ''))
      ? String(barber?.featured_images[0])
      : row.banner_url;

  const { error } = await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .update({
      status: 'accepted',
      accepted_at: now,
      updated_at: now,
      accept_ip: forwarded.slice(0, 64) || null,
      accept_user_agent: ua || null,
      banner_url: cover || null,
      name_snapshot: String(barber?.name || row.name_snapshot).trim() || row.name_snapshot,
    })
    .eq('id', row.id)
    .eq('status', 'pending');
  if (error) return Response.json({ ok: false, error: 'update_failed' }, { status: 500, headers });
  return Response.json({ ok: true, status: 'accepted' }, { headers });
}
