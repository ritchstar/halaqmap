/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار نسخ حلانا1 غير المعلنة بالاسم والبريد.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { halanaDeskUrl, halanaShopUrl, issueHalanaCopy, listHalanaCopies } from './_lib/storeHalanaLive.js';
import { sendHalanaLiveLinksEmail } from './_lib/storeHalanaLiveMail.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const ADMIN_PERMS = [
  'view_overview',
  'view_payments',
  'review_payments',
  'view_requests',
  'review_requests',
  'manage_partner_billing',
  'view_partner_marketing',
  'manage_partner_marketing',
] as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function adminGate(request: Request) {
  const headers = corsHeaders(request);
  const db = serviceClient();
  if (!db) return { ok: false as const, response: Response.json({ error: 'server_misconfigured' }, { status: 503, headers }) };
  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [...ADMIN_PERMS]);
  if (auth.ok === false) {
    return { ok: false as const, response: Response.json(auth.json, { status: auth.status, headers }) };
  }
  return { ok: true as const, db, headers, reviewer: String(auth.actorEmail || '').trim() };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const gate = await adminGate(request);
  if (gate.ok === false) return gate.response;
  const rows = await listHalanaCopies(gate.db);
  return Response.json(
    {
      ok: true,
      rows: rows.map((row) => ({
        ...row,
        shopHref: halanaShopUrl(String(row.shop_token || '')),
        deskHref: halanaDeskUrl(String(row.desk_token || '')),
      })),
    },
    { headers: gate.headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const gate = await adminGate(request);
  if (gate.ok === false) return gate.response;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'تعذر قراءة الطلب.' }, { status: 400, headers: gate.headers });
  }
  const issued = await issueHalanaCopy(gate.db, {
    name: String(body.name || ''),
    email: String(body.email || ''),
    issuedBy: gate.reviewer,
  });
  if (!issued.ok) {
    return Response.json({ ok: false, error: issued.error }, { status: 400, headers: gate.headers });
  }
  const mailed = await sendHalanaLiveLinksEmail({
    to: String(body.email || '').trim().toLowerCase(),
    name: String(body.name || '').trim(),
    shopUrl: halanaShopUrl(issued.shopToken),
    deskUrl: halanaDeskUrl(issued.deskToken),
  });
  if (!mailed) {
    return Response.json({ ok: false, error: 'صدرت النسخة وتعذر إرسال البريد.' }, { status: 503, headers: gate.headers });
  }
  return Response.json(
    { ok: true, copyId: issued.copyId, shopHref: halanaShopUrl(issued.shopToken), deskHref: halanaDeskUrl(issued.deskToken) },
    { headers: gate.headers },
  );
}
