/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مزاد تمرتنا1 — عرض ومزايدة علنية، إغلاق يدوي، بلا تحصيل عبر المنصة.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  datesLiveIsExpired,
  STORE_DATES_LIVE_PRODUCT,
  STORE_DATES_LIVE_TABLE,
} from './_lib/storeDatesLive.js';
import {
  auctionMinNextBid,
  deskAuctionLotView,
  newAuctionBidId,
  newAuctionLotId,
  parseAuctionLot,
  publicAuctionLotView,
  STORE_DATES_AUCTION_TABLE,
  type AuctionLot,
} from './_lib/storeShopAuction.js';
import { persistShopImageIfBase64 } from './_lib/storeShopMediaStorage.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon',
} as const;

type Db = NonNullable<ReturnType<typeof serviceClient>>;

type DatesRow = {
  id: string;
  status: string;
  shop_token: string;
  desk_token: string;
  expires_at: string | null;
  payload: Record<string, unknown>;
};

type LotRow = {
  id: string;
  dates_order_id: string;
  shop_token: string;
  desk_token: string;
  status: string;
  current_bid: number;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

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

function isTermExpired(row: Pick<DatesRow, 'status' | 'expires_at'>): boolean {
  if (row.status === 'revoked') return true;
  if (row.status === 'expired' || row.status === 'pending_renewal') return true;
  if (row.status === 'live' && datesLiveIsExpired(row.expires_at)) return true;
  return false;
}

function lotFromRow(row: LotRow): AuctionLot {
  return parseAuctionLot({
    ...(row.payload || {}),
    id: row.id,
    status: row.status,
    currentBid: row.current_bid,
    createdAt: String((row.payload as { createdAt?: string })?.createdAt || row.created_at || ''),
  });
}

async function findDatesByShop(db: Db, token: string): Promise<DatesRow | null> {
  const { data } = await db.from(STORE_DATES_LIVE_TABLE).select('*').eq('shop_token', token).maybeSingle();
  return data ? (data as DatesRow) : null;
}

async function findDatesByDesk(db: Db, token: string): Promise<DatesRow | null> {
  const { data } = await db.from(STORE_DATES_LIVE_TABLE).select('*').eq('desk_token', token).maybeSingle();
  return data ? (data as DatesRow) : null;
}

async function persistLotPhotos(db: Db, datesId: string, lotId: string, photos: string[]): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < photos.length; i += 1) {
    const src = photos[i] || '';
    if (!src.startsWith('data:image/')) {
      out.push(src);
      continue;
    }
    const stored = await persistShopImageIfBase64(db, datesId, `auction-${lotId}-${i}`, src);
    out.push(stored || '');
  }
  return out.filter(Boolean).slice(0, 6);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const url = new URL(request.url);
  const token = String(url.searchParams.get('token') || '').trim();
  if (!token) {
    return json({ ok: true, route: 'public-store-dates-auction', product: STORE_DATES_LIVE_PRODUCT }, 200, headers);
  }
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  return getPublic(db, token, String(url.searchParams.get('viewerPhone') || ''), headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-dates-auction');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, headers);
  }
  const action = String(body.action || '').trim();
  const rate =
    action === 'get_public' || action === 'get_desk' ? 45
      : action === 'add_bid' ? 20
        : 12;
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: rate });
  if (!secGuard.allowed) return secGuard.response;

  if (action === 'get_public') {
    return getPublic(db, String(body.token || '').trim(), String(body.viewerPhone || ''), headers);
  }
  if (action === 'get_desk') return getDesk(db, String(body.token || '').trim(), headers);
  if (action === 'create_lot') return createLot(db, body, headers);
  if (action === 'open_lot') return openLot(db, body, headers);
  if (action === 'close_lot') return closeLot(db, body, headers);
  if (action === 'add_bid') return addBid(db, body, headers);
  return json({ error: 'إجراء غير معروف' }, 400, headers);
}

