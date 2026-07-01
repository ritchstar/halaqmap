/**
 * Moyasar Webhook — Supabase Edge Function
 *
 * التحقق: حقل `secret_token` في جسم JSON يجب أن يطابق MOYASAR_WEBHOOK_SECRET (مقارنة آمنة زمنياً).
 * @see https://docs.moyasar.com/api/other/webhooks/webhook-reference
 *
 * أسرار: MOYASAR_WEBHOOK_SECRET، RESEND_API_KEY، RESEND_FROM_EMAIL
 * Production split keys (Supabase Edge secrets):
 * - PAYMENT_ENV=live
 * - MOYASAR_WEBHOOK_LIVE_SECRET=...
 * - MOYSAR_SECRET_LIVE_API_KEY=sk_live_... (used by Vercel verify endpoint)
 * Sandbox split keys:
 * - PAYMENT_ENV=test
 * - MOYASAR_WEBHOOK_TEST_SECRET=...
 * - MOYSAR_SECRET_TEST_API_KEY=sk_test_...
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

function resolveWebhookSecret(): string {
  const mode = (Deno.env.get("PAYMENT_ENV") ?? "test").trim().toLowerCase();
  const testSecret = (Deno.env.get("MOYASAR_WEBHOOK_TEST_SECRET") ?? "").trim();
  const liveSecret = (Deno.env.get("MOYASAR_WEBHOOK_LIVE_SECRET") ?? "").trim();
  const legacy = (Deno.env.get("MOYASAR_WEBHOOK_SECRET") ?? "").trim();
  if (mode === "live") return liveSecret || legacy;
  return testSecret || legacy;
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

function expectedAmountHalalasFromTier(tier: "bronze" | "gold" | "diamond"): number {
  // السعر الأساسي الشهري المعتمد في التسجيل/الدفع (قبل أي منطق ضرائب مستقبلي على الخادم).
  if (tier === "gold") return 15000;
  if (tier === "diamond") return 20000;
  return 10000;
}

function expectedAmountHalalasFromMeta(meta: Record<string, unknown> | null | undefined): number | null {
  if (!meta || typeof meta !== "object") return null;
  const raw =
    meta.expected_amount_halalas ??
    meta.expectedAmountHalalas ??
    meta.amount_halalas_expected ??
    null;
  if (raw == null) return null;
  const n =
    typeof raw === "number"
      ? Math.trunc(raw)
      : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 100) return null;
  return n;
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

function licenseQuantityFromMeta(meta: Record<string, unknown> | null | undefined): number {
  if (!meta || typeof meta !== "object") return 1;
  const raw = meta.license_quantity ?? meta.licenseQuantity ?? 1;
  const n =
    typeof raw === "number"
      ? Math.trunc(raw)
      : Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

function licenseSkuFromMeta(meta: Record<string, unknown>, tier: "bronze" | "gold" | "diamond" | null): string {
  const fromMeta = String(meta.license_sku ?? meta.licenseSku ?? "").trim().toLowerCase();
  if (fromMeta) return fromMeta;
  if (tier === "gold") return "gold_30";
  if (tier === "diamond") return "diamond_30";
  return "bronze_30";
}

function digitalShiftAddonFromMeta(meta: Record<string, unknown>): boolean {
  const raw = meta.digital_shift_addon ?? meta.digitalShiftAddon;
  return raw === true || raw === "true" || raw === 1 || raw === "1";
}

function clampRegistrationQty(raw: unknown): number {
  const n =
    typeof raw === "number" && Number.isFinite(raw)
      ? Math.trunc(raw)
      : Number.parseInt(String(raw ?? "1").trim(), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, n));
}

async function validateRegistrationPaymentAgainstMeta(
  supabase: ReturnType<typeof createClient>,
  registrationRequestId: string,
  meta: Record<string, unknown>,
  tier: "bronze" | "gold" | "diamond" | null,
  licenseQty: number,
): Promise<{ ok: true } | { ok: false; code: string; detail: Record<string, unknown> }> {
  const { data, error } = await supabase
    .from("registration_submissions")
    .select("payload")
    .eq("id", registrationRequestId)
    .maybeSingle();
  if (error || !data?.payload || typeof data.payload !== "object" || Array.isArray(data.payload)) {
    return { ok: true };
  }

  const p = data.payload as Record<string, unknown>;
  const regTier = String(p.tier ?? "").trim().toLowerCase();
  const payTier = tier ?? "";
  if (regTier && payTier && regTier !== payTier) {
    return {
      ok: false,
      code: "registration_payment_tier_mismatch",
      detail: { registrationTier: regTier, paymentTier: payTier },
    };
  }

  const regQty = clampRegistrationQty(p.listingLicenseQuantity);
  if (regQty !== licenseQty) {
    return {
      ok: false,
      code: "registration_payment_qty_mismatch",
      detail: { registrationQty: regQty, paymentQty: licenseQty },
    };
  }

  const regAddonRaw = p.digitalShiftAddonSelected;
  const regAddon =
    regAddonRaw === true || regAddonRaw === "true" || regAddonRaw === 1 || regAddonRaw === "1";
  const regAddonAllowed = regTier === "diamond" && regAddon;
  const payAddon = digitalShiftAddonFromMeta(meta);
  if (regAddonAllowed !== payAddon) {
    return {
      ok: false,
      code: "registration_payment_addon_mismatch",
      detail: { registrationAddon: regAddonAllowed, paymentAddon: payAddon },
    };
  }

  return { ok: true };
}

async function provisionBarberViaInternalApi(input: {
  registrationRequestId: string | null;
  buyerEmail: string | null;
  buyerName: string;
  buyerPhone: string | null;
  tier: "bronze" | "gold" | "diamond" | null;
  moyasarPaymentId: string;
}): Promise<
  | { ok: true; barberId: string; created: boolean; credentialEmailSent: boolean }
  | { ok: false; error: string }
> {
  const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") ?? Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "").trim().replace(
    /\/+$/,
    "",
  );
  const secret = (Deno.env.get("BARBER_PROVISION_INTERNAL_SECRET") ?? Deno.env.get("LISTING_LICENSE_INTERNAL_SECRET") ?? "").trim();
  if (!appOrigin || !secret) {
    return { ok: false, error: "barber_provision_internal_not_configured" };
  }
  try {
    const resp = await fetch(`${appOrigin}/api/barber-provision-from-payment-internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-barber-provision-internal-secret": secret,
      },
      body: JSON.stringify({
        registrationRequestId: input.registrationRequestId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        buyerPhone: input.buyerPhone,
        tier: input.tier ?? "bronze",
        moyasarPaymentId: input.moyasarPaymentId,
      }),
    });
    const text = await resp.text();
    if (!resp.ok) {
      return { ok: false, error: text.slice(0, 500) || `http_${resp.status}` };
    }
    const j = JSON.parse(text) as { barberId?: string; created?: boolean; credentialEmailSent?: boolean };
    const bid = String(j.barberId ?? "").trim();
    if (!UUID_RE.test(bid)) {
      return { ok: false, error: "provision_missing_barber_id" };
    }
    return {
      ok: true,
      barberId: bid,
      created: j.created === true,
      credentialEmailSent: j.credentialEmailSent === true,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "provision_fetch_failed" };
  }
}

async function fulfillListingLicenseViaInternalApi(input: {
  skuCode: string;
  tier: "bronze" | "gold" | "diamond" | null;
  barberId: string | null;
  buyerEmail: string | null;
  buyerName: string;
  moyasarPaymentId: string;
  registrationRequestId: string | null;
  amountHalalas: number | null;
  quantity: number;
  autoRedeem: boolean;
  paymentMetadata?: Record<string, unknown>;
}): Promise<{ ok: true; autoRedeemed: boolean; validUntil: string } | { ok: false; error: string }> {
  const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") ?? Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "").trim().replace(
    /\/+$/,
    "",
  );
  const secret = (Deno.env.get("LISTING_LICENSE_INTERNAL_SECRET") ?? "").trim();
  if (!appOrigin || !secret) {
    return { ok: false, error: "listing_license_internal_not_configured" };
  }
  try {
    const resp = await fetch(`${appOrigin}/api/listing-license-fulfill-internal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-listing-license-internal-secret": secret,
      },
      body: JSON.stringify({
        skuCode: input.skuCode,
        tier: input.tier ?? "bronze",
        barberId: input.barberId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        paymentChannel: "moyasar",
        moyasarPaymentId: input.moyasarPaymentId,
        registrationRequestId: input.registrationRequestId,
        amountHalalas: input.amountHalalas,
        quantity: input.quantity,
        autoRedeem: input.autoRedeem,
        metadata: {
          source: "moyasar_webhook",
          license_quantity: input.quantity,
          ...(input.paymentMetadata && typeof input.paymentMetadata === "object"
            ? input.paymentMetadata
            : {}),
        },
      }),
    });
    const text = await resp.text();
    if (!resp.ok) {
      return { ok: false, error: text.slice(0, 500) || `http_${resp.status}` };
    }
    const j = JSON.parse(text) as { autoRedeemed?: boolean; validUntil?: string };
    return {
      ok: true,
      autoRedeemed: j.autoRedeemed === true,
      validUntil: String(j.validUntil ?? ""),
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function logPaymentSecurityEvent(
  supabase: ReturnType<typeof createClient>,
  input: {
    severity?: "info" | "warning" | "critical";
    eventType: string;
    paymentId: string | null;
    registrationRequestId?: string | null;
    barberId?: string | null;
    reason?: string | null;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await supabase.from("payment_security_events").insert({
      severity: input.severity ?? "warning",
      event_type: input.eventType,
      source: "moyasar_webhook",
      payment_id: input.paymentId ?? null,
      registration_request_id: input.registrationRequestId ?? null,
      barber_id: input.barberId ?? null,
      reason: input.reason ?? null,
      detail: input.detail ?? {},
    });
  } catch {
    // سجل اختياري: لا نوقف مسار الدفع إذا تعذّر إدراج السجل الأمني.
  }
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
  tier?: "bronze" | "gold" | "diamond" | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const amountSar = (input.amountHalalas / 100).toFixed(2);
  const isBronze = input.tier === "bronze";
  const subject = input.accountActivated
    ? isBronze
      ? "حلاق ماب | تم الدفع وتفعيل رخصة النفاذ"
      : "حلاق ماب | تم الدفع وتفعيل حسابك"
    : "حلاق ماب | تم استلام الدفع";
  const activationBlock = input.accountActivated
    ? isBronze
      ? `<p>تم <strong>تفعيل رخصة النفاذ الرقمية</strong> وبروتوكول الربط الآلي. راجع بريدك لشهادة التفعيل وروابط تشغيل الصالون (مفتوح/مغلق) والعقد الموحّد.</p>`
      : `<p>تم <strong>تفعيل حسابك عبر نظام الرصد الذكي</strong> ويمكنك البدء باستقبال الطلبات من لوحة التحكم.</p>`
    : `<p>تم استلام المبلغ بنجاح. إذا لم يظهر صالونك عبر نظام الرصد الذكي بعد، تأكد من إكمال التسجيل وربط معرّف الحلاق في عملية الدفع أو تواصل مع الدعم.</p>`;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc">
<p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p>
<p>شكرًا لك، تم استلام قيمة <strong>حزمة الرخصة لخدمات الإدراج</strong> (Halaqmap Software Package) بنجاح عبر <strong>ميسر (Moyasar)</strong>.</p>
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
  const subject = "حلاق ماب | لم يكتمل شراء حزمة الرخصة";
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
): Promise<{ email: string | null; barberName: string; linkedBarberId: string | null; phone: string | null }> {
  const fromMetaBarber = String(meta.linked_barber_id ?? meta.linkedBarberId ?? "").trim();
  const sourcePhone = (() => {
    const src = payment.source;
    if (!src || typeof src !== "object") return "";
    const n = String(src.number ?? "").trim();
    if (!n) return "";
    return n.startsWith("+") ? n : `+${n.replace(/^00/, "")}`;
  })();

  const fromPayment = extractCustomerEmail(payment);
  const sourceName = (() => {
    const src = payment.source;
    if (!src || typeof src !== "object") return "";
    return String(src.name ?? "").trim();
  })();
  if (fromPayment) {
    const bid = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return {
      email: fromPayment,
      barberName: sourceName || "عميلنا الكريم",
      linkedBarberId: bid,
      phone: sourcePhone || null,
    };
  }

  if (!registrationRequestId) {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: "عميلنا الكريم", linkedBarberId: bidOnly, phone: sourcePhone || null };
  }

  const { data, error } = await supabase
    .from("registration_submissions")
    .select("payload")
    .eq("id", registrationRequestId)
    .maybeSingle();
  if (error || !data?.payload || typeof data.payload !== "object") {
    const bidOnly = UUID_RE.test(fromMetaBarber) ? fromMetaBarber : null;
    return { email: null, barberName: "عميلنا الكريم", linkedBarberId: bidOnly, phone: sourcePhone || null };
  }

  const p = data.payload as Record<string, unknown>;
  const email = typeof p.email === "string" ? p.email.trim() : "";
  const barberName = typeof p.barberName === "string" ? p.barberName.trim() : "عميلنا الكريم";
  const phone = typeof p.phone === "string" ? p.phone.trim() : "";
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
    phone: phone || sourcePhone || null,
  };
}

type WebhookPlatformPay = {
  enable_internal_onboarding_email: boolean;
  enable_whatsapp_payment_notify: boolean;
  enable_resend_payment_receipt: boolean;
  enforce_price_currency_match: boolean;
};

const WEBHOOK_PLATFORM_PAY_DEFAULT: WebhookPlatformPay = {
  enable_internal_onboarding_email: true,
  enable_whatsapp_payment_notify: false,
  enable_resend_payment_receipt: true,
  enforce_price_currency_match: true,
};

async function fetchPlatformPaymentSettingsForWebhook(
  supabase: ReturnType<typeof createClient>,
): Promise<WebhookPlatformPay> {
  const { data, error } = await supabase
    .from("platform_payment_settings")
    .select(
      "enable_internal_onboarding_email, enable_whatsapp_payment_notify, enable_resend_payment_receipt, enforce_price_currency_match",
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return WEBHOOK_PLATFORM_PAY_DEFAULT;
  const d = data as Record<string, unknown>;
  return {
    enable_internal_onboarding_email: d.enable_internal_onboarding_email !== false,
    enable_whatsapp_payment_notify: d.enable_whatsapp_payment_notify === true,
    enable_resend_payment_receipt: d.enable_resend_payment_receipt !== false,
    enforce_price_currency_match: d.enforce_price_currency_match !== false,
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

  const webhookSecret = resolveWebhookSecret();
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

  const platformPay = await fetchPlatformPaymentSettingsForWebhook(supabase);

  if (eventId) {
    const { data: dup } = await supabase
      .from("barber_subscriptions")
      .select("id")
      .eq("moyasar_webhook_event_id", eventId)
      .maybeSingle();
    if (dup) {
      const { data: existingOrder } = await supabase
        .from("listing_license_orders")
        .select("id")
        .eq("moyasar_payment_id", paymentId)
        .maybeSingle();
      if (existingOrder?.id) {
        return jsonResponse({ ok: true, idempotent: true, eventId, orderId: existingOrder.id }, 200);
      }
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
  const paymentGateway = String(meta.payment_gateway ?? "MOYASAR")
    .trim()
    .toUpperCase();
  const successStatus = paymentStatus === "paid" || paymentStatus === "success" || paymentStatus === "succeeded";

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
  if (successStatus) rowStatus = "paid";
  else if (paymentStatus === "failed" || paymentStatus === "faild") rowStatus = "failed";
  else if (paymentStatus === "canceled" || paymentStatus === "cancelled") rowStatus = "cancelled";
  else if (paymentStatus === "refunded") rowStatus = "refunded";
  else if (paymentStatus === "voided") rowStatus = "voided";
  else if (paymentStatus === "authorized") rowStatus = "authorized";

  const failureReasonRaw = extractFailureReason(data);
  const invoiceUrlStored = typeof meta.invoice_url === "string" ? meta.invoice_url.trim() : "";

  const { email: resolvedEmail, barberName, linkedBarberId, phone: resolvedPhone } = await resolveRecipientContext(
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
    payment_gateway: paymentGateway,
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
  let whatsappDraftOk = false;

  if (rowStatus === "paid") {
    const trustedPaidSource = Boolean(eventType && /^payment/i.test(eventType));
    if (!trustedPaidSource) {
      await logPaymentSecurityEvent(supabase, {
        severity: "critical",
        eventType: "untrusted_paid_event_type",
        paymentId,
        registrationRequestId: requestId || null,
        barberId: barberId ?? null,
        reason: "Paid status received from untrusted or missing event type.",
        detail: { eventType, paymentStatus, metadata: metaPayload },
      });
      return jsonResponse(
        {
          error: "untrusted_paid_event_type",
          paymentId,
          eventId: eventId || null,
        },
        409,
      );
    }

    const paidAmount = typeof amount === "number" && Number.isFinite(amount) ? amount : null;
    const expectedFromMeta = expectedAmountHalalasFromMeta(meta);
    const licenseQty = licenseQuantityFromMeta(meta);
    const expectedFromTier = tier ? expectedAmountHalalasFromTier(tier) * licenseQty : null;
    const expectedAmount = expectedFromMeta ?? expectedFromTier;
    const expectedCurrency = String(meta.expected_currency ?? meta.expectedCurrency ?? "SAR")
      .trim()
      .toUpperCase();
    const currencyOk = !expectedCurrency || expectedCurrency === currency;
    const amountOk = expectedAmount != null && paidAmount != null && paidAmount === expectedAmount;

    if (platformPay.enforce_price_currency_match) {
      if (!amountOk || !currencyOk) {
        const detail = {
          reason: "price_mismatch_before_activation",
          expected_amount_halalas: expectedAmount,
          actual_amount_halalas: paidAmount,
          expected_currency: expectedCurrency || null,
          actual_currency: currency || null,
          tier: tier ?? null,
        };
        const tsFail = new Date().toISOString();
        await supabase
          .from("barber_subscriptions")
          .update({
            failure_reason: "Payment amount/currency mismatch with expected license SKU pricing.",
            metadata: { ...metaPayload, ...detail, activation_blocked_at: tsFail },
            updated_at: tsFail,
          })
          .eq("moyasar_payment_id", paymentId);

        await logPaymentSecurityEvent(supabase, {
          severity: "critical",
          eventType: "price_mismatch_before_activation",
          paymentId,
          registrationRequestId: requestId || null,
          barberId: barberId ?? null,
          reason: "Payment amount/currency mismatch with expected license SKU pricing.",
          detail,
        });

        return jsonResponse(
          {
            error: "price_mismatch_before_activation",
            detail,
            paymentId,
            eventId: eventId || null,
          },
          409,
        );
      }
    }

    if (requestId) {
      const regMatch = await validateRegistrationPaymentAgainstMeta(
        supabase,
        requestId,
        meta,
        tier,
        licenseQty,
      );
      if (!regMatch.ok) {
        const tsFail = new Date().toISOString();
        await supabase
          .from("barber_subscriptions")
          .update({
            failure_reason: "Registration payload mismatch with payment metadata.",
            metadata: { ...metaPayload, ...regMatch.detail, activation_blocked_at: tsFail, code: regMatch.code },
            updated_at: tsFail,
          })
          .eq("moyasar_payment_id", paymentId);

        await logPaymentSecurityEvent(supabase, {
          severity: "critical",
          eventType: regMatch.code,
          paymentId,
          registrationRequestId: requestId,
          barberId: barberId ?? null,
          reason: "Registration payload mismatch with payment metadata.",
          detail: regMatch.detail,
        });

        return jsonResponse(
          {
            error: regMatch.code,
            detail: regMatch.detail,
            paymentId,
            eventId: eventId || null,
          },
          409,
        );
      }
    }

    const skuCode = licenseSkuFromMeta(meta, tier);

    let effectiveBarberId = barberId;
    if (!effectiveBarberId && (requestId || (resolvedEmail && resolvedEmail.includes("@")))) {
      const provision = await provisionBarberViaInternalApi({
        registrationRequestId: requestId || null,
        buyerEmail: resolvedEmail,
        buyerName: barberName,
        buyerPhone: resolvedPhone,
        tier,
        moyasarPaymentId: paymentId,
      });
      if (!provision.ok) {
        const tsFail = new Date().toISOString();
        await supabase
          .from("barber_subscriptions")
          .update({
            failure_reason: "Barber account provisioning failed after successful payment.",
            metadata: {
              ...metaPayload,
              barber_provision_error: provision.error,
              activation_blocked_at: tsFail,
            },
            updated_at: tsFail,
          })
          .eq("moyasar_payment_id", paymentId);

        await logPaymentSecurityEvent(supabase, {
          severity: "critical",
          eventType: "barber_provision_failed",
          paymentId,
          registrationRequestId: requestId || null,
          barberId: null,
          reason: "Barber account provisioning failed after successful payment.",
          detail: { error: provision.error },
        });

        return jsonResponse(
          {
            error: "barber_provision_failed",
            detail: provision.error,
            paymentId,
            eventId: eventId || null,
          },
          502,
        );
      }

      effectiveBarberId = provision.barberId;
      const tsProv = new Date().toISOString();
      await supabase
        .from("barber_subscriptions")
        .update({
          barber_id: effectiveBarberId,
          metadata: {
            ...metaPayload,
            barber_provisioned_at: tsProv,
            barber_provision_created: provision.created,
            barber_credentials_emailed: provision.credentialEmailSent,
          },
          updated_at: tsProv,
        })
        .eq("moyasar_payment_id", paymentId);
    }

    const fulfill = await fulfillListingLicenseViaInternalApi({
      skuCode,
      tier,
      barberId: effectiveBarberId,
      buyerEmail: resolvedEmail,
      buyerName: barberName,
      moyasarPaymentId: paymentId,
      registrationRequestId: requestId || null,
      amountHalalas: paidAmount,
      quantity: licenseQty,
      autoRedeem: Boolean(effectiveBarberId),
      paymentMetadata: meta,
    });
    if (!fulfill.ok) {
      console.warn("[moyasar-webhook] fulfillListingLicense:", fulfill.error);
      return jsonResponse(
        { error: "license_fulfillment_failed", detail: fulfill.error, paymentId, eventId: eventId || null },
        502,
      );
    }
    accountActivated = fulfill.autoRedeemed;
    const tsAct = new Date().toISOString();
    await supabase
      .from("barber_subscriptions")
      .update({
        metadata: {
          ...metaPayload,
          license_sku: skuCode,
          webhook_license_fulfilled_at: tsAct,
          listing_valid_until: fulfill.validUntil || null,
        },
        updated_at: tsAct,
      })
      .eq("moyasar_payment_id", paymentId);

    const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") ?? Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "").trim().replace(
      /\/+$/,
      "",
    );
    const obSecret = (Deno.env.get("ONBOARDING_INTERNAL_WEBHOOK_SECRET") ?? "").trim();
    const { data: bRow } = effectiveBarberId
      ? await supabase.from("barbers").select("email,name").eq("id", effectiveBarberId).maybeSingle()
      : { data: null };
    const toOnboarding =
      bRow?.email && String(bRow.email).includes("@") ? String(bRow.email).trim() : resolvedEmail;
    const nameOnboarding = (bRow?.name && String(bRow.name).trim()) || barberName;
    if (appOrigin && obSecret && toOnboarding && effectiveBarberId) {
      const nameOnboarding = (bRow?.name && String(bRow.name).trim()) || barberName;
      // بريد التفعيل الموحّد (شهادة + عقد + لوحة/مناوب/برونزي) يُرسل من listing-license-fulfill-internal

      if (platformPay.enable_whatsapp_payment_notify && resolvedPhone) {
        const tierAr =
          tier === "diamond" ? "ماسي" : tier === "gold" ? "ذهبي" : "برونزي";
        const amountSar = ((amount ?? 0) / 100).toFixed(2);
        try {
          const waResp = await fetch(`${appOrigin}/api/send-payment-whatsapp-draft`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-onboarding-internal-secret": obSecret,
            },
            body: JSON.stringify({
              phone: resolvedPhone,
              barberName: nameOnboarding,
              tierLabelAr: tierAr,
              paymentId,
              amountSar,
            }),
          });
          if (waResp.ok) whatsappDraftOk = true;
          else console.warn("[moyasar-webhook] send-payment-whatsapp-draft:", await waResp.text());
        } catch (e) {
          console.warn("[moyasar-webhook] send-payment-whatsapp-draft fetch:", e);
        }
      }
    }
  }

  let emailSent = false;
  let failureEmailSent = false;

  if (rowStatus === "paid" && platformPay.enable_resend_payment_receipt && resendKey && resendFrom && resolvedEmail) {
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
        accountActivated: accountActivated && Boolean(effectiveBarberId),
        tier: tier === "diamond" ? "diamond" : tier === "gold" ? "gold" : tier === "bronze" ? "bronze" : null,
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

  if (rowStatus === "failed" || rowStatus === "cancelled" || rowStatus === "refunded") {
    await logPaymentSecurityEvent(supabase, {
      severity: rowStatus === "refunded" ? "info" : "warning",
      eventType: `payment_${rowStatus}`,
      paymentId,
      registrationRequestId: requestId || null,
      barberId,
      reason: failureReasonRaw ?? null,
      detail: {
        paymentStatus,
        currency,
        amount_halalas: amount,
        moyasar_event_type: eventType || null,
      },
    });
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
      whatsappDraftOk,
    },
    200,
  );
});
