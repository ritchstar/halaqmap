import type { SupabaseClient } from '@supabase/supabase-js';
import { safeHost, verifyManageBarbersAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { whitelistBarberUpsertRow } from './_lib/approveBarberUpsertWhitelist.js';
import {
  isBarberUpsertMissingInclusiveCareColumnError,
  stripInclusiveCareKeysFromBarberUpsertRow,
} from './_lib/barberInclusiveCareUpsertRetry.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 45,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function siteBaseUrl(): string {
  const fromEnv = (
    process.env.VITE_SITE_ORIGIN ||
    process.env.VITE_PUBLIC_APP_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
    ''
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  return 'https://www.halaqmap.com';
}

/** كلمة مرور مؤقتة آمنة للبريد (بدون أحرف مربكة). */
function generateBarberTempPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(22);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += chars[bytes[i]! % chars.length];
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendBarberCredentialsViaResend(input: {
  to: string;
  dashboardUrl: string;
  email: string;
  password: string;
  barberName: string;
  apiKey: string;
  fromEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = 'حلاق ماب | بيانات الدخول — لوحة تحكم الحلاق';
  const text = [
    `أهلًا ${input.barberName}،`,
    '',
    'تم إنشاء حسابك على حلاق ماب. يمكنك تسجيل الدخول بالبيانات التالية:',
    '',
    `البريد: ${input.email}`,
    `كلمة المرور: ${input.password}`,
    '',
    `رابط لوحة التحكم: ${input.dashboardUrl}`,
    '',
    'نوصي بتغيير كلمة المرور بعد أول دخول.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc"><p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p><p>تم إنشاء حسابك. استخدم البيانات التالية لتسجيل الدخول إلى لوحة التحكم:</p><table style="margin:16px 0;border-collapse:collapse;font-size:15px"><tr><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff">البريد</td><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff" dir="ltr">${escapeHtml(input.email)}</td></tr><tr><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff">كلمة المرور</td><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff;font-family:ui-monospace,monospace" dir="ltr">${escapeHtml(input.password)}</td></tr></table><p><a href="${escapeHtml(input.dashboardUrl)}" style="display:inline-block;padding:12px 22px;background:#0d9488;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">فتح لوحة التحكم</a></p><p style="font-size:13px;color:#64748b">يُفضّل تغيير كلمة المرور بعد أول دخول.</p></body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.fromEmail,
      to: [input.to],
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
    return { ok: false, error: msg };
  }
  return { ok: true };
}

/**
 * يُنشئ مستخدم Auth أو يُحدّث كلمة مروره إن وُجد مسبقاً بنفس البريد.
 * email_confirm: true لتجاوز خطوة تأكيد البريد في Supabase.
 */
async function ensureAuthUserWithPassword(
  supabase: SupabaseClient,
  emailRaw: string,
  password: string,
  fullName: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!createErr && created.user?.id) {
    return { ok: true, userId: created.user.id };
  }
  if (!createErr) {
    return { ok: false, error: 'createUser returned no user' };
  }
  const errMsg = createErr.message?.toLowerCase() ?? '';
  const dup =
    createErr.status === 422 ||
    errMsg.includes('already') ||
    errMsg.includes('registered') ||
    errMsg.includes('exists') ||
    errMsg.includes('duplicate') ||
    errMsg.includes('user already');
  if (!dup) {
    return { ok: false, error: createErr.message };
  }
  let foundId: string | null = null;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (listErr || !data?.users?.length) break;
    const u = data.users.find((x) => (x.email ?? '').toLowerCase() === email);
    if (u?.id) {
      foundId = u.id;
      break;
    }
    if (data.users.length < 200) break;
  }
  if (!foundId) {
    return { ok: false, error: createErr.message ?? 'User exists but could not be resolved' };
  }
  const { error: upErr } = await supabase.auth.admin.updateUserById(foundId, {
    password,
    email_confirm: true,
  });
  if (upErr) return { ok: false, error: upErr.message };
  return { ok: true, userId: foundId };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** تشخيص بدون أسرار — افتح: /api/approve-barber */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const url = Boolean(resolvedUrl);
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const resendApiKeySet = Boolean((process.env.RESEND_API_KEY || '').trim());
  const resendFromEmailSet = Boolean((process.env.RESEND_FROM_EMAIL || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'approve-barber',
      supabaseUrlSet: url,
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      resendApiKeySet,
      resendFromEmailSet,
      postAuth: 'Authorization: Bearer <Supabase access_token> + active admin with manage_barbers',
      ready: url && serviceRole,
      credentialsEmailReady: url && serviceRole && resendApiKeySet && resendFromEmailSet,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  const adminAuth = await verifyManageBarbersAdminFromRequest(request, url, serviceRole);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const bodyObj = body as {
    row?: unknown;
    legalDisclaimerAccepted?: unknown;
    legalDisclaimerAcceptedAtIso?: unknown;
  };
  const row = bodyObj?.row;
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return Response.json({ error: 'Invalid row payload' }, { status: 400, headers });
  }

  const legalDisclaimerAccepted = bodyObj.legalDisclaimerAccepted === true;
  const legalDisclaimerAcceptedAtIso =
    typeof bodyObj.legalDisclaimerAcceptedAtIso === 'string'
      ? bodyObj.legalDisclaimerAcceptedAtIso.trim()
      : '';

  const wl = whitelistBarberUpsertRow(row as Record<string, unknown>);
  if (wl.ok === false) {
    return Response.json(
      {
        error: 'Row contains disallowed fields',
        disallowedKeys: wl.disallowedKeys,
        hint: 'Only barber profile columns approved for admin upsert are accepted (rating_invite_token is server-managed).',
      },
      { status: 400, headers }
    );
  }

  const email = String((wl.row as { email?: unknown }).email ?? '').trim();
  if (!email) {
    return Response.json({ error: 'Missing barber email' }, { status: 400, headers });
  }

  const barberDisplayName = String((wl.row as { name?: unknown }).name ?? '').trim() || 'شريك حلاق ماب';

  /** يُربط user_id من الخادم فقط بعد إنشاء حساب Auth — لا نثق بقيمة العميل. */
  const upsertSource = { ...(wl.row as Record<string, unknown>) };
  delete upsertSource.user_id;
  let upsertPayload: Record<string, unknown> = upsertSource;
  let skippedInclusiveCareDueToSchema = false;
  let { data, error } = await supabase
    .from('barbers')
    .upsert(upsertPayload, { onConflict: 'email' })
    .select('id, member_number')
    .single();

  if (error && isBarberUpsertMissingInclusiveCareColumnError(error.message)) {
    skippedInclusiveCareDueToSchema = true;
    upsertPayload = stripInclusiveCareKeysFromBarberUpsertRow(upsertSource);
    const second = await supabase
      .from('barbers')
      .upsert(upsertPayload, { onConflict: 'email' })
      .select('id, member_number')
      .single();
    data = second.data;
    error = second.error;
  }

  if (error || !data) {
    return Response.json({ error: error?.message || 'Upsert failed' }, { status: 500, headers });
  }

  const tempPassword = generateBarberTempPassword();
  const authResult = await ensureAuthUserWithPassword(supabase, email, tempPassword, barberDisplayName);
  if (authResult.ok === false) {
    return Response.json(
      { error: authResult.error, hint: 'فشل إنشاء/تحديث مستخدم Supabase Auth', barberId: String((data as { id: string }).id) },
      { status: 502, headers },
    );
  }
  const authUserId = authResult.userId;

  const { error: linkErr } = await supabase.from('barbers').update({ user_id: authUserId }).eq('id', String((data as { id: string }).id));
  if (linkErr) {
    return Response.json(
      {
        error: linkErr.message || 'Failed to link barber.user_id',
        hint: 'تم إنشاء مستخدم Auth لكن فشل ربطه بصف الحلاق — راجع يدوياً.',
        authUserId,
        barberId: String((data as { id: string }).id),
      },
      { status: 500, headers },
    );
  }

  const profilePatch: Record<string, unknown> = {
    user_type: 'barber',
    full_name: barberDisplayName,
  };
  if (legalDisclaimerAccepted) {
    profilePatch.legal_disclaimer_accepted = true;
    profilePatch.acceptance_timestamp = legalDisclaimerAcceptedAtIso || new Date().toISOString();
  }
  const { error: profilePatchErr } = await supabase.from('profiles').update(profilePatch).eq('id', authUserId);
  if (profilePatchErr && process.env.NODE_ENV !== 'production') {
    console.warn('[approve-barber] profile update:', profilePatchErr.message);
  }

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const resendFromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  const dashboardUrl = `${siteBaseUrl()}/#/barber/dashboard`;
  let credentialEmailSent = false;
  let credentialEmailError: string | undefined;
  if (resendApiKey && resendFromEmail) {
    const mail = await sendBarberCredentialsViaResend({
      to: email.trim(),
      dashboardUrl,
      email: email.trim(),
      password: tempPassword,
      barberName: barberDisplayName,
      apiKey: resendApiKey,
      fromEmail: resendFromEmail,
    });
    if (mail.ok) credentialEmailSent = true;
    else credentialEmailError = mail.error;
  } else {
    credentialEmailError = 'RESEND_API_KEY أو RESEND_FROM_EMAIL غير مضبوطين — لم يُرسل بريد بيانات الدخول.';
  }

  const barberId = String((data as { id: string }).id);
  const memberNumberRaw = (data as { member_number?: number | null }).member_number;
  const memberNumber =
    memberNumberRaw != null && Number.isFinite(Number(memberNumberRaw)) ? Number(memberNumberRaw) : null;

  /** صفوف قديمة أو upsert بدون لمس العمود قد تبقي rating_invite_token فارغاً — يُعبَّأ هنا ليعمل QR والبريد */
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('barbers')
    .select('rating_invite_token')
    .eq('id', barberId)
    .maybeSingle();
  if (!tokenErr && tokenRow) {
    const existing = String((tokenRow as { rating_invite_token?: string | null }).rating_invite_token ?? '').trim();
    if (!existing) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const fresh = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      const { error: upErr } = await supabase
        .from('barbers')
        .update({ rating_invite_token: fresh })
        .eq('id', barberId);
      if (upErr) {
        return Response.json(
          { error: upErr.message || 'Failed to set rating_invite_token', barberId },
          { status: 500, headers },
        );
      }
    }
  }

  /** رمز صفحة خفيفة لتبديل «مفتوح/مغلق» للعملاء (مفيد للبرونزي دون لوحة تحكم) */
  let shopOpenQuickHashLink: string | undefined;
  const { data: ostRow, error: ostErr } = await supabase
    .from('barbers')
    .select('open_status_token')
    .eq('id', barberId)
    .maybeSingle();
  if (!ostErr && ostRow) {
    let tok = String((ostRow as { open_status_token?: string | null }).open_status_token ?? '').trim();
    if (!tok) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      tok = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      const { error: ostUpErr } = await supabase.from('barbers').update({ open_status_token: tok }).eq('id', barberId);
      if (ostUpErr) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[approve-barber] open_status_token:', ostUpErr.message);
        }
      }
    }
    const { data: ostAgain } = await supabase.from('barbers').select('open_status_token').eq('id', barberId).maybeSingle();
    const finalTok = String((ostAgain as { open_status_token?: string | null } | null)?.open_status_token ?? '').trim();
    if (finalTok) {
      shopOpenQuickHashLink = `/#/partners/shop-open?t=${encodeURIComponent(finalTok)}`;
    }
  }

  return Response.json(
    {
      ok: true,
      barberId,
      memberNumber,
      authUserId,
      credentialEmailSent,
      ...(credentialEmailError ? { credentialEmailError } : {}),
      ...(shopOpenQuickHashLink ? { shopOpenQuickHashLink } : {}),
      ...(skippedInclusiveCareDueToSchema
        ? {
            warning:
              'تم حفظ الحلاق دون حقول «رعاية شاملة» لأن قاعدة البيانات لا تزال بلا الأعمدة الجديدة. نفّذ ترحيل 32 أو 38 في Supabase ثم حدّث إعدادات الرعاية من لوحة الحلاق.',
          }
        : {}),
    },
    { headers }
  );
}
