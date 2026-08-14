/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { buildListingDaysSnapshotFromEntitlementRows } from './_lib/listingDaysRemaining.js';
import {
  isSalonPrivatePageEligibleTier,
  salonPrivatePagePackageByPageCount,
  SALON_PRIVATE_PAGE_MAX_PAGES,
} from './_lib/salonPrivatePageCatalog.js';

export const config = {
  maxDuration: 20,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-barber-portal-session, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').trim().slice(0, max);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return Response.json(
    {
      ok: true,
      route: 'barber-salon-private-page-request',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers: corsHeaders(request) },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-salon-private-page-request');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const barberId = clip(body.barberId, 80);
  const rawEmail = clip(body.email, 320);
  const action = clip(body.action, 32) || 'list';
  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const authGate = assertBarberPortalSessionFromRequest(request, barberId, rawEmail);
  if (!authGate.ok) {
    return Response.json({ error: authGate.message }, { status: authGate.status, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .select('id, email, is_active')
    .eq('id', barberId)
    .maybeSingle();
  if (barberErr) {
    return Response.json({ error: barberErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!barber) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }
  const rowEmail = String((barber as { email?: string }).email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== rawEmail.toLowerCase()) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if ((barber as { is_active?: boolean | null }).is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const nowIso = new Date().toISOString();
  const { data: ents, error: entErr } = await supabase
    .from('barber_listing_entitlements')
    .select('valid_until, tier')
    .eq('barber_id', barberId)
    .is('revoked_at', null)
    .gt('valid_until', nowIso);
  if (entErr) {
    return Response.json({ error: entErr.message || 'Entitlement lookup failed' }, { status: 500, headers });
  }
  const snapshot = buildListingDaysSnapshotFromEntitlementRows(
    (ents ?? []) as Array<{ valid_until?: string | null; tier?: string | null }>,
  );
  if (!snapshot.hasActiveListing || !isSalonPrivatePageEligibleTier(snapshot.activeTier)) {
    return Response.json(
      { error: 'صفحة العرض الخاصة متاحة لأصحاب رخصة ذهبية أو ماسية مفعّلة فقط.' },
      { status: 403, headers },
    );
  }

  if (action === 'list') {
    const { data: rows, error: listErr } = await supabase
      .from('salon_private_page_requests')
      .select(
        'id, sku, page_count, unit_sar, base_sar, status, salon_display_name, created_at',
      )
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (listErr) {
      if (/salon_private_page_requests/i.test(listErr.message || '')) {
        return Response.json(
          {
            error: 'salon_private_page_table_missing',
            hint: 'Apply migration 158_salon_private_page_requests.sql on Supabase.',
          },
          { status: 503, headers },
        );
      }
      return Response.json({ error: listErr.message || 'List failed' }, { status: 500, headers });
    }
    return Response.json({ ok: true, requests: rows ?? [] }, { headers });
  }

  if (action !== 'submit') {
    return Response.json({ error: 'Unknown action' }, { status: 400, headers });
  }

  const pageCount = Math.trunc(Number(body.pageCount));
  const pack = salonPrivatePagePackageByPageCount(pageCount);
  if (!pack || pageCount > SALON_PRIVATE_PAGE_MAX_PAGES) {
    return Response.json({ error: 'عدد الصفحات غير صالح.' }, { status: 400, headers });
  }

  const salonDisplayName = clip(body.salonDisplayName, 120);
  const aboutText = clip(body.aboutText, 2000);
  const servicesText = clip(body.servicesText, 2000);
  if (salonDisplayName.length < 2 || aboutText.length < 12 || servicesText.length < 8) {
    return Response.json(
      { error: 'أكمل اسم الصالون، نبذة العرض، والخدمات قبل إرسال الطلب.' },
      { status: 400, headers },
    );
  }

  const insertRow = {
    barber_id: barberId,
    sku: pack.sku,
    page_count: pack.pageCount,
    unit_sar: pack.unitSar,
    base_sar: pack.baseSar,
    base_halalas: pack.baseHalalas,
    status: 'submitted',
    salon_display_name: salonDisplayName,
    city: clip(body.city, 80) || null,
    district: clip(body.district, 80) || null,
    about_text: aboutText,
    services_text: servicesText,
    products_text: clip(body.productsText, 2000) || null,
    brand_notes: clip(body.brandNotes, 2000) || null,
    contact_whatsapp: clip(body.contactWhatsapp, 32) || null,
    surface: 'halaqmap',
  };

  const { data: created, error: insErr } = await supabase
    .from('salon_private_page_requests')
    .insert(insertRow)
    .select('id, sku, page_count, unit_sar, base_sar, status, salon_display_name, created_at')
    .maybeSingle();

  if (insErr) {
    if (/salon_private_page_requests/i.test(insErr.message || '')) {
      return Response.json(
        {
          error: 'salon_private_page_table_missing',
          hint: 'Apply migration 158_salon_private_page_requests.sql on Supabase.',
        },
        { status: 503, headers },
      );
    }
    return Response.json({ error: insErr.message || 'Insert failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true, request: created }, { headers });
}
