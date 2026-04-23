import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-simulate-booking-secret',
} as const;

/** تاريخ بعيد لتفادي التصادم مع حجوزات حقيقية */
const SIM_DATE = '2099-04-21';
const MARKER = 'SIM_OVERLAP_TEST';

function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

function simulationRouteEnabled(): boolean {
  if (!isProductionRuntime()) return true;
  return (process.env.ALLOW_BOOKING_OVERLAP_SIMULATION || '').trim() === 'true';
}

function corsJson(request: Request, body: unknown, status: number): Response {
  const { headers } = buildPublicApiCorsHeaders(request, CORS_OPTS);
  return Response.json(body, { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function resolveSupabaseUrl(): string {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
}

function resolveAnonKey(): string {
  return (
    (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
      .trim()
  );
}

function resolveServiceRole(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
}

/** يفرض السرّ إن وُجد؛ في الإنتاج مع ALLOW يجب ضبط السرّ على الخادم */
function rejectIfSecretInvalid(request: Request): Response | null {
  const prod = isProductionRuntime();
  const allow = (process.env.ALLOW_BOOKING_OVERLAP_SIMULATION || '').trim() === 'true';
  const serverSecret = (process.env.SIMULATE_BOOKING_OVERLAP_SECRET || '').trim();

  if (prod && allow && !serverSecret) {
    return corsJson(
      request,
      {
        error: 'Server misconfiguration',
        hint: 'With ALLOW_BOOKING_OVERLAP_SIMULATION=true you must set SIMULATE_BOOKING_OVERLAP_SECRET on the server.',
      },
      503
    );
  }

  if (!serverSecret) return null;

  const hdr = request.headers.get('x-simulate-booking-secret')?.trim();
  if (hdr !== serverSecret) {
    return corsJson(request, { error: 'Unauthorized', hint: 'Missing or invalid x-simulate-booking-secret header.' }, 401);
  }
  return null;
}

async function cleanupTestBookings(service: SupabaseClient, barberId: string): Promise<void> {
  await service
    .from('bookings')
    .delete()
    .eq('barber_id', barberId)
    .eq('booking_date', SIM_DATE)
    .or(`customer_name.eq.${MARKER},notes.eq.${MARKER}`);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const url = Boolean(resolveSupabaseUrl());
  const anon = Boolean(resolveAnonKey());
  const sr = Boolean(resolveServiceRole());
  return corsJson(
    request,
    {
      ok: true,
      route: 'simulate-booking-overlap',
      enabled: simulationRouteEnabled(),
      supabaseUrlSet: url,
      anonKeySet: anon,
      serviceRoleKeySet: sr,
      ready: simulationRouteEnabled() && url && anon && sr,
      registrationGuard: registrationGuardDiagnostics(),
      note: 'POST بدون جسم — ينشئ حجزاً ثم يحاول حجزاً متداخلاً بنفس المفتاح المجهول، ثم يحذف بيانات الاختبار.',
    },
    200
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  if (!simulationRouteEnabled()) {
    return corsJson(request, { error: 'Not found' }, 404);
  }

  const secretResp = rejectIfSecretInvalid(request);
  if (secretResp) return secretResp;

  const guard = runRegistrationRouteGuards(request, 'simulate-booking-overlap');
  if (!guard.ok) {
    return corsJson(request, guard.json, guard.status);
  }

  const url = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  const serviceRole = resolveServiceRole();
  if (!url || !anonKey || !serviceRole) {
    return corsJson(
      request,
      { error: 'Server not configured', hint: 'SUPABASE_URL, anon key, and SUPABASE_SERVICE_ROLE_KEY required.' },
      503
    );
  }

  const service = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: barberRow, error: barberErr } = await service.from('barbers').select('id').limit(1).maybeSingle();

  if (barberErr || !barberRow?.id) {
    return corsJson(
      request,
      { error: 'No barber row available', hint: barberErr?.message || 'Insert at least one barber to run simulation.' },
      503
    );
  }

  const barberId = String(barberRow.id);
  await cleanupTestBookings(service, barberId);

  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const baseArgs = {
    p_barber_id: barberId,
    p_customer_name: MARKER,
    p_customer_phone: '+966500000001',
    p_service_name: 'محاكاة تعارض حجز',
    p_booking_date: SIM_DATE,
    p_booking_time: '10:00:00',
    p_customer_email: null as string | null,
    p_service_price: null as number | null,
    p_duration_minutes: 60,
    p_notes: MARKER,
  };

  try {
    const first = await anon.rpc('create_booking_safe', baseArgs);
    if (first.error) {
      return corsJson(
        request,
        {
          error: 'First booking failed (simulation aborted)',
          code: first.error.code,
          message: first.error.message,
        },
        502
      );
    }

    const second = await anon.rpc('create_booking_safe', {
      ...baseArgs,
      p_customer_phone: '+966500000002',
      p_booking_time: '10:30:00',
    });

    const overlapCode = second.error?.code === '23P01';
    const overlapMsg = (second.error?.message || '').toLowerCase().includes('overlap');

    if (!second.error || (!overlapCode && !overlapMsg)) {
      return corsJson(
        request,
        {
          error: 'Simulation did not trigger overlap denial',
          secondError: second.error ?? null,
        },
        500
      );
    }

    // داخل نفس معاملة استدعاء الـ RPC قد تُلغى إدراجات السجل قبل RAISE؛ نُثبت صفاً واحداً عبر دور الخدمة لعرض الواجهة/Realtime.
    const { error: logInsertErr } = await service.from('platform_booking_security_log').insert({
      severity: 'warn',
      event_code: 'booking_overlap_denied',
      message: 'create_booking_safe: slot overlaps existing booking',
      barber_id: barberId,
      detail: {
        booking_date: SIM_DATE,
        booking_time: '10:30:00',
        overlap_probe: 'simulate_booking_overlap_api',
        note: 'Echo row: RPC txn may roll back SECURITY DEFINER log before RAISE.',
      },
    });
    if (logInsertErr) {
      return corsJson(
        request,
        {
          ok: true,
          warning: 'Overlap was rejected by RPC but security log echo failed',
          log_error: logInsertErr.message,
          barber_id: barberId,
          first_booking_id: first.data,
          overlap_pg_errcode: second.error?.code ?? null,
        },
        200
      );
    }

    return corsJson(
      request,
      {
        ok: true,
        summary:
          'تم إنشاء حجز أول ثم رُفض حجز متداخل عبر create_booking_safe (23P01)، وسُجّلت نسخة السجل عبر الخادم ليظهر التنبيه في سجل الأمان/البث المباشر.',
        barber_id: barberId,
        first_booking_id: first.data,
        overlap_pg_errcode: second.error?.code ?? null,
      },
      200
    );
  } finally {
    await cleanupTestBookings(service, barberId);
  }
}
