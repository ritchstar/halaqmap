import type { SupabaseClient } from '@supabase/supabase-js';
import { siteBaseUrlFromEnv } from './barberProvisionService.js';
import {
  buildPartnerUnifiedContractPdf,
  type PartnerUnifiedContractFields,
} from './partnerUnifiedContractAr.js';
import { isBronzeTier, tierLabelAr } from './partnerTierMail.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPartnerContractEmailBodies(input: {
  establishmentName: string;
  tier: string;
  registrationOrderId?: string | null;
}): { subject: string; html: string; text: string } {
  const name = input.establishmentName.trim() || 'شريك حلاق ماب';
  const tierAr = tierLabelAr(input.tier);
  const bronze = isBronzeTier(input.tier);
  const orderId = input.registrationOrderId?.trim() || null;
  const siteBase = siteBaseUrlFromEnv().replace(/\/+$/, '');
  const policyUrl = `${siteBase}/#/partners/subscription-policy`;
  const partnersUrl = `${siteBase}/#/partners`;

  const subject = bronze
    ? `حلاق ماب | عقدك الرقمي جاهز — بداية قوية مع باقتك ${tierAr}`
    : 'حلاق ماب | نسخة PDF — العقد الرقمي الموحّد (مسار الخدمات البرمجية للمنصة)';

  const bronzeIntro = [
    `أهلًا ${name}،`,
    '',
    `مبروك تفعيل **باقتك ${tierAr}** على حلاق ماب!`,
    '',
    'نرفق في هذه الرسالة **نسخة PDF من العقد الرقمي الموحّد** لمسار الخدمات البرمجية للمنصة — وثيقة مرجعية تحفظ حقوقك وتلخّص التزاماتك مع المنصة.',
    '',
    '**خطوتك التالية (باقة برونزية):**',
    '• راجع بريد **شهادة التفعيل** و**روابط التشغيل** (مفتوح/مغلق + تجديد الرابط) — هما أداتك اليومية.',
    '• الباقة البرونزية **بدون لوحة تحكم كاملة** — وهذا مقصود: تشغيل خفيف وسريع عبر الروابط المخصّصة لك.',
    '• احفظ هذا العقد PDF في أرشيف منشأتك؛ يمكنك الرجوع إليه وقت الحاجة.',
    '',
    orderId ? `مرجع طلبك: ${orderId}` : '',
    `سياسة رخصة النفاذ الرقمية: ${policyUrl}`,
    '',
    'نحن بجانبك في بداية رحلتك — صالونك يستحق حضوراً رقمياً واضحاً عبر نظام الاستجابة الذكية.',
    '',
    'إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها أو تواصل معنا عبر القنوات الرسمية في الموقع.',
    '',
    '— فريق حلاق ماب',
  ]
    .filter(Boolean)
    .join('\n');

  const standardIntro = [
    `أهلًا ${name}،`,
    '',
    `بناءً على **إتمام تفعيل رخصتك (${tierAr})** واعتماد مسار الخدمات البرمجية للمنصة، نرفق نسخة PDF من **العقد الرقمي الموحّد**.`,
    '',
    'احفظ المرفق في أرشيف منشأتك — يوضّح إطار الخدمة والالتزامات بين الطرفين.',
    orderId ? `مرجع طلبك: ${orderId}` : '',
    `مسار الشركاء: ${partnersUrl}`,
    '',
    'إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها أو تواصل معنا عبر القنوات الرسمية.',
    '',
    '— فريق حلاق ماب',
  ]
    .filter(Boolean)
    .join('\n');

  const text = bronze ? bronzeIntro : standardIntro;

  const h = escapeHtml;
  const bronzeHtmlBlocks = `
<p>أهلًا <strong>${h(name)}</strong>،</p>
<p style="font-size:16px;color:#0f766e;font-weight:800">مبروك تفعيل <strong>باقتك ${h(tierAr)}</strong> على حلاق ماب!</p>
<p>نرفق في هذه الرسالة <strong>نسخة PDF من العقد الرقمي الموحّد</strong> لمسار الخدمات البرمجية للمنصة — وثيقة مرجعية تحفظ حقوقك وتلخّص التزاماتك مع المنصة.</p>
<div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#ecfdf5;border:1px solid #99f6e4">
<p style="margin:0 0 10px;font-weight:800;color:#0f766e">خطوتك التالية — باقة برونزية</p>
<ul style="margin:0;padding-right:20px;line-height:1.9;color:#334155">
<li>راجع بريد <strong>شهادة التفعيل</strong> و<strong>روابط التشغيل</strong> (مفتوح/مغلق + تجديد الرابط).</li>
<li>الباقة البرونزية <strong>بدون لوحة تحكم كاملة</strong> — تشغيل خفيف عبر الروابط المخصّصة لك.</li>
<li>احفظ هذا العقد PDF في أرشيف منشأتك.</li>
</ul>
</div>
${orderId ? `<p style="font-size:13px;color:#64748b">مرجع الطلب: <span dir="ltr">${h(orderId)}</span></p>` : ''}
<p style="font-size:13px"><a href="${h(policyUrl)}">سياسة رخصة النفاذ الرقمية</a></p>
<p>نحن بجانبك في بداية رحلتك — صالونك يستحق حضوراً رقمياً واضحاً عبر نظام الاستجابة الذكية.</p>`;

  const standardHtmlBlocks = `
<p>أهلًا <strong>${h(name)}</strong>،</p>
<p>بناءً على <strong>إتمام تفعيل رخصتك (${h(tierAr)})</strong> واعتماد مسار الخدمات البرمجية للمنصة، نرفق نسخة PDF من <strong>العقد الرقمي الموحّد</strong>.</p>
<p>احفظ المرفق في أرشيف منشأتك — يوضّح إطار الخدمة والالتزامات بين الطرفين.</p>
${orderId ? `<p style="font-size:13px;color:#64748b">مرجع الطلب: <span dir="ltr">${h(orderId)}</span></p>` : ''}
<p style="font-size:13px"><a href="${h(partnersUrl)}">مسار الشركاء</a></p>`;

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="font-family:Tahoma,Arial,sans-serif;padding:22px;line-height:1.85;background:#f8fafc;color:#1e293b">
${bronze ? bronzeHtmlBlocks : standardHtmlBlocks}
<p style="font-size:13px;color:#64748b;margin-top:20px">إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها أو تواصل معنا عبر القنوات الرسمية في الموقع.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  return { subject, html, text };
}

