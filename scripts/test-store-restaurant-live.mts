/**
 * فحص مطعمنا1: 699/999، العزل عن بقية وسوم المتجر، وصندوق المحادثة مدرج.
 * تشغيل: npx tsx scripts/test-store-restaurant-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_RESTAURANT_MENU, parseRestaurantListText } from '../src/config/storeRestaurantMenu.ts';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED,
  STORE_RESTAURANT_LIVE_DAYS_12,
  STORE_RESTAURANT_LIVE_DAYS_6,
  STORE_RESTAURANT_LIVE_PACKS,
  STORE_RESTAURANT_LIVE_PRICE_12_HALALAS,
  STORE_RESTAURANT_LIVE_PRICE_12_SAR,
  STORE_RESTAURANT_LIVE_PRICE_6_HALALAS,
  STORE_RESTAURANT_LIVE_PRICE_6_SAR,
  STORE_RESTAURANT_LIVE_PRODUCT,
  STORE_RESTAURANT_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeRestaurantLive.ts';
import { STORE_EVENT_LIVE_PRODUCT } from '../src/config/storeEventLive.ts';
import { STORE_GROCERS_LIVE_PRODUCT } from '../src/config/storeGrocersLive.ts';
import { STORE_LOUNGE_LIVE_PRODUCT } from '../src/config/storeLoungeLive.ts';
import { STORE_WEDDING_LIVE_PRODUCT } from '../src/config/storeWeddingLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import {
  STORE_RESTAURANT_LIVE_PRODUCT as apiProduct,
  isRestaurantPriceHalalas,
  parseRestaurantLiveOrderBody,
  restaurantChargeHalalas,
  restaurantLiveInvoiceDescription,
  restaurantLiveIsExpired,
  restaurantLivePaymentMatches,
  restaurantLiveTermEndIso,
} from '../api/_lib/storeRestaurantLive.ts';
import { grocersLivePaymentMatches } from '../api/_lib/storeGrocersLive.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeRestaurantLiveRemote.ts'), 'utf8');
const restaurantApi = readFileSync(join(root, 'api/public-store-restaurant-live.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/175_store_restaurant_live.sql'), 'utf8');
const copyBlob = [
  STORE_RESTAURANT_LIVE.leadAr,
  STORE_RESTAURANT_LIVE.termsFoldBodyAr,
  STORE_RESTAURANT_LIVE.priceLineAr,
  STORE_LANDING_COPY.restaurantLiveLeadAr,
].join('\n');

assert.equal(STORE_RESTAURANT_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED, true);
assert.equal(STORE_RESTAURANT_LIVE_PRODUCT, 'store_restaurant_live');
assert.equal(STORE_RESTAURANT_LIVE_PRODUCT, apiProduct);
assert.notEqual(STORE_RESTAURANT_LIVE_PRODUCT, STORE_GROCERS_LIVE_PRODUCT);
assert.notEqual(STORE_RESTAURANT_LIVE_PRODUCT, STORE_LOUNGE_LIVE_PRODUCT);
assert.notEqual(STORE_RESTAURANT_LIVE_PRODUCT, STORE_EVENT_LIVE_PRODUCT);
assert.notEqual(STORE_RESTAURANT_LIVE_PRODUCT, STORE_WEDDING_LIVE_PRODUCT);
assert.notEqual(STORE_RESTAURANT_LIVE_PRODUCT, 'store_occasion_card');
assert.equal(STORE_RESTAURANT_LIVE_DAYS_6, 180);
assert.equal(STORE_RESTAURANT_LIVE_DAYS_12, 365);
assert.equal(STORE_RESTAURANT_LIVE_PACKS.length, 2);
assert.equal(STORE_RESTAURANT_LIVE_PRICE_6_SAR, 699);
assert.equal(STORE_RESTAURANT_LIVE_PRICE_12_SAR, 999);
assert.equal(STORE_RESTAURANT_LIVE_PRICE_6_HALALAS, 69900);
assert.equal(STORE_RESTAURANT_LIVE_PRICE_12_HALALAS, 99900);
assert.equal(restaurantChargeHalalas('m6'), 69900);
assert.equal(restaurantChargeHalalas('m12'), 99900);
assert.equal(isRestaurantPriceHalalas(69900), true);
assert.equal(isRestaurantPriceHalalas(99900), true);
assert.equal(isRestaurantPriceHalalas(59900), false);
assert.equal(isRestaurantPriceHalalas(89900), false);
assert.equal(isRestaurantPriceHalalas(60000), false);
assert.match(restaurantLiveInvoiceDescription('m6'), /مطعمنا1/);
assert.match(STORE_RESTAURANT_LIVE.titleAr, /مطعمنا1/);
assert.doesNotMatch(copyBlob, /تمويناتا1|افراحي1|اجواء1|لاونجا1|كاردي8/);
assert.doesNotMatch(copyBlob, /599|600|898|1398/);
assert.match(STORE_RESTAURANT_LIVE.leadAr, /699/);
assert.match(STORE_RESTAURANT_LIVE.priceLineAr, /999/);
assert.match(STORE_LANDING_COPY.restaurantLiveTitleAr, /مطعمنا1/);
assert.match(STORE_LANDING_COPY.restaurantLiveLeadAr, /699/);

const end6 = Date.parse(restaurantLiveTermEndIso(180, Date.parse('2026-01-01T00:00:00.000Z')));
assert.equal(end6 - Date.parse('2026-01-01T00:00:00.000Z'), 180 * 24 * 60 * 60 * 1000);
assert.equal(restaurantLiveIsExpired('2026-01-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:01.000Z')), true);
assert.equal(restaurantLiveIsExpired('2026-07-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:00.000Z')), false);

assert.equal(
  restaurantLivePaymentMatches({
    meta: { product: 'store_restaurant_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 69900,
  }),
  true,
);
assert.equal(
  restaurantLivePaymentMatches({
    meta: { product: 'store_restaurant_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 99900,
  }),
  true,
);
assert.equal(
  restaurantLivePaymentMatches({
    meta: { product: 'store_grocers_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 69900,
  }),
  false,
);
assert.equal(
  restaurantLivePaymentMatches({
    meta: { product: 'store_restaurant_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 89900,
  }),
  false,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_restaurant_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 59900,
  }),
  false,
);
assert.deepEqual(matchStoreAffiliateCommission('store_restaurant_live', 69900), {
  lineId: 'restaurant_6',
  commissionHalalas: 9900,
});
assert.deepEqual(matchStoreAffiliateCommission('store_restaurant_live', 99900), {
  lineId: 'restaurant_12',
  commissionHalalas: 19900,
});

const parsed = parseRestaurantLiveOrderBody({
  email: 'kitchen@example.com',
  shopName: 'مطعم السدرة',
  packId: 'm6',
});
assert.equal(parsed.ok, true);
if (parsed.ok) {
  assert.equal(parsed.payload.chatIncluded, true);
  assert.equal(parsed.payload.nextTicket, 1);
}

assert.ok(STORE_RESTAURANT_MENU.length >= 10);
assert.match(app, /\/store\/restaurant/);
assert.match(app, /\/r\/:token\/desk/);
assert.match(app, /\/pay\/restaurant\/:token/);
assert.match(app, /StoreRestaurantLandingPage/);
assert.match(app, /StoreRestaurantShopPage/);
assert.match(app, /StoreRestaurantPayPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeRestaurantLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeRestaurantLiveRemote['"]/);
assert.match(landing, /restaurantLiveTitleAr/);
assert.match(landing, /STORE_RESTAURANT/);
assert.match(webhook, /skipped: "store_restaurant_live"/);
assert.match(webhook, /store_restaurant_live_orders/);
assert.match(webhook, /69900/);
assert.match(webhook, /99900/);
assert.match(webhook, /creditStoreAffiliateLedger\(supabase, "store_restaurant_live"/);
assert.match(restaurantApi, /creditStoreAffiliateLedger/);
assert.match(restaurantApi, /storeAffiliateCodeFromMeta/);
assert.match(indexHtml, /store_restaurant_live/);
assert.match(indexHtml, /\/pay\/restaurant\//);
assert.match(remote, /public-store-restaurant-live/);
assert.doesNotMatch(remote, /public-store-grocers-live/);
assert.match(sql, /price_halalas IN \(69900, 99900\)/);
assert.match(sql, /pending_renewal/);
assert.match(sql, /desk_token/);

const rows = parseRestaurantListText('كبسة دجاج 28\nشاورما عربي 14');
assert.equal(rows.length, 2);
assert.equal(rows[0].price, 28);
assert.equal(rows[1].nameAr, 'شاورما عربي');

console.log('store-restaurant-live ok', STORE_RESTAURANT_MENU.length);
