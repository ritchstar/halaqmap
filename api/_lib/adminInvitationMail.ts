/**
 * Admin invitation + password-reset email templates.
 *
 * Tone: Arabic, administrative-professional. Each email is personalised
 * by name (with a graceful fallback when no display name is recorded),
 * carries an "open dashboard" CTA pre-filled with the recipient's email,
 * and exposes the generated temporary password in a copy-friendly block.
 */

type ResendOk = { ok: true; id: string };
type ResendErr = { ok: false; error: string };
type ResendResult = ResendOk | ResendErr;

const ADMIN_LOGIN_BASE_ENV_KEYS = [
  'ADMIN_LOGIN_URL',
  'VITE_ADMIN_LOGIN_URL',
] as const;

const SITE_ORIGIN_ENV_KEYS = [
  'PUBLIC_SITE_ORIGIN',
  'VITE_PUBLIC_APP_ORIGIN',
  'VITE_SITE_ORIGIN',
] as const;

const ADMIN_PORTAL_BASE_ENV_KEYS = [
  'VITE_ADMIN_PORTAL_BASE',
  'ADMIN_PORTAL_BASE',
] as const;

/**
 * Must stay aligned with `ADMIN_PORTAL_DEFAULT_BASE` in
 * src/config/adminAuth.ts — the React Router registers this base
 * even when the env override is not provided, so emails built with
 * this fallback still resolve to a real route (no 404).
 */
const ADMIN_PORTAL_FALLBACK_BASE = '/_hmap-int-9kz2';

/** Resolve the site origin (e.g. https://www.halaqmap.com) — no trailing slash. */
function readSiteOrigin(): string {
  for (const key of SITE_ORIGIN_ENV_KEYS) {
    const v = (process.env[key] || '').trim();
    if (v) return v.replace(/\/+$/, '');
  }
  return 'https://www.halaqmap.com';
}

function normalizeBaseSegment(raw: string): string {
  let b = raw.trim();
  if (!b) return ADMIN_PORTAL_FALLBACK_BASE;
  if (!b.startsWith('/')) b = `/${b}`;
  return b.replace(/\/+$/, '');
}

/**
 * Resolve the canonical admin portal base used in invitation emails.
 *
 * Mirrors `getAdminPortalBasePath()` on the frontend:
 *   - if the env var holds a comma-separated list, take the FIRST entry
 *     (the canonical/active obfuscated path)
 *   - otherwise fall back to the same default the frontend ships with
 *     so links keep resolving even when env vars are missing
 */
function readAdminPortalBase(): string {
  for (const key of ADMIN_PORTAL_BASE_ENV_KEYS) {
    const v = (process.env[key] || '').trim();
    if (!v) continue;
    const first = v.split(',').map((s) => s.trim()).filter(Boolean)[0];
    if (first) return normalizeBaseSegment(first);
  }
  return ADMIN_PORTAL_FALLBACK_BASE;
}

/**
 * The login URL the founder wants embedded in invitation emails.
 * Supports an explicit `ADMIN_LOGIN_URL` override, otherwise composed
 * from site origin + admin portal base + `/in`. The recipient's email
 * is appended as a query parameter so the login form pre-fills.
 */
export function buildAdminLoginUrl(emailForPrefill: string): string {
  for (const key of ADMIN_LOGIN_BASE_ENV_KEYS) {
    const v = (process.env[key] || '').trim();
    if (v) {
      const sep = v.includes('?') ? '&' : '?';
      return `${v.replace(/\/+$/, '')}${sep}email=${encodeURIComponent(emailForPrefill)}`;
    }
  }
  const origin = readSiteOrigin();
  const base = readAdminPortalBase();
  return `${origin}/#${base}/in?email=${encodeURIComponent(emailForPrefill)}`;
}

/**
 * Generate a cryptographically-strong human-friendly password.
 * 16 characters: 4 uppercase + 4 lowercase + 4 digits + 4 safe symbols,
 * shuffled, no characters that are easily confused (1/I/l, 0/O).
 */