async function getPublic(db: Db, token: string, viewerPhone: string, headers: Record<string, string>) {
  if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
  const dates = await findDatesByShop(db, token);
  if (!dates) return json({ error: 'الرابط غير موجود' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const { data } = await db
    .from(STORE_DATES_AUCTION_TABLE)
    .select('*')
    .eq('shop_token', token)
    .in('status', ['open', 'closed'])
    .order('updated_at', { ascending: false })
    .limit(40);
  const rows = (data || []) as LotRow[];
  const lots = rows.map((row) => publicAuctionLotView(lotFromRow(row), viewerPhone));
  return json({
    ok: true,
    shopName: String(dates.payload?.shopName || 'تمرتنا1'),
    lots,
  }, 200, headers);
}

async function getDesk(db: Db, token: string, headers: Record<string, string>) {
  if (!token) return json({ error: 'رابط اللوحة غير صالح' }, 400, headers);
  const dates = await findDatesByDesk(db, token);
  if (!dates) return json({ error: 'رابط اللوحة غير موجود' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);
  const { data } = await db
    .from(STORE_DATES_AUCTION_TABLE)
    .select('*')
    .eq('desk_token', token)
    .order('updated_at', { ascending: false })
    .limit(80);
  const rows = (data || []) as LotRow[];
  return json({
    ok: true,
    shopName: String(dates.payload?.shopName || 'تمرتنا1'),
    shopToken: dates.shop_token,
    lots: rows.map((row) => deskAuctionLotView(lotFromRow(row))),
  }, 200, headers);
}

async function createLot(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const dates = await findDatesByDesk(db, token);
  if (!dates) return json({ error: 'رابط اللوحة غير صالح' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);

  const id = newAuctionLotId();
  const now = new Date().toISOString();
  const photos = await persistLotPhotos(
    db,
    dates.id,
    id,
    Array.isArray(body.photoSrcs) ? body.photoSrcs.map((s) => String(s || '')) : [],
  );
  const lot = parseAuctionLot({
    id,
    titleAr: body.titleAr,
    descriptionAr: body.descriptionAr,
    photoSrcs: photos,
    videoUrl: body.videoUrl,
    startingPrice: body.startingPrice,
    minIncrement: body.minIncrement,
    status: 'draft',
    currentBid: 0,
    bids: [],
    createdAt: now,
  });
  if (lot.titleAr.length < 2) return json({ error: 'عنوان الصندوق مطلوب' }, 400, headers);
  if (lot.startingPrice < 1) return json({ error: 'السعر الابتدائي مطلوب' }, 400, headers);

  const { error } = await db.from(STORE_DATES_AUCTION_TABLE).insert({
    id: lot.id,
    dates_order_id: dates.id,
    shop_token: dates.shop_token,
    desk_token: dates.desk_token,
    status: 'draft',
    current_bid: 0,
    payload: lot,
    created_at: now,
    updated_at: now,
  });
  if (error) return json({ error: 'تعذّر حفظ الصندوق' }, 500, headers);
  return json({ ok: true, lot: deskAuctionLotView(lot) }, 200, headers);
}

async function openLot(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const lotId = String(body.lotId || '').trim();
  const dates = await findDatesByDesk(db, token);
  if (!dates) return json({ error: 'رابط اللوحة غير صالح' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);

  const { data } = await db.from(STORE_DATES_AUCTION_TABLE).select('*').eq('id', lotId).eq('desk_token', token).maybeSingle();
  if (!data) return json({ error: 'الصندوق غير موجود' }, 404, headers);
  const row = data as LotRow;
  const lot = lotFromRow(row);
  if (lot.status !== 'draft' && lot.status !== 'cancelled') {
    return json({ error: 'لا يمكن نشر هذا الصندوق' }, 400, headers);
  }
  const now = new Date().toISOString();
  const next: AuctionLot = {
    ...lot,
    status: 'open',
    openedAt: now,
    currentBid: 0,
    bids: [],
    winnerName: '',
    winnerPhone: '',
    closedAt: '',
  };
  const { error } = await db
    .from(STORE_DATES_AUCTION_TABLE)
    .update({ status: 'open', current_bid: 0, payload: next, updated_at: now })
    .eq('id', lotId)
    .eq('desk_token', token);
  if (error) return json({ error: 'تعذّر نشر الصندوق' }, 500, headers);
  return json({ ok: true, lot: deskAuctionLotView(next) }, 200, headers);
}

async function closeLot(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const lotId = String(body.lotId || '').trim();
  const dates = await findDatesByDesk(db, token);
  if (!dates) return json({ error: 'رابط اللوحة غير صالح' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);

  const { data } = await db.from(STORE_DATES_AUCTION_TABLE).select('*').eq('id', lotId).eq('desk_token', token).maybeSingle();
  if (!data) return json({ error: 'الصندوق غير موجود' }, 404, headers);
  const lot = lotFromRow(data as LotRow);
  if (lot.status !== 'open') return json({ error: 'الصندوق غير مفتوح' }, 400, headers);

  const top = lot.bids[0];
  const now = new Date().toISOString();
  const next: AuctionLot = {
    ...lot,
    status: 'closed',
    closedAt: now,
    winnerName: top?.name || '',
    winnerPhone: top?.phone || '',
    currentBid: top?.amount || lot.currentBid || lot.startingPrice,
  };
  const { error } = await db
    .from(STORE_DATES_AUCTION_TABLE)
    .update({ status: 'closed', current_bid: next.currentBid, payload: next, updated_at: now })
    .eq('id', lotId)
    .eq('desk_token', token)
    .eq('status', 'open');
  if (error) return json({ error: 'تعذّر إغلاق المزاد' }, 500, headers);
  return json({ ok: true, lot: deskAuctionLotView(next) }, 200, headers);
}

async function addBid(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  const lotId = String(body.lotId || '').trim();
  const name = String(body.name || '').trim().slice(0, 40);
  const phone = String(body.phone || '').trim().slice(0, 20);
  const amount = Math.floor(Number(body.amount) || 0);

  if (!token || !lotId) return json({ error: 'الطلب غير صالح' }, 400, headers);
  if (name.length < 2 || phone.length < 9) return json({ error: 'الاسم والجوال مطلوبان' }, 400, headers);
  if (amount < 1) return json({ error: 'المبلغ غير صالح' }, 400, headers);

  const dates = await findDatesByShop(db, token);
  if (!dates) return json({ error: 'الرابط غير موجود' }, 404, headers);
  if (dates.status !== 'live' || isTermExpired(dates)) return json({ error: 'انتهت مدة التشغيل' }, 403, headers);

  const { data } = await db.from(STORE_DATES_AUCTION_TABLE).select('*').eq('id', lotId).eq('shop_token', token).maybeSingle();
  if (!data) return json({ error: 'الصندوق غير موجود' }, 404, headers);
  const row = data as LotRow;
  if (row.status !== 'open') return json({ error: 'المزاد مغلق' }, 400, headers);

  const lot = lotFromRow(row);
  const minNext = auctionMinNextBid(lot);
  if (amount < minNext) {
    return json({ error: `أقل مزايدة مقبولة: ${minNext} ر.س`, minNext, currentBid: lot.currentBid }, 409, headers);
  }

  const now = new Date().toISOString();
  const bid = {
    id: newAuctionBidId(),
    name,
    phone,
    amount,
    at: now,
  };
  const next: AuctionLot = {
    ...lot,
    currentBid: amount,
    bids: [bid, ...lot.bids].slice(0, 200),
  };

  const { data: updated, error } = await db
    .from(STORE_DATES_AUCTION_TABLE)
    .update({ current_bid: amount, payload: next, updated_at: now })
    .eq('id', lotId)
    .eq('shop_token', token)
    .eq('status', 'open')
    .lte('current_bid', amount - 1)
    .select('*')
    .maybeSingle();

  if (error || !updated) {
    return json({ error: 'سُبقت بمزايدة أعلى. حدّث الصفحة وزايد من جديد.', currentBid: lot.currentBid }, 409, headers);
  }
  return json({ ok: true, lot: publicAuctionLotView(lotFromRow(updated as LotRow), phone) }, 200, headers);
}
