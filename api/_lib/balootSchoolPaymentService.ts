/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * دفع مدرسة البلوت — تفعيل حقيقي بعد تحقق فعلي من ميسر (لا تفعيل أعمى بمجرد
 * استدعاء العميل)، مطابق حرفياً لـ chessSchoolPaymentService.ts وبنفس نمط
 * fulfillFromPaymentId في public-store-produce-live.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fetchMoyasarPayment,
  moyasarPaymentIsPaid,
  resolveMoyasarApiBase,
  resolveMoyasarSecretKey,
  secretKeyLooksValid,
} from './moyasarApiClient.js';
import { readResendFromEmailEnv, resolveResendFromAddress } from './resendFrom.js';
import { BALOOT_SCHOOL_PRICE_HALALAS, BALOOT_SCHOOL_PRODUCT } from './balootSchoolPayShared.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABLE = 'baloot_school_registrations';

async function sendResend(input: { to: string; subject: string; html: string; text: string }): Promise<void> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = resolveResendFromAddress(readResendFromEmailEnv());
  if (!apiKey || !from) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    });
  } catch {
    // بريد نجاح الدفع أفضل الجهد — لا يُفشل تفعيل الدفع نفسه.
  }
}

async function sendPaidConfirmationEmail(email: string, fullName: string, studentPath: string): Promise<void> {
  const studentUrl = `${(process.env.APP_PUBLIC_ORIGIN || process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_SITE_URL || 'https://www.halaqmap.com').trim().replace(/\/+$/, '')}/#${studentPath}`;
  const subject = 'مدرسة البلوت | تم تفعيل اشتراكك بنجاح';
  const text = [
    `مرحباً ${fullName}،`,
    `تم استلام دفعتك (199 ر.س — دفعة واحدة) بنجاح، واشتراكك في مدرسة البلوت مفعّل الآن.`,
    `صفحتك الخاصة الدائمة (القواعد، ترتيب الورق، والحسبة) جاهزة الآن على الرابط التالي:`,
    studentUrl,
    `— مدرسة البلوت | خريطة الحل`,
  ].join('\n');
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8">
<p>مرحباً <strong>${fullName}</strong>،</p>
<p>تم استلام دفعتك (<strong>199 ر.س — دفعة واحدة</strong>) بنجاح، واشتراكك في <strong>مدرسة البلوت</strong> مفعّل الآن.</p>
<p><a href="${studentUrl}" style="display:inline-block;padding:10px 20px;background:#0f766e;color:#fff;border-radius:8px;text-decoration:none">افتح صفحتك الخاصة الآن</a></p>
<p>— مدرسة البلوت | خريطة الحل</p>
</div>`;
  await sendResend({ to: email, subject, html, text });
}

export type BalootSchoolPayPublic = {
  ok: true;
  status: string;
  fullName: string;
  amountHalalas: number;
  paidAt: string | null;
};

export async function getBalootSchoolPayPublic(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<BalootSchoolPayPublic | { ok: false; error: string; status: number }> {
  const id = String(registrationId ?? '').trim();
  if (!UUID_RE.test(id)) return { ok: false, error: 'invalid_id', status: 400 };
  const { data, error } = await supabase
    .from(TABLE)
    .select('status, full_name, paid_at')
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  if (!data) return { ok: false, error: 'registration_not_found', status: 404 };
  return {
    ok: true,
    status: String(data.status),
    fullName: String(data.full_name || ''),
    amountHalalas: BALOOT_SCHOOL_PRICE_HALALAS,
    paidAt: data.paid_at ? String(data.paid_at) : null,
  };
}

async function markBalootSchoolPaid(
  supabase: SupabaseClient,
  registrationId: string,
  paymentId: string,
  amountHalalas: number,
): Promise<{ ok: true; fullName: string; alreadyPaid: boolean } | { ok: false }> {
  const { data: current } = await supabase
    .from(TABLE)
    .select('id, status, full_name, email, moyasar_payment_id')
    .eq('id', registrationId)
    .maybeSingle();
  if (!current) return { ok: false };
  if (current.status === 'paid' && String(current.moyasar_payment_id || '') === paymentId) {
    return { ok: true, fullName: String(current.full_name || ''), alreadyPaid: true };
  }
  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from(TABLE)
    .update({
      status: 'paid',
      moyasar_payment_id: paymentId,
      amount_halalas: amountHalalas,
      paid_at: now,
      updated_at: now,
    })
    .eq('id', registrationId)
    .in('status', ['email_confirmed', 'paid'])
    .select('id, full_name, email')
    .maybeSingle();
  if (error) return { ok: false };
  if (!updated?.id) {
    // إعادة فحص دفاعية — قد يكون طلب متزامن آخر (نداء مضاعف من on_completed) فعّل للتو.
    const { data: again } = await supabase.from(TABLE).select('status, full_name').eq('id', registrationId).maybeSingle();
    if (again?.status === 'paid') return { ok: true, fullName: String(again.full_name || ''), alreadyPaid: true };
    return { ok: false };
  }
  void sendPaidConfirmationEmail(
    String(updated.email),
    String(updated.full_name),
    `/baloot/school/student/${registrationId}`,
  );
  return { ok: true, fullName: String(updated.full_name || ''), alreadyPaid: false };
}

export async function activateBalootSchoolPaid(
  supabase: SupabaseClient,
  input: { registrationId: string; paymentId: string },
): Promise<
  | { ok: true; status: 'paid'; fullName: string }
  | { ok: false; error: string; status: number }
> {
  const registrationId = String(input.registrationId ?? '').trim();
  const paymentId = String(input.paymentId ?? '').trim();
  if (!UUID_RE.test(registrationId) || !paymentId) {
    return { ok: false, error: 'invalid_reference', status: 400 };
  }

  const { data: reg, error: regErr } = await supabase
    .from(TABLE)
    .select('id, status, full_name, moyasar_payment_id')
    .eq('id', registrationId)
    .maybeSingle();
  if (regErr) return { ok: false, error: regErr.message, status: 500 };
  if (!reg) return { ok: false, error: 'registration_not_found', status: 404 };
  if (reg.status === 'paid' && String(reg.moyasar_payment_id || '') === paymentId) {
    return { ok: true, status: 'paid', fullName: String(reg.full_name || '') };
  }
  if (reg.status !== 'email_confirmed' && reg.status !== 'paid') {
    return { ok: false, error: 'email_not_confirmed', status: 409 };
  }

  const secret = resolveMoyasarSecretKey();
  if (!secret || !secretKeyLooksValid(secret)) {
    return { ok: false, error: 'moyasar_disabled', status: 503 };
  }

  const upstream = await fetchMoyasarPayment(paymentId, secret, resolveMoyasarApiBase());
  if (upstream.status >= 400) return { ok: false, error: 'moyasar_verify_failed', status: 502 };

  let parsed: { status?: string; amount?: number; metadata?: Record<string, unknown> };
  try {
    parsed = JSON.parse(upstream.text) as typeof parsed;
  } catch {
    return { ok: false, error: 'moyasar_response_unreadable', status: 502 };
  }

  if (!moyasarPaymentIsPaid(String(parsed.status || ''))) {
    return { ok: false, error: 'payment_not_completed', status: 402 };
  }
  if (Number(parsed.amount) !== BALOOT_SCHOOL_PRICE_HALALAS) {
    return { ok: false, error: 'amount_mismatch', status: 409 };
  }
  const meta = (parsed.metadata || {}) as Record<string, unknown>;
  const metaProduct = String(meta.product || meta.product_type || '').trim();
  const metaRid = String(meta.baloot_school_registration_id || '').trim();
  if (metaProduct !== BALOOT_SCHOOL_PRODUCT || metaRid !== registrationId) {
    return { ok: false, error: 'metadata_mismatch', status: 409 };
  }

  const marked = await markBalootSchoolPaid(supabase, registrationId, paymentId, Number(parsed.amount));
  if (!marked.ok) return { ok: false, error: 'activation_failed', status: 409 };
  return { ok: true, status: 'paid', fullName: marked.fullName };
}
