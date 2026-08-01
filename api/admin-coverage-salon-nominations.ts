/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * قائمة ترشيحات التغطية — للقسم التسويقي في لوحة التحكم.
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, PATCH, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const STATUSES = new Set(['new', 'reviewed', 'contacted', 'archived']);

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    status: String(row.status ?? 'new'),
    salonName: String(row.salon_name ?? ''),
    contactPhone: String(row.contact_phone ?? ''),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoUrl: typeof row.photo_url === 'string' ? row.photo_url : null,
    insideSalonConfirmed: Boolean(row.inside_salon_confirmed),
    locationShared: Boolean(row.location_shared),
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ ok: false, error: 'server_misconfigured' }, 503, request);

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_command_center',
    'view_partner_marketing',
    'view_overview',
  ]);
  if (adminAuth.ok === false) {
    return json(adminAuth.json, adminAuth.status, request);
  }

  const { data, error } = await adminAuth.supabase
    .from('coverage_salon_nominations')
    .select(
      'id, status, salon_name, contact_phone, latitude, longitude, photo_url, inside_salon_confirmed, location_shared, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return json({ ok: false, error: error.message }, 500, request);
  }

  return json(
    { ok: true, items: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)) },
    200,
    request,
  );
}

export async function PATCH(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ ok: false, error: 'server_misconfigured' }, 503, request);

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_command_center',
    'view_partner_marketing',
    'manage_partner_marketing',
  ]);
  if (adminAuth.ok === false) {
    return json(adminAuth.json, adminAuth.status, request);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400, request);
  }

  const id = String(body.id ?? '').trim();
  const status = String(body.status ?? '').trim();
  if (!id || !STATUSES.has(status)) {
    return json({ ok: false, error: 'invalid_id_or_status' }, 400, request);
  }

  const { error } = await adminAuth.supabase
    .from('coverage_salon_nominations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return json({ ok: false, error: error.message }, 500, request);
  }
  return json({ ok: true }, 200, request);
}
