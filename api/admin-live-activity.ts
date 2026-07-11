/**
 * GET /api/admin-live-activity
 * Product-truth windows (15m / 1h / 24h) + presence online counts.
 * No geo search logging.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { PRESENCE_ONLINE_WINDOW_MS } from './_lib/platformPresence.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

type WindowKey = 'm15' | 'h1' | 'h24';

type WindowStats = {
  minutes: number;
  bookings: number;
  paymentsCompleted: number;
  paymentsFailed: number;
  conversationsStarted: number;
  newProfiles: number;
  registrationSubmissions: number;
  interestSignups: number;
  securityEvents: number;
};

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function sinceIso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

async function headCount(
  supabase: SupabaseClient,
  table: string,
  column: string,
  since: string,
  eqFilter?: { column: string; value: string },
): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true }).gte(column, since);
  if (eqFilter) q = q.eq(eqFilter.column, eqFilter.value);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
}

async function buildWindow(supabase: SupabaseClient, minutes: number): Promise<WindowStats> {
  const since = sinceIso(minutes);
  const [
    bookings,
    paymentsCompleted,
    paymentsFailed,
    conversationsStarted,
    newProfiles,
    registrationSubmissions,
    interestSignups,
    securityEvents,
  ] = await Promise.all([
    headCount(supabase, 'bookings', 'created_at', since),
    headCount(supabase, 'payments', 'created_at', since, { column: 'status', value: 'completed' }),
    headCount(supabase, 'payments', 'created_at', since, { column: 'status', value: 'failed' }),
    headCount(supabase, 'private_conversations', 'started_at', since),
    headCount(supabase, 'profiles', 'created_at', since),
    headCount(supabase, 'registration_submissions', 'created_at', since),
    headCount(supabase, 'barber_interest_signups', 'created_at', since),
    headCount(supabase, 'platform_booking_security_log', 'created_at', since),
  ]);

  return {
    minutes,
    bookings,
    paymentsCompleted,
    paymentsFailed,
    conversationsStarted,
    newProfiles,
    registrationSubmissions,
    interestSignups,
    securityEvents,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return Response.json({ ok: false, error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_command_center',
    'view_overview',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  try {
    const supabase = createClient(serverUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [m15, h1, h24] = await Promise.all([
      buildWindow(supabase, 15),
      buildWindow(supabase, 60),
      buildWindow(supabase, 1440),
    ]);

    const windows: Record<WindowKey, WindowStats> = { m15, h1, h24 };

    const onlineSince = new Date(Date.now() - PRESENCE_ONLINE_WINDOW_MS).toISOString();
    const { data: presenceRows, error: presenceErr } = await supabase
      .from('platform_presence')
      .select('persona')
      .gte('last_seen_at', onlineSince);

    const online = {
      total: 0,
      anon: 0,
      barber: 0,
      admin: 0,
      ambassador: 0,
      presenceTableReady: !presenceErr,
    };

    if (!presenceErr && Array.isArray(presenceRows)) {
      for (const row of presenceRows) {
        const p = String((row as { persona?: string }).persona || '');
        online.total += 1;
        if (p === 'anon') online.anon += 1;
        else if (p === 'barber') online.barber += 1;
        else if (p === 'admin') online.admin += 1;
        else if (p === 'ambassador') online.ambassador += 1;
      }
    }

    return Response.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        onlineWindowSeconds: PRESENCE_ONLINE_WINDOW_MS / 1000,
        online,
        windows,
        notes: {
          ar: 'أرقام من قاعدة البيانات (حقيقة المنتج) + Presence بدون جغرافيا. سجل البحث الجغرافي متوقف نهائياً.',
          searchGeoLogging: 'disabled_migration_91',
        },
        integrations: {
          posthogClientConfigured: Boolean((process.env.VITE_POSTHOG_KEY || '').trim()),
        },
      },
      {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Live activity failed';
    return Response.json({ ok: false, error: msg }, { status: 502, headers });
  }
}
