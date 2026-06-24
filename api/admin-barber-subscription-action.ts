/**
 * إجراءات إدارة دفع ميسر بعد التفعيل: اعتماد / ملاحظات جودة / إعادة مبلغ (Refund).
 * POST + جلسة إدارية + صلاحية review_payments.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { tryEmailPartnerUnifiedContractAfterApprove } from './_lib/partnerContractNotify.js';
import { defaultMoyasarSkuForTier } from './_lib/listingLicenseCatalog.js';
import { creditBarberListingEntitlement, loadProductBySku } from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MOYSAR_API_BASE = (process.env.MOYSAR_API_BASE || 'https://api.moyasar.com/v1').trim().replace(/\/$/, '');

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


async function sendResendEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
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

async function moyasarRefundPayment(
  paymentId: string,
  secret: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: number }> {
  const basic = Buffer.from(`${secret}:`, 'utf8').toString('base64');
  let upstream: Response;
  try {
    upstream = await fetch(`${MOYSAR_API_BASE}/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  } catch {
    return { ok: false, error: 'upstream_network' };
  }
  const text = await upstream.text();
  if (!upstream.ok) {
    let msg = text.slice(0, 400);
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg, status: upstream.status };
  }
  return { ok: true };
}

type BarberSubscriptionRow = {
  id: string;
  moyasar_payment_id: string;
  registration_request_id: string | null;
  barber_id: string | null;
  tier: string | null;
  amount_halalas: number | string | null;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
};

async function loadSubscriptionRow(
  supabase: SupabaseClient,
  rowId: string,
): Promise<{ ok: true; row: BarberSubscriptionRow } | { ok: false; error: string }> {
  const { data, error } = await supabase.from('barber_subscriptions').select('*').eq('id', rowId).maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'not_found' };
  return { ok: true, row: data as BarberSubscriptionRow };
}

async function resolveBarberIdAndEmail(
  supabase: SupabaseClient,
  row: BarberSubscriptionRow,
): Promise<
  | { ok: true; barberId: string; email: string; barberName: string; registrationApproved: boolean }
  | { ok: false; error: string }
> {
  let barberId = row.barber_id && UUID_RE.test(row.barber_id) ? row.barber_id : null;
  const rid = row.registration_request_id?.trim();
  let payload: Record<string, unknown> = {};
  let registrationApproved = false;

  if (rid) {
    const { data: reg, error: regErr } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', rid)
      .maybeSingle();
    if (regErr) return { ok: false, error: regErr.message };
    if (reg?.payload && typeof reg.payload === 'object' && !Array.isArray(reg.payload)) {
      payload = reg.payload as Record<string, unknown>;
      const st = String(payload.status ?? '').toLowerCase();
      registrationApproved = st === 'approved';
      const linked = String(payload.linkedBarberId ?? '').trim();
      if (!barberId && linked && UUID_RE.test(linked)) barberId = linked;
    }
  }

  /** احتياطي: معرّف الحلاق من metadata ميسر (نفس الحقل المُمرَّر من صفحة الدفع كـ linkedBarberId). */
  if (!barberId && row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)) {
    const m = row.metadata as Record<string, unknown>;
    const mid = String(m.linked_barber_id ?? m.linkedBarberId ?? '').trim();
    if (mid && UUID_RE.test(mid)) barberId = mid;
  }

  /** بعد الدفع التلقائي قد يكون الصف `paid` مع barber_id دون اعتماد نموذج التسجيل بعد — نسمح للإدارة بالإصلاح اليدوي. */
  if (!registrationApproved && !(row.status === 'paid' && barberId)) {
    return {
      ok: false,
      error:
        'طلب التسجيل غير معتمد بعد — اعتمد الطلب من تبويب «الطلبات» حتى يُضبَط في الطلب حقل linkedBarberId ويصبح بالإمكان تفعيل الحلاق بعد الدفع.',
    };
  }

  if (!barberId) {
    return {
      ok: false,
      error:
        'لم يُعثر على معرّف حلاق مرتبط (linkedBarberId / barber_id). اعتمد طلب التسجيل أولاً، أو تأكد أن صفحة الدفع أرسلت linkedBarberId في metadata لميسر.',
    };
  }

  const { data: barber, error: bErr } = await supabase
    .from('barbers')
    .select('id,email,name')
    .eq('id', barberId)
    .maybeSingle();
  if (bErr || !barber?.email) {
    return { ok: false, error: bErr?.message || 'barber_not_found' };
  }

  const email = String(barber.email).trim();
  const barberName = String(barber.name ?? 'عميلنا الكريم').trim();
  return { ok: true, barberId, email, barberName, registrationApproved };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const sr = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const moy = Boolean((process.env.MOYSAR_SECRET_API_KEY || '').trim());
  const resend = Boolean((process.env.RESEND_API_KEY || '').trim() && (process.env.RESEND_FROM_EMAIL || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'admin-barber-subscription-action',
      ready: url && sr,
      supabaseConfigured: url && sr,
      moyasarSecretSet: moy,
      resendConfigured: resend,
    },
    { headers },
  );
}

