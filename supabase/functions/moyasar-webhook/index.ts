/**
 * Moyasar Webhook — Supabase Edge Function
 *
 * التحقق: حقل `secret_token` في جسم JSON يجب أن يطابق MOYASAR_WEBHOOK_SECRET (مقارنة آمنة زمنياً).
 * @see https://docs.moyasar.com/api/other/webhooks/webhook-reference
 *
 * أسرار: MOYASAR_WEBHOOK_SECRET، RESEND_API_KEY، RESEND_FROM_EMAIL
 * اختياري: INVOICE_PLACEHOLDER_URL — رابط الفاتورة الافتراضي إن لم يُمرَّر metadata.invoice_url
 * تفعيل تلقائي + بريد الترحيب (نفس محتوى /api/send-barber-onboarding):
 *   APP_PUBLIC_ORIGIN أو PUBLIC_SITE_ORIGIN — أصل الموقع (https://…)
 *   ONBOARDING_INTERNAL_WEBHOOK_SECRET — يطابق سر Vercel نفسه في رأس x-onboarding-internal-secret
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type MoyasarWebhookBody = {
  id?: string;
  type?: string;
  created_at?: string;
  secret_token?: string;
  data?: Record<string, unknown> | null;
};

type PaymentData = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const ae = new TextEncoder().encode(a);
  const be = new TextEncoder().encode(b);
  let diff = 0;
  for (let i = 0; i < ae.length; i += 1) diff |= ae[i]! ^ be[i]!;
  return diff === 0;
}

function jsonResponse(body: Record<string, unknown>, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function tierFromMeta(meta: Record<string, unknown> | null | undefined): "bronze" | "gold" | "diamond" | null {
  const t = String(meta?.tier ?? "").toLowerCase();
  if (t === "bronze" || t === "gold" || t === "diamond") return t;
  return null;
}

function extractCustomerEmail(payment: PaymentData): string | null {
  const src = payment.source;
  if (src && typeof src === "object") {
    const em = String(src.email ?? "").trim();
    if (em.includes("@")) return em;
    const n = String(src.number ?? "").trim();
    if (n.includes("@")) return n;
  }
  return null;
}

function extractFailureReason(data: PaymentData): string | null {
  const src = data.source;
  if (!src || typeof src !== "object") return null;
  const msg = String(src.message ?? "").trim();
  if (msg) return msg.slice(0, 4000);
  const name = String(src.name ?? "").trim();
  if (name) return name.slice(0, 4000);
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** رابط فاتورة وهمي إلى أن يُربط توليد PDF / زاتكا — أو metadata.invoice_url من ميسر */
function resolveInvoiceHref(meta: Record<string, unknown>): string {
  const fromMeta = String(meta.invoice_url ?? "").trim();
  if (fromMeta.startsWith("http://") || fromMeta.startsWith("https://")) return fromMeta;
  const envPlaceholder = (Deno.env.get("INVOICE_PLACEHOLDER_URL") ?? "").trim();
  if (envPlaceholder.startsWith("http://") || envPlaceholder.startsWith("https://")) return envPlaceholder;
  return "https://www.halaqmap.com/#/partners/payment?invoice=pending";
}

