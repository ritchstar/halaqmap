/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أيام الإدراج للحلاقين في لوحة الإدارة — نفس مصدر لوحة الحلاق (barber_listing_summary).
 * GET + Bootstrap أو صلاحية manage_barbers / view_barbers.
 */
import {
  isBootstrapAdminEmail,
  verifyPlatformAdminFromRequestAny,
} from './_lib/adminManageBarbersAuth.js';
import { getBarberListingBalance } from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
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
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'manage_barbers',
    'view_barbers',
    'review_payments',
    'manage_partner_billing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const reqUrl = new URL(request.url);
  const idsParam = String(reqUrl.searchParams.get('ids') ?? '').trim();
  let barberIds: string[] = [];
  if (idsParam) {
    barberIds = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
      .slice(0, 500);
  } else {
    const { data } = await auth.supabase.from('barbers').select('id').limit(2000);
    barberIds = (data ?? []).map((r) => String((r as { id: string }).id)).filter(Boolean);
  }

  const daysByBarberId: Record<
    string,
    {
      hasActiveListing: boolean;
      listingDaysRemaining: number;
      validUntil: string | null;
      activeTier: string | null;
    }
  > = {};

  // دفعة متوازية محدودة لتجنّب الضغط على RPC
  const chunkSize = 40;
  for (let i = 0; i < barberIds.length; i += chunkSize) {
    const chunk = barberIds.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        const bal = await getBarberListingBalance(auth.supabase, id);
        daysByBarberId[id] = {
          hasActiveListing: bal.hasActiveListing,
          listingDaysRemaining: bal.listingDaysRemaining,
          validUntil: bal.validUntil,
          activeTier: bal.activeTier,
        };
      }),
    );
  }

  return Response.json(
    {
      ok: true,
      source: 'barber_listing_summary',
      bootstrap: isBootstrapAdminEmail(auth.actorEmail),
      daysByBarberId,
    },
    { headers },
  );
}
