/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تسجيل مدرسة البلوت — المرحلة ١ (تسجيل + تأكيد بريد حقيقي). نفس بنية
 * chessSchoolRegistrationService.ts حرفياً، بجدول ونصوص مستقلة عن الشطرنج.
 * لا يُنشئ دفعاً ولا صفحة خاصة بعد — تلك تُبنى على نفس التسجيل لاحقاً.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  mintBalootSchoolEmailConfirmToken,
  verifyBalootSchoolEmailConfirmToken,
} from './balootSchoolEmailConfirmToken.js';
import { readResendFromEmailEnv, resolveResendFromAddress } from './resendFrom.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export type BalootSchoolRegistrationInput = {
  fullName: string;
  email: string;
};

export async function submitBalootSchoolRegistration(
  supabase: SupabaseClient,
  input: BalootSchoolRegistrationInput,
): Promise<
  | { ok: true; registrationId: string; confirmEmailSent: boolean; alreadyRegistered: boolean }
  | { ok: false; error: string; status: number }
> {
  const email = normalizeEmail(input.email);
  const fullName = String(input.fullName ?? '').trim().slice(0, 120);

  if (!fullName || fullName.length < 2) return { ok: false, error: 'missing_name', status: 400 };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email', status: 400 };

  const { data: existing } = await supabase
    .from('baloot_school_registrations')
    .select('id, status, confirm_email_send_count')
    .ilike('email', email)
    .in('status', ['pending_email', 'email_confirmed'])
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    if (existing.status === 'email_confirmed') {
      return { ok: true, registrationId: String(existing.id), confirmEmailSent: false, alreadyRegistered: true };
    }
    // بريد سابق لم يُؤكَّد بعد — أعد إرسال رسالة التأكيد بدل رفض الطلب.
    const mail = await sendConfirmEmail(String(existing.id), email, fullName);
    if (mail.ok) {
      await supabase
        .from('baloot_school_registrations')
        .update({
          confirm_email_sent_at: new Date().toISOString(),
          confirm_email_send_count: (Number(existing.confirm_email_send_count) || 0) + 1,
        })
        .eq('id', existing.id);
    }
    return { ok: true, registrationId: String(existing.id), confirmEmailSent: mail.ok, alreadyRegistered: true };
  }

  const { data: row, error } = await supabase
    .from('baloot_school_registrations')
    .insert({
      status: 'pending_email',
      full_name: fullName,
      email,
    })
    .select('id')
    .single();

  if (error || !row?.id) {
    return { ok: false, error: error?.message ?? 'insert_failed', status: 500 };
  }

  const mail = await sendConfirmEmail(String(row.id), email, fullName);
  if (mail.ok) {
    await supabase
      .from('baloot_school_registrations')
      .update({ confirm_email_sent_at: new Date().toISOString(), confirm_email_send_count: 1 })
      .eq('id', row.id);
  }

  return {
    ok: true,
    registrationId: String(row.id),
    confirmEmailSent: mail.ok,
    alreadyRegistered: false,
  };
}

async function sendConfirmEmail(
  registrationId: string,
  email: string,
  fullName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const minted = mintBalootSchoolEmailConfirmToken({ registrationId, email });
  if (!minted.ok) return minted;
  const confirmUrl = `${siteBase()}/#/baloot/school/confirm?c=${encodeURIComponent(minted.token)}`;
  const subject = 'مدرسة البلوت | أكّد بريدك لتفعيل حسابك';
  const text = [
    `مرحباً ${fullName}،`,
    `شكراً لتسجيلك في مدرسة البلوت.`,
    `أكّد بريدك الآن لتفعيل حسابك والانتقال مباشرة لدفع الاشتراك (199 ر.س — دفعة واحدة، وصول دائم):`,
    confirmUrl,
    `الرابط صالح حتى 48 ساعة.`,
    `إن لم تطلب هذا التسجيل، تجاهل هذه الرسالة.`,
    `— مدرسة البلوت | خريطة الحل`,
  ].join('\n');
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8">
<p>مرحباً <strong>${fullName}</strong>،</p>
<p>شكراً لتسجيلك في <strong>مدرسة البلوت</strong>.</p>
<p><a href="${confirmUrl}" style="display:inline-block;padding:10px 20px;background:#0f766e;color:#fff;border-radius:8px;text-decoration:none">أكّد بريدك الآن</a></p>
<p>بعد التأكيد ستنتقل مباشرة لدفع الاشتراك (199 ر.س — دفعة واحدة، وصول دائم).</p>
<p style="color:#6b7280;font-size:13px">الرابط صالح حتى 48 ساعة. إن لم تطلب هذا التسجيل، تجاهل هذه الرسالة.</p>
<p>— مدرسة البلوت | خريطة الحل</p>
</div>`;
  return sendResend({ to: email, subject, html, text });
}

export async function confirmBalootSchoolRegistrationEmail(
  supabase: SupabaseClient,
  token: string,
): Promise<{ ok: true; registrationId: string; fullName: string } | { ok: false; error: string; status: number }> {
  const verified = verifyBalootSchoolEmailConfirmToken(token);
  if (!verified.ok) {
    const status = verified.error === 'token_expired' ? 410 : 400;
    return { ok: false, error: verified.error, status };
  }

  const { data: row, error } = await supabase
    .from('baloot_school_registrations')
    .select('id, email, full_name, status, email_confirmed_at')
    .eq('id', verified.registrationId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!row?.id) return { ok: false, error: 'registration_not_found', status: 404 };
  if (normalizeEmail(String(row.email)) !== verified.email) {
    return { ok: false, error: 'email_mismatch', status: 403 };
  }

  if (row.status === 'email_confirmed') {
    return { ok: true, registrationId: String(row.id), fullName: String(row.full_name) };
  }
  if (row.status !== 'pending_email') {
    return { ok: false, error: 'invalid_status', status: 409 };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from('baloot_school_registrations')
    .update({
      status: 'email_confirmed',
      email_confirmed_at: now,
      updated_at: now,
    })
    .eq('id', row.id)
    .eq('status', 'pending_email')
    .select('id, status')
    .maybeSingle();

  if (updErr) return { ok: false, error: updErr.message, status: 500 };
  if (!updated?.id) {
    // إعادة فحص دفاعية — قد يكون طلب متزامن آخر أكّد للتو.
    const { data: again } = await supabase
      .from('baloot_school_registrations')
      .select('id, status')
      .eq('id', row.id)
      .maybeSingle();
    if (again?.id && again.status === 'email_confirmed') {
      return { ok: true, registrationId: String(again.id), fullName: String(row.full_name) };
    }
    return { ok: false, error: 'confirm_update_failed', status: 500 };
  }

  return { ok: true, registrationId: String(updated.id), fullName: String(row.full_name) };
}

export async function resendBalootSchoolConfirmEmail(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const id = String(registrationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };
  const { data: reg, error } = await supabase
    .from('baloot_school_registrations')
    .select('id, email, full_name, status, confirm_email_send_count')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!reg) return { ok: false, error: 'registration_not_found', status: 404 };
  if (reg.status !== 'pending_email') return { ok: false, error: 'not_pending_email', status: 409 };

  const mail = await sendConfirmEmail(id, normalizeEmail(String(reg.email)), String(reg.full_name));
  if (!mail.ok) return { ok: false, error: mail.error, status: 502 };

  await supabase
    .from('baloot_school_registrations')
    .update({
      confirm_email_sent_at: new Date().toISOString(),
      confirm_email_send_count: (Number(reg.confirm_email_send_count) || 0) + 1,
    })
    .eq('id', id);

  return { ok: true };
}