function addOneMonth(d: Date): Date {
  const out = new Date(d.getTime());
  out.setMonth(out.getMonth() + 1);
  return out;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** تفعيل فوري: حلاق نشط + اشتراك شهري active (نفس منطق اعتماد الإدارة السابق). */
async function activateBarberAndSubscriptionPaid(
  supabase: ReturnType<typeof createClient>,
  barberId: string,
  tier: "bronze" | "gold" | "diamond" | null,
  amountHalalas: number | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const tierNorm = tier === "gold" || tier === "diamond" ? tier : "bronze";
  const now = new Date();
  const start = dateStr(now);
  const end = dateStr(addOneMonth(now));
  const amt = typeof amountHalalas === "number" && Number.isFinite(amountHalalas) ? amountHalalas : 0;
  const priceSar = amt > 0 ? Math.round(amt) / 100 : 0;
  const ts = now.toISOString();

  const { error: barberErr } = await supabase
    .from("barbers")
    .update({
      is_active: true,
      is_verified: true,
      open_for_customers: true,
      tier: tierNorm,
      updated_at: ts,
    })
    .eq("id", barberId);
  if (barberErr) return { ok: false, error: barberErr.message };

  const { data: latestSub, error: subSelErr } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("barber_id", barberId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subSelErr) return { ok: false, error: subSelErr.message };

  if (latestSub?.id) {
    const { error: subUp } = await supabase
      .from("subscriptions")
      .update({
        tier: tierNorm,
        start_date: start,
        end_date: end,
        status: "active",
        price: priceSar,
        updated_at: ts,
      })
      .eq("id", latestSub.id);
    if (subUp) return { ok: false, error: subUp.message };
  } else {
    const { error: subIn } = await supabase.from("subscriptions").insert({
      barber_id: barberId,
      tier: tierNorm,
      start_date: start,
      end_date: end,
      status: "active",
      auto_renew: false,
      price: priceSar,
    });
    if (subIn) return { ok: false, error: subIn.message };
  }
  return { ok: true };
}

async function sendResendConfirmation(input: {
  apiKey: string;
  from: string;
  to: string;
  barberName: string;
  tierLabel: string;
  amountHalalas: number;
  currency: string;
  invoiceHref: string;
  /** عند ربط حساب حلاق وتفعيله تلقائياً من الـ Webhook */
  accountActivated: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const amountSar = (input.amountHalalas / 100).toFixed(2);
  const subject = input.accountActivated
    ? "حلاق ماب | تم الدفع وتفعيل حسابك"
    : "حلاق ماب | تم استلام الدفع";
  const activationBlock = input.accountActivated
    ? `<p>تم <strong>تفعيل حسابك على الخريطة</strong> ويمكنك البدء باستقبال الطلبات من لوحة التحكم.</p>`
    : `<p>تم استلام المبلغ بنجاح. إذا لم يظهر صالونك على الخريطة بعد، تأكد من إكمال التسجيل وربط معرّف الحلاق في عملية الدفع أو تواصل مع الدعم.</p>`;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc">
<p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p>
<p>شكرًا لك، تم استلام مبلغ الاشتراك بنجاح عبر <strong>ميسر (Moyasar)</strong>.</p>
${activationBlock}
<ul style="list-style:none;padding:0">
<li>الباقة: <strong>${escapeHtml(input.tierLabel)}</strong></li>
<li>المبلغ: <strong>${escapeHtml(amountSar)} ${escapeHtml(input.currency)}</strong></li>
</ul>
<p>مرجع الفاتورة/الإيصال: <a href="${escapeHtml(input.invoiceHref)}">عرض الرابط</a>
<span style="font-size:12px;color:#64748b">(إن وُجد <code>invoice_url</code> في بيانات الدفع يُستبدل هذا الرابط تلقائياً)</span></p>
<p>لأي استفسار ردّ على هذا البريد أو من صفحة التواصل في الموقع.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject,
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

async function sendResendPaymentFailure(input: {
  apiKey: string;
  from: string;
  to: string;
  barberName: string;
  reason: string;
  paymentId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = "حلاق ماب | لم يكتمل دفع الاشتراك";
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#fef2f2">
<p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p>
<p>لم نتمكن من إتمام عملية الدفع عبر ميسر.</p>
<p><strong>التفاصيل:</strong> ${escapeHtml(input.reason || "غير محدد")}</p>
<p style="font-size:13px;color:#64748b" dir="ltr">مرجع الدفع: ${escapeHtml(input.paymentId)}</p>
<p>يرجى المحاولة مرة أخرى أو استخدام بطاقة دفع بديلة من صفحة الدفع في حلاق ماب.</p>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject,
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

async function resolveRecipientContext(
  supabase: ReturnType<typeof createClient>,
  registrationRequestId: string | null,
  payment: PaymentData,
  meta: Record<string, unknown>,
): Promise<{ email: string | null; barberName: string; linkedBarberId: string | null }> {
  const fromMetaBarber = String(meta.linked_barber_id ?? meta.linkedBarberId ?? "").trim();

  const fromPayment = extractCustomerEmail(payment);
  if (fromPayment) {
    const bid = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: fromPayment, barberName: "عميلنا الكريم", linkedBarberId: bid };
  }

  if (!registrationRequestId) {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: "عميلنا الكريم", linkedBarberId: bidOnly };
  }

  const { data, error } = await supabase
    .from("registration_submissions")
    .select("payload")
    .eq("id", registrationRequestId)
    .maybeSingle();
  if (error || !data?.payload || typeof data.payload !== "object") {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: "عميلنا الكريم", linkedBarberId: bidOnly };
  }

  const p = data.payload as Record<string, unknown>;
  const email = typeof p.email === "string" ? p.email.trim() : "";
  const barberName = typeof p.barberName === "string" ? p.barberName.trim() : "عميلنا الكريم";
  const linkedPayload = typeof p.linkedBarberId === "string" ? p.linkedBarberId.trim() : "";
  const linked = UUID_RE.test(fromMetaBarber)
    ? fromMetaBarber
    : UUID_RE.test(linkedPayload)
      ? linkedPayload
      : null;

  return {
    email: email && email.includes("@") ? email : null,
    barberName: barberName || "عميلنا الكريم",
    linkedBarberId: linked,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const webhookSecret = (Deno.env.get("MOYASAR_WEBHOOK_SECRET") ?? "").trim();
  const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  const resendFrom = (Deno.env.get("RESEND_FROM_EMAIL") ?? "").trim();
  const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();
  const serviceRole = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();

  if (!webhookSecret || !supabaseUrl || !serviceRole) {
    return jsonResponse(
      {
        error: "server_misconfigured",
        hint: "Set MOYASAR_WEBHOOK_SECRET and ensure Supabase secrets are present.",
      },
      503,
    );
  }

  const rawBody = await req.text();
  let body: MoyasarWebhookBody;
  try {
    body = JSON.parse(rawBody) as MoyasarWebhookBody;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const token = String(body.secret_token ?? "");
  if (!token || !timingSafeEq(token, webhookSecret)) {
    return jsonResponse({ error: "invalid_secret_token" }, 401);
  }

  const eventId = String(body.id ?? "").trim();
  const eventType = String(body.type ?? "").trim();
  const data = (body.data ?? {}) as PaymentData;
  const paymentId = String(data.id ?? "").trim();

  if (!paymentId) {
    return jsonResponse({ error: "missing_payment_id" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (eventId) {
    const { data: dup } = await supabase
      .from("barber_subscriptions")
      .select("id")
      .eq("moyasar_webhook_event_id", eventId)
      .maybeSingle();
    if (dup) {
      return jsonResponse({ ok: true, idempotent: true, eventId }, 200);
    }
  }

  const meta = (data.metadata && typeof data.metadata === "object" ? data.metadata : {}) as Record<string, unknown>;
  const requestId =
    (typeof meta.request_id === "string" ? meta.request_id.trim() : "") ||
    (typeof meta.requestId === "string" ? meta.requestId.trim() : "");
  const tier = tierFromMeta(meta);
  const rawAmount = data.amount;
  const amount =
    typeof rawAmount === "number" && Number.isFinite(rawAmount) ? Math.trunc(rawAmount) : null;
  const currency = String(data.currency ?? "SAR").toUpperCase() || "SAR";
  const paymentStatus = String(data.status ?? "").toLowerCase();

  let rowStatus:
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "voided"
    | "authorized"
    | "cancelled"
    | "pending_review"
    | "approved" = "pending";
  /**
   * عند `paid` من ميسر: `barber_subscriptions.status = paid` وتفعيل فوري للحلاق (barbers + subscriptions)
   * عند توفر معرّف حلاق صالح في metadata / الطلب — دون انتظار إداري.
   */
  if (paymentStatus === "paid") rowStatus = "paid";
  else if (paymentStatus === "failed" || paymentStatus === "faild") rowStatus = "failed";
  else if (paymentStatus === "canceled" || paymentStatus === "cancelled") rowStatus = "cancelled";
  else if (paymentStatus === "refunded") rowStatus = "refunded";
  else if (paymentStatus === "voided") rowStatus = "voided";
  else if (paymentStatus === "authorized") rowStatus = "authorized";

  const failureReasonRaw = extractFailureReason(data);
  const invoiceUrlStored = typeof meta.invoice_url === "string" ? meta.invoice_url.trim() : "";

  const { email: resolvedEmail, barberName, linkedBarberId } = await resolveRecipientContext(
    supabase,
    requestId || null,
    data,
    meta,
  );

  const barberId = linkedBarberId && UUID_RE.test(linkedBarberId) ? linkedBarberId : null;

  /** يُخزَّن مع metadata لمساعدة الإدارة ومسار الاعتماد عندما يُمرَّر من صفحة الدفع (linkedBarberId / linked_barber_id). */
  const linkedFromPaymentMeta = (() => {
    const a = String(meta.linked_barber_id ?? "").trim();
    const b = String(meta.linkedBarberId ?? "").trim();
    if (UUID_RE.test(a)) return a;
    if (UUID_RE.test(b)) return b;
    return "";
  })();

  const metaPayload = {
    moyasar_type: eventType,
    payment_status: paymentStatus,
    moyasar_payment_status: paymentStatus,
    raw_payment_id: paymentId,
    ...(linkedFromPaymentMeta ? { linked_barber_id: linkedFromPaymentMeta } : {}),
    ...(invoiceUrlStored ? { invoice_url: invoiceUrlStored } : {}),
  };

  const upsertRow: Record<string, unknown> = {
    moyasar_payment_id: paymentId,
    moyasar_webhook_event_id: eventId || null,
    registration_request_id: requestId || null,
    barber_id: barberId,
    tier: tier ?? null,
    amount_halalas: amount,
    currency,
    status: rowStatus,
    last_webhook_type: eventType || null,
    metadata: metaPayload,
    failure_reason:
      rowStatus === "failed" || rowStatus === "cancelled"
        ? failureReasonRaw ?? null
        : rowStatus === "refunded"
          ? failureReasonRaw ?? "تمت إعادة المبلغ."
          : null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: selErr } = await supabase
    .from("barber_subscriptions")
    .select("id,confirmation_email_sent_at,failure_notification_sent_at")
    .eq("moyasar_payment_id", paymentId)
    .maybeSingle();

  if (selErr) {
    return jsonResponse({ error: "db_select_failed", detail: selErr.message }, 500);
  }

  if (existing?.id) {
    const { error: upErr } = await supabase.from("barber_subscriptions").update(upsertRow).eq("id", existing.id);
    if (upErr) return jsonResponse({ error: "db_update_failed", detail: upErr.message }, 500);
  } else {
    const { error: insErr } = await supabase.from("barber_subscriptions").insert({
      ...upsertRow,
      created_at: new Date().toISOString(),
    });
    if (insErr) return jsonResponse({ error: "db_insert_failed", detail: insErr.message }, 500);
  }

  let accountActivated = false;
  let onboardingApiOk = false;

  if (rowStatus === "paid" && barberId) {
    const act = await activateBarberAndSubscriptionPaid(supabase, barberId, tier, amount);
    if (!act.ok) {
      console.warn("[moyasar-webhook] activateBarberAndSubscriptionPaid:", act.error);
      return jsonResponse(
        { error: "activation_failed", detail: act.error, paymentId, eventId: eventId || null },
        502,
      );
    }
    accountActivated = true;
    const tsAct = new Date().toISOString();
    await supabase
      .from("barber_subscriptions")
      .update({
        metadata: { ...metaPayload, webhook_auto_activated_at: tsAct },
        updated_at: tsAct,
      })
      .eq("moyasar_payment_id", paymentId);

    const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") ?? Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "").trim().replace(
      /\/+$/,
      "",
    );
    const obSecret = (Deno.env.get("ONBOARDING_INTERNAL_WEBHOOK_SECRET") ?? "").trim();
    const { data: bRow } = await supabase.from("barbers").select("email,name").eq("id", barberId).maybeSingle();
    const toOnboarding =
      bRow?.email && String(bRow.email).includes("@") ? String(bRow.email).trim() : resolvedEmail;
    const nameOnboarding = (bRow?.name && String(bRow.name).trim()) || barberName;
    if (appOrigin && obSecret && toOnboarding) {
      const tierStr = tier === "diamond" ? "diamond" : tier === "gold" ? "gold" : "bronze";
      try {
        const obResp = await fetch(`${appOrigin}/api/send-barber-onboarding`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-onboarding-internal-secret": obSecret,
          },
          body: JSON.stringify({
            mode: "single",
            barberEmail: toOnboarding,
            barberName: nameOnboarding,
            tier: tierStr,
            barberId,
            registrationOrderId: requestId || undefined,
          }),
        });
        if (obResp.ok) onboardingApiOk = true;
        else console.warn("[moyasar-webhook] send-barber-onboarding:", await obResp.text());
      } catch (e) {
        console.warn("[moyasar-webhook] send-barber-onboarding fetch:", e);
      }
    }
  }

  let emailSent = false;
  let failureEmailSent = false;

  if (rowStatus === "paid" && resendKey && resendFrom && resolvedEmail) {
    const { data: rowAfter } = await supabase
      .from("barber_subscriptions")
      .select("confirmation_email_sent_at")
      .eq("moyasar_payment_id", paymentId)
      .maybeSingle();

    if (!rowAfter?.confirmation_email_sent_at) {
      const tierAr =
        tier === "diamond" ? "ماسي" : tier === "gold" ? "ذهبي" : tier === "bronze" ? "برونزي" : "الباقة المختارة";
      const invoiceHref = resolveInvoiceHref(meta);
      const mail = await sendResendConfirmation({
        apiKey: resendKey,
        from: resendFrom,
        to: resolvedEmail,
        barberName,
        tierLabel: tierAr,
        amountHalalas: amount ?? 0,
        currency,
        invoiceHref,
        accountActivated: accountActivated && Boolean(barberId),
      });
      if (mail.ok) {
        emailSent = true;
        await supabase
          .from("barber_subscriptions")
          .update({ confirmation_email_sent_at: new Date().toISOString() })
          .eq("moyasar_payment_id", paymentId);
      } else {
        console.warn("[moyasar-webhook] resend:", mail.error);
      }
    }
  }

  if ((rowStatus === "failed" || rowStatus === "cancelled") && resendKey && resendFrom && resolvedEmail) {
    const { data: rowFail } = await supabase
      .from("barber_subscriptions")
      .select("failure_notification_sent_at")
      .eq("moyasar_payment_id", paymentId)
      .maybeSingle();

    if (!rowFail?.failure_notification_sent_at) {
      const mail = await sendResendPaymentFailure({
        apiKey: resendKey,
        from: resendFrom,
        to: resolvedEmail,
        barberName,
        reason: failureReasonRaw || (rowStatus === "cancelled" ? "تم إلغاء العملية." : "فشل التحقق من الدفع."),
        paymentId,
      });
      if (mail.ok) {
        failureEmailSent = true;
        await supabase
          .from("barber_subscriptions")
          .update({ failure_notification_sent_at: new Date().toISOString() })
          .eq("moyasar_payment_id", paymentId);
      } else {
        console.warn("[moyasar-webhook] resend failure mail:", mail.error);
      }
    }
  }

  return jsonResponse(
    {
      ok: true,
      paymentId,
      eventId: eventId || null,
      status: rowStatus,
      emailSent,
      failureEmailSent,
      accountActivated,
      onboardingApiOk,
    },
    200,
  );
});