export function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#%&*+=?';
  const pickN = (pool: string, n: number): string => {
    const out: string[] = [];
    const buf = new Uint32Array(n);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(buf);
      for (let i = 0; i < n; i++) out.push(pool[buf[i] % pool.length]);
    } else {
      for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return out.join('');
  };

  const raw = pickN(upper, 4) + pickN(lower, 4) + pickN(digits, 4) + pickN(symbols, 4);
  const arr = raw.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPermissionsList(permissions: Record<string, boolean | null | undefined>): string[] {
  const ARABIC_LABELS: Record<string, string> = {
    super_admin: 'سوبر أدمن (كل الصلاحيات)',
    manage_admins: 'إدارة المدراء والصلاحيات',
    manage_barbers: 'إدارة الحلاقين والشركاء',
    view_overview: 'الاطلاع على لوحة المتابعة',
    view_command_center: 'فتح غرفة القيادة والرادار',
    manage_financials: 'إدارة المالية والفواتير',
    manage_listings: 'إدارة الإدراجات الجغرافية',
    manage_subscriptions: 'إدارة تفعيلات الرخصة',
    manage_marketing: 'إدارة التسويق والحملات',
    manage_payouts: 'إدارة المدفوعات للشركاء',
    manage_support_chat: 'إدارة محادثات الدعم',
    manage_ops_controller: 'إدارة وحدات التشغيل (Ops Controller)',
    view_engineering_council: 'الاطلاع على مجلس الهندسة',
    invoke_engineering_council: 'استدعاء مجلس الهندسة',
    view_public_prosecutor: 'الاطلاع على المدعي العام الرقمي',
    invoke_public_prosecutor: 'استدعاء المدعي العام الرقمي',
  };
  const out: string[] = [];
  for (const [key, value] of Object.entries(permissions)) {
    if (!value) continue;
    out.push(ARABIC_LABELS[key] ?? key);
  }
  return out.length > 0 ? out : ['(لم تحدد صلاحيات بعد)'];
}

// ---------------------------------------------------------------------------
// Invitation email — first contact with a newly-added admin.
// ---------------------------------------------------------------------------

