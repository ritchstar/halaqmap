/**
 * حماية خفيفة لمسارات عامة (تسجيل، رفع، بوابة حلاق) — لا تعتمد على سرّ زائر:
 * - حد معدّل لكل عنوان IP (نافذة ثابتة، ذاكرة العملية — يقلل الضجيج على نفس مثيل Vercel).
 * - قائمة أصول مسموحة (اختياري): PUBLIC_API_ALLOWED_ORIGINS أو REGISTRATION_ALLOWED_ORIGINS.
 */

export type RegistrationGuardResult =
  | { ok: true }
  | { ok: false; status: number; json: Record<string, unknown> };

function envInt(name: string, fallback: number): number {
  const raw = (process.env[name] || '').trim();
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function clientIpFromRequest(request: Request): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 128);
  const cf = request.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf.slice(0, 128);
  return 'unknown';
}

type Bucket = { count: number; windowStart: number };
const rateBuckets = new Map<string, Bucket>();
const RATE_PRUNE_EVERY = 200;

function pruneRateBuckets(now: number, windowMs: number): void {
  if (rateBuckets.size < RATE_PRUNE_EVERY) return;
  for (const [k, v] of rateBuckets) {
    if (now - v.windowStart > windowMs * 2) rateBuckets.delete(k);
  }
  if (rateBuckets.size > RATE_PRUNE_EVERY) rateBuckets.clear();
}

function rateLimitOk(routeId: string, ip: string, max: number, windowMs: number): boolean {
  if (max <= 0 || windowMs <= 0) return true;
  const key = `${routeId}|${ip}`;
  const now = Date.now();
  pruneRateBuckets(now, windowMs);
  const b = rateBuckets.get(key);
  if (!b || now - b.windowStart >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

function normalizeOriginList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      try {
        return new URL(s).origin;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
}

/** يُفضّل PUBLIC_API_ALLOWED_ORIGINS؛ وإلا تُستخدم REGISTRATION_ALLOWED_ORIGINS للتوافق مع النشر السابق. */
export function parsePublicApiAllowedOrigins(): string[] {
  const primary = (process.env.PUBLIC_API_ALLOWED_ORIGINS || '').trim();
  if (primary) return normalizeOriginList(primary);
  const legacy = (process.env.REGISTRATION_ALLOWED_ORIGINS || '').trim();
  if (legacy) return normalizeOriginList(legacy);
  return [];
}

/** اسم قديم — يعيد نفس parsePublicApiAllowedOrigins (الاختبارات والاستيرادات الحالية). */
export function parseRegistrationAllowedOrigins(): string[] {
  return parsePublicApiAllowedOrigins();
}

function rateLimitMaxForRoute(routeId: string): number {
  if (routeId.startsWith('barber-portal')) {
    const barberOnly = envInt('BARBER_PORTAL_RATE_LIMIT_MAX', -1);
    if (barberOnly >= 0) return barberOnly;
    return Math.min(30, envInt('REGISTRATION_RATE_LIMIT_MAX', 45));
  }
  return envInt('REGISTRATION_RATE_LIMIT_MAX', 45);
}

export function registrationGuardDiagnostics(): {
  rateLimitMax: number;
  barberPortalRateLimitMax: number;
  rateLimitWindowMs: number;
  originAllowlistEnabled: boolean;
  originAllowlistCount: number;
} {
  const list = parsePublicApiAllowedOrigins();
  return {
    rateLimitMax: envInt('REGISTRATION_RATE_LIMIT_MAX', 45),
    barberPortalRateLimitMax: rateLimitMaxForRoute('barber-portal-login'),
    rateLimitWindowMs: envInt('REGISTRATION_RATE_LIMIT_WINDOW_MS', 60_000),
    originAllowlistEnabled: list.length > 0,
    originAllowlistCount: list.length,
  };
}

function requestOriginNormalized(request: Request): string | null {
  const raw = request.headers.get('origin')?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * يُستدعى في بداية POST لمسارات التسجيل وبوابة الحلاق وغيرها من الـ APIs العامة.
 * @param routeId مفتاح فريد لكل مسار (للعداد المنفصل)
 */
export function runRegistrationRouteGuards(request: Request, routeId: string): RegistrationGuardResult {
  const max = rateLimitMaxForRoute(routeId);
  const windowMs = envInt('REGISTRATION_RATE_LIMIT_WINDOW_MS', 60_000);
  const ip = clientIpFromRequest(request);

  if (!rateLimitOk(routeId, ip, max, windowMs)) {
    return {
      ok: false,
      status: 429,
      json: {
        error: 'Too many requests',
        hint: 'Slow down requests from this client. Tune REGISTRATION_RATE_LIMIT_MAX / REGISTRATION_RATE_LIMIT_WINDOW_MS; for barber portal only use BARBER_PORTAL_RATE_LIMIT_MAX.',
      },
    };
  }

  const allowed = parsePublicApiAllowedOrigins();
  if (allowed.length === 0) {
    return { ok: true };
  }

  const origin = requestOriginNormalized(request);
  if (!origin) {
    return {
      ok: false,
      status: 403,
      json: {
        error: 'Forbidden',
        hint: 'Missing Origin header. Browsers send Origin on cross-origin POST. For API tests, send Origin matching PUBLIC_API_ALLOWED_ORIGINS or REGISTRATION_ALLOWED_ORIGINS.',
      },
    };
  }

  if (!allowed.includes(origin)) {
    return {
      ok: false,
      status: 403,
      json: {
        error: 'Forbidden',
        hint: 'Origin not allowed. Set PUBLIC_API_ALLOWED_ORIGINS or REGISTRATION_ALLOWED_ORIGINS (comma-separated) on the server.',
        origin,
      },
    };
  }

  return { ok: true };
}
