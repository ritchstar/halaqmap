/**
 * التحقق من دفع ميسر — Supabase Edge (احتياط عند فشل Vercel 502).
 * أسرار: PAYMENT_ENV، MOYSAR_SECRET_TEST_API_KEY، MOYSAR_SECRET_LIVE_API_KEY
 */

const DEFAULT_MOYSAR_API_BASE = "https://api.moyasar.com/v1";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ORIGINS = new Set(["https://www.halaqmap.com", "https://halaqmap.com"]);

function corsHeaders(origin: string | null): Record<string, string> {
  const acao = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://www.halaqmap.com";
  return {
    "Access-Control-Allow-Origin": acao,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

function resolveMoyasarSecretKey(): string {
  const mode = (Deno.env.get("PAYMENT_ENV") ?? "test").trim().toLowerCase();
  const testKey = (Deno.env.get("MOYSAR_SECRET_TEST_API_KEY") ?? "").trim();
  const liveKey = (Deno.env.get("MOYSAR_SECRET_LIVE_API_KEY") ?? "").trim();
  const legacy = (Deno.env.get("MOYSAR_SECRET_API_KEY") ?? "").trim();
  const candidates = mode === "live" ? [liveKey, legacy, testKey] : [testKey, legacy, liveKey];
  return (candidates.find((k) => k.startsWith("sk_")) || "").replace(/\s+/g, "");
}

function secretKeyLooksValid(secret: string): boolean {
  const mode = (Deno.env.get("PAYMENT_ENV") ?? "test").trim().toLowerCase();
  if (!secret.startsWith("sk_")) return false;
  if (secret.includes("...") || secret.includes("***")) return false;
  if (secret.length < 20) return false;
  if (mode === "live") return secret.startsWith("sk_live_");
  return secret.startsWith("sk_test_") || secret.startsWith("sk_live_");
}

function moyasarBasicAuthHeader(secret: string): string {
  const token = `${secret}:`;
  let binary = "";
  for (const byte of new TextEncoder().encode(token)) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

type MoyasarPaymentJson = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  fee?: number;
  description?: string;
  amount_format?: string;
  message?: string;
  type?: string;
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "GET") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, origin);
  }

  const url = new URL(req.url);
  const secret = resolveMoyasarSecretKey();

  if (url.searchParams.get("health") === "1") {
    const probeId = "00000000-0000-4000-8000-000000000001";
    let upstreamProbe: { ok: boolean; status?: number; error?: string } = { ok: false };
    if (secret && secretKeyLooksValid(secret)) {
      try {
        const upstream = await fetch(`${DEFAULT_MOYSAR_API_BASE}/payments/${encodeURIComponent(probeId)}`, {
          headers: {
            Authorization: moyasarBasicAuthHeader(secret),
            Accept: "application/json",
            "User-Agent": "halaqmap-verify-edge/1.0",
          },
        });
        upstreamProbe = { ok: true, status: upstream.status };
      } catch (error) {
        upstreamProbe = {
          ok: false,
          error: error instanceof Error ? error.message : "upstream_probe_failed",
        };
      }
    }
    return jsonResponse(
      {
        ok: true,
        provider: "supabase-edge",
        moyasarConfigured: Boolean(secret),
        secretLooksValid: secret ? secretKeyLooksValid(secret) : false,
        apiBase: DEFAULT_MOYSAR_API_BASE,
        paymentEnv: (Deno.env.get("PAYMENT_ENV") ?? "test").trim().toLowerCase(),
        upstreamProbe,
      },
      200,
      origin,
    );
  }

  if (!secret) {
    return jsonResponse(
      {
        ok: false,
        error: "moyasar_disabled",
        hint: "Set MOYSAR_SECRET_TEST_API_KEY on Supabase Edge secrets.",
      },
      503,
      origin,
    );
  }

  if (!secretKeyLooksValid(secret)) {
    return jsonResponse(
      {
        ok: false,
        error: "moyasar_secret_invalid",
        hint: "يجب أن يبدأ MOYSAR_SECRET_TEST_API_KEY بـ sk_test_ كاملاً من لوحة ميسر.",
      },
      503,
      origin,
    );
  }

  const id = (url.searchParams.get("paymentId") || url.searchParams.get("id") || "").trim();
  if (!id || !UUID_RE.test(id)) {
    return jsonResponse(
      { ok: false, error: "invalid_id", hint: "Provide a valid Moyasar payment UUID as ?paymentId=" },
      400,
      origin,
    );
  }

  const expectedAmountRaw = url.searchParams.get("expectedAmount");
  const expectedCurrency = (url.searchParams.get("expectedCurrency") || "").trim().toUpperCase() || undefined;
  let expectedAmount: number | undefined;
  if (expectedAmountRaw != null && expectedAmountRaw !== "") {
    const n = Number.parseInt(expectedAmountRaw, 10);
    if (!Number.isFinite(n) || n < 100) {
      return jsonResponse({ ok: false, error: "invalid_expected_amount" }, 400, origin);
    }
    expectedAmount = n;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${DEFAULT_MOYSAR_API_BASE}/payments/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: moyasarBasicAuthHeader(secret),
        Accept: "application/json",
        "User-Agent": "halaqmap-verify-edge/1.0",
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: "upstream_network",
        hint: error instanceof Error ? error.message : "تعذر الاتصال ببوابة ميسر.",
      },
      502,
      origin,
    );
  }

  const text = await upstream.text();
  if (text.trimStart().startsWith("<")) {
    return jsonResponse(
      {
        ok: false,
        error: "invalid_upstream",
        status: upstream.status,
        hint: "رد غير متوقع من بوابة ميسر (HTML).",
      },
      502,
      origin,
    );
  }

  let body: MoyasarPaymentJson;
  try {
    body = text ? (JSON.parse(text) as MoyasarPaymentJson) : {};
  } catch {
    return jsonResponse(
      { ok: false, error: "invalid_upstream", status: upstream.status, hint: "تعذر تحليل رد بوابة ميسر." },
      502,
      origin,
    );
  }

  if (!upstream.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "moyasar_error",
        status: upstream.status,
        message: body.message || body.type || "fetch_failed",
      },
      upstream.status === 404 ? 404 : 502,
      origin,
    );
  }

  const status = String(body.status || "");
  const amount = typeof body.amount === "number" ? body.amount : NaN;
  const currency = String(body.currency || "");

  if (expectedAmount != null && Number.isFinite(amount) && amount !== expectedAmount) {
    return jsonResponse(
      {
        ok: false,
        error: "amount_mismatch",
        expectedAmount,
        actualAmount: amount,
        paymentId: body.id,
        status,
      },
      409,
      origin,
    );
  }

  if (expectedCurrency && currency && expectedCurrency !== currency) {
    return jsonResponse(
      { ok: false, error: "currency_mismatch", expectedCurrency, actualCurrency: currency, paymentId: body.id },
      409,
      origin,
    );
  }

  return jsonResponse(
    {
      ok: true,
      paid: status === "paid",
      status,
      id: body.id,
      amount: Number.isFinite(amount) ? amount : null,
      currency: currency || null,
      fee: typeof body.fee === "number" ? body.fee : null,
      description: body.description ?? null,
      amount_format: body.amount_format ?? null,
    },
    200,
    origin,
  );
});