export function buildAdminInvitationEmail(input: {
  recipientDisplayName: string;
  recipientEmail: string;
  temporaryPassword: string;
  loginUrl: string;
  permissions: Record<string, boolean | null | undefined>;
  invitedByDisplayName?: string;
  invitedByEmail?: string;
}): { subject: string; text: string; html: string } {
  const name = input.recipientDisplayName.trim() || 'الزميل الكريم';
  const inviter =
    input.invitedByDisplayName?.trim() ||
    input.invitedByEmail?.trim() ||
    'إدارة منصة حلاق ماب';
  const perms = buildPermissionsList(input.permissions);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(input.recipientEmail);
  const safePass = escapeHtml(input.temporaryPassword);
  const safeUrl = escapeHtml(input.loginUrl);
  const safeInviter = escapeHtml(inviter);

  const subject = `حلاق ماب | دعوة رسمية للانضمام إلى فريق الإدارة — ${input.recipientEmail}`;

  const text = [
    `السلام عليكم ${name}،`,
    '',
    `تمت دعوتك من قِبَل ${inviter} للانضمام إلى فريق إدارة منصة حلاق ماب بصلاحيات إدارية مخصّصة.`,
    '',
    'تفاصيل دخولك إلى لوحة التحكم:',
    `• البريد الإداري: ${input.recipientEmail}`,
    `• كلمة المرور المؤقتة: ${input.temporaryPassword}`,
    `• رابط لوحة التحكم: ${input.loginUrl}`,
    '',
    'الصلاحيات الممنوحة لك:',
    ...perms.map((p) => `  - ${p}`),
    '',
    'تعليمات أمنية مهمة:',
    '1) افتح رابط لوحة التحكم أعلاه واستخدم البريد وكلمة المرور للدخول مباشرة.',
    '2) كلمة المرور أعلاه مؤقتة — يُنصح بشدة بتغييرها من إعدادات الحساب فور الدخول.',
    '3) لا تشارك هذه الرسالة أو كلمة المرور مع أي شخص.',
    '4) في حال فقدان كلمة المرور لاحقاً، استخدم رابط «نسيت كلمة المرور» في صفحة الدخول وسنرسل إليك كلمة مرور جديدة مؤقتة على بريدك.',
    '',
    'بالتوفيق في مهامك،',
    '— فريق إدارة منصة حلاق ماب',
  ].join('\n');

  const permsHtml = perms
    .map((p) => `<li style="margin:4px 0;color:#1e293b">${escapeHtml(p)}</li>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Tahoma,'Segoe UI',Arial,sans-serif;color:#e2e8f0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;background:#0f172a">
<tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35)">
<tr><td style="height:5px;background:linear-gradient(90deg,#f59e0b 0%,#dc2626 50%,#7c2d12 100%)"></td></tr>
<tr><td style="padding:30px 28px 12px;text-align:right;background:#fff">
  <div style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;letter-spacing:0.5px;margin-bottom:18px">دعوة إدارية رسمية — حلاق ماب</div>
  <h1 style="margin:0 0 6px;font-size:24px;color:#0f172a;line-height:1.4">أهلاً ${safeName}،</h1>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#334155">
    تمت دعوتك من قِبَل <strong style="color:#dc2626">${safeInviter}</strong> للانضمام إلى
    <strong>فريق إدارة منصة حلاق ماب</strong> بصلاحيات إدارية مخصّصة. أعددنا حسابك ولا يتبقى سوى خطوة دخولك الأولى.
  </p>
</td></tr>

<tr><td style="padding:0 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:14px;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)">
    <tr><td style="padding:18px 20px">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.5px;color:#b45309">بيانات الدخول المؤقتة</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">البريد الإداري</td>
          <td style="padding:6px 0;font-family:Consolas,Monaco,monospace;font-size:14px;color:#0f172a;direction:ltr;text-align:left"><strong>${safeEmail}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">كلمة المرور المؤقتة</td>
          <td style="padding:6px 0;font-family:Consolas,Monaco,monospace;font-size:16px;color:#7c2d12;direction:ltr;text-align:left;letter-spacing:1px"><strong style="background:#fde68a;padding:4px 10px;border-radius:6px;display:inline-block">${safePass}</strong></td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#92400e;line-height:1.7">انسخ كلمة المرور بالضغط عليها مرة واحدة، ثم استخدمها مع بريدك للدخول.</p>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:22px 28px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${safeUrl}" style="display:inline-block;padding:14px 36px;border-radius:12px;background:linear-gradient(180deg,#dc2626,#991b1b);color:#fff;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 24px rgba(220,38,38,0.35)">فتح لوحة التحكم الآن</a>
  </td></tr></table>
  <p style="margin:14px 0 0;text-align:center;font-size:11px;color:#94a3b8;direction:ltr">${safeUrl}</p>
</td></tr>

<tr><td style="padding:24px 28px 8px">
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0f172a">الصلاحيات الممنوحة لك</p>
  <ul style="margin:0;padding:0 18px 0 0;font-size:14px;line-height:1.9;color:#1e293b">${permsHtml}</ul>
</td></tr>

<tr><td style="padding:18px 28px 22px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fecaca;border-radius:12px;background:#fef2f2">
    <tr><td style="padding:14px 18px;font-size:13px;line-height:1.8;color:#7f1d1d">
      <strong style="color:#991b1b">تعليمات أمنية:</strong>
      <ol style="margin:8px 0 0;padding:0 20px 0 0">
        <li>غيّر كلمة المرور بعد أول دخول من إعدادات الحساب.</li>
        <li>لا تشارك هذه الرسالة أو كلمة المرور — هي شخصية بحت.</li>
        <li>في حال فقدان كلمة المرور، اضغط <strong>«نسيت كلمة المرور؟»</strong> في صفحة الدخول وسنرسل لك كلمة مرور جديدة مؤقتة.</li>
      </ol>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:14px 28px 24px;text-align:center;border-top:1px solid #e2e8f0;background:#f8fafc">
  <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">— فريق إدارة منصة حلاق ماب<br>منصة <strong>حلاق ماب</strong> · مزوّد حلول تقنية للتواجد الجغرافي للحلاقين</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Password reset email — sent on a "forgot password" request.
// ---------------------------------------------------------------------------

export function buildAdminPasswordResetEmail(input: {
  recipientDisplayName: string;
  recipientEmail: string;
  temporaryPassword: string;
  loginUrl: string;
}): { subject: string; text: string; html: string } {
  const name = input.recipientDisplayName.trim() || 'الزميل الكريم';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(input.recipientEmail);
  const safePass = escapeHtml(input.temporaryPassword);
  const safeUrl = escapeHtml(input.loginUrl);

  const subject = `حلاق ماب | كلمة مرور إدارية جديدة — ${input.recipientEmail}`;

  const text = [
    `السلام عليكم ${name}،`,
    '',
    'بناءً على طلبك إعادة تعيين كلمة المرور، أنشأنا لك كلمة مرور مؤقتة جديدة:',
    '',
    `• البريد الإداري: ${input.recipientEmail}`,
    `• كلمة المرور الجديدة: ${input.temporaryPassword}`,
    `• رابط لوحة التحكم: ${input.loginUrl}`,
    '',
    'يُنصح بشدة بتغيير كلمة المرور فور الدخول من إعدادات الحساب.',
    '',
    'إذا لم تطلب أنت هذه الرسالة، تجاهلها — كلمة المرور القديمة لم تعد فعّالة الآن، يمكنك طلب واحدة جديدة في أي وقت.',
    '',
    '— فريق إدارة منصة حلاق ماب',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Tahoma,'Segoe UI',Arial,sans-serif;color:#e2e8f0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;background:#0f172a">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35)">
<tr><td style="height:5px;background:linear-gradient(90deg,#0891b2 0%,#0e7490 50%,#155e75 100%)"></td></tr>
<tr><td style="padding:28px 26px 8px;text-align:right">
  <div style="display:inline-block;padding:4px 12px;border-radius:999px;background:#cffafe;color:#155e75;font-size:11px;font-weight:700;letter-spacing:0.5px;margin-bottom:16px">إعادة تعيين كلمة المرور — حلاق ماب</div>
  <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a">أهلاً ${safeName}،</h1>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.85;color:#334155">
    بناءً على طلبك من صفحة الدخول، أعدنا توليد كلمة مرور إدارية مؤقتة لحسابك. كلمة المرور السابقة لم تعد فعّالة.
  </p>
</td></tr>

<tr><td style="padding:0 26px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #a5f3fc;border-radius:14px;background:#ecfeff">
    <tr><td style="padding:18px 20px">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.5px;color:#155e75">بيانات الدخول الجديدة</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">البريد الإداري</td>
          <td style="padding:6px 0;font-family:Consolas,Monaco,monospace;font-size:14px;color:#0f172a;direction:ltr;text-align:left"><strong>${safeEmail}</strong></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#64748b">كلمة المرور الجديدة</td>
          <td style="padding:6px 0;font-family:Consolas,Monaco,monospace;font-size:16px;color:#0e7490;direction:ltr;text-align:left;letter-spacing:1px"><strong style="background:#a5f3fc;padding:4px 10px;border-radius:6px;display:inline-block">${safePass}</strong></td>
        </tr>
      </table>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:20px 26px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${safeUrl}" style="display:inline-block;padding:13px 32px;border-radius:12px;background:linear-gradient(180deg,#0891b2,#0e7490);color:#fff;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 6px 18px rgba(8,145,178,0.35)">فتح صفحة الدخول</a>
  </td></tr></table>
  <p style="margin:12px 0 0;text-align:center;font-size:11px;color:#94a3b8;direction:ltr">${safeUrl}</p>
</td></tr>

<tr><td style="padding:20px 26px 22px">
  <p style="margin:0;font-size:13px;line-height:1.8;color:#475569">
    إذا لم تطلب أنت هذه الرسالة، تجاهلها فقط — كلمة المرور القديمة قد أُلغيت كإجراء احترازي، ولا حاجة لأي خطوة من جانبك. يمكنك طلب كلمة مرور جديدة في أي وقت لاحقاً.
  </p>
</td></tr>

<tr><td style="padding:14px 26px 22px;text-align:center;border-top:1px solid #e2e8f0;background:#f8fafc">
  <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">— فريق إدارة منصة حلاق ماب</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Resend transport — shared with the rest of the platform.
// ---------------------------------------------------------------------------

export async function sendAdminTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<ResendResult> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return { ok: false, error: 'resend_not_configured' };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      reply_to: input.replyTo,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) return { ok: false, error: raw.slice(0, 400) || `resend_${resp.status}` };
  try {
    const j = JSON.parse(raw) as { id?: string };
    return { ok: true, id: String(j.id ?? '') };
  } catch {
    return { ok: true, id: '' };
  }
}
