/**
 * إرسال بريد ملخص طلب التسجيل + رابط صفحة الدفع (Resend) — بعد التحقق من تطابق البريد مع الطلب في قاعدة البيانات.
 */

import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 30 };

const TABLE = 'registration_submissions';
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;
const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function sanitizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function getSiteBaseUrl(): string {
  const fromEnv = (
    process.env.VITE_SITE_ORIGIN ||
    process.env.VITE_PUBLIC_APP_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
    ''
  ).trim();
  if (fromEnv) return sanitizeBaseUrl(fromEnv);
  return 'https://halaqmap.com';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tierLabelAr(tier: string): string {
  const t = tier.trim().toLowerCase();
  if (t === 'gold') return 'ذهبي';
  if (t === 'diamond') return 'ماسي';
  return 'برونزي';
}

function paymentMethodLabelAr(method: string): string {
  return method === 'bank_transfer' ? 'تحويل بنكي (فترة مسبقة الدفع)' : 'تفعيل الحزمة البرمجية (بطاقة / ميسر)';
}

function buildPaymentUrl(siteBase: string, tier: string, orderId: string): string {
  const q = new URLSearchParams();
  q.set('tier', tier.trim().toLowerCase());
  if (orderId.trim()) q.set('requestId', orderId.trim());
  return `${sanitizeBaseUrl(siteBase)}/#/partners/payment?${q.toString()}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const resend = Boolean((process.env.RESEND_API_KEY || '').trim() && (process.env.RESEND_FROM_EMAIL || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'send-registration-payment-summary',
      supabaseConfigured: url && serviceRole,
      resendConfigured: resend,
      ready: url && serviceRole && resend,
    },
    { headers },
  );
}

type PostBody = {
  orderId?: unknown;
  email?: unknown;
  shopName?: unknown;
  tier?: unknown;
  paymentMethod?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'send-registration-payment-summary');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!resendApiKey || !fromEmail) {
    return Response.json(
      { error: 'email_service_unavailable', hint: 'Configure RESEND_API_KEY and RESEND_FROM_EMAIL on the server.' },
      { status: 503, headers },
    );
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json(
      { error: 'verification_unavailable', hint: 'Server needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to verify the request.' },
      { status: 503, headers },
    );
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const orderId = String(body.orderId ?? '').trim();
  const email = String(body.email ?? '').trim();
  const shopName = String(body.shopName ?? '').trim().slice(0, 240);
  const tierRaw = String(body.tier ?? '').trim().toLowerCase();
  const paymentMethod = String(body.paymentMethod ?? '').trim();

  if (!ORDER_ID_RE.test(orderId)) {
    return Response.json({ error: 'invalid_order_id' }, { status: 400, headers });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400, headers });
  }
  if (shopName.length < 1) {
    return Response.json({ error: 'invalid_shop_name' }, { status: 400, headers });
  }
  if (!['bronze', 'gold', 'diamond'].includes(tierRaw)) {
    return Response.json({ error: 'invalid_tier' }, { status: 400, headers });
  }
  if (paymentMethod !== 'monthly' && paymentMethod !== 'bank_transfer') {
    return Response.json({ error: 'invalid_payment_method' }, { status: 400, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: selErr } = await supabase.from(TABLE).select('payload').eq('id', orderId).maybeSingle();
  if (selErr || !row?.payload || typeof row.payload !== 'object' || Array.isArray(row.payload)) {
    return Response.json({ error: 'verification_failed' }, { status: 400, headers });
  }

  const payload = row.payload as Record<string, unknown>;
  const storedEmail = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!storedEmail || storedEmail !== email.toLowerCase()) {
    return Response.json({ error: 'verification_failed' }, { status: 400, headers });
  }

  const storedTier = typeof payload.tier === 'string' ? payload.tier.trim().toLowerCase() : '';
  if (storedTier && storedTier !== tierRaw) {
    return Response.json({ error: 'tier_mismatch' }, { status: 400, headers });
  }

  const siteBase = getSiteBaseUrl();
  const paymentUrl = buildPaymentUrl(siteBase, tierRaw, orderId);
  const tierAr = tierLabelAr(tierRaw);
  const payAr = paymentMethodLabelAr(paymentMethod);

  const subject = `حلاق ماب — رابط إتمام الدفع | ${orderId}`;
  const text = [
    `أهلًا ${shopName}،`,
    '',
    'ملخص طلبك:',
    `- رقم الطلب: ${orderId}`,
    `- اسم المحل: ${shopName}`,
    `- الباقة: ${tierAr}`,
    `- طريقة الدفع المختارة عند التقديم: ${payAr}`,
    '',
    `رابط إتمام الدفع (احفظه أو افتحه من أي جهاز):`,
    paymentUrl,
    '',
    'يمكنك إكمال الدفع من هذا الرابط في أي وقت لتفعيل حزمتك البرمجية بعد اعتماد الإدارة للطلب.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc">
<p>أهلًا <strong>${escapeHtml(shopName)}</strong>،</p>
<p>هذا ملخص طلب التسجيل لدينا:</p>
<ul style="list-style:none;padding:0">
<li><strong>رقم الطلب:</strong> <span dir="ltr">${escapeHtml(orderId)}</span></li>
<li><strong>اسم المحل:</strong> ${escapeHtml(shopName)}</li>
<li><strong>الباقة:</strong> ${escapeHtml(tierAr)}</li>
<li><strong>طريقة الدفع عند التقديم:</strong> ${escapeHtml(payAr)}</li>
</ul>
<p><a href="${escapeHtml(paymentUrl)}" style="display:inline-block;padding:12px 22px;background:#0d9488;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">فتح صفحة الدفع</a></p>
<p style="font-size:14px;color:#334155">يمكنك إكمال الدفع من هذا الرابط في أي وقت لتفعيل حزمتك البرمجية بعد اعتماد الإدارة للطلب.</p>
<p style="font-size:12px;color:#64748b" dir="ltr">${escapeHtml(paymentUrl)}</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject,
      text,
      html,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    let msg = raw.slice(0, 400);
    try {
      const j = JSON.parse(raw) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    return Response.json({ error: 'resend_failed', detail: msg }, { status: 502, headers });
  }

  let messageId = '';
  try {
    const j = JSON.parse(raw) as { id?: string };
    if (j.id) messageId = j.id;
  } catch {
    /* ignore */
  }

  return Response.json({ ok: true, messageId }, { status: 200, headers });
}
