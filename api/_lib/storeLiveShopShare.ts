/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مشاركة صفحات الحي بلا هاش — واتساب يقرأ /h/:token لا #/h/:token.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { STORE_CAFE_LIVE_TABLE } from './storeCafeLive.js';
import { findHalanaCopy, isHalanaCopyOperable, STORE_HALANA_COPIES_TABLE } from './storeHalanaLive.js';
import { STORE_GROCERS_LIVE_TABLE } from './storeGrocersLive.js';
import { STORE_KITCHEN_LIVE_TABLE } from './storeKitchenLive.js';
import { STORE_PRODUCE_LIVE_TABLE } from './storeProduceLive.js';
import { STORE_DATES_LIVE_TABLE } from './storeDatesLive.js';
import { STORE_RESTAURANT_LIVE_TABLE } from './storeRestaurantLive.js';

export const STORE_LIVE_SHOP_ORIGIN = 'https://store.halaqmap.com';
export const STORE_LIVE_SHOP_TOKEN_RE = /^[A-Za-z0-9_-]{3,64}$/;

export type StoreLiveShopKind = 'halana' | 'grocers' | 'restaurant' | 'cafe' | 'kitchen' | 'produce' | 'dates';

type ShopKindMeta = {
  prefix: `/${string}`;
  productAr: string;
  defaultImage: string;
  describe: (shopName: string) => string;
};

const KIND_META: Record<StoreLiveShopKind, ShopKindMeta> = {
  halana: {
    prefix: '/h',
    productAr: 'حلانا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/halana/halana-cake-light.jpg`,
    describe: (shop) => `أعمال ${shop}. اطّلعي على المعرض ثم اطلبي حلوى خاصة مسبقاً.`,
  },
  grocers: {
    prefix: '/g',
    productAr: 'تمويناتا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/grocers-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — تموينات الحي على الجوال.`,
  },
  restaurant: {
    prefix: '/r',
    productAr: 'مطعمنا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/restaurant-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — قائمة المطعم وطلب ضيف الحي.`,
  },
  cafe: {
    prefix: '/c',
    productAr: 'كافينا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/lounge-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — مقهى الحي على الجوال.`,
  },
  kitchen: {
    prefix: '/k',
    productAr: 'طبختنا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/kitchen-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — أكل منزلي للحي.`,
  },
  produce: {
    prefix: '/v',
    productAr: 'خضارنا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/produce-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — خضار وفواكه الحي.`,
  },
  dates: {
    prefix: '/t',
    productAr: 'تمرتنا1',
    defaultImage: `${STORE_LIVE_SHOP_ORIGIN}/images/store/dates-hero-marketing.jpg`,
    describe: (shop) => `اطلب من ${shop} — تمر الحي.`,
  },
};

export function parseStoreLiveShopKind(raw: unknown): StoreLiveShopKind | null {
  const value = String(raw || '').trim();
  return value in KIND_META ? (value as StoreLiveShopKind) : null;
}

export function parseStoreLiveShopToken(raw: unknown): string {
  const token = String(raw || '').trim();
  return STORE_LIVE_SHOP_TOKEN_RE.test(token) ? token : '';
}

export function storeLiveShopPrefix(kind: StoreLiveShopKind): string {
  return KIND_META[kind].prefix;
}

export function storeLiveShopShareHref(kind: StoreLiveShopKind, token: string): string {
  return `${STORE_LIVE_SHOP_ORIGIN}${KIND_META[kind].prefix}/${encodeURIComponent(token)}`;
}

export function storeLiveShopHashHref(kind: StoreLiveShopKind, token: string): string {
  return `${STORE_LIVE_SHOP_ORIGIN}/#${KIND_META[kind].prefix}/${encodeURIComponent(token)}`;
}

export function storeLiveShopCopy(kind: StoreLiveShopKind, shopName: string) {
  const meta = KIND_META[kind];
  const shop = shopName.trim() || meta.productAr;
  return {
    title: `${shop} · ${meta.productAr}`,
    description: meta.describe(shop),
    siteName: shop,
    image: meta.defaultImage,
  };
}

function readPayloadShopName(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const row = payload as Record<string, unknown>;
  return String(row.shopName || row.shop_name || '').trim();
}

function isLiveShopExpired(expiresAt: unknown): boolean {
  const raw = String(expiresAt || '').trim();
  if (!raw) return false;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) && ms <= Date.now();
}

function serviceClient(): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function readStoreLiveShopMeta(
  kind: StoreLiveShopKind,
  token: string,
): Promise<{ shopName: string; live: boolean }> {
  const db = serviceClient();
  if (!db) return { shopName: '', live: false };

  if (kind === 'halana') {
    const row = (await findHalanaCopy(db, token, 'shop')) || (await findHalanaCopy(db, token, 'desk'));
    if (!row || !isHalanaCopyOperable(row)) return { shopName: '', live: false };
    return {
      shopName: String(row.shop_name || row.specialist_name || '').trim(),
      live: true,
    };
  }

  const table =
    kind === 'grocers'
      ? STORE_GROCERS_LIVE_TABLE
      : kind === 'restaurant'
        ? STORE_RESTAURANT_LIVE_TABLE
        : kind === 'cafe'
          ? STORE_CAFE_LIVE_TABLE
          : kind === 'kitchen'
            ? STORE_KITCHEN_LIVE_TABLE
            : kind === 'dates'
              ? STORE_DATES_LIVE_TABLE
              : STORE_PRODUCE_LIVE_TABLE;

  const { data } = await db
    .from(table)
    .select('status, payload, expires_at')
    .eq('shop_token', token)
    .maybeSingle();

  if (!data || String(data.status || '') !== 'live' || isLiveShopExpired(data.expires_at)) {
    return { shopName: '', live: false };
  }

  return {
    shopName: readPayloadShopName(data.payload),
    live: true,
  };
}

export function isShareCrawler(request: Request): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  return /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|pinterest|googlebot/.test(
    ua,
  );
}

export function storeLiveShopShareHtml(input: {
  title: string;
  description: string;
  canonical: string;
  nextHref: string;
  image: string;
  siteName: string;
  refresh: boolean;
}): string {
  const esc = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const title = esc(input.title);
  const description = esc(input.description);
  const canonical = esc(input.canonical);
  const nextHref = esc(input.nextHref);
  const image = esc(input.image);
  const siteName = esc(input.siteName);
  const refresh = input.refresh ? `<meta http-equiv="refresh" content="0;url=${nextHref}" />` : '';
  const jump = input.refresh
    ? `<script>(function(){try{location.replace(${JSON.stringify(input.nextHref)});}catch(e){}})();</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${title}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
${refresh}
<style>
  html,body{margin:0;min-height:100vh;background:#061018;color:#f4efe4;font-family:Tahoma,Arial,sans-serif}
  a{color:#e8c547;font-weight:800}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}
</style>
</head>
<body>
<div class="wrap"><p><a href="${nextHref}">${title}</a></p></div>
${jump}
</body>
</html>`;
}
