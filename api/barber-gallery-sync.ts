import { createClient } from '@supabase/supabase-js';
import {
  listBarberGalleryPublicUrls,
  loadBarberForGalleryWrite,
  syncBarberGalleryItems,
} from './_lib/barberGallerySync.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 25,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function createServiceSupabase() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'barber-gallery-sync',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      publicApiGuard: registrationGuardDiagnostics(),
      ready: Boolean(resolvedUrl) && serviceRole,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-gallery-sync');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  const serverUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  if (clientSupabaseUrl && clientSupabaseUrl !== serverUrl) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(serverUrl),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const b = body as Record<string, unknown>;
  const action = String(b.action ?? '').trim().toLowerCase();
  const barberId = String(b.barberId ?? '').trim();
  const rawEmail = String(b.email ?? '').trim();

  const auth = await loadBarberForGalleryWrite(supabase, barberId, rawEmail);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status, headers });
  }

  if (action === 'list') {
    const listed = await listBarberGalleryPublicUrls(supabase, barberId);
    if (!listed.ok) {
      return Response.json({ error: listed.error }, { status: listed.status, headers });
    }
    return Response.json(
      {
        ok: true,
        publicUrls: listed.urls,
        galleryCount: listed.urls.length,
        maxAllowed: auth.maxAllowed,
      },
      { headers },
    );
  }

  if (action === 'sync') {
    const rawUrls = b.galleryUrls;
    if (!Array.isArray(rawUrls)) {
      return Response.json({ error: 'galleryUrls must be an array' }, { status: 400, headers });
    }
    const galleryUrls = rawUrls.map((u) => String(u ?? '').trim()).filter(Boolean);
    const synced = await syncBarberGalleryItems(supabase, barberId, galleryUrls, auth.maxAllowed);
    if (!synced.ok) {
      return Response.json({ error: synced.error }, { status: synced.status, headers });
    }
    return Response.json({ ok: true, ...synced.data, maxAllowed: auth.maxAllowed }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
