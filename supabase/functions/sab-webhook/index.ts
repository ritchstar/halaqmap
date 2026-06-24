/**
 * SAB Webhook — Supabase Edge (بروكسي إلى Vercel /api/sab-webhook)
 *
 * يُفضّل تسجيل عنوان Vercel مباشرة لدى البنك إن أمكن:
 *   https://www.halaqmap.com/api/sab-webhook
 *
 * أسرار Edge: APP_PUBLIC_ORIGIN، SAB_WEBHOOK_*_SECRET (يُمرَّر في جسم الطلب كـ secret_token)
 */

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

  const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") ?? Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!appOrigin) {
    return jsonResponse(
      { error: "server_misconfigured", hint: "Set APP_PUBLIC_ORIGIN on Supabase Edge." },
      503,
    );
  }

  const rawBody = await req.text();
  try {
    const upstream = await fetch(`${appOrigin}/api/sab-webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return jsonResponse(
      { error: "upstream_failed", detail: e instanceof Error ? e.message : String(e) },
      502,
    );
  }
});
