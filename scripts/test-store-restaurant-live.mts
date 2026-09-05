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
  STORE_RESTAURANT_LIVE_FEATURES,
  STORE_RESTAURANT_LIVE_PACKS,
  STORE_RESTAURANT_LIVE_PRICE_12_HALALAS,
  STORE_RESTAURANT_LIVE_PRICE_12_SAR,
  STORE_RESTAURANT_LIVE_PRICE_6_HALALAS,
  STORE_RESTAURANT_LIVE_PRICE_6_SAR,
  STORE_RESTAURANT_LIVE_PRODUCT,
  STORE_RESTAURANT_LIVE_PUBLIC_ENABLED,
  restaurantShelfVisible,
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
  publicRestaurantPayload,
  restaurantChargeHalalas,
  restaurantLiveInvoiceDescription,
  restaurantLiveIsExpired,
  restaurantLivePaymentMatches,
  restaurantLiveTermEndIso,
} from '../api/_lib/storeRestaurantLive.ts';
import { grocersLivePaymentMatches } from '../api/_lib/storeGrocersLive.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';
import {
  pickStoreLiveShelf,
  shouldHoldStoreLiveDeskEdits,
  storeLiveInStock,
} from '../src/lib/storeLivePublicRead.ts';
import { liveHostText } from '../src/lib/storeLiveDeskSync.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeRestaurantLiveRemote.ts'), 'utf8');
const restaurantApi = readFileSync(join(root, 'api/public-store-restaurant-live.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/175_store_restaurant_live.sql'), 'utf8');
const restaurantLanding = readFileSync(join(root, 'src/pages/store/StoreRestaurantLandingPage.tsx'), 'utf8');
const restaurantShop = readFileSync(join(root, 'src/components/store/StoreRestaurantShop.tsx'), 'utf8');
const restaurantDesk = readFileSync(join(root, 'src/components/store/StoreRestaurantDesk.tsx'), 'utf8');
const restaurantStudio = readFileSync(join(root, 'src/components/store/StoreRestaurantStudio.tsx'), 'utf8');
const copyBlob = [
  STORE_RESTAURANT_LIVE.leadAr,
  STORE_RESTAURANT_LIVE.whatsappLineAr,
  STORE_RESTAURANT_LIVE.payIndependenceAr,
  STORE_RESTAURANT_LIVE.payLeadAr,
  STORE_RESTAURANT_LIVE.opsBodyAr,
  STORE_RESTAURANT_LIVE.privacyAr,
  STORE_RESTAURANT_LIVE.closeAr,
  STORE_RESTAURANT_LIVE.kickerAr,
  STORE_RESTAURANT_LIVE.termsFoldBodyAr,
  STORE_RESTAURANT_LIVE.orderConsentAr,
  STORE_LANDING_COPY.restaurantLiveLeadAr,
  STORE_RESTAURANT_LIVE.howSteps.map((step) => `${step.titleAr}\n${step.bodyAr}`).join('\n'),
  STORE_RESTAURANT_LIVE_FEATURES.map((item) => `${item.titleAr}\n${item.bodyAr}`).join('\n'),
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
assert.match(STORE_RESTAURANT_LIVE.leadAr, /لوحة الكاشير والمطبخ/);
assert.match(STORE_RESTAURANT_LIVE.leadAr, /بنقرة واحدة/);
assert.match(STORE_RESTAURANT_LIVE.howSteps[2]?.bodyAr || '', /رابط موقع التوصيل/);
assert.match(STORE_RESTAURANT_LIVE.opsBodyAr, /جهاز تشغيل واحد/);
assert.match(STORE_RESTAURANT_LIVE.privacyAr, /لوحة المشغّل/);
assert.match(STORE_RESTAURANT_LIVE.closeAr, /عامل التوصيل/);
assert.match(STORE_RESTAURANT_LIVE.kickerAr, /ضيف الحي/);
assert.match(STORE_RESTAURANT_LIVE.payIndependenceAr, /لا تحصيل لقيمة الطلب عبر خريطة الحل/);
assert.doesNotMatch(copyBlob, /لا تحصيل إلكتروني|لحظة بلحظة|لوكيشن|واجهة المنزل|صفر عمولات|آلياً/);
assert.doesNotMatch(copyBlob, /تمويناتا1|افراحي1|اجواء1|لاونجا1|كاردي8/);
assert.doesNotMatch(copyBlob, /تجربة ستون|المسوّق/);
assert.doesNotMatch(copyBlob, /599|600|898|1398/);
assert.match(restaurantLanding, /howSteps/);
assert.match(restaurantLanding, /payTitleAr/);
assert.match(restaurantLanding, /StoreEnterpriseDirectMail/);
assert.match(restaurantLanding, /privacyTitleAr/);
assert.match(restaurantLanding, /STORE_RESTAURANT_EXTENSION_PRICING/);
assert.match(restaurantLanding, /formatRestaurantPriceSar\(799\)/);
assert.match(STORE_RESTAURANT_LIVE_PACKS[0]?.titleAr || '', /180/);
assert.match(STORE_LANDING_COPY.restaurantLiveTitleAr, /مطعمنا1/);
assert.match(STORE_LANDING_COPY.restaurantLiveLeadAr, /ضيف الحي/);
assert.equal(STORE_RESTAURANT_LIVE.howSteps.length, 4);
assert.equal(restaurantShelfVisible('available'), true);
assert.equal(restaurantShelfVisible('limited'), true);
assert.equal(restaurantShelfVisible('paused'), false);

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
    meta: { product: 'store_restaurant_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 79900,
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
  assert.equal(parsed.payload.pickupPlaceVisible, false);
  const withPlace = {
    ...parsed.payload,
    pickupLat: 24.7136,
    pickupLng: 46.6753,
    pickupMapsUrl: 'https://maps.google.com/?q=24.713600,46.675300',
    pickupPlaceVisible: false,
  };
  const shopView = publicRestaurantPayload(withPlace, 'shop');
  assert.equal(shopView.pickupLat, 0);
  assert.equal(shopView.pickupMapsUrl, '');
  const deskView = publicRestaurantPayload(withPlace, 'desk');
  assert.equal(deskView.pickupLat, 24.7136);
  assert.match(deskView.pickupMapsUrl, /maps\.google\.com/);
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
assert.match(restaurantDesk, /StoreShopPresenceCount/);
assert.match(restaurantDesk, /presenceDeskLabelAr/);
assert.match(restaurantDesk, /archiveDeleteAr/);
assert.match(restaurantDesk, /STORE_RESTAURANT_CUSTOM_FIELD_LABELS/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8'), /useStoreShopPresence/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8'), /pickStoreLiveShelf/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8'), /useStoreLiveDeskSync/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8'), /scheduleSave/);
assert.match(readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8'), /liveHostText/);
assert.match(restaurantApi, /save_host' \? 40/);
assert.equal(storeLiveInStock(false), false);
assert.equal(storeLiveInStock(true), true);
assert.equal(storeLiveInStock(undefined), true);
assert.deepEqual(
  pickStoreLiveShelf([{ catalogId: 'a', inStock: false }], [{ catalogId: 'b', inStock: true }]),
  [{ catalogId: 'a', inStock: false }],
);
assert.deepEqual(
  pickStoreLiveShelf([], [{ catalogId: 'b', inStock: true }]),
  [{ catalogId: 'b', inStock: true }],
);
assert.equal(shouldHoldStoreLiveDeskEdits(Date.now() - 1000), true);
assert.equal(shouldHoldStoreLiveDeskEdits(Date.now() - 20_000), false);
assert.equal(liveHostText('', 'مطعم السدرة'), '');
assert.equal(liveHostText(undefined, 'مطعم السدرة'), 'مطعم السدرة');
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

assert.match(STORE_RESTAURANT_LIVE.locateMeAr, /استخدم موقعي الحالي/);
assert.match(STORE_RESTAURANT_LIVE.confirmPlaceAr, /فتح الموقع للتحقق/);
assert.match(STORE_RESTAURANT_LIVE.adoptPlaceAr, /اعتماد الموقع/);
assert.match(STORE_RESTAURANT_LIVE.chatBuyerTitleAr, /اسأل المطعم/);
assert.match(STORE_RESTAURANT_LIVE.serviceDeliveryAr, /^توصيل$/);
assert.match(STORE_RESTAURANT_LIVE.ingestTitleAr, /مكتبة الأطباق/);
assert.match(restaurantShop, /StoreBuyerLocateButtons/);
assert.match(restaurantShop, /labPreviewEnvAr|RESTAURANT_LIVE_LAB_TOKEN/);
assert.match(restaurantStudio, /labPreviewBadgeAr/);
assert.match(restaurantStudio, /max-w-md/);
assert.match(STORE_RESTAURANT_LIVE.pickupShowAr, /إبراز الموقع/);
assert.doesNotMatch(STORE_RESTAURANT_LIVE.deskPickupLeadAr, /تمويناتا1|كافينا1|لاونجا1|طبختنا1/);
assert.match(restaurantDesk, /StoreShopPlaceDesk/);
assert.match(restaurantShop, /StoreShopPlacePin/);
assert.match(readFileSync(join(root, 'api/public-store-restaurant-live.ts'), 'utf8'), /parseShopPickupPlace/);
assert.match(readFileSync(join(root, 'src/components/store/StoreVisitorEngage.tsx'), 'utf8'), /compactProductLanding/);

console.log('store-restaurant-live ok', STORE_RESTAURANT_MENU.length);
