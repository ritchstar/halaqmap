/**
 * securityGuard — الحارس الأمني الحقيقي
 *
 * يُطبَّق على المسارات الحساسة:
 *  · يستخرج IP الحقيقي من الـ headers
 *  · يتحقق من قائمة الحظر في Supabase
 *  · حد معدّل في ذاكرة العملية (يعمل حتى بدون صفوف سابقة في security_events)
 *  · يُسجَّل الأحداث المريبة ورحلات honeypot
 *  · يُعيد 403/429 فورياً إذا كان IP محجوباً أو تجاوز الحدّ
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── استخراج IP الحقيقي ────────────────────────────────────────────────────
export function extractClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') || // Cloudflare
    request.headers.get('x-real-ip') || // Nginx proxy
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // Load balancer
    request.headers.get('x-vercel-forwarded-for') || // Vercel
    'unknown'
  );
}

// ─── حد معدّل في الذاكرة (لكل مثيل) ─────────────────────────────────────────
type MemBucket = { count: number; windowStart: number };
const memRateBuckets = new Map<string, MemBucket>();
const honeypotBuckets = new Map<string, MemBucket>();
const MEM_PRUNE_EVERY = 250;
const MEM_WINDOW_MS = 60_000;
const HONEYPOT_WINDOW_MS = 10 * 60_000;
const HONEYPOT_AUTO_BLOCK_AFTER = 5;
const HONEYPOT_BLOCK_TTL_MS = 60 * 60_000;

function pruneMap(map: Map<string, MemBucket>, now: number, windowMs: number): void {
  if (map.size < MEM_PRUNE_EVERY) return;
  for (const [k, v] of map) {
    if (now - v.windowStart > windowMs * 2) map.delete(k);
  }
  if (map.size > MEM_PRUNE_EVERY) map.clear();
}

/** true = مسموح، false = تجاوز الحد */
function memoryRateLimitOk(ip: string, endpoint: string, limitPerMinute: number): boolean {
  if (!ip || ip === 'unknown' || limitPerMinute <= 0) return true;
  const key = `${endpoint}|${ip}`;
  const now = Date.now();
  pruneMap(memRateBuckets, now, MEM_WINDOW_MS);
  const b = memRateBuckets.get(key);
  if (!b || now - b.windowStart >= MEM_WINDOW_MS) {
    memRateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (b.count >= limitPerMinute) return false;
  b.count += 1;
  return true;
}

function bumpHoneypotCount(ip: string): number {
  const now = Date.now();
  pruneMap(honeypotBuckets, now, HONEYPOT_WINDOW_MS);
  const b = honeypotBuckets.get(ip);
  if (!b || now - b.windowStart >= HONEYPOT_WINDOW_MS) {
    honeypotBuckets.set(ip, { count: 1, windowStart: now });
    return 1;
  }
  b.count += 1;
  return b.count;
}

function getServiceSupabase(
  supabaseUrl?: string,
  supabaseServiceKey?: string,
): SupabaseClient | null {
  const url = supabaseUrl || (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const key =
    supabaseServiceKey || (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ─── فحص قائمة الحظر ──────────────────────────────────────────────────────
export async function isIpBlocked(supabase: SupabaseClient, ip: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false;
  try {
    const { data: rows } = await supabase
      .from('security_block_list')
      .select('id, expires_at')
      .eq('ip', ip)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    const data = Array.isArray(rows) ? rows[0] : null;
    if (!data) return false;

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      await supabase.from('security_block_list').update({ active: false }).eq('id', data.id);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ─── جلب موقع IP الجغرافي (ip-api.com — مجاني) ────────────────────────────
async function getIpGeo(
  ip: string,
): Promise<{ ip_lat?: number; ip_lng?: number; ip_country?: string; ip_city?: string }> {
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return {};
  }
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 1800);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,country,city`, {
      signal: ctrl.signal,
    });
    const d = (await res.json()) as { lat?: number; lon?: number; country?: string; city?: string };
    return { ip_lat: d.lat, ip_lng: d.lon, ip_country: d.country, ip_city: d.city };
  } catch {
    return {};
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
    withGeo?: boolean;
  },
): Promise<void> {
  try {
    const geoData = params.withGeo || params.severity === 'critical' ? await getIpGeo(params.ip) : {};
    await supabase.from('security_events').insert({
      ip: params.ip,
      event_type: params.event_type,
      severity: params.severity,
      endpoint: params.endpoint,
      user_agent: params.user_agent,
      detail: params.detail ?? {},
      ...geoData,
    });
  } catch {
    /* صامت — التسجيل لا يوقف الخدمة */
  }
}

async function softBlockIp(
  supabase: SupabaseClient,
  ip: string,
  reason: string,
  ttlMs: number,
): Promise<void> {
  if (!ip || ip === 'unknown') return;
  try {
    await supabase.from('security_block_list').insert({
      ip,
      reason,
      blocked_by: 'security_guard_auto',
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      active: true,
      metadata: { source: 'honeypot_surge' },
    });
  } catch {
    /* صامت */
  }
}

/**
 * رحلة honeypot على نموذج عام: تسجّل الحدث، وبعد تكرار كافٍ تحظر IP مؤقتاً.
 * يُستدعى بعد اكتشاف حقل website غير فارغ — مع الإبقاء على استجابة 200 وهمية في المسار.
 */
export async function recordHoneypotTrip(
  request: Request,
  routeId: string,
): Promise<void> {
  const ip = extractClientIp(request);
  const hits = bumpHoneypotCount(ip);
  const supabase = getServiceSupabase();
  if (!supabase) return;

  const endpoint = new URL(request.url).pathname;
  await logSecurityEvent(supabase, {
    ip,
    event_type: 'suspicious_pattern',
    severity: hits >= HONEYPOT_AUTO_BLOCK_AFTER ? 'critical' : 'warning',
    endpoint,
    user_agent: request.headers.get('user-agent') ?? undefined,
    detail: { kind: 'honeypot', routeId, hits },
    withGeo: hits >= 3,
  });

  if (hits >= HONEYPOT_AUTO_BLOCK_AFTER) {
    await softBlockIp(
      supabase,
      ip,
      `honeypot_auto_block:${routeId}`,
      HONEYPOT_BLOCK_TTL_MS,
    );
  }
}

// ─── فحص معدّل الطلبات (DB — مكمّل للذاكرة؛ لا يعتمد على نجاحات سابقة) ──
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
      .eq('endpoint', endpoint)
      .in('event_type', ['rate_limit_exceeded', 'brute_force', 'suspicious_pattern'])
      .gte('created_at', windowStart);

    const currentCount = count ?? 0;
    // عتبة DB أعلى من الذاكرة — للحظر عند هجمات مسجّلة فقط
    const dbThreshold = Math.max(limitPerMinute * 2, 20);
    if (currentCount >= dbThreshold) {
      await logSecurityEvent(supabase, {
        ip,
        event_type: 'rate_limit_exceeded',
        severity: currentCount > dbThreshold * 2 ? 'critical' : 'warning',
        endpoint,
        detail: { count: currentCount, limit: dbThreshold, source: 'db_events' },
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
  const body =
    reason === 'blocked'
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
    rateLimit?: number; // طلبات/دقيقة للـ IP على هذا المسار (افتراضي: 20)
    sensitiveRoute?: boolean; // مسار حساس → رصد أشد (افتراضي: false)
    supabaseUrl?: string;
    supabaseServiceKey?: string;
  } = {},
): Promise<{ allowed: true; ip: string } | { allowed: false; response: Response }> {
  const ip = extractClientIp(request);
  const endpoint = new URL(request.url).pathname;
  const userAgent = request.headers.get('user-agent') ?? undefined;

  const supabase = getServiceSupabase(options.supabaseUrl, options.supabaseServiceKey);

  // بدون Supabase: طبّق حد الذاكرة فقط على المسارات الحساسة
  if (!supabase) {
    if (options.sensitiveRoute) {
      const limit = options.rateLimit ?? 20;
      if (!memoryRateLimitOk(ip, endpoint, limit)) {
        return { allowed: false, response: blockedResponse('rate_limit') };
      }
    }
    return { allowed: true, ip };
  }

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

  // ٢. فحص معدّل الطلبات (للمسارات الحساسة) — ذاكرة أولاً ثم أحداث DB
  if (options.sensitiveRoute) {
    const limit = options.rateLimit ?? 20;
    if (!memoryRateLimitOk(ip, endpoint, limit)) {
      await logSecurityEvent(supabase, {
        ip,
        event_type: 'rate_limit_exceeded',
        severity: 'warning',
        endpoint,
        user_agent: userAgent,
        detail: { limit, source: 'memory' },
      });
      return { allowed: false, response: blockedResponse('rate_limit') };
    }

    const { exceeded } = await checkRateLimit(supabase, ip, limit, endpoint);
    if (exceeded) {
      return { allowed: false, response: blockedResponse('rate_limit') };
    }
  }

  return { allowed: true, ip };
}
