/**
 * طابور طلبات تجربة برونزي — مستقل عن التسجيل الرسمي.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { issueBronzeTrialCodes } from './bronzeTrialCodeService.js';
import {
  mintBronzeTrialEmailConfirmToken,
  verifyBronzeTrialEmailConfirmToken,
} from './bronzeTrialEmailConfirmToken.js';
import { readResendFromEmailEnv, resolveResendFromAddress } from './resendFrom.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHOTO_URL_RE = /^https?:\/\/.+/i;

function siteBase(): string {
  const raw = (
    process.env.APP_PUBLIC_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
    process.env.VITE_SITE_URL ||
    'https://www.halaqmap.com'
  )
    .trim()
    .replace(/\/+$/, '');
  return raw || 'https://www.halaqmap.com';
}

function normalizeEmail(raw: string): string {
  return String(raw ?? '').trim().toLowerCase();
}

async function sendResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = resolveResendFromAddress(readResendFromEmailEnv());
  if (!apiKey || !from) return { ok: false, error: 'resend_not_configured' };
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text().catch(() => '');
    return { ok: false, error: t.slice(0, 300) || `resend_http_${resp.status}` };
  }
  return { ok: true };
}

export type BronzeTrialApplicationInput = {
  salonName: string;
  establishmentName: string;
  email: string;
  phone: string;
  whatsapp: string;
  cityAr: string;
  districtAr: string;
  regionAr?: string | null;
  latitude: number;
  longitude: number;
  notes?: string | null;
  photoExteriorSignUrl: string;
  photoExterior2Url: string;
  photoInterior1Url: string;
  photoInterior2Url: string;
  uploadOrderId?: string | null;
};

export async function submitBronzeTrialApplication(
  supabase: SupabaseClient,
  input: BronzeTrialApplicationInput,
): Promise<{ ok: true; applicationId: string; confirmEmailSent: boolean } | { ok: false; error: string; status: number }> {
  const email = normalizeEmail(input.email);
  const salonName = String(input.salonName ?? '').trim().slice(0, 120);
  const establishmentName = String(input.establishmentName ?? '').trim().slice(0, 160);
  const phone = String(input.phone ?? '').trim().slice(0, 40);
  const whatsapp = String(input.whatsapp ?? '').trim().slice(0, 40);
  const cityAr = String(input.cityAr ?? '').trim().slice(0, 80);
  const districtAr = String(input.districtAr ?? '').trim().slice(0, 80);
  const regionAr = String(input.regionAr ?? '').trim().slice(0, 80) || null;
  const notes = String(input.notes ?? '').trim().slice(0, 1000) || null;
  const lat = Number(input.latitude);
  const lng = Number(input.longitude);
  const photos = [
    String(input.photoExteriorSignUrl ?? '').trim(),
    String(input.photoExterior2Url ?? '').trim(),
    String(input.photoInterior1Url ?? '').trim(),
    String(input.photoInterior2Url ?? '').trim(),
  ];

  if (!salonName || !establishmentName) return { ok: false, error: 'missing_names', status: 400 };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email', status: 400 };
  if (!phone || !whatsapp) return { ok: false, error: 'missing_phone', status: 400 };
  if (!cityAr || !districtAr) return { ok: false, error: 'missing_location', status: 400 };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false, error: 'invalid_coordinates', status: 400 };
  }
  if (photos.some((u) => !PHOTO_URL_RE.test(u))) return { ok: false, error: 'missing_photos', status: 400 };

  const { data: pendingDup } = await supabase
    .from('bronze_trial_applications')
    .select('id, status')
    .ilike('email', email)
    .in('status', ['pending_email', 'pending_review', 'approved'])
    .limit(1)
    .maybeSingle();
  if (pendingDup?.id) {
    return { ok: false, error: 'application_already_exists', status: 409 };
  }

  const { data: row, error } = await supabase
    .from('bronze_trial_applications')
    .insert({
      status: 'pending_email',
      salon_name: salonName,
      establishment_name: establishmentName,
      email,
      phone,
      whatsapp,
      city_ar: cityAr,
      district_ar: districtAr,
      region_ar: regionAr,
      latitude: lat,
      longitude: lng,
      notes,
      photo_exterior_sign_url: photos[0],
      photo_exterior_2_url: photos[1],
      photo_interior_1_url: photos[2],
      photo_interior_2_url: photos[3],
      upload_order_id: String(input.uploadOrderId ?? '').trim() || null,
    })
    .select('id')
    .single();

  if (error || !row?.id) {
    return { ok: false, error: error?.message ?? 'insert_failed', status: 500 };
  }

  const mail = await sendConfirmEmail(supabase, String(row.id), email, salonName);
  return {
    ok: true,
    applicationId: String(row.id),
    confirmEmailSent: mail.ok,
  };
}

async function sendConfirmEmail(
  _supabase: SupabaseClient,
  applicationId: string,
  email: string,
  salonName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const minted = mintBronzeTrialEmailConfirmToken({ applicationId, email });
  if (!minted.ok) return minted;
  const confirmUrl = `${siteBase()}/#/partners/bronze-trial/confirm?c=${encodeURIComponent(minted.token)}`;
  const subject = 'حلاق ماب | أكّد بريدك لطلب التجربة البرونزية';
  const text = [
    `مرحباً،`,
    `استلمنا طلب تقييم تجربة برونزي لـ «${salonName}».`,
    `هذا الطلب ليس تسجيلاً رسمياً في المنصة.`,
    `أكّد بريدك عبر الرابط (صالح حتى 48 ساعة):`,
    confirmUrl,
    `بعد التأكيد يُراجع الطلب خلال 3–5 أيام عمل.`,
    `— حلاق ماب`,
  ].join('\n');
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7">
<p>مرحباً،</p>
<p>استلمنا طلب تقييم تجربة برونزي لـ <strong>${salonName}</strong>.</p>
<p><strong>هذا الطلب ليس تسجيلاً رسمياً</strong> في المنصة.</p>
<p><a href="${confirmUrl}">اضغط هنا لتأكيد البريد</a> (صالح حتى 48 ساعة).</p>
<p>بعد التأكيد يُراجع الطلب خلال 3–5 أيام عمل.</p>
<p>— حلاق ماب</p>
</div>`;
  return sendResend({ to: email, subject, html, text });
}

export async function confirmBronzeTrialApplicationEmail(
  supabase: SupabaseClient,
  token: string,
): Promise<{ ok: true; applicationId: string } | { ok: false; error: string; status: number }> {
  const verified = verifyBronzeTrialEmailConfirmToken(token);
  if (!verified.ok) {
    const status = verified.error === 'token_expired' ? 410 : 400;
    return { ok: false, error: verified.error, status };
  }

  const { data: row, error } = await supabase
    .from('bronze_trial_applications')
    .select('id, email, status, email_confirmed_at')
    .eq('id', verified.applicationId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!row?.id) return { ok: false, error: 'application_not_found', status: 404 };
  if (normalizeEmail(String(row.email)) !== verified.email) {
    return { ok: false, error: 'email_mismatch', status: 403 };
  }
  if (row.status === 'pending_review' || row.status === 'approved') {
    // إن وُجدت الحالة دون طابع زمني (طلبات قديمة/عالقة) أكمل التسجيل.
    if (!row.email_confirmed_at && row.status === 'pending_review') {
      const nowFix = new Date().toISOString();
      await supabase
        .from('bronze_trial_applications')
        .update({ email_confirmed_at: nowFix, updated_at: nowFix })
        .eq('id', row.id)
        .is('email_confirmed_at', null);
    }
    return { ok: true, applicationId: String(row.id) };
  }
  if (row.status !== 'pending_email') {
    return { ok: false, error: 'invalid_status', status: 409 };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from('bronze_trial_applications')
    .update({
      status: 'pending_review',
      email_confirmed_at: now,
      updated_at: now,
    })
    .eq('id', row.id)
    .eq('status', 'pending_email')
    .select('id, status, email_confirmed_at')
    .maybeSingle();

  if (updErr) return { ok: false, error: updErr.message, status: 500 };

  if (!updated?.id || String(updated.status) !== 'pending_review') {
    const { data: again } = await supabase
      .from('bronze_trial_applications')
      .select('id, status, email_confirmed_at')
      .eq('id', row.id)
      .maybeSingle();
    if (
      again?.id &&
      (again.status === 'pending_review' || again.status === 'approved') &&
      again.email_confirmed_at
    ) {
      return { ok: true, applicationId: String(again.id) };
    }
    console.error('[bronze-trial-confirm] update_no_row', {
      applicationId: row.id,
      updated,
      again,
    });
    return { ok: false, error: 'confirm_update_failed', status: 500 };
  }

  return { ok: true, applicationId: String(updated.id) };
}

/** تأكيد بريد يدوياً من لوحة الأدمن (طلبات عالقة بعد ضغط العميل للرابط). */
export async function adminConfirmBronzeTrialApplicationEmail(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<{ ok: true; applicationId: string } | { ok: false; error: string; status: number }> {
  const id = String(applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };

  const { data: row, error } = await supabase
    .from('bronze_trial_applications')
    .select('id, status, email_confirmed_at')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!row?.id) return { ok: false, error: 'application_not_found', status: 404 };

  if (row.status === 'pending_review' || row.status === 'approved') {
    if (!row.email_confirmed_at) {
      const now = new Date().toISOString();
      await supabase
        .from('bronze_trial_applications')
        .update({ email_confirmed_at: now, updated_at: now })
        .eq('id', id);
    }
    return { ok: true, applicationId: id };
  }
  if (row.status !== 'pending_email') {
    return { ok: false, error: 'invalid_status', status: 409 };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from('bronze_trial_applications')
    .update({
      status: 'pending_review',
      email_confirmed_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .eq('status', 'pending_email')
    .select('id, status')
    .maybeSingle();

  if (updErr) return { ok: false, error: updErr.message, status: 500 };
  if (!updated?.id) return { ok: false, error: 'confirm_update_failed', status: 500 };
  return { ok: true, applicationId: id };
}

export async function approveBronzeTrialApplication(
  supabase: SupabaseClient,
  input: { applicationId: string; adminEmail: string },
): Promise<
  | { ok: true; plaintextCode: string; emailSent: boolean }
  | { ok: false; error: string; status: number }
> {
  const id = String(input.applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };

  const { data: app, error } = await supabase
    .from('bronze_trial_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!app) return { ok: false, error: 'application_not_found', status: 404 };
  if (app.status !== 'pending_review') {
    return { ok: false, error: 'not_pending_review', status: 409 };
  }

  const email = normalizeEmail(String(app.email));
  const issued = await issueBronzeTrialCodes(supabase, {
    count: 1,
    adminEmail: input.adminEmail,
    note: `طلب تجربة: ${app.salon_name}`,
    boundEmail: email,
    applicationId: id,
  });
  if (!issued.ok || !issued.codes[0]) {
    return { ok: false, error: issued.ok === false ? issued.error : 'issue_failed', status: 500 };
  }
  const plaintextCode = issued.codes[0];

  const { data: codeRow } = await supabase
    .from('bronze_trial_codes')
    .select('id')
    .eq('bound_email', email)
    .eq('application_id', id)
    .eq('status', 'issued')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date().toISOString();
  const mail = await sendTrialCodeEmail({
    to: email,
    salonName: String(app.salon_name),
    code: plaintextCode,
  });

  await supabase
    .from('bronze_trial_applications')
    .update({
      status: 'approved',
      reviewed_at: now,
      reviewed_by_admin_email: input.adminEmail,
      trial_code_id: codeRow?.id ?? null,
      code_emailed_at: mail.ok ? now : null,
      code_email_count: mail.ok ? 1 : 0,
      updated_at: now,
    })
    .eq('id', id);

  return { ok: true, plaintextCode, emailSent: mail.ok };
}

export async function rejectBronzeTrialApplication(
  supabase: SupabaseClient,
  input: { applicationId: string; adminEmail: string; reason?: string | null },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const id = String(input.applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('bronze_trial_applications')
    .update({
      status: 'rejected',
      reviewed_at: now,
      reviewed_by_admin_email: input.adminEmail,
      reject_reason: String(input.reason ?? '').trim().slice(0, 500) || null,
      updated_at: now,
    })
    .eq('id', id)
    .in('status', ['pending_email', 'pending_review'])
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!data?.id) return { ok: false, error: 'not_rejectable', status: 409 };
  return { ok: true };
}

export async function resendBronzeTrialCodeEmail(
  supabase: SupabaseClient,
  input: { applicationId: string; adminEmail: string },
): Promise<{ ok: true; plaintextCode?: string } | { ok: false; error: string; status: number }> {
  const id = String(input.applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };

  const { data: app, error } = await supabase
    .from('bronze_trial_applications')
    .select('id, email, salon_name, status, trial_code_id, code_email_count')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!app) return { ok: false, error: 'application_not_found', status: 404 };
  if (app.status !== 'approved') return { ok: false, error: 'not_approved', status: 409 };

  // إعادة الإصدار فقط إن لم يُستهلك الكود — وإلا نولّد بديلاً مرتبطاً بنفس الإيميل
  let plaintextCode: string | null = null;
  if (app.trial_code_id) {
    const { data: codeRow } = await supabase
      .from('bronze_trial_codes')
      .select('id, status')
      .eq('id', app.trial_code_id)
      .maybeSingle();
    if (codeRow?.status === 'issued') {
      // لا نملك النص الصريح بعد الإصدار — نولّد كوداً جديداً ونلغي القديم
      await supabase
        .from('bronze_trial_codes')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('id', codeRow.id)
        .eq('status', 'issued');
    }
  }

  const email = normalizeEmail(String(app.email));
  const issued = await issueBronzeTrialCodes(supabase, {
    count: 1,
    adminEmail: input.adminEmail,
    note: `إعادة إرسال — ${app.salon_name}`,
    boundEmail: email,
    applicationId: id,
  });
  if (!issued.ok || !issued.codes[0]) {
    return { ok: false, error: issued.ok === false ? issued.error : 'issue_failed', status: 500 };
  }
  plaintextCode = issued.codes[0];

  const { data: newCode } = await supabase
    .from('bronze_trial_codes')
    .select('id')
    .eq('application_id', id)
    .eq('status', 'issued')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const mail = await sendTrialCodeEmail({
    to: email,
    salonName: String(app.salon_name),
    code: plaintextCode,
  });
  if (!mail.ok) return { ok: false, error: mail.error, status: 502 };

  const now = new Date().toISOString();
  await supabase
    .from('bronze_trial_applications')
    .update({
      trial_code_id: newCode?.id ?? null,
      code_emailed_at: now,
      code_email_count: (Number(app.code_email_count) || 0) + 1,
      updated_at: now,
    })
    .eq('id', id);

  return { ok: true, plaintextCode };
}

async function sendTrialCodeEmail(input: {
  to: string;
  salonName: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const registerUrl = `${siteBase()}/#/partners/register`;
  const subject = 'حلاق ماب | كود تفعيل تجربة برونزي 30 يوماً';
  const text = [
    `مرحباً،`,
    `تمت الموافقة على طلب تقييم التجربة لـ «${input.salonName}».`,
    ``,
    `كود التفعيل (لمرة واحدة): ${input.code}`,
    ``,
    `الخطوات:`,
    `1) أكمل التسجيل الرسمي بنفس هذا البريد من: ${registerUrl}`,
    `2) بعد تسجيل الطلب ستظهر صفحة «خطوة الدفع والتفعيل».`,
    `3) أدخل كود التجربة في خانة «رمز تجربة برونزي» على تلك الصفحة (أو في صفحة الدفع التالية) — بدون دفع ميسر.`,
    ``,
    `مهم: يجب أن يكون بريد التسجيل مطابقاً لهذا البريد وإلا يُرفض الكود.`,
    `— حلاق ماب`,
  ].join('\n');
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8">
<p>مرحباً،</p>
<p>تمت الموافقة على طلب تقييم التجربة لـ <strong>${input.salonName}</strong>.</p>
<p style="font-size:18px"><strong>كود التفعيل (لمرة واحدة):</strong> <code dir="ltr">${input.code}</code></p>
<ol>
<li>أكمل <a href="${registerUrl}">التسجيل الرسمي</a> بنفس هذا البريد.</li>
<li>بعد تسجيل الطلب ستظهر صفحة <strong>خطوة الدفع والتفعيل</strong>.</li>
<li>أدخل كود التجربة في خانة <strong>رمز تجربة برونزي</strong> على تلك الصفحة (أو في صفحة الدفع التالية) — بدون دفع ميسر.</li>
</ol>
<p>مهم: بريد التسجيل يجب أن يطابق هذا البريد وإلا يُرفض الكود.</p>
<p>— حلاق ماب</p>
</div>`;
  return sendResend({ to: input.to, subject, html, text });
}

/**
 * تصحيح بريد طلب التجربة من لوحة الأدمن — قبل الموافقة أو بعدها (مع تحديث bound_email للكود).
 * لا توافق على الطلب قبل تصحيح البريد.
 */
export async function adminUpdateBronzeTrialApplicationEmail(
  supabase: SupabaseClient,
  input: { applicationId: string; newEmail: string; adminEmail: string; resendConfirm?: boolean },
): Promise<
  | { ok: true; email: string; confirmResent: boolean }
  | { ok: false; error: string; status: number }
> {
  const id = String(input.applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };
  const newEmail = normalizeEmail(String(input.newEmail ?? ''));
  if (!EMAIL_RE.test(newEmail)) return { ok: false, error: 'invalid_email', status: 400 };

  const { data: app, error } = await supabase
    .from('bronze_trial_applications')
    .select('id, email, status, salon_name, trial_code_id')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!app?.id) return { ok: false, error: 'application_not_found', status: 404 };

  const oldEmail = normalizeEmail(String(app.email));
  if (oldEmail === newEmail) {
    return { ok: true, email: newEmail, confirmResent: false };
  }

  // منع التكرار إن وُجد طلب آخر بنفس البريد الجديد (غير مرفوض/ملغى)
  const { data: dup } = await supabase
    .from('bronze_trial_applications')
    .select('id')
    .ilike('email', newEmail)
    .neq('id', id)
    .not('status', 'in', '(rejected,cancelled)')
    .limit(1)
    .maybeSingle();
  if (dup?.id) return { ok: false, error: 'email_already_used_on_another_application', status: 409 };

  const now = new Date().toISOString();
  const wasPendingEmail = String(app.status) === 'pending_email';
  const patch: Record<string, unknown> = {
    email: newEmail,
    updated_at: now,
  };
  // إن لم يُؤكَّد بعد — أعد طلب التأكيد للبريد الجديد
  if (wasPendingEmail) {
    patch.email_confirmed_at = null;
  }

  const { error: updErr } = await supabase.from('bronze_trial_applications').update(patch).eq('id', id);
  if (updErr) return { ok: false, error: updErr.message, status: 500 };

  // حدّث ربط الكود إن وُجد
  const codeId = String(app.trial_code_id ?? '').trim();
  if (UUID_RE.test(codeId)) {
    await supabase
      .from('bronze_trial_codes')
      .update({ bound_email: newEmail, updated_at: now })
      .eq('id', codeId);
  } else {
    await supabase
      .from('bronze_trial_codes')
      .update({ bound_email: newEmail, updated_at: now })
      .eq('application_id', id)
      .in('status', ['issued', 'redeemed']);
  }

  // إن وُجد حساب حلاق بنفس البريد القديم — صحّح بريده أيضاً (بعد التسجيل بالخطأ)
  await supabase.from('barbers').update({ email: newEmail, updated_at: now }).ilike('email', oldEmail);

  let confirmResent = false;
  const shouldResend =
    input.resendConfirm !== false && (wasPendingEmail || String(app.status) === 'pending_review');
  if (shouldResend && wasPendingEmail) {
    const mail = await sendConfirmEmail(
      supabase,
      id,
      newEmail,
      String(app.salon_name ?? 'الصالون'),
    );
    confirmResent = mail.ok;
    if (!mail.ok) {
      console.error('[bronze-trial] email_corrected_but_confirm_resend_failed', mail.error);
    }
  }

  console.info('[bronze-trial] email_corrected', {
    applicationId: id,
    from: oldEmail,
    to: newEmail,
    by: input.adminEmail,
  });

  return { ok: true, email: newEmail, confirmResent };
}

export async function resendBronzeTrialConfirmEmail(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const id = String(applicationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };
  const { data: app, error } = await supabase
    .from('bronze_trial_applications')
    .select('id, email, salon_name, status')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!app) return { ok: false, error: 'application_not_found', status: 404 };
  if (app.status !== 'pending_email') return { ok: false, error: 'not_pending_email', status: 409 };
  const mail = await sendConfirmEmail(supabase, id, normalizeEmail(String(app.email)), String(app.salon_name));
  if (!mail.ok) return { ok: false, error: mail.error, status: 502 };
  return { ok: true };
}
