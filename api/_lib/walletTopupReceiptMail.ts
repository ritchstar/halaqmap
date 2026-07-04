/**
 * إيصال شحن محفظة المناوب الرقمي — يُرسل تلقائياً بعد كل عملية شحن ناجحة جديدة (Resend).
 *
 * ملاحظة نظامية: هذا «إيصال شحن/ملخص» يوضّح المبلغ المدفوع وتفصيل ضريبة القيمة المضافة
 * (15% فوق القيمة الأساسية) والرصيد الناتج. ليس فاتورة ضريبية رسمية معتمدة لدى هيئة
 * الزكاة والضريبة ما لم يُضَف الرقم الضريبي واسم البائع النظامي لاحقاً.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { repliesFromHalalas, walletTopupPackageBySku } from './digitalShiftWalletTopup.js';

/** تنسيق مبلغ بالهللات إلى ريال سعودي بخانتين عشريتين. */
function formatSar(halalas: number): string {
  const h = Math.trunc(Number(halalas) || 0);
  return (h / 100).toFixed(2);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function walletLabelAr(sku: string): string {
  const pkg = walletTopupPackageBySku(sku);
  if (pkg) return pkg.labelAr;
  return 'شحن رصيد المحفظة';
}

function sourceLabelAr(source: string): string {
  const s = String(source ?? '').trim().toLowerCase();
  if (s === 'moyasar_invoice') return 'فاتورة يدوية عبر ميسر';
  return 'شحن ذاتي من لوحة التحكم';
}

function formatDateAr(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh',
    }).format(d);
  } catch {
    return iso;
  }
}

export type WalletTopupReceiptInput = {
  barberName: string;
  walletSku: string;
  /** المبلغ المدفوع فعلياً (شامل الضريبة) بالهللات. */
  chargedHalalas: number;
  /** القيمة الأساسية المُضافة للرصيد (قبل الضريبة) بالهللات. */
  creditedHalalas: number;
  /** رصيد المحفظة بعد الشحن بالهللات. */
  balanceHalalas: number;
  /** معرّف دفعة ميسر. */
  paymentId: string;
  /** moyasar | moyasar_invoice */
  source: string;
  /** تاريخ العملية (ISO). */
  dateIso: string;
};

