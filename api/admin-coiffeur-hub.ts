/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مكتب تشغيل كوافير ماب — مهتمات + إدراجات القطاع + زرع مشغل تجريبي.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { COIFFEUR_LISTING_SECTOR } from './_lib/coiffeurListingSector.js';
import { ensureBronzeListingAfterRegistrationApprove } from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

const INTEREST_TABLE = 'coiffeur_interest_signups';
const MAX_ROWS = 200;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TRIAL_SALON = {
  name: 'مشغل تجريبي كوافير ماب',
  email: 'coiffeur.trial@halaqmap.internal',
  phone: '0500000096',
  city: 'الرياض',
  address: 'الرياض — إدراج تجريبي لكوافير ماب',
  latitude: 24.7136,
  longitude: 46.6753,
  specialties: ['كوافير نسائي', 'مشغل تجميل'],
} as const;

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

function mapInterestRows(data: Record<string, unknown>[] | null) {
  return (data ?? []).map((row) => ({
    id: String(row.id ?? ''),
    email: String(row.email_normalized ?? ''),
    displayName: row.display_name ? String(row.display_name) : '',
    role: row.role ? String(row.role) : '',
    intentId: row.intent_id ? String(row.intent_id) : '',
    source: row.source ? String(row.source) : '',
    phone: row.phone ? String(row.phone) : '',
    createdAt: String(row.created_at ?? ''),
    consent: row.consent_follow_updates === true,
  }));
}

function mapListingRows(data: Record<string, unknown>[] | null) {
  return (data ?? []).map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    city: row.city != null ? String(row.city) : '',
    address: row.address != null ? String(row.address) : '',
    latitude: row.latitude == null || row.latitude === '' ? null : Number(row.latitude),
    longitude: row.longitude == null || row.longitude === '' ? null : Number(row.longitude),
    tier: String(row.tier ?? 'bronze'),
    isActive: row.is_active !== false,
    isVerified: row.is_verified === true,
    openForCustomers: row.open_for_customers !== false,
    specialties: Array.isArray(row.specialties)
      ? row.specialties.map((x) => String(x)).filter(Boolean)
      : [],
    listingSector: String(row.listing_sector ?? ''),
    createdAt: String(row.created_at ?? ''),
    isTrial: String(row.email ?? '').toLowerCase() === TRIAL_SALON.email,
  }));
}

