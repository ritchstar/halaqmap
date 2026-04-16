import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60,
};

type Tier = 'bronze' | 'gold' | 'diamond' | string;

type SinglePayload = {
  mode: 'single';
  barberName: string;
  barberEmail: string;
  tier?: Tier | null;
};

type BulkPayload = {
  mode: 'bulk_active';
  limit?: number;
};

type OnboardingBody = SinglePayload | BulkPayload;

type MailLinks = {
  loginUrl: string;
  dashboardUrl: string;
  policyUrl: string;
};

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon',
    'Access-Control-Max-Age': '86400',
  };
}

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function tierLabelAr(tier: Tier | null | undefined): string {
  const t = String(tier || '').toLowerCase();
  if (t === 'diamond') return 'الماسي';
  if (t === 'gold') return 'الذهبي';
  return 'البرونزي';
}

function sanitizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '');
}

function getSiteBaseUrl(): string {
  const fromEnv =
    (process.env.VITE_SITE_ORIGIN || process.env.VITE_PUBLIC_APP_ORIGIN || process.env.PUBLIC_SITE_ORIGIN || '')
      .trim();
  if (fromEnv) return sanitizeBaseUrl(fromEnv);
  return 'https://www.halaqmap.com';
}

function buildLinks(baseUrl: string): MailLinks {
  return {
    loginUrl: `${baseUrl}/#/barber/login`,
    dashboardUrl: `${baseUrl}/#/barber/dashboard`,
    policyUrl: `${baseUrl}/#/subscription-policy`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function emailText(name: string, tier: string, links: MailLinks): string {
  return [
    `مرحباً ${name}،`,
    '',
    'تم اعتماد حسابك في منصة حلاق ماب بنجاح.',
    `الباقة الحالية: ${tier}.`,
    '',
    'روابط مهمة:',
    `- تسجيل دخول الحلاق: ${links.loginUrl}`,
    `- لوحة التحكم: ${links.dashboardUrl}`,
    `- سياسة الاشتراكات: ${links.policyUrl}`,
    '',
    'شرح استخدام البنرات بشكل دقيق:',
    '1) سجّل الدخول عبر رابط تسجيل الدخول أعلاه.',
    '2) افتح لوحة التحكم ثم انتقل إلى قسم صور المحل والبنرات.',
    '3) ارفع الصور الأساسية: واجهة المحل + صورة داخلية واضحة.',
    '4) ارفع صور البنر (يفضّل مقاس أفقي واضح مثل 1600x900 وجودة جيدة).',
    '5) استخدم صوراً خالية من الكتابة الصغيرة والزخرفة الزائدة لضمان وضوح الإعلان.',
    '6) احفظ التغييرات ثم راجع بطاقة المحل في الصفحة الرئيسية للتأكد من الظهور الصحيح.',
    '7) حدّث الصور دوريًا عند وجود عروض أو تغييرات في الهوية البصرية.',
    '',
    'ملاحظات مهمة:',
    '- البيانات المعتمدة تُستخدم مباشرة في نتائج الظهور القريب للعملاء.',
    '- تأكد من صحة رقم الجوال وواتساب وساعات العمل لتفادي فقدان العملاء.',
    '',
    'مع تحيات فريق حلاق ماب.',
  ].join('\n');
}

function emailHtml(name: string, tier: string, links: MailLinks): string {
  const nameSafe = escapeHtml(name);
  const tierSafe = escapeHtml(tier);
  return `
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#1f2937">
  <h2 style="margin:0 0 12px">مرحباً ${nameSafe}</h2>
  <p style="margin:0 0 10px">تم اعتماد حسابك في منصة <strong>حلاق ماب</strong> بنجاح.</p>
  <p style="margin:0 0 14px">الباقة الحالية: <strong>${tierSafe}</strong>.</p>

  <div style="margin:0 0 14px">
    <p style="margin:0 0 8px"><strong>روابط مهمة:</strong></p>
    <ul style="margin:0;padding-right:18px">
      <li><a href="${links.loginUrl}" target="_blank" rel="noopener noreferrer">تسجيل دخول الحلاق</a></li>
      <li><a href="${links.dashboardUrl}" target="_blank" rel="noopener noreferrer">لوحة التحكم</a></li>
      <li><a href="${links.policyUrl}" target="_blank" rel="noopener noreferrer">سياسة الاشتراكات</a></li>
    </ul>
  </div>

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin:0 0 14px">
    <p style="margin:0 0 6px"><strong>شرح استخدام البنرات (دقيق ومختصر):</strong></p>
    <ol style="margin:0;padding-right:18px">
      <li>سجّل الدخول عبر رابط تسجيل الدخول.</li>
      <li>افتح لوحة التحكم وانتقل إلى قسم <strong>صور المحل والبنرات</strong>.</li>
      <li>ارفع الصور الأساسية: واجهة المحل + صورة داخلية واضحة.</li>
      <li>ارفع صور البنر بجودة عالية (يفضّل مقاس أفقي واضح مثل 1600x900).</li>
      <li>احفظ التغييرات ثم راجع بطاقة المحل في الصفحة الرئيسية.</li>
      <li>حدّث الصور دوريًا عند وجود عروض أو تغييرات.</li>
    </ol>
  </div>

  <p style="margin:0">مع تحيات فريق حلاق ماب.</p>
</div>
`.trim();
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  resendApiKey: string;
  fromEmail: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.resendApiKey}`,
      },
      body: JSON.stringify({
        from: input.fromEmail,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });
    const payload = (await resp.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!resp.ok || !payload.id) {
      return {
        ok: false,
        error: payload.message || payload.name || `Resend HTTP ${resp.status}`,
      };
    }
    return { ok: true, id: payload.id };
  } catch {
    return { ok: false, error: 'Network error while calling Resend API' };
  }
}

function validateAnon(request: Request, expectedAnon: string): { ok: true } | { ok: false; error: string; status: number } {
  if (!expectedAnon) {
    return {
      ok: false,
      error: 'Server not configured (SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY)',
      status: 503,
    };
  }
  const providedAnon = request.headers.get('x-supabase-anon')?.trim() || '';
  if (providedAnon !== expectedAnon) {
    return { ok: false, error: 'Unauthorized', status: 401 };
  }
  return { ok: true };
}

function parseLimit(raw: unknown, fallback = 200): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(500, Math.max(1, Math.floor(n)));
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** تشخيص بدون أسرار — /api/send-barber-onboarding */
export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const resendApiKeySet = Boolean((process.env.RESEND_API_KEY || '').trim());
  const fromEmailSet = Boolean((process.env.RESEND_FROM_EMAIL || '').trim());
  const anonSet = Boolean((process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'send-barber-onboarding',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      resendApiKeySet,
      resendFromEmailSet: fromEmailSet,
      anonKeySetForVerification: anonSet,
      ready: resendApiKeySet && fromEmailSet && anonSet,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();

  const anonCheck = validateAnon(request, expectedAnon);
  if (!anonCheck.ok) {
    return Response.json({ error: anonCheck.error }, { status: anonCheck.status, headers });
  }
  if (!resendApiKey || !fromEmail) {
    return Response.json(
      { error: 'Server not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)' },
      { status: 503, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }
  const payload = body as Partial<OnboardingBody>;
  const mode = payload.mode;

  const baseUrl = getSiteBaseUrl();
  const links = buildLinks(baseUrl);

  if (mode === 'single') {
    const barberEmail = String(payload.barberEmail || '').trim().toLowerCase();
    const barberName = String(payload.barberName || '').trim() || 'شريك حلاق ماب';
    const tier = tierLabelAr((payload as SinglePayload).tier);
    if (!barberEmail) {
      return Response.json({ error: 'Missing barberEmail' }, { status: 400, headers });
    }
    const subject = 'حلاق ماب | تم اعتماد حسابك + روابط لوحة التحكم ودليل البنرات';
    const text = emailText(barberName, tier, links);
    const html = emailHtml(barberName, tier, links);
    const sent = await sendViaResend({
      to: barberEmail,
      subject,
      text,
      html,
      resendApiKey,
      fromEmail,
    });
    if (!sent.ok) {
      return Response.json({ error: sent.error }, { status: 502, headers });
    }
    return Response.json({ ok: true, mode: 'single', messageId: sent.id, to: barberEmail }, { headers });
  }

  if (mode === 'bulk_active') {
    if (!url || !serviceRole) {
      return Response.json(
        { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
        { status: 503, headers }
      );
    }
    const limit = parseLimit((payload as BulkPayload).limit, 200);
    const supabase = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from('barbers')
      .select('name, email, tier, is_active')
      .eq('is_active', true)
      .not('email', 'is', null)
      .limit(limit);
    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers });
    }
    const rows = (data ?? []) as Array<{ name: string | null; email: string | null; tier: string | null }>;
    let sentCount = 0;
    const failed: Array<{ email: string; error: string }> = [];
    for (const row of rows) {
      const email = String(row.email || '').trim().toLowerCase();
      if (!email) continue;
      const name = String(row.name || '').trim() || 'شريك حلاق ماب';
      const tier = tierLabelAr(row.tier);
      const subject = 'حلاق ماب | روابط لوحة التحكم ودليل البنرات';
      const text = emailText(name, tier, links);
      const html = emailHtml(name, tier, links);
      const sent = await sendViaResend({
        to: email,
        subject,
        text,
        html,
        resendApiKey,
        fromEmail,
      });
      if (sent.ok) {
        sentCount += 1;
      } else {
        failed.push({ email, error: sent.error });
      }
    }
    return Response.json(
      {
        ok: true,
        mode: 'bulk_active',
        attempted: rows.length,
        sent: sentCount,
        failed: failed.length,
        failedDetails: failed.slice(0, 20),
      },
      { headers }
    );
  }

  return Response.json({ error: 'Unsupported mode' }, { status: 400, headers });
}
