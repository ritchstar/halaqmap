/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مركز إدارة موافقات إبراز فزعة — دعوة بريد رسمي، سحب، وقائمة الحالات.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  FAZAA_LISTING_CONSENT_TABLE,
  FAZAA_LISTING_CONSENT_TTL_DAYS,
  FAZAA_LISTING_CONSENT_VERSION,
  buildFazaaListingConsentUrl,
  expireStalePending,
  isSafeHttpsBannerUrl,
  mintFazaaListingConsentToken,
  normalizeInviteInput,
  sendFazaaListingConsentEmail,
} from './_lib/fazaaListingConsent.js';

export const config = { maxDuration: 25 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function originFromRequest(request: Request): string {
  const env = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_SITE_ORIGIN || '').trim();
  if (env) return env.replace(/\/$/, '');
  return 'https://www.halaqmap.com';
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function authed(request: Request) {
  const headers = corsHeaders(request);
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return { blocked };
  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return { headers, error: Response.json({ error: 'server_misconfigured' }, { status: 503, headers }) };
  }
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_overview',
    'view_partner_marketing',
  ]);
  if (auth.ok === false) {
    return { headers, error: Response.json(auth.json, { status: auth.status, headers }) };
  }
  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { headers, supabase, adminEmail: auth.actorEmail || '' };
}

function mapConsent(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ''),
    barberId: String(row.barber_id ?? ''),
    status: String(row.status ?? ''),
    salonName: String(row.name_snapshot ?? ''),
    emailTo: String(row.email_to ?? ''),
    citySlug: String(row.city_slug ?? ''),
    cityNameAr: String(row.city_name_ar ?? ''),
    neighborhoodSlugs: Array.isArray(row.neighborhood_slugs) ? row.neighborhood_slugs : [],
    areaLabelAr: String(row.area_label_ar ?? ''),
    bannerUrl: isSafeHttpsBannerUrl(String(row.banner_url || '')) ? String(row.banner_url) : '',
    emailSentAt: row.email_sent_at ? String(row.email_sent_at) : '',
    expiresAt: String(row.expires_at ?? ''),
    acceptedAt: row.accepted_at ? String(row.accepted_at) : '',
    createdAt: String(row.created_at ?? ''),
    createdBy: String(row.created_by_email ?? ''),
  };
}

