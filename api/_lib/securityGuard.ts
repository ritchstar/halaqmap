/**
 * securityGuard — الحارس الأمني الحقيقي
 *
 * يُطبَّق على المسارات الحساسة:
 *  · يستخرج IP الحقيقي من الـ headers
 *  · يتحقق من قائمة الحظر في Supabase
 *  · يُسجَّل الأحداث المريبة
 *  · يُعيد 403/429 فورياً إذا كان IP محجوباً أو تجاوز الحدّ
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── استخراج IP الحقيقي ────────────────────────────────────────────────────
export function extractClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||       // Cloudflare
    request.headers.get('x-real-ip') ||               // Nginx proxy
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // Load balancer
    request.headers.get('x-vercel-forwarded-for') ||  // Vercel
    'unknown'
  );
}

// ─── فحص قائمة الحظر ──────────────────────────────────────────────────────
export async function isIpBlocked(supabase: SupabaseClient, ip: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false;
  try {
    const { data } = await supabase
      .from('security_block_list')
      .select('id, expires_at')
      .eq('ip', ip)
      .eq('active', true)
      .maybeSingle();

    if (!data) return false;

    // فحص انتهاء الصلاحية
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // ألغِ الحظر تلقائياً
      await supabase
        .from('security_block_list')
        .update({ active: false })
        .eq('id', data.id);
      return false;
    }

    return true;
  } catch {
    return false; // في حال خطأ DB — لا نوقف الخدمة
  }
}

// ─── تسجيل حدث أمني ──────────────────────────────────────────────────────
export async function logSecurityEvent(
  supabase: SupabaseClient,
  params: {
    ip: string;
    event_type: 'rate_limit_exceeded' | 'blocked_ip_attempt' | 'suspicious_pattern' | 'brute_force';
    severity: 'info' | 'warning' | 'critical';
    endpoint?: string;
    user_agent?: string;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from('security_events').insert({
      ip: params.ip,
      event_type: params.event_type,
      severity: params.severity,
      endpoint: params.endpoint,
      user_agent: params.user_agent,
      detail: params.detail ?? {},
    });
  } catch {
    /* صامت — التسجيل لا يوقف الخدمة */
  }
}

// ─── فحص معدّل الطلبات (Rate Limit) ─────────────────────────────────────────
export async function checkRateLimit(
  supabase: SupabaseClient,
  ip: string,
  limitPerMinute: number,
  endpoint: string,
): Promise<{ exceeded: boolean; count: number }> {
  if (!ip || ip === 'unknown') return { exceeded: false, count: 0 };
  try {
    const windowStart = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', windowStart);

    const currentCount = count ?? 0;
    if (currentCount >= limitPerMinute) {
      await logSecurityEvent(supabase, {
        ip,
        event_type: 'rate_limit_exceeded',
        severity: currentCount > limitPerMinute * 2 ? 'critical' : 'warning',
        endpoint,
        detail: { count: currentCount, limit: limitPerMinute },
      });
      return { exceeded: true, count: currentCount };
    }

    return { exceeded: false, count: currentCount };
  } catch {
    return { exceeded: false, count: 0 };
  }
}

// ─── استجابة الحظر ───────────────────────────────────────────────────────────
export function blockedResponse(reason: 'blocked' | 'rate_limit'): Response {
  const body = reason === 'blocked'
    ? { error: 'تم حظر هذا العنوان — يُرجى التواصل مع الدعم.', code: 'IP_BLOCKED' }
    : { error: 'طلبات كثيرة جداً — حاول بعد دقيقة.', code: 'RATE_LIMIT_EXCEEDED' };
  return Response.json(body, {
    status: reason === 'blocked' ? 403 : 429,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-RateLimit-Policy': 'security-guard',
    },
  });
}

// ─── الدالة الرئيسية — تُستخدم في API routes ─────────────────────────────────
export async function runSecurityGuard(
  request: Request,
  options: {
    rateLimit?: number;         // طلبات/دقيقة للـ IP (افتراضي: 60)
    sensitiveRoute?: boolean;   // مسار حساس → رصد أشد (افتراضي: false)
    supabaseUrl?: string;
    supabaseServiceKey?: string;
  } = {},
): Promise<{ allowed: true; ip: string } | { allowed: false; response: Response }> {
  const ip = extractClientIp(request);
  const endpoint = new URL(request.url).pathname;
  const userAgent = request.headers.get('user-agent') ?? undefined;

  const url = options.supabaseUrl || (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const key = options.supabaseServiceKey || (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !key) return { allowed: true, ip }; // إذا لم يتوفر Supabase — مرّر الطلب

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // ١. فحص قائمة الحظر
  const blocked = await isIpBlocked(supabase, ip);
  if (blocked) {
    await logSecurityEvent(supabase, {
      ip,
      event_type: 'blocked_ip_attempt',
      severity: 'critical',
      endpoint,
      user_agent: userAgent,
      detail: { method: request.method },
    });
    return { allowed: false, response: blockedResponse('blocked') };
  }

  // ٢. فحص معدّل الطلبات (للمسارات الحساسة)
  if (options.sensitiveRoute) {
    const limit = options.rateLimit ?? 20;
    const { exceeded } = await checkRateLimit(supabase, ip, limit, endpoint);
    if (exceeded) {
      return { allowed: false, response: blockedResponse('rate_limit') };
    }
  }

  return { allowed: true, ip };
}
