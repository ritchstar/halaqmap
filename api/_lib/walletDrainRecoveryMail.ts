import type { SupabaseClient } from '@supabase/supabase-js';
import { repliesFromHalalas } from './digitalShiftWalletTopup.js';
import { resolveResendFromAddress, readResendFromEmailEnv } from './resendFrom.js';
import type { WalletDrainRecoveryResult } from './walletDrainRecovery.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function formatSar(halalas: number): string {
  return (Math.trunc(halalas) / 100).toFixed(2);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateAr(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function buildWalletDrainRecoveryEmail(input: {
  barberName: string;
  recoveredHalalas: number;
  balanceHalalas: number;
  orphanCount: number;
  dateIso: string;
}): { subject: string; text: string; html: string } {
  const name = input.barberName.trim() || 'شريك حلاق ماب';
  const recoveredSar = formatSar(input.recoveredHalalas);
  const balanceSar = formatSar(input.balanceHalalas);
  const replies = repliesFromHalalas(input.recoveredHalalas);
  const balanceReplies = repliesFromHalalas(input.balanceHalalas);
  const dateAr = formatDateAr(input.dateIso);
  const nameSafe = escapeHtml(name);

  const text = [
    `أهلًا ${name}،`,
    '',
    'راجعنا محفظة «المناوب الرقمي» واكتشفنا خصومات غير مرتبطة بردود فعلية للعملاء (خلل تقني سابق).',
    'تم إعادة الرصيد تلقائياً إلى محفظتك:',
    '',
    `- المبلغ المُسترد: ${recoveredSar} ر.س (≈ ${replies} رد)`,
    `- عدد الخصومات المعالجة: ${input.orphanCount}`,
    `- رصيد المحفظة الحالي: ${balanceSar} ر.س (≈ ${balanceReplies} رد)`,
    `- التاريخ: ${dateAr}`,
    '',
    'نعتذر عن الإزعاج — تم إصلاح السبب لمنع تكرار المشكلة.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #99f6e4;overflow:hidden">
<tr><td style="height:4px;background:linear-gradient(90deg,#0d9488,#22d3ee,#a855f7)"></td></tr>
<tr><td style="padding:24px 22px">
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0d9488">المناوب الرقمي</p>
  <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a">استرداد رصيد المحفظة</h1>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#334155">أهلًا <strong>${nameSafe}</strong>، راجعنا محفظتك واكتشفنا خصومات غير مرتبطة بردود فعلية. تم إعادة الرصيد:</p>
  <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">
    <tr><td style="padding:8px 0;color:#475569">المبلغ المُسترد</td><td style="padding:8px 0;text-align:left;font-weight:700" dir="ltr">${recoveredSar} SAR · ${replies} رد</td></tr>
    <tr><td style="padding:8px 0;color:#475569">خصومات معالجة</td><td style="padding:8px 0;text-align:left">${input.orphanCount}</td></tr>
    <tr><td style="padding:8px 0;color:#475569">الرصيد الحالي</td><td style="padding:8px 0;text-align:left;font-weight:700" dir="ltr">${balanceSar} SAR · ${balanceReplies} رد</td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;color:#64748b">التاريخ: ${escapeHtml(dateAr)}</p>
  <p style="margin:12px 0 0;font-size:12px;color:#64748b;line-height:1.7">تم إصلاح الخلل التقني لمنع تكرار المشكلة. نعتذر عن الإزعاج.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return {
    subject: 'حلاق ماب | استرداد رصيد محفظة المناوب',
    text,
    html,
  };
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey || !readResendFromEmailEnv()) return { ok: false, error: 'resend_not_configured' };
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: resolveResendFromAddress(),
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    return { ok: false, error: raw.slice(0, 400) || `resend_${resp.status}` };
  }
  return { ok: true };
}

export async function dispatchWalletDrainRecoveryEmail(
  supabase: SupabaseClient,
  result: WalletDrainRecoveryResult,
): Promise<{ ok: true } | { ok: false; error: string } | { ok: true; skipped: true }> {
  if (result.recoveredHalalas <= 0 || result.balanceHalalasAfter == null) {
    return { ok: true, skipped: true };
  }

  let email = result.barberEmail?.trim() ?? '';
  if (!EMAIL_RE.test(email)) {
    const { data: row } = await supabase
      .from('barbers')
      .select('email, name')
      .eq('id', result.barberId)
      .maybeSingle();
    email = String(row?.email ?? '').trim();
  }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'barber_email_missing' };

  const mail = buildWalletDrainRecoveryEmail({
    barberName: result.barberName ?? 'شريك حلاق ماب',
    recoveredHalalas: result.recoveredHalalas,
    balanceHalalas: result.balanceHalalasAfter,
    orphanCount: result.recoveredCount,
    dateIso: new Date().toISOString(),
  });

  return sendResendEmail({ to: email, ...mail });
}