type PostBody = {
  action?: unknown;
  rowId?: unknown;
  notes?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'review_payments',
    'manage_partner_billing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }
  const { supabase, actorEmail } = auth;

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim().toLowerCase();
  const rowId = String(body.rowId ?? '').trim();
  const notes = String(body.notes ?? '').trim();

  if (!rowId || !UUID_RE.test(rowId)) {
    return Response.json({ error: 'invalid_row_id' }, { status: 400, headers });
  }

  const loaded = await loadSubscriptionRow(supabase, rowId);
  if (!loaded.ok) {
    return Response.json({ error: 'row_not_found', detail: loaded.error }, { status: 404, headers });
  }
  const row = loaded.row;

  const resendKey = (process.env.RESEND_API_KEY ?? '').trim();
  const resendFrom = (process.env.RESEND_FROM_EMAIL ?? '').trim();

  if (action === 'notes') {
    if (row.status !== 'pending_review' && row.status !== 'paid') {
      return Response.json({ error: 'invalid_status_for_notes' }, { status: 400, headers });
    }
    if (notes.length < 3) {
      return Response.json({ error: 'notes_too_short' }, { status: 400, headers });
    }
    if (notes.length > 8000) {
      return Response.json({ error: 'notes_too_long' }, { status: 400, headers });
    }
    const resolved = await resolveBarberIdAndEmail(supabase, row);
    if (!resolved.ok) {
      return Response.json({ error: 'resolve_barber_failed', detail: resolved.error }, { status: 400, headers });
    }

    const prevMeta =
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const history = Array.isArray(prevMeta.admin_notes_history)
      ? ([...prevMeta.admin_notes_history] as unknown[])
      : [];
    history.push({
      at: new Date().toISOString(),
      by: actorEmail,
      text: notes,
    });
    const nextMeta = {
      ...prevMeta,
      admin_last_note: notes,
      admin_notes_history: history,
    };

    const { error: upErr } = await supabase
      .from('barber_subscriptions')
      .update({
        metadata: nextMeta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rowId)
      .in('status', ['pending_review', 'paid']);
    if (upErr) {
      return Response.json({ error: 'db_update_failed', detail: upErr.message }, { status: 500, headers });
    }

    if (resendKey && resendFrom) {
      const subject = 'حلاق ماب | ملاحظات فريق الجودة على طلبك';
      const text = [
        `أهلًا ${resolved.barberName}،`,
        '',
        'إليك ملاحظات من فريق الجودة بخصوص طلب حزمة الرخصة:',
        notes,
        '',
        'طلبك ما زال قيد المراجعة — يمكنك الرد على هذا البريد أو التواصل عبر الموقع.',
        '',
        '— فريق حلاق ماب',
      ].join('\n');
      const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#fffbeb">
<p>أهلًا <strong>${escapeHtml(resolved.barberName)}</strong>،</p>
<p>إليك ملاحظات من <strong>فريق الجودة</strong>:</p>
<p style="white-space:pre-wrap;border:1px solid #fde68a;background:#fff;border-radius:12px;padding:16px">${escapeHtml(
        notes,
      )}</p>
<p>طلبك ما زال <strong>قيد المراجعة</strong>.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;
      const mail = await sendResendEmail({
        apiKey: resendKey,
        from: resendFrom,
        to: resolved.email,
        subject,
        html,
        text,
      });
      if (!mail.ok) {
        return Response.json({ error: 'email_failed', detail: mail.error }, { status: 502, headers });
      }
    } else {
      return Response.json({ error: 'resend_not_configured' }, { status: 503, headers });
    }

    return Response.json({ ok: true, action: 'notes' }, { headers });
  }

  if (action === 'approve') {
    if (row.status !== 'pending_review' && row.status !== 'paid') {
      return Response.json({ error: 'invalid_status_for_approve' }, { status: 400, headers });
    }
    const resolved = await resolveBarberIdAndEmail(supabase, row);
    if (!resolved.ok) {
      return Response.json({ error: 'resolve_barber_failed', detail: resolved.error }, { status: 400, headers });
    }

    const tierRaw = String(row.tier ?? '').toLowerCase();
    const tier = tierRaw === 'gold' || tierRaw === 'diamond' ? tierRaw : 'bronze';
    const ts = new Date().toISOString();

    const paymentId = String(row.moyasar_payment_id ?? '').trim();
    let entitlementAlreadyFulfilled = false;
    if (paymentId) {
      const { data: existingOrder } = await supabase
        .from('listing_license_orders')
        .select('id')
        .eq('moyasar_payment_id', paymentId)
        .maybeSingle();
      entitlementAlreadyFulfilled = Boolean(existingOrder?.id);
    }

    if (!entitlementAlreadyFulfilled) {
      const sku = defaultMoyasarSkuForTier(tier);
      const productLoaded = await loadProductBySku(supabase, sku);
      if (!productLoaded.ok) {
        return Response.json(
          { error: 'license_product_not_found', detail: productLoaded.error },
          { status: 500, headers },
        );
      }

      const credit = await creditBarberListingEntitlement(supabase, {
        barberId: resolved.barberId,
        product: productLoaded.product,
        source: 'admin_payment_approve',
      });
      if (!credit.ok) {
        return Response.json(
          { error: 'listing_entitlement_failed', detail: credit.error },
          { status: 500, headers },
        );
      }
    }

    const prevMeta =
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const { error: subRowErr } = await supabase
      .from('barber_subscriptions')
      .update({
        status: 'approved',
        barber_id: resolved.barberId,
        metadata: {
          ...prevMeta,
          admin_approved_at: ts,
          admin_approved_by: actorEmail,
        },
        updated_at: ts,
      })
      .eq('id', rowId)
      .in('status', ['pending_review', 'paid']);
    if (subRowErr) {
      return Response.json({ error: 'subscription_row_update_failed', detail: subRowErr.message }, { status: 500, headers });
    }

    if (resendKey && resendFrom) {
      void tryEmailPartnerUnifiedContractAfterApprove({
        supabase,
        resendApiKey: resendKey,
        resendFrom,
        barberEmail: resolved.email,
        barberName: resolved.barberName,
        tier,
        registrationRequestId: row.registration_request_id,
        barberId: resolved.barberId,
      }).catch((e) => console.error('[approve] partner unified contract pdf email', e));
    }

    return Response.json(
      {
        ok: true,
        action: 'approve',
        barberId: resolved.barberId,
        barberEmail: resolved.email,
        barberName: resolved.barberName,
        registrationOrderId: row.registration_request_id,
        tier,
      },
      { headers },
    );
  }

  if (action === 'refund') {
    if (row.status !== 'pending_review' && row.status !== 'paid') {
      return Response.json({ error: 'invalid_status_for_refund' }, { status: 400, headers });
    }
    const secret = (process.env.MOYSAR_SECRET_API_KEY || '').trim();
    if (!secret) {
      return Response.json({ error: 'moyasar_secret_missing' }, { status: 503, headers });
    }
    const refund = await moyasarRefundPayment(row.moyasar_payment_id, secret);
    if (!refund.ok) {
      return Response.json(
        { error: 'moyasar_refund_failed', detail: refund.error, status: refund.status },
        { status: 502, headers },
      );
    }

    const ts = new Date().toISOString();
    const prevMeta =
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const { error: upErr } = await supabase
      .from('barber_subscriptions')
      .update({
        status: 'refunded',
        failure_reason: 'تمت إعادة المبلغ عبر ميسر (إجراء إداري).',
        metadata: {
          ...prevMeta,
          admin_refunded_at: ts,
          admin_refunded_by: actorEmail,
        },
        updated_at: ts,
      })
      .eq('id', rowId)
      .in('status', ['pending_review', 'paid']);
    if (upErr) {
      return Response.json({ error: 'db_update_failed', detail: upErr.message }, { status: 500, headers });
    }

    const resolved = await resolveBarberIdAndEmail(supabase, row);
    if (resolved.ok && resendKey && resendFrom) {
      const subject = 'حلاق ماب | تمت إعادة مبلغ حزمة الرخصة';
      const text = [
        `أهلًا ${resolved.barberName}،`,
        '',
        'تمت إعادة مبلغ شراء حزمة الرخصة وفق سياسة المنصة. إن كان لديك استفسار رد على هذا البريد.',
        '',
        '— فريق حلاق ماب',
      ].join('\n');
      const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc">
<p>أهلًا <strong>${escapeHtml(resolved.barberName)}</strong>،</p>
<p>تمت <strong>إعادة مبلغ</strong> شراء حزمة الرخصة عبر بوابة الدفع. إن رغبت بمتابعة الانضمام يمكنك التواصل معنا.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;
      await sendResendEmail({
        apiKey: resendKey,
        from: resendFrom,
        to: resolved.email,
        subject,
        html,
        text,
      });
    }

    return Response.json({ ok: true, action: 'refund' }, { headers });
  }

  return Response.json({ error: 'unknown_action' }, { status: 400, headers });
}
