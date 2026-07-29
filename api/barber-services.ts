/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إدارة قائمة خدمات الصالون (اطلاع / إضافة / تعديل / حذف) عبر جلسة بوابة الحلاق.
 */
import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { assertBarberPortalSessionFromRequest } from './_lib/barberPortalAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  deleteBarberServiceCatalog,
  listBarberServicesCatalog,
  seedBarberServicesFromRegistration,
  upsertBarberServiceCatalog,
} from './_lib/barberServicesCatalog.js';

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

function mapCatalogError(message: string): { status: number; error: string } {
  if (message === 'service_name_required') return { status: 400, error: 'أدخل اسم الخدمة.' };
  if (message === 'invalid_price') return { status: 400, error: 'سعر الخدمة غير صالح.' };
  if (message === 'service_not_found') return { status: 404, error: 'الخدمة غير موجودة.' };
  if (message === 'service_id_required') return { status: 400, error: 'معرّف الخدمة مطلوب.' };
  if (message === 'services_limit_reached') {
    return { status: 400, error: 'وصلت للحد الأقصى لعدد الخدمات (40). احذف خدمة قبل الإضافة.' };
  }
  return { status: 500, error: message || 'تعذّر تنفيذ العملية.' };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return Response.json(
    {
      ok: true,
      route: 'barber-services',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-portal-services');
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const action = String((body as { action?: unknown }).action ?? 'list').trim() || 'list';
  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();

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

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return Response.json({ error: selErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as { id: string; email: string; tier: string; is_active: boolean | null };
  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }
  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  const tier = String(b.tier ?? '').toLowerCase();
  if (tier !== 'gold' && tier !== 'diamond') {
    return Response.json(
      { error: 'إدارة قائمة الخدمات متاحة للباقة الذهبية والماسية.' },
      { status: 403, headers },
    );
  }

  try {
    if (action === 'list') {
      const includeInactive = (body as { includeInactive?: unknown }).includeInactive === true;
      let services = await listBarberServicesCatalog(supabase, barberId, { includeInactive });
      let seeded = 0;
      if (services.length === 0) {
        const seed = await seedBarberServicesFromRegistration(supabase, barberId, rawEmail);
        services = seed.services;
        seeded = seed.seeded;
      }
      return Response.json({ ok: true, services, seeded }, { headers });
    }

    if (action === 'upsert') {
      const service = await upsertBarberServiceCatalog(supabase, {
        barberId,
        id: String((body as { id?: unknown }).id ?? '').trim() || null,
        serviceName: String((body as { serviceName?: unknown }).serviceName ?? ''),
        price: (body as { price?: unknown }).price as number,
        durationMinutes: (body as { durationMinutes?: unknown }).durationMinutes as number | undefined,
        description:
          (body as { description?: unknown }).description == null
            ? null
            : String((body as { description?: unknown }).description),
        category:
          (body as { category?: unknown }).category == null
            ? null
            : String((body as { category?: unknown }).category),
        isActive: (body as { isActive?: unknown }).isActive !== false,
      });
      return Response.json({ ok: true, service }, { headers });
    }

    if (action === 'delete') {
      const serviceId = String((body as { id?: unknown }).id ?? '').trim();
      await deleteBarberServiceCatalog(supabase, barberId, serviceId);
      return Response.json({ ok: true }, { headers });
    }

    if (action === 'seed') {
      const seed = await seedBarberServicesFromRegistration(supabase, barberId, rawEmail);
      return Response.json({ ok: true, seeded: seed.seeded, services: seed.services }, { headers });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400, headers });
  } catch (e) {
    const mapped = mapCatalogError(e instanceof Error ? e.message : 'error');
    return Response.json({ error: mapped.error }, { status: mapped.status, headers });
  }
}
