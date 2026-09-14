/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * GET /api/check-barber-subscription-status?linkedBarberId=<uuid>&requestId=HM-...
 *
 * فحص للقراءة فقط لآخر حالة اشتراك حلاق مسجَّلة عبر webhook ميسر — دون الحاجة
 * لمعرّف الدفعة نفسه.
 *
 * لماذا هذا المسار ضروري: ودجت ميسر (mpf.js) يستدعي on_failure على المتصفح
 * برسالة نصية فقط (لا يرفق معرّف الدفعة إطلاقاً — موثّق رسمياً)، فحين يُطلق
 * هذا الاستدعاء لا تملك الواجهة أي معرّف يمكن التحقق منه مباشرة عبر
 * /api/verify-moyasar-payment. في المقابل فإن webhook ميسر (مستقل تماماً عن
 * ودجت المتصفح، ويُستدعى من خوادم ميسر نفسها) يُحدّث جدول barber_subscriptions
 * فور معرفة الحالة الحقيقية للدفعة — فقد تكون العملية نجحت فعلياً وتم خصم
 * المبلغ رغم ظهور «فشل الدفع» في المتصفح بسبب عطل في اتصال الودجت وحده لا في
 * الدفعة نفسها. هذا المسار يتيح لصفحة الدفع التحقق من تلك الحالة الحقيقية بعد
 * فشل الودجت، بدل تصديق حكم المتصفح وحده.
 *
 * لا يُعيد أي بيانات حساسة (لا بريد، لا اسم صاحب البطاقة، لا تفاصيل بطاقة) —
 * فقط الحالة والمستوى والمبلغ ووقت آخر تحديث لأحدث سجل اشتراك.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 20 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REQUEST_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
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

  const guard = runRegistrationRouteGuards(request, 'check-barber-subscription-status');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = new URL(request.url);
  const linkedBarberId = (url.searchParams.get('linkedBarberId') || '').trim();
  const requestId = (url.searchParams.get('requestId') || '').trim().toUpperCase();

  const barberIdValid = UUID_RE.test(linkedBarberId);
  const requestIdValid = REQUEST_ID_RE.test(requestId);
  if (!barberIdValid && !requestIdValid) {
    return Response.json(
      { ok: false, error: 'invalid_params', hint: 'أرفق linkedBarberId صالحاً أو requestId بصيغة HM-...' },
      { status: 400, headers },
    );
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = supabase
    .from('barber_subscriptions')
    .select('status, tier, amount_halalas, currency, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  // نُفضّل رقم الطلب (requestId) حين يتوفر — أدق ارتباطاً بمحاولة دفع بعينها؛
  // وإلا نعتمد على آخر سجل اشتراك لهذا الحلاق (حالة «تجديد/شحن» بلا requestId).
  query = requestIdValid ? query.eq('registration_request_id', requestId) : query.eq('barber_id', linkedBarberId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return Response.json({ ok: false, error: 'db_select_failed' }, { status: 500, headers });
  }

  if (!data) {
    return Response.json({ ok: true, found: false }, { headers });
  }

  return Response.json(
    {
      ok: true,
      found: true,
      status: data.status,
      tier: data.tier,
      amountHalalas: data.amount_halalas,
      currency: data.currency,
      updatedAt: data.updated_at,
    },
    { headers },
  );
}