export function buildWalletTopupReceiptEmail(input: WalletTopupReceiptInput): {
  subject: string;
  text: string;
  html: string;
} {
  const name = input.barberName.trim() || 'شريك حلاق ماب';
  const label = walletLabelAr(input.walletSku);
  const creditedHalalas = Math.trunc(input.creditedHalalas);
  const vatHalalas = Math.max(0, Math.trunc(input.chargedHalalas) - creditedHalalas);
  const hasVat = vatHalalas > 0;
  const effectiveVatPercent = hasVat && creditedHalalas > 0 ? Math.round((vatHalalas / creditedHalalas) * 100) : 0;
  const repliesCredited = repliesFromHalalas(input.creditedHalalas);
  const repliesRemaining = repliesFromHalalas(input.balanceHalalas);
  const dateAr = formatDateAr(input.dateIso);
  const srcAr = sourceLabelAr(input.source);

  const baseSar = formatSar(input.creditedHalalas);
  const vatSar = formatSar(vatHalalas);
  const totalSar = formatSar(input.chargedHalalas);
  const balanceSar = formatSar(input.balanceHalalas);

  const amountLinesText = hasVat
    ? [
        `- القيمة الأساسية: ${baseSar} ر.س`,
        `- ضريبة القيمة المضافة (${effectiveVatPercent}%): ${vatSar} ر.س`,
        `- الإجمالي المدفوع: ${totalSar} ر.س`,
      ]
    : [`- المبلغ المدفوع: ${totalSar} ر.س`];

  const text = [
    `أهلًا ${name}،`,
    '',
    'تم شحن رصيد محفظة «المناوب الرقمي الذكي» بنجاح. إليك تفاصيل الإيصال:',
    '',
    `- الباقة: ${label}`,
    `- طريقة الشحن: ${srcAr}`,
    ...amountLinesText,
    `- الردود المُضافة: ${repliesCredited}`,
    `- رصيد المحفظة الحالي: ${balanceSar} ر.س (${repliesRemaining} رداً متبقياً)`,
    '- معرّف الدفعة:',
    `  ${input.paymentId}`,
    `- التاريخ: ${dateAr}`,
    '',
    'ملاحظة: هذا إيصال شحن وملخص للعملية. تُخصم قيمة كل رد آلي من الرصيد تلقائياً.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');

  const nameSafe = escapeHtml(name);
  const row = (k: string, v: string, strong = false) =>
    `<tr>
      <td style="padding:8px 0;color:#475569;font-size:14px">${escapeHtml(k)}</td>
      <td style="padding:8px 0;text-align:left;color:${strong ? '#0f172a' : '#334155'};font-size:14px;font-weight:${strong ? '700' : '500'}" dir="ltr">${escapeHtml(v)}</td>
    </tr>`;

  const amountRowsHtml = hasVat
    ? row('القيمة الأساسية', `${baseSar} SAR`) +
      row(`ضريبة القيمة المضافة (${effectiveVatPercent}%)`, `${vatSar} SAR`) +
      row('الإجمالي المدفوع', `${totalSar} SAR`, true)
    : row('المبلغ المدفوع', `${totalSar} SAR`, true);

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #99f6e4;overflow:hidden">
<tr><td style="height:4px;background:linear-gradient(90deg,#0d9488,#22d3ee,#a855f7)"></td></tr>
<tr><td style="padding:24px 22px">
  <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#0d9488">المناوب الرقمي الذكي</p>
  <h1 style="margin:0 0 6px;font-size:22px;color:#0f172a">إيصال شحن المحفظة</h1>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.85;color:#334155">أهلًا <strong>${nameSafe}</strong>، تم شحن رصيد محفظتك بنجاح. هذه تفاصيل العملية:</p>
  <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">
    ${row('الباقة', label)}
    ${row('طريقة الشحن', srcAr)}
    ${amountRowsHtml}
    ${row('الردود المُضافة', String(repliesCredited))}
    ${row('رصيد المحفظة الحالي', `${balanceSar} SAR · ${repliesRemaining} ردّ`, true)}
  </table>
  <p style="margin:16px 0 2px;font-size:12px;color:#64748b">معرّف الدفعة</p>
  <p style="margin:0 0 12px;font-size:12px;color:#334155;word-break:break-all" dir="ltr">${escapeHtml(input.paymentId)}</p>
  <p style="margin:0 0 16px;font-size:12px;color:#64748b">التاريخ: ${escapeHtml(dateAr)}</p>
  <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7">هذا إيصال شحن وملخص للعملية. تُخصم قيمة كل رد آلي من الرصيد تلقائياً.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return {
    subject: 'حلاق ماب | إيصال شحن محفظة المناوب الرقمي',
    text,
    html,
  };
}

async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/**
 * يُرسل إيصال الشحن للمشتري — غير معطِّل: أي فشل يُرجَع كـ { ok:false } دون رمي استثناء،
 * كي لا يتأثر مسار الشحن الأساسي. يُستدعى فقط عند شحن جديد (ليس idempotent-hit).
 */
export async function dispatchWalletTopupReceiptEmail(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    buyerEmail?: string | null;
    walletSku: string;
    chargedHalalas: number;
    creditedHalalas: number;
    balanceHalalas: number;
    paymentId: string;
    source: string;
    dateIso?: string;
  },
): Promise<{ ok: true; sent: boolean; messageId?: string } | { ok: false; error: string }> {
  try {
    let email = String(input.buyerEmail ?? '').trim().toLowerCase();
    let name = '';

    const { data: barber } = await supabase
      .from('barbers')
      .select('email, name')
      .eq('id', input.barberId)
      .maybeSingle();
    if (barber) {
      name = String(barber.name ?? '').trim();
      if (!EMAIL_RE.test(email)) email = String(barber.email ?? '').trim().toLowerCase();
    }

    if (!EMAIL_RE.test(email)) return { ok: true, sent: false };

    const mail = buildWalletTopupReceiptEmail({
      barberName: name,
      walletSku: input.walletSku,
      chargedHalalas: input.chargedHalalas,
      creditedHalalas: input.creditedHalalas,
      balanceHalalas: input.balanceHalalas,
      paymentId: input.paymentId,
      source: input.source,
      dateIso: input.dateIso ?? new Date().toISOString(),
    });

    const sent = await sendResendEmail({ to: email, ...mail });
    if (!sent.ok) return sent;
    return { ok: true, sent: true, messageId: sent.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'receipt_mail_failed' };
  }
}
