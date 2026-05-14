import type { SupabaseClient } from '@supabase/supabase-js';
import {
  buildPartnerUnifiedContractPdf,
  type PartnerUnifiedContractFields,
} from './partnerUnifiedContractAr.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function tierLabelAr(tier: string): string {
  const t = String(tier || '').toLowerCase();
  if (t === 'diamond') return 'الماسي';
  if (t === 'gold') return 'الذهبي';
  return 'البرونزي';
}

export async function emailPartnerUnifiedContractPdf(input: {
  apiKey: string;
  from: string;
  to: string;
  fields: PartnerUnifiedContractFields;
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

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: 'حلاق ماب | نسخة PDF — العقد الرقمي الموحّد (مسار الشركاء)',
      html: `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;padding:22px;line-height:1.85;background:#f8fafc">
<p>مرحباً،</p>
<p>بناءً على <strong>إتمام اشتراكك واعتماد مسار الشركاء</strong>، نرفق نسخة PDF من <strong>العقد الرقمي الموحّد</strong> لمسار الشركاء في حلاق ماب.</p>
<p style="font-size:13px;color:#64748b">إن لم يظهر المرفق، راجع مجلد الرسائل غير المرغوب فيها أو تواصل معنا عبر القنوات الرسمية.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`,
      text: [
        'مرحباً،',
        '',
        'نرفق نسخة PDF من العقد الرقمي الموحّد لمسار الشركاء في حلاق ماب.',
        '',
        '— فريق حلاق ماب',
      ].join('\n'),
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
 * يُستدعى بعد اعتماد الاشتراك من لوحة الإدارة أو من Webhook آمن — لا يرمي أخطاء للمتصل؛ يُسجّل فقط عند الفشل.
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
  let commercialRegistration: string | null = (process.env.LEGAL_COMMERCIAL_REGISTRATION || '').trim() || null;
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