export async function GET(request: Request): Promise<Response> {
  const ctx = await authed(request);
  if ('blocked' in ctx && ctx.blocked) return ctx.blocked;
  if ('error' in ctx && ctx.error) return ctx.error;
  const { headers, supabase } = ctx;
  await expireStalePending(supabase);

  const url = new URL(request.url);
  const q = String(url.searchParams.get('q') || '').trim().slice(0, 80);

  const { data: consents, error, count } = await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .select(
      'id, barber_id, status, name_snapshot, email_to, city_slug, city_name_ar, neighborhood_slugs, area_label_ar, banner_url, email_sent_at, expires_at, accepted_at, created_at, created_by_email',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    if (/fazaa_seo_listing_consents|does not exist|schema cache/i.test(error.message || '')) {
      return Response.json(
        { ok: true, tableMissing: true, consents: [], candidates: [], total: 0, hint: 'Apply migration 160_fazaa_seo_listing_consents.sql' },
        { headers },
      );
    }
    return Response.json({ ok: false, error: 'query_failed' }, { status: 500, headers });
  }

  let barberQuery = supabase
    .from('barbers')
    .select('id, name, email, city, tier, cover_image, is_active')
    .eq('is_active', true)
    .in('tier', ['gold', 'diamond'])
    .order('name', { ascending: true })
    .limit(80);
  if (q) barberQuery = barberQuery.or(`name.ilike.%${q.replace(/[%*,]/g, '')}%,email.ilike.%${q.replace(/[%*,]/g, '')}%`);

  const { data: barbers } = await barberQuery;
  const candidates = (barbers ?? []).map((b) => ({
    id: String(b.id),
    name: String(b.name || ''),
    email: String(b.email || ''),
    city: String(b.city || ''),
    tier: String(b.tier || ''),
    hasBanner: isSafeHttpsBannerUrl(String(b.cover_image || '')),
  }));

  return Response.json(
    {
      ok: true,
      tableMissing: false,
      total: count ?? (consents ?? []).length,
      consents: (consents ?? []).map((row) => mapConsent(row as Record<string, unknown>)),
      candidates,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const ctx = await authed(request);
  if ('blocked' in ctx && ctx.blocked) return ctx.blocked;
  if ('error' in ctx && ctx.error) return ctx.error;
  const { headers, supabase, adminEmail } = ctx;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }
  const action = String(body.action || '').trim();

  if (action === 'revoke') {
    const id = String(body.id || '').trim();
    if (!id) return Response.json({ ok: false, error: 'missing_id' }, { status: 400, headers });
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(FAZAA_LISTING_CONSENT_TABLE)
      .update({ status: 'revoked', revoked_at: now, updated_at: now })
      .eq('id', id)
      .in('status', ['pending', 'accepted']);
    if (error) return Response.json({ ok: false, error: 'update_failed' }, { status: 500, headers });
    return Response.json({ ok: true, status: 'revoked' }, { headers });
  }

  if (action !== 'invite' && action !== 'resend') {
    return Response.json({ ok: false, error: 'invalid_action' }, { status: 400, headers });
  }

  let barberId = '';
  let citySlug = '';
  let cityNameAr = '';
  let areaLabelAr = '';
  let specialtyHintAr = 'حلاقة رجالي';
  let neighborhoodSlugs: string[] = [];

  if (action === 'resend') {
    const id = String(body.id || '').trim();
    const { data: existing } = await supabase.from(FAZAA_LISTING_CONSENT_TABLE).select('*').eq('id', id).maybeSingle();
    if (!existing || existing.status !== 'pending') {
      return Response.json({ ok: false, error: 'not_pending' }, { status: 409, headers });
    }
    barberId = String(existing.barber_id);
    citySlug = String(existing.city_slug);
    cityNameAr = String(existing.city_name_ar);
    areaLabelAr = String(existing.area_label_ar);
    specialtyHintAr = String(existing.specialty_hint_ar || 'حلاقة رجالي');
    neighborhoodSlugs = Array.isArray(existing.neighborhood_slugs) ? existing.neighborhood_slugs : [];
    await supabase
      .from(FAZAA_LISTING_CONSENT_TABLE)
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', id);
  } else {
    const parsed = normalizeInviteInput(body);
    if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400, headers });
    barberId = parsed.barberId;
    citySlug = parsed.citySlug;
    cityNameAr = parsed.cityNameAr;
    areaLabelAr = parsed.areaLabelAr;
    specialtyHintAr = parsed.specialtyHintAr;
    neighborhoodSlugs = parsed.neighborhoodSlugs;
  }

  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name, email, cover_image, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();
  if (!barber || !barber.is_active || (barber.tier !== 'gold' && barber.tier !== 'diamond')) {
    return Response.json({ ok: false, error: 'barber_not_eligible' }, { status: 400, headers });
  }
  const email = String(barber.email || '').trim();
  if (!email || !email.includes('@')) {
    return Response.json({ ok: false, error: 'barber_email_missing' }, { status: 400, headers });
  }

  const { data: accepted } = await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .select('id')
    .eq('barber_id', barberId)
    .eq('status', 'accepted')
    .limit(1);
  if ((accepted ?? []).length > 0 && action === 'invite') {
    return Response.json({ ok: false, error: 'already_accepted' }, { status: 409, headers });
  }

  await expireStalePending(supabase, barberId);
  await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('barber_id', barberId)
    .eq('status', 'pending');

  const { token, tokenHash } = mintFazaaListingConsentToken();
  const now = new Date();
  const expires = new Date(now.getTime() + FAZAA_LISTING_CONSENT_TTL_DAYS * 86400000);
  const bannerUrl = isSafeHttpsBannerUrl(String(barber.cover_image || '')) ? String(barber.cover_image) : null;
  const insert = {
    barber_id: barberId,
    token_hash: tokenHash,
    status: 'pending',
    consent_version: FAZAA_LISTING_CONSENT_VERSION,
    city_slug: citySlug,
    city_name_ar: cityNameAr,
    neighborhood_slugs: neighborhoodSlugs,
    area_label_ar: areaLabelAr,
    specialty_hint_ar: specialtyHintAr,
    banner_url: bannerUrl,
    name_snapshot: String(barber.name || '').trim() || 'صالون شريك',
    email_to: email,
    expires_at: expires.toISOString(),
    created_by_email: adminEmail || null,
  };
  const { data: created, error: insertError } = await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .insert(insert)
    .select('id')
    .single();
  if (insertError || !created) {
    return Response.json({ ok: false, error: 'insert_failed' }, { status: 500, headers });
  }

  const consentUrl = buildFazaaListingConsentUrl(originFromRequest(request), token);
  const sent = await sendFazaaListingConsentEmail({
    to: email,
    salonName: insert.name_snapshot,
    cityNameAr,
    areaLabelAr,
    consentUrl,
  });
  if (!sent.ok) {
    await supabase.from(FAZAA_LISTING_CONSENT_TABLE).update({ status: 'expired', updated_at: now.toISOString() }).eq('id', created.id);
    return Response.json({ ok: false, error: sent.error }, { status: 502, headers });
  }
  await supabase
    .from(FAZAA_LISTING_CONSENT_TABLE)
    .update({ email_sent_at: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', created.id);

  return Response.json({ ok: true, id: created.id, status: 'pending' }, { headers });
}