export async function emailPartnerUnifiedContractPdf(input: {
  apiKey: string;
  from: string;
  to: string;
  fields: PartnerUnifiedContractFields;
  tier?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  let pdf: Buffer;
  try {
    pdf = await buildPartnerUnifiedContractPdf({
      name: input.fields.establishmentName,
      cr: String(input.fields.commercialRegistration ?? ''),
      package: input.fields.packageTypeAr,
      date: input.fields.contractDateDisplay,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'pdf_failed' };
  }

  const safeId = String(input.fields.registrationOrderId || 'contract')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80);
  const filename = `Halaqmap-Partner-Unified-Contract-${safeId}.pdf`;

  const tierRaw = input.tier ?? input.fields.packageTypeAr;
  const mail = buildPartnerContractEmailBodies({
    establishmentName: input.fields.establishmentName,
    tier: tierRaw,
    registrationOrderId: input.fields.registrationOrderId,
  });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: [{ filename, content: pdf.toString('base64') }],
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
 * يُستدعى بعد اعتماد تفعيل الرخصة من لوحة الإدارة أو من Webhook آمن — لا يرمي أخطاء للمتصل؛ يُسجّل فقط عند الفشل.
 * عند تمرير `barberId`: يمنع إرسال مزدوج عبر `barber_subscriptions.partner_unified_contract_email_sent_at` (claim قبل الإرسال).
 * @returns true إذا أُرسِل البريد بنجاح أو تُجاهل الإرسال لأنه مُرسَل مسبقاً
 */
export async function tryEmailPartnerUnifiedContractAfterApprove(input: {
  supabase: SupabaseClient;
  resendApiKey: string;
  resendFrom: string;
  barberEmail: string;
  barberName: string;
  tier: string;
  registrationRequestId: string | null;
  /** لمنع تكرار بريد العقد بين الإدارة وـ DB webhook — migration 75 */
  barberId?: string | null;
}): Promise<boolean> {
  const barberId = String(input.barberId ?? '').trim();
  let claimedSubscriptionRowId: string | null = null;

  if (barberId && UUID_RE.test(barberId)) {
    const { data: latest } = await input.supabase
      .from('barber_subscriptions')
      .select('id, partner_unified_contract_email_sent_at')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.id) {
      if (latest.partner_unified_contract_email_sent_at) {
        console.info('[tryEmailPartnerUnifiedContractAfterApprove] skip duplicate (already sent)', {
          barberId,
          subscriptionRowId: latest.id,
        });
        return true;
      }
      const ts = new Date().toISOString();
      const { data: claimed, error: claimErr } = await input.supabase
        .from('barber_subscriptions')
        .update({
          partner_unified_contract_email_sent_at: ts,
          updated_at: ts,
        })
        .eq('id', latest.id)
        .is('partner_unified_contract_email_sent_at', null)
        .select('id')
        .maybeSingle();
      if (claimErr) {
        console.error('[tryEmailPartnerUnifiedContractAfterApprove] claim_failed', claimErr.message);
        return false;
      }
      if (!claimed?.id) {
        console.info('[tryEmailPartnerUnifiedContractAfterApprove] skip duplicate (concurrent claim)', { barberId });
        return true;
      }
      claimedSubscriptionRowId = claimed.id;
    }
  }

  const orderId = input.registrationRequestId?.trim() || null;
  let commercialRegistration: string | null =
    (process.env.LEGAL_COMMERCIAL_REGISTRATION || '').trim() || '7054117093';
  let establishmentName = input.barberName;

  if (orderId) {
    const { data } = await input.supabase.from('registration_submissions').select('payload').eq('id', orderId).maybeSingle();
    const p =
      data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)
        ? (data.payload as Record<string, unknown>)
        : {};
    const cr = String(p.commercialRegistration ?? p.crNumber ?? p.commercial_reg ?? p.cr ?? '').trim();
    if (cr) commercialRegistration = cr;
    const bn = String(p.salonName ?? p.shopName ?? p.barbershopName ?? p.establishmentName ?? '').trim();
    if (bn) establishmentName = bn;
  }

  const fields: PartnerUnifiedContractFields = {
    establishmentName,
    commercialRegistration,
    packageTypeAr: `باقة ${tierLabelAr(input.tier)}`,
    contractDateDisplay: new Date().toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' }),
    registrationOrderId: orderId,
  };

  const r = await emailPartnerUnifiedContractPdf({
    apiKey: input.resendApiKey,
    from: input.resendFrom,
    to: input.barberEmail,
    fields,
    tier: input.tier,
  });
  if (!r.ok) {
    console.error('[tryEmailPartnerUnifiedContractAfterApprove]', r.error);
    if (claimedSubscriptionRowId) {
      const ts = new Date().toISOString();
      await input.supabase
        .from('barber_subscriptions')
        .update({
          partner_unified_contract_email_sent_at: null,
          updated_at: ts,
        })
        .eq('id', claimedSubscriptionRowId);
    }
    return false;
  }
  return true;
}
