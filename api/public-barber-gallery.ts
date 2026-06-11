import { createClient } from '@supabase/supabase-js';
import { isBarberPubliclyListed, listBarberGalleryPublicUrls } from './_lib/barberGallerySync.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 15,
};

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
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

/**
 * /api/public-barber-gallery?barberId=...
 * معرض كامل للعميل — يُجلب عند الطلب فقط (lazy).
 */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'public-barber-gallery');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const requestUrl = new URL(request.url);
  const barberId = (requestUrl.searchParams.get('barberId') || '').trim();

  if (!barberId || !UUID_RE.test(barberId)) {
    return Response.json({ error: 'Invalid barberId' }, { status: 400, headers });
  }

  const supabase = createServiceSupabase();
  if (!supabase) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const listed = await isBarberPubliclyListed(supabase, barberId);
  if (!listed) {
    return Response.json({ error: 'Barber not found or not publicly listed' }, { status: 404, headers });
  }

  const gallery = await listBarberGalleryPublicUrls(supabase, barberId);
  if (!gallery.ok) {
    return Response.json({ error: gallery.error }, { status: gallery.status, headers });
  }

  return Response.json(
    {
      ok: true,
      barberId,
      galleryCount: gallery.urls.length,
      publicUrls: gallery.urls,
      route: 'public-barber-gallery',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}
