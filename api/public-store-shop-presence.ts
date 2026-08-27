/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نبض حضور مجهول لصفحات الحي. ping بمفتاح زائر، وcount للوحة فقط.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  isStoreShopPresenceLiveToken,
  isStoreShopPresenceVisitorKey,
  parseStoreShopPresenceTag,
  storeShopPresenceOrdersTable,
  storeShopPresenceStaleIso,
  storeShopRowIsLive,
  STORE_SHOP_PRESENCE_TABLE,
  type StoreShopPresenceTag,
} from './_lib/storeShopPresence.js';

export const config = { maxDuration: 10 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

type Db = NonNullable<ReturnType<typeof serviceClient>>;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
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

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return json({ ok: true, route: 'public-store-shop-presence' }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-shop-presence');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 120 });
  if (!secGuard.allowed) return secGuard.response;
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, headers);
  }
  const action = String(body.action || '').trim();
  if (action === 'ping') return ping(db, body, headers);
  if (action === 'leave') return leave(db, body, headers);
  if (action === 'count') return count(db, body, headers);
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

type ShopRow = { status: string | null; expires_at: string | null; shop_token: string };

async function loadLiveShop(
  db: Db,
  tag: StoreShopPresenceTag,
  column: 'shop_token' | 'desk_token',
  token: string,
): Promise<ShopRow | null> {
  const table = storeShopPresenceOrdersTable(tag);
  const { data } = await db
    .from(table)
    .select('status, expires_at, shop_token')
    .eq(column, token)
    .maybeSingle();
  if (!data) return null;
  const row = data as ShopRow;
  if (!storeShopRowIsLive(tag, row)) return null;
  const shopToken = String(row.shop_token || '').trim();
  if (!isStoreShopPresenceLiveToken(shopToken)) return null;
  return row;
}

async function ping(db: Db, body: Record<string, unknown>, headers: Record<string, string>): Promise<Response> {
  const tag = parseStoreShopPresenceTag(body.productTag ?? body.product);
  const token = String(body.token || '').trim();
  const visitorKey = String(body.visitorKey || '').trim();
  if (!tag || !isStoreShopPresenceLiveToken(token) || !isStoreShopPresenceVisitorKey(visitorKey)) {
    return json({ error: 'الطلب غير صالح' }, 400, headers);
  }
  const row = await loadLiveShop(db, tag, 'shop_token', token);
  if (!row) return json({ error: 'الرابط غير صالح' }, 404, headers);
  const staleIso = storeShopPresenceStaleIso();
  await db
    .from(STORE_SHOP_PRESENCE_TABLE)
    .delete()
    .eq('product_tag', tag)
    .eq('shop_token', token)
    .lt('last_seen_at', staleIso);
  const { error } = await db.from(STORE_SHOP_PRESENCE_TABLE).upsert(
    {
      product_tag: tag,
      shop_token: token,
      visitor_key: visitorKey,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'product_tag,shop_token,visitor_key' },
  );
  if (error) return json({ error: 'تعذر تسجيل النبض' }, 500, headers);
  return json({ ok: true }, 200, headers);
}

async function leave(db: Db, body: Record<string, unknown>, headers: Record<string, string>): Promise<Response> {
  const tag = parseStoreShopPresenceTag(body.productTag ?? body.product);
  const token = String(body.token || '').trim();
  const visitorKey = String(body.visitorKey || '').trim();
  if (!tag || !isStoreShopPresenceLiveToken(token) || !isStoreShopPresenceVisitorKey(visitorKey)) {
    return json({ error: 'الطلب غير صالح' }, 400, headers);
  }
  await db
    .from(STORE_SHOP_PRESENCE_TABLE)
    .delete()
    .eq('product_tag', tag)
    .eq('shop_token', token)
    .eq('visitor_key', visitorKey);
  return json({ ok: true }, 200, headers);
}

async function count(db: Db, body: Record<string, unknown>, headers: Record<string, string>): Promise<Response> {
  const tag = parseStoreShopPresenceTag(body.productTag ?? body.product);
  const token = String(body.token || '').trim();
  if (!tag || !isStoreShopPresenceLiveToken(token)) {
    return json({ error: 'الطلب غير صالح' }, 400, headers);
  }
  const row = await loadLiveShop(db, tag, 'desk_token', token);
  if (!row) return json({ error: 'الرابط غير صالح' }, 404, headers);
  const staleIso = storeShopPresenceStaleIso();
  await db
    .from(STORE_SHOP_PRESENCE_TABLE)
    .delete()
    .eq('product_tag', tag)
    .eq('shop_token', row.shop_token)
    .lt('last_seen_at', staleIso);
  const { count: n, error } = await db
    .from(STORE_SHOP_PRESENCE_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('product_tag', tag)
    .eq('shop_token', row.shop_token)
    .gte('last_seen_at', staleIso);
  if (error) return json({ ok: true, count: 0 }, 200, headers);
  return json({ ok: true, count: n ?? 0 }, 200, headers);
}
