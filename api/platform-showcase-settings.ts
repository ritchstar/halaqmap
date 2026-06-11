import { createClient } from '@supabase/supabase-js';
import { isBootstrapAdminEmail, verifyActivePlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import {
  ensureShowcaseBarber,
  fetchShowcasePublicRow,
  loadPlatformShowcaseSettings,
  mapShowcaseRowToApiPayload,
} from './_lib/platformShowcasePreview.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 30,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyActivePlatformAdminFromRequest(request, url, serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  if (!isBootstrapAdminEmail(adminAuth.actorEmail)) {
    return Response.json({ error: 'Bootstrap admin only' }, { status: 403, headers });
  }

  const settingsRes = await loadPlatformShowcaseSettings(adminAuth.supabase);
  if (settingsRes.ok === false) {
    return Response.json({ error: settingsRes.error }, { status: 500, headers });
  }

  let barber: Record<string, unknown> | null = null;
  if (settingsRes.settings.barberId) {
    const row = await fetchShowcasePublicRow(adminAuth.supabase, settingsRes.settings.barberId);
    if (row) barber = mapShowcaseRowToApiPayload(row);
  }

  return Response.json(
    {
      ok: true,
      settings: {
        barber_id: settingsRes.settings.barberId,
        fallback_when_empty: settingsRes.settings.fallbackWhenEmpty,
        map_visible: settingsRes.settings.mapVisible,
        education_intro_ar: settingsRes.settings.educationIntroAr,
        updated_at: settingsRes.settings.updatedAt,
        updated_by_email: settingsRes.settings.updatedByEmail,
      },
      barber,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyActivePlatformAdminFromRequest(request, url, serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  if (!isBootstrapAdminEmail(adminAuth.actorEmail)) {
    return Response.json({ error: 'Bootstrap admin only' }, { status: 403, headers });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const action = String(body.action || 'patch_settings').trim();

  if (action === 'ensure_barber') {
    const ensured = await ensureShowcaseBarber(adminAuth.supabase);
    if (ensured.ok === false) {
      return Response.json({ error: ensured.error }, { status: 500, headers });
    }
    const row = await fetchShowcasePublicRow(adminAuth.supabase, ensured.barberId);
    return Response.json(
      {
        ok: true,
        barber_id: ensured.barberId,
        created: ensured.created,
        barber: row ? mapShowcaseRowToApiPayload(row) : null,
      },
      { headers },
    );
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by_email: adminAuth.actorEmail,
  };
  if (typeof body.fallback_when_empty === 'boolean') patch.fallback_when_empty = body.fallback_when_empty;
  if (typeof body.map_visible === 'boolean') patch.map_visible = body.map_visible;
  if (typeof body.education_intro_ar === 'string') {
    patch.education_intro_ar = body.education_intro_ar.trim().slice(0, 600);
  }

  const { error } = await adminAuth.supabase.from('platform_showcase_settings').upsert(
    { id: 1, ...patch },
    { onConflict: 'id' },
  );
  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }

  const settingsRes = await loadPlatformShowcaseSettings(adminAuth.supabase);
  if (settingsRes.ok === false) {
    return Response.json({ error: settingsRes.error }, { status: 500, headers });
  }

  return Response.json(
    {
      ok: true,
      settings: {
        barber_id: settingsRes.settings.barberId,
        fallback_when_empty: settingsRes.settings.fallbackWhenEmpty,
        map_visible: settingsRes.settings.mapVisible,
        education_intro_ar: settingsRes.settings.educationIntroAr,
        updated_at: settingsRes.settings.updatedAt,
        updated_by_email: settingsRes.settings.updatedByEmail,
      },
    },
    { headers },
  );
}