async function loadHubSnapshot(
  supabase: SupabaseClient,
): Promise<Record<string, unknown>> {
  const interest = await supabase
    .from(INTEREST_TABLE)
    .select(
      'id, email_normalized, display_name, role, intent_id, source, phone, created_at, consent_follow_updates',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  let tableMissing = false;
  let interestHint: string | undefined;
  if (interest.error) {
    if (/coiffeur_interest_signups|does not exist|schema cache/i.test(interest.error.message || '')) {
      tableMissing = true;
      interestHint = 'Apply migration 159_coiffeur_interest_signups.sql on Supabase.';
    } else {
      return { ok: false, error: 'interest_query_failed' };
    }
  }

  const listings = await supabase
    .from('barbers')
    .select(
      'id, name, email, phone, city, address, latitude, longitude, tier, is_active, is_verified, open_for_customers, specialties, listing_sector, created_at',
    )
    .eq('listing_sector', COIFFEUR_LISTING_SECTOR)
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  let listingsMissing = false;
  let listingsHint: string | undefined;
  if (listings.error) {
    if (/listing_sector|does not exist|schema cache/i.test(listings.error.message || '')) {
      listingsMissing = true;
      listingsHint = 'Apply migration 162_listing_sector_coiffeur_women.sql on Supabase.';
    } else {
      return { ok: false, error: 'listings_query_failed' };
    }
  }

  const interestRows = tableMissing ? [] : mapInterestRows(interest.data as Record<string, unknown>[] | null);
  const listingRows = listingsMissing ? [] : mapListingRows(listings.data as Record<string, unknown>[] | null);

  return {
    ok: true,
    tableMissing,
    total: tableMissing ? 0 : typeof interest.count === 'number' ? interest.count : interestRows.length,
    rows: interestRows,
    hint: interestHint,
    listingsMissing,
    listingsHint,
    listingTotal: listingRows.length,
    listings: listingRows,
  };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_overview',
    'view_partner_marketing',
    'view_requests',
    'view_barbers',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const snapshot = await loadHubSnapshot(supabase);
  if (snapshot.ok === false) {
    return Response.json(snapshot, { status: 500, headers });
  }
  return Response.json(snapshot, { headers });
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'manage_barbers',
    'review_requests',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  let body: { action?: unknown; barberId?: unknown; isActive?: unknown; openForCustomers?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();
  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === 'seed_trial') {
    const trialRow: Record<string, unknown> = {
      name: TRIAL_SALON.name,
      email: TRIAL_SALON.email,
      phone: TRIAL_SALON.phone,
      city: TRIAL_SALON.city,
      address: TRIAL_SALON.address,
      latitude: TRIAL_SALON.latitude,
      longitude: TRIAL_SALON.longitude,
      specialties: [...TRIAL_SALON.specialties],
      listing_sector: COIFFEUR_LISTING_SECTOR,
      tier: 'bronze',
      is_active: true,
      is_verified: true,
      open_for_customers: true,
      children_specialist: false,
      mens_grooming_center: false,
      grooming_center_banner_lines: [],
    };
    let upsert = await supabase
      .from('barbers')
      .upsert(trialRow, { onConflict: 'email' })
      .select('id, email, name, listing_sector')
      .single();
    if (upsert.error && /column|schema cache|does not exist/i.test(upsert.error.message || '')) {
      const minimal = { ...trialRow };
      delete minimal.children_specialist;
      delete minimal.mens_grooming_center;
      delete minimal.grooming_center_banner_lines;
      delete minimal.open_for_customers;
      upsert = await supabase
        .from('barbers')
        .upsert(minimal, { onConflict: 'email' })
        .select('id, email, name, listing_sector')
        .single();
    }

    if (upsert.error || !upsert.data) {
      const msg = upsert.error?.message || 'seed_failed';
      if (/listing_sector|does not exist|schema cache/i.test(msg)) {
        return Response.json(
          {
            ok: false,
            error: 'listings_column_missing',
            hint: 'Apply migration 162_listing_sector_coiffeur_women.sql on Supabase.',
          },
          { status: 409, headers },
        );
      }
      return Response.json({ ok: false, error: msg }, { status: 500, headers });
    }

    const barberId = String((upsert.data as { id: string }).id);
    const grant = await ensureBronzeListingAfterRegistrationApprove(supabase, { barberId });
    const snapshot = await loadHubSnapshot(supabase);
    return Response.json(
      {
        ...snapshot,
        seeded: {
          barberId,
          email: TRIAL_SALON.email,
          listingGranted: grant.ok === true ? grant.granted : false,
          listingError: grant.ok === false ? grant.error : undefined,
          validUntil: grant.ok === true ? grant.validUntil : undefined,
        },
      },
      { headers },
    );
  }

  if (action === 'patch_listing') {
    const barberId = String(body.barberId ?? '').trim();
    if (!UUID_RE.test(barberId)) {
      return Response.json({ ok: false, error: 'invalid_barber_id' }, { status: 400, headers });
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.isActive === 'boolean') patch.is_active = body.isActive;
    if (typeof body.openForCustomers === 'boolean') patch.open_for_customers = body.openForCustomers;
    if (Object.keys(patch).length <= 1) {
      return Response.json({ ok: false, error: 'empty_patch' }, { status: 400, headers });
    }

    const { error } = await supabase
      .from('barbers')
      .update(patch)
      .eq('id', barberId)
      .eq('listing_sector', COIFFEUR_LISTING_SECTOR);
    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500, headers });
    }
    const snapshot = await loadHubSnapshot(supabase);
    return Response.json(snapshot, { headers });
  }

  return Response.json({ ok: false, error: 'unknown_action' }, { status: 400, headers });
}
