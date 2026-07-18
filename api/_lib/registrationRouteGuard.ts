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
  if (routeId.startsWith('admin-sentinel-')) {
    return envInt('ADMIN_SENTINEL_RATE_LIMIT_MAX', 40);
  }
  if (routeId === 'partner-assistant-chat') {
    return envInt('PARTNER_ASSISTANT_RATE_LIMIT_MAX', 20);
  }
  // ── حملة إعلانية / تسجيل عام: حدود أضيق من الافتراضي 45 ──
  if (routeId === 'interest-signup') {
    return envInt('INTEREST_SIGNUP_RATE_LIMIT_MAX', 8);
  }
  if (routeId === 'register-submission') {
    return envInt('REGISTER_SUBMISSION_RATE_LIMIT_MAX', 8);
  }
  if (routeId === 'register-mint-intent') {
    return envInt('REGISTER_MINT_INTENT_RATE_LIMIT_MAX', 12);
  }
  if (routeId === 'register-upload-file' || routeId === 'register-signed-upload') {
    return envInt('REGISTER_UPLOAD_RATE_LIMIT_MAX', 10);
  }
  if (routeId === 'bronze-trial-apply' || routeId === 'ambassador-apply') {
    return envInt('PUBLIC_APPLY_RATE_LIMIT_MAX', 6);
  }
  if (
    routeId === 'bronze-trial-redeem' ||
    routeId === 'listing-license-redeem' ||
    routeId === 'bronze-trial-confirm-email'
  ) {
    return envInt('PUBLIC_REDEEM_RATE_LIMIT_MAX', 5);
  }
  if (routeId === 'public-hospitality-b2b-request') {
    return envInt('HOSPITALITY_B2B_RATE_LIMIT_MAX', 6);
  }
  if (routeId === 'send-registration-payment-summary') {
    return envInt('REGISTRATION_PAYMENT_SUMMARY_RATE_LIMIT_MAX', 3);
  }
  if (routeId === 'public-barbers-get') {
    return envInt('PUBLIC_BARBERS_RATE_LIMIT_MAX', 90);
  }
  if (routeId === 'public-pulse-map') {
    return envInt('PUBLIC_PULSE_MAP_RATE_LIMIT_MAX', 60);
  }
  if (routeId === 'presence-heartbeat') {
    return envInt('PRESENCE_HEARTBEAT_RATE_LIMIT_MAX', 36);
  }
  if (routeId === 'public-rate-barber-context') {
    return envInt('PUBLIC_RATE_BARBER_CONTEXT_RATE_LIMIT_MAX', 80);
  }
  if (routeId === 'submit-barber-qr-review') {
    return envInt('SUBMIT_BARBER_QR_REVIEW_RATE_LIMIT_MAX', 15);
  }
  if (routeId === 'barber-portal-magic-consume' || routeId === 'barber-portal-magic-enter') {
    return envInt('BARBER_PORTAL_MAGIC_RATE_LIMIT_MAX', 12);
  }
  if (routeId === 'barber-portfolio') {
    return envInt('BARBER_PORTFOLIO_RATE_LIMIT_MAX', 80);
  }
  if (routeId === 'barber-open-status-rotate-request') {
    return envInt('BARBER_OPEN_STATUS_ROTATE_REQUEST_RATE_LIMIT_MAX', 6);
  }
  if (routeId === 'barber-open-status-rotate-confirm') {
    return envInt('BARBER_OPEN_STATUS_ROTATE_CONFIRM_RATE_LIMIT_MAX', 12);
  }
  if (routeId === 'barber-open-status-rotate') {
    return envInt('BARBER_OPEN_STATUS_ROTATE_RATE_LIMIT_MAX', 8);
  }
  if (routeId === 'barber-gallery-sync') {
    return envInt('BARBER_GALLERY_SYNC_RATE_LIMIT_MAX', 60);
  }
  if (routeId === 'barber-portal-customer-private-chat') {
    return envInt('BARBER_PRIVATE_CHAT_RATE_LIMIT_MAX', 24);
  }
  if (routeId === 'customer-private-chat') {
    return envInt('CUSTOMER_PRIVATE_CHAT_RATE_LIMIT_MAX', 30);
  }
  if (routeId === 'diamond-appointment-booking') {
    return envInt('DIAMOND_APPOINTMENT_BOOKING_RATE_LIMIT_MAX', 20);
  }
  if (routeId === 'public-barber-gallery') {
    return envInt('PUBLIC_BARBER_GALLERY_RATE_LIMIT_MAX', 120);
  }
  if (routeId.startsWith('barber-portal')) {
    const barberOnly = envInt('BARBER_PORTAL_RATE_LIMIT_MAX', -1);
    if (barberOnly >= 0) return barberOnly;
    // أثناء ضغط الحملات: سقف أوضح لتسجيل الدخول/بوابة الحلاق
    return Math.min(20, envInt('REGISTRATION_RATE_LIMIT_MAX', 45));
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

function requestRefererOrigin(request: Request): string | null {
  const raw = request.headers.get('referer')?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function requestHostOrigin(request: Request): string | null {
  const host = request.headers.get('host')?.trim().toLowerCase();
  if (!host) return null;
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  const proto = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : 'https';
  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return null;
  }
}

/** المتصفح قد لا يُرسل Origin — نستنتج من Referer أو Host (شائع في WebView البريد). */
function resolveAllowedBrowserOrigin(request: Request, allowed: string[]): string | null {
  const direct = requestOriginNormalized(request);
  if (direct && allowed.includes(direct)) return direct;

  const refererOrigin = requestRefererOrigin(request);
  if (refererOrigin && allowed.includes(refererOrigin)) return refererOrigin;

  const hostOrigin = requestHostOrigin(request);
  if (hostOrigin && allowed.includes(hostOrigin)) return hostOrigin;

  return direct;
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

  // طلب نفس-الأصل أو غير-متصفح آمن بطبيعته (القائمة البيضاء تخص العابر للأصل فقط):
  //  - رأس Origin موجود ويطابق أصل الخادم، أو
  //  - لا Origin إطلاقاً (تنقّل مباشر أو جلب GET نفس-الأصل — المتصفح يُرسل Origin
  //    دائماً للطلبات العابرة للأصل عبر fetch/XHR وPOST) وReferer إمّا غائب أو
  //    يطابق أصل الخادم. هذا يغطّي نشر Preview على Vercel دون فتح ثغرة للعابر.
  const directOrigin = requestOriginNormalized(request);
  const selfOrigin = requestHostOrigin(request);
  const refererOrigin = requestRefererOrigin(request);
  if (directOrigin) {
    if (selfOrigin && directOrigin === selfOrigin) return { ok: true };
  } else if (!refererOrigin || refererOrigin === selfOrigin) {
    return { ok: true };
  }

  const origin = resolveAllowedBrowserOrigin(request, allowed);
  if (!origin) {
    return {
      ok: false,
      status: 403,
      json: {
        error: 'Forbidden',
        hint: 'Missing or disallowed Origin. Add your site to PUBLIC_API_ALLOWED_ORIGINS (e.g. https://www.halaqmap.com,https://halaqmap.com). Same-origin GET may omit Origin; Referer/Host must match the allowlist.',
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
