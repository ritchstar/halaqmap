/**
 * GET /api/barber-portal-magic-enter?m=...&next=watch
 * دخول سريع من البريد — بدون اعتماد على #/barber/enter (يتجنب فقدان الرمز عند تحويل النطاق).
 */
import { createClient } from '@supabase/supabase-js';
import { siteBaseUrlFromEnv } from './_lib/barberProvisionService.js';
import { getBarberPortalMagicSecret } from './_lib/barberPortalMagicToken.js';
import { consumeBarberPortalMagicToken } from './_lib/barberPortalMagicConsumeCore.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';

export const config = { maxDuration: 15 };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tierToSubscription(tier: string): string {
  const t = String(tier || '').toLowerCase();
  if (t === 'gold') return 'gold';
  if (t === 'diamond') return 'diamond';
  return 'bronze';
}

function destinationHash(next: string | null): string {
  if (next === 'watch') return '/barber/dashboard?view=watch';
  return '/barber/dashboard';
}

function loginHash(next: string | null): string {
  const dest = destinationHash(next);
  return `/partners/login?next=${encodeURIComponent(dest)}`;
}

function htmlPage(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="font-family:Tahoma,Arial,sans-serif;padding:24px;line-height:1.8;color:#1e293b">${body}</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

function successBootstrapHtml(siteBase: string, next: string | null, session: Record<string, unknown>): Response {
  const dest = `${siteBase}/#${destinationHash(next)}`;
  const sessionObj = { ...session, loggedIn: true };
  const body = `<p style="margin:0 0 12px">جاري فتح لوحة التحكم…</p>
<script>
(function () {
  try {
    var session = ${JSON.stringify(sessionObj)};
    localStorage.setItem('barberAuth', JSON.stringify(session));
  } catch (e) {}
  location.replace(${JSON.stringify(dest)});
})();
</script>
<noscript><p>فعّل JavaScript ثم <a href="${escapeHtml(dest)}">اضغط هنا</a>.</p></noscript>`;
  return htmlPage('جاري الدخول', body);
}

function failureHtml(siteBase: string, next: string | null, message: string): Response {
  const loginUrl = `${siteBase}/#${loginHash(next)}`;
  const body = `<p style="margin:0 0 12px;color:#b45309;font-weight:700">${escapeHtml(message)}</p>
<p style="margin:0 0 12px;font-size:14px;color:#475569">يمكنك تسجيل الدخول يدوياً من صفحة الشركاء باستخدام البريد وكلمة المرور في أحدث بريد تفعيل.</p>
<p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#0d9488;color:#fff;font-weight:700;text-decoration:none">تسجيل الدخول اليدوي</a></p>`;
  return htmlPage('تعذر الدخول السريع', body);
}

export async function GET(request: Request): Promise<Response> {
  const guard = runRegistrationRouteGuards(request, 'barber-portal-magic-enter');
  if (guard.ok === false) {
    const siteBase = siteBaseUrlFromEnv();
    return failureHtml(siteBase, null, String(guard.json.error || 'تعذر التحقق من الطلب.'));
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('m')?.trim() || '';
  const next = url.searchParams.get('next')?.trim() || null;
  const siteBase = siteBaseUrlFromEnv();

  const secret = getBarberPortalMagicSecret();
  if (!secret) {
    return failureHtml(siteBase, next, 'روابط الدخول السريع غير مفعّلة على الخادم.');
  }

  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return failureHtml(siteBase, next, 'الخادم غير مضبوط.');
  }

  if (!token) {
    return failureHtml(siteBase, next, 'الرابط ناقص الرمز.');
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await consumeBarberPortalMagicToken(supabase, token, secret);
  if (result.ok === false) {
    return failureHtml(siteBase, next, result.error);
  }

  const b = result.barber;
  const session = {
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone || '',
    subscription: tierToSubscription(b.tier),
    ratingInviteToken: b.rating_invite_token,
    memberNumber: b.member_number,
    inclusiveCare: b.inclusiveCare,
    barberSessionToken: result.barber_session_token || '',
    salonRole: result.salon_role,
  };

  return successBootstrapHtml(siteBase, next, session);
}
