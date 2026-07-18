import { createClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { recordHoneypotTrip, runSecurityGuard } from './_lib/securityGuard.js';

export const config = { maxDuration: 20 };

const TABLE = 'partner_prospects';

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

const FACILITY_TYPES = new Set(['hotel', 'furnished_apartments', 'guest_house']);

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function trimStr(raw: unknown, max = 300): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, max);
}

function parseNonNegativeInt(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function isLikelyGoogleMapsUrl(raw: string): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    return host.includes('google.') || host.includes('goo.gl') || host.includes('maps.app.goo.gl');
  } catch {
    return false;
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'public-hospitality-b2b-request',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      ready: url && serviceRole,
      registrationGuard: registrationGuardDiagnostics(),
      note: 'POST with facility/shipping fields to submit hospitality QR banner request.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'public-hospitality-b2b-request');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const honeypot = trimStr(body.website, 200);
  if (honeypot) {
    await recordHoneypotTrip(request, 'public-hospitality-b2b-request');
    return Response.json({ ok: true }, { headers });
  }

  const facilityName = trimStr(body.facilityName, 200);
  const facilityType = trimStr(body.facilityType, 50);
  const receptionBannersCount = parseNonNegativeInt(body.receptionBannersCount);
  const roomsBannersCount = parseNonNegativeInt(body.roomsBannersCount);
  const shippingCity = trimStr(body.shippingCity, 120);
  const shippingDistrict = trimStr(body.shippingDistrict, 120);
  const shippingRecipientName = trimStr(body.shippingRecipientName, 160);
  const shippingPhone = trimStr(body.shippingPhone, 40);
  const shippingGoogleMapsUrl = trimStr(body.shippingGoogleMapsUrl, 500);
  const ambassadorCodeRaw = trimStr(body.ambassadorCode ?? body.amb ?? body.ref, 40).toUpperCase();
  const ambassadorCode =
    ambassadorCodeRaw && /^HM-AMB-[A-Z0-9]{6,16}$/i.test(ambassadorCodeRaw)
      ? ambassadorCodeRaw
      : ambassadorCodeRaw.slice(0, 40) || null;

  if (!facilityName || !FACILITY_TYPES.has(facilityType)) {
    return Response.json({ error: 'بيانات المنشأة غير مكتملة' }, { status: 400, headers });
  }
  if (receptionBannersCount <= 0 && roomsBannersCount <= 0) {
    return Response.json({ error: 'يجب إدخال عدد بنرات أكبر من صفر' }, { status: 400, headers });
  }
  if (!shippingCity || !shippingDistrict || !shippingRecipientName || !shippingPhone) {
    return Response.json({ error: 'بيانات الشحن مطلوبة بالكامل' }, { status: 400, headers });
  }
  if (!isLikelyGoogleMapsUrl(shippingGoogleMapsUrl)) {
    return Response.json({ error: 'رابط خرائط جوجل غير صالح' }, { status: 400, headers });
  }

  const facilityTypeLabel =
    facilityType === 'hotel'
      ? 'فندق'
      : facilityType === 'furnished_apartments'
        ? 'شقق مفروشة'
        : 'دور ضيافة';

  const notes = [
    'طلب B2B — بنرات QR للضيافة',
    `نوع المنشأة: ${facilityTypeLabel}`,
    `بنرات الاستقبال: ${receptionBannersCount}`,
    `بنرات الغرف: ${roomsBannersCount}`,
    `مستلم الشحنة: ${shippingRecipientName}`,
    `جوال المستلم: ${shippingPhone}`,
    `رابط التوثيق (خرائط): ${shippingGoogleMapsUrl}`,
    ...(ambassadorCode ? [`كود السفير: ${ambassadorCode}`] : []),
  ].join('\n');

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const insertRow = {
    name: facilityName,
    city: shippingCity,
    region: shippingDistrict,
    address: `المدينة: ${shippingCity} — الحي: ${shippingDistrict} — المستلم: ${shippingRecipientName}`,
    tier_fit: 'mixed',
    channel: 'phone',
    phone: shippingPhone,
    source: 'import',
    notes,
    source_meta: {
      program: 'hospitality_qr_b2b',
      facilityType,
      receptionBannersCount,
      roomsBannersCount,
      shippingRecipientName,
      shippingGoogleMapsUrl,
      freeShippingIncluded: true,
      filledBy: 'establishment',
      ...(ambassadorCode ? { ambassadorCode } : {}),
      lifecycle: {
        stage: 'submitted',
        submittedAtIso: new Date().toISOString(),
      },
    },
    status: 'new',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from(TABLE).insert(insertRow).select('id').single();
  if (error) {
    return Response.json({ error: 'تعذّر حفظ الطلب', hint: error.message }, { status: 500, headers });
  }

  return Response.json({ ok: true, requestId: data?.id ?? null }, { status: 201, headers });
}
