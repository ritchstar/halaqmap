/**
 * فحص كافينا1: 1199/2099، عمولة 199/499، تجربة ستون يوماً، توصيل الحي واستلام من المحل.
 * تشغيل: npx tsx scripts/test-store-cafe-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_CAFE_MENU, parseCafeListText } from '../src/config/storeCafeMenu.ts';
import {
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_CHECKOUT_ENABLED,
  STORE_CAFE_LIVE_DAYS_12,
  STORE_CAFE_LIVE_DAYS_6,
  STORE_CAFE_LIVE_FEATURES,
  STORE_CAFE_LIVE_PACKS,
  STORE_CAFE_LIVE_PRICE_12_HALALAS,
  STORE_CAFE_LIVE_PRICE_12_SAR,
  STORE_CAFE_LIVE_PRICE_6_HALALAS,
  STORE_CAFE_LIVE_PRICE_6_SAR,
  STORE_CAFE_LIVE_PRODUCT,
  STORE_CAFE_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeCafeLive.ts';
import { STORE_EVENT_LIVE_PRODUCT } from '../src/config/storeEventLive.ts';
import { STORE_GROCERS_LIVE_PRODUCT } from '../src/config/storeGrocersLive.ts';
import { STORE_LOUNGE_LIVE_PRODUCT } from '../src/config/storeLoungeLive.ts';
import { STORE_RESTAURANT_LIVE_PRODUCT } from '../src/config/storeRestaurantLive.ts';
import { STORE_WEDDING_LIVE_PRODUCT } from '../src/config/storeWeddingLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import { cafeAffiliateCommissionSar } from '../src/config/storeAffiliateLive.ts';
import { STORE_SHOP_PRESENCE_LABEL_AR } from '../src/config/storeShopPresence.ts';
import { STORE_PRODUCT_TRIAL_KEYS, STORE_PRODUCT_TRIAL_PRODUCTS } from '../src/config/storeProductTrial.ts';
import {
  STORE_CAFE_LIVE_PRODUCT as apiProduct,
  isCafePriceHalalas,
  parseCafeLiveOrderBody,
  publicCafePayload,
  cafeChargeHalalas,
  cafeLiveInvoiceDescription,
  cafeLiveIsExpired,
  cafeLivePaymentMatches,
  cafeLiveTermEndIso,
} from '../api/_lib/storeCafeLive.ts';
import { restaurantLivePaymentMatches } from '../api/_lib/storeRestaurantLive.ts';
import { grocersLivePaymentMatches } from '../api/_lib/storeGrocersLive.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeCafeLiveRemote.ts'), 'utf8');
const cafeApi = readFileSync(join(root, 'api/public-store-cafe-live.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/181_store_cafe_live.sql'), 'utf8');
const cafeLanding = readFileSync(join(root, 'src/pages/store/StoreCafeLandingPage.tsx'), 'utf8');
const shop = readFileSync(join(root, 'src/components/store/StoreCafeShop.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/components/store/StoreCafeDesk.tsx'), 'utf8');
const studio = readFileSync(join(root, 'src/components/store/StoreCafeStudio.tsx'), 'utf8');
const shopPage = readFileSync(join(root, 'src/pages/store/StoreCafeShopPage.tsx'), 'utf8');
const copyBlob = [
  STORE_CAFE_LIVE.kickerAr,
  STORE_CAFE_LIVE.leadAr,
  STORE_CAFE_LIVE.problemTitleAr,
  STORE_CAFE_LIVE.problemBodyAr,
  STORE_CAFE_LIVE.solutionTitleAr,
  STORE_CAFE_LIVE.howLeadAr,
  STORE_CAFE_LIVE.howSteps.join('\n'),
  STORE_CAFE_LIVE.drinksTitleAr,
  STORE_CAFE_LIVE.drinksLineAr,
  STORE_CAFE_LIVE.hoursTitleAr,
  STORE_CAFE_LIVE.hoursLineAr,
  STORE_CAFE_LIVE.presenceTitleAr,
  STORE_CAFE_LIVE.presenceLineAr,
  STORE_CAFE_LIVE.screensTitleAr,
  STORE_CAFE_LIVE.screensLineAr,
  STORE_CAFE_LIVE.chatTitleAr,
  STORE_CAFE_LIVE.chatLineAr,
  STORE_CAFE_LIVE.whatsappLineAr,
  STORE_CAFE_LIVE.payTitleAr,
  STORE_CAFE_LIVE.payIndependenceAr,
  STORE_CAFE_LIVE.renewTitleAr,
  STORE_CAFE_LIVE.renewLineAr,
  STORE_CAFE_LIVE.opsBodyAr,
  STORE_CAFE_LIVE.privacyAr,
  STORE_CAFE_LIVE.legalTitleAr,
  STORE_CAFE_LIVE.legalLeadBeforeAr,
  STORE_CAFE_LIVE.legalLeadAfterAr,
  STORE_CAFE_LIVE.startTitleAr,
  STORE_CAFE_LIVE.closeAr,
  STORE_CAFE_LIVE.termsFoldBodyAr,
  STORE_CAFE_LIVE.priceLineAr,
  STORE_CAFE_LIVE.durationLineAr,
  STORE_CAFE_LIVE.labLeadAr,
  STORE_LANDING_COPY.cafeLiveLeadAr,
  STORE_CAFE_LIVE.ticketItems.join('\n'),
  STORE_CAFE_LIVE_FEATURES.map((item) => `${item.titleAr}\n${item.bodyAr}`).join('\n'),
].join('\n');

assert.equal(STORE_CAFE_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_CAFE_LIVE_CHECKOUT_ENABLED, true);
assert.equal(STORE_CAFE_LIVE_PRODUCT, 'store_cafe_live');
assert.equal(STORE_CAFE_LIVE_PRODUCT, apiProduct);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, STORE_GROCERS_LIVE_PRODUCT);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, STORE_LOUNGE_LIVE_PRODUCT);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, STORE_EVENT_LIVE_PRODUCT);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, STORE_WEDDING_LIVE_PRODUCT);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, STORE_RESTAURANT_LIVE_PRODUCT);
assert.notEqual(STORE_CAFE_LIVE_PRODUCT, 'store_occasion_card');
assert.equal(STORE_CAFE_LIVE_DAYS_6, 180);
assert.equal(STORE_CAFE_LIVE_DAYS_12, 365);
assert.equal(STORE_CAFE_LIVE_PACKS.length, 2);
assert.equal(STORE_CAFE_LIVE_PRICE_6_SAR, 1199);
assert.equal(STORE_CAFE_LIVE_PRICE_12_SAR, 2099);
assert.equal(STORE_CAFE_LIVE_PRICE_6_HALALAS, 119900);
assert.equal(STORE_CAFE_LIVE_PRICE_12_HALALAS, 209900);
assert.equal(cafeChargeHalalas('m6'), 119900);
assert.equal(cafeChargeHalalas('m12'), 209900);
assert.equal(isCafePriceHalalas(119900), true);
assert.equal(isCafePriceHalalas(209900), true);
assert.equal(isCafePriceHalalas(69900), false);
assert.equal(isCafePriceHalalas(99900), false);
assert.equal(isCafePriceHalalas(89900), false);
assert.equal(cafeAffiliateCommissionSar('m6'), 199);
assert.equal(cafeAffiliateCommissionSar('m12'), 499);
assert.match(cafeLiveInvoiceDescription('m6'), /كافينا1/);
assert.match(STORE_CAFE_LIVE.titleAr, /كافينا1/);
assert.match(STORE_CAFE_LIVE.problemTitleAr, /الشاشة المطفأة/);
assert.match(STORE_CAFE_LIVE.howLeadAr, /التوصيل في الحي/);
assert.match(STORE_CAFE_LIVE.howSteps.join('\n'), /خلال ثوانٍ/);
assert.match(STORE_CAFE_LIVE.howSteps.join('\n'), /بنقرة واحدة/);
assert.match(STORE_CAFE_LIVE.drinksLineAr, /مراجعة الصفوف قبل الحفظ/);
assert.doesNotMatch(STORE_CAFE_LIVE.drinksLineAr, /يقرأها النظام|ليقارنها النظام/);
assert.doesNotMatch(STORE_CAFE_LIVE.howSteps.join('\n'), /واجهة موقع الاستلام|واجهة السكن/);
assert.doesNotMatch(STORE_CAFE_LIVE.chatLineAr, /ساعة واحدة|تختفي تلقائياً/);
assert.match(STORE_CAFE_LIVE.presenceLineAr, new RegExp(STORE_SHOP_PRESENCE_LABEL_AR));
assert.match(STORE_CAFE_LIVE.legalLeadAfterAr, /7054117093/);
assert.match(STORE_CAFE_LIVE.legalLeadAfterAr, /0000291761/);
assert.match(STORE_CAFE_LIVE.closeAr, /اختر باقتك الآن/);
assert.doesNotMatch(STORE_CAFE_LIVE.closeAr, /تجربة|جرّب/);
assert.match(STORE_CAFE_LIVE.opsBodyAr, /جهاز تشغيل واحد/);
assert.match(STORE_CAFE_LIVE.privacyAr, /دفتر زبائن/);
assert.match(STORE_CAFE_LIVE.servicePickupAr, /استلام من المحل/);
assert.match(STORE_CAFE_LIVE.serviceDeliveryAr, /توصيل في الحي/);
assert.doesNotMatch(copyBlob, /لحظة بلحظة|لوكيشن|واجهة المنزل|صفر عمولات|آلياً/);
assert.doesNotMatch(copyBlob, /تمويناتا1|افراحي1|اجواء1|لاونجا1|كاردي8|مطعمنا1|طبختنا1|أكلنا1/);
assert.doesNotMatch(copyBlob, /تجربة ستون|المسوّق/);
assert.match(STORE_CAFE_LIVE.durationLineAr, /صندوق المحادثة مدرج/);
assert.doesNotMatch(copyBlob, /599|600|698|699|898|899|999|1398/);
assert.match(cafeLanding, /howTitleAr/);
assert.match(cafeLanding, /howSteps/);
assert.match(cafeLanding, /problemTitleAr/);
assert.match(cafeLanding, /legalLeadBeforeAr/);
assert.match(cafeLanding, /STORE_BRAND_LATIN/);
assert.match(cafeLanding, /list-decimal/);
assert.match(cafeLanding, /StoreEnterpriseDirectMail/);
assert.match(STORE_CAFE_LIVE.priceLineAr, /1199/);
assert.match(STORE_CAFE_LIVE.priceLineAr, /2099/);
assert.match(STORE_LANDING_COPY.cafeLiveTitleAr, /كافينا1/);
assert.match(STORE_LANDING_COPY.cafeLiveLeadAr, /1199/);
assert.ok(STORE_PRODUCT_TRIAL_KEYS.includes('cafe'));
assert.equal(STORE_PRODUCT_TRIAL_PRODUCTS.cafe.productTag, 'store_cafe_live');
assert.match(shop, /setService\('delivery'\)/);
assert.match(shop, /setService\('pickup'\)/);
assert.match(desk, /showTrialNote/);
assert.doesNotMatch(studio, /showTrialNote=\{true\}/);
assert.match(shopPage, /showTrialNote=\{isTrial\}/);
assert.match(shopPage, /cafeLabRaw/);
assert.match(studio, /cafeLabRaw/);

const end6 = Date.parse(cafeLiveTermEndIso(180, Date.parse('2026-01-01T00:00:00.000Z')));
assert.equal(end6 - Date.parse('2026-01-01T00:00:00.000Z'), 180 * 24 * 60 * 60 * 1000);
assert.equal(cafeLiveIsExpired('2026-01-01T00:00:00.000Z', Date.parse('2026-01-01T00:00:01.000Z')), true);

assert.equal(
  cafeLivePaymentMatches({
    meta: { product: 'store_cafe_live', store_cafe_token: 'tok_c' },
    token: 'tok_c',
    amount: 119900,
  }),
  true,
);
assert.equal(
  cafeLivePaymentMatches({
    meta: { product: 'store_cafe_live', store_cafe_token: 'tok_c' },
    token: 'tok_c',
    amount: 209900,
  }),
  true,
);
assert.equal(
  cafeLivePaymentMatches({
    meta: { product: 'store_cafe_live', store_cafe_token: 'tok_c' },
    token: 'tok_c',
    amount: 125000,
  }),
  true,
);
assert.equal(
  cafeLivePaymentMatches({
    meta: { product: 'store_restaurant_live', store_cafe_token: 'tok_c' },
    token: 'tok_c',
    amount: 119900,
  }),
  false,
);
assert.equal(
  restaurantLivePaymentMatches({
    meta: { product: 'store_cafe_live', store_restaurant_token: 'tok_r' },
    token: 'tok_r',
    amount: 69900,
  }),
  false,
);
assert.equal(
  grocersLivePaymentMatches({
    meta: { product: 'store_cafe_live', store_grocers_token: 'tok_g' },
    token: 'tok_g',
    amount: 59900,
  }),
  false,
);
assert.deepEqual(matchStoreAffiliateCommission('store_cafe_live', 119900), {
  lineId: 'cafe_6',
  commissionHalalas: 19900,
});
assert.deepEqual(matchStoreAffiliateCommission('store_cafe_live', 209900), {
  lineId: 'cafe_12',
  commissionHalalas: 49900,
});

const parsed = parseCafeLiveOrderBody({
  email: 'cafe@example.com',
  shopName: 'مقهى السدرة',
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
  const shopView = publicCafePayload(withPlace, 'shop');
  assert.equal(shopView.pickupLat, 0);
  assert.equal(shopView.pickupMapsUrl, '');
  const deskView = publicCafePayload(withPlace, 'desk');
  assert.equal(deskView.pickupLat, 24.7136);
  assert.match(deskView.pickupMapsUrl, /maps\.google\.com/);
}

assert.ok(STORE_CAFE_MENU.length >= 10);
assert.match(app, /\/store\/cafe/);
assert.match(app, /\/c\/:token\/desk/);
assert.match(app, /\/c\/:token\/quiet/);
assert.match(app, /\/pay\/cafe\/:token/);
assert.match(app, /StoreCafeLandingPage/);
assert.match(app, /StoreCafeShopPage/);
assert.match(app, /StoreCafePayPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeCafeLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeCafeLiveRemote['"]/);
assert.match(desk, /StoreShopPresenceCount/);
assert.match(shopPage, /useStoreShopPresence/);
assert.doesNotMatch(studio, /useStoreShopPresence/);
assert.match(landing, /cafeLiveTitleAr/);
assert.match(landing, /STORE_CAFE/);
assert.match(webhook, /skipped: "store_cafe_live"/);
assert.match(webhook, /store_cafe_live_orders/);
assert.match(webhook, /119900/);
assert.match(webhook, /209900/);
assert.match(webhook, /creditStoreAffiliateLedger\(supabase, "store_cafe_live"/);
assert.match(cafeApi, /creditStoreAffiliateLedger/);
assert.match(cafeApi, /storeAffiliateCodeFromMeta/);
assert.match(cafeApi, /display_token/);
assert.match(cafeApi, /add_blessing/);
assert.match(indexHtml, /store_cafe_live/);
assert.match(indexHtml, /\/pay\/cafe\//);
assert.match(remote, /public-store-cafe-live/);
assert.doesNotMatch(remote, /public-store-restaurant-live/);
assert.match(sql, /price_halalas IN \(0, 119900, 209900\)/);
assert.match(sql, /pending_renewal/);
assert.match(sql, /desk_token/);
assert.match(sql, /display_token/);
assert.match(sql, /guest_token/);
assert.match(sql, /is_trial/);

const rows = parseCafeListText('قهوة عربية 8\nلاتيه 14');
assert.equal(rows.length, 2);
assert.equal(rows[0].price, 8);
assert.equal(rows[1].nameAr, 'لاتيه');

assert.match(STORE_CAFE_LIVE.locateMeAr, /حدد موقعي/);
assert.match(STORE_CAFE_LIVE.confirmPlaceAr, /تأكد من موقعي/);
assert.match(readFileSync(join(root, 'src/components/store/StoreCafeShop.tsx'), 'utf8'), /StoreBuyerLocateButtons/);
assert.match(STORE_CAFE_LIVE.pickupShowAr, /إبراز الموقع/);
assert.doesNotMatch(STORE_CAFE_LIVE.deskPickupLeadAr, /تمويناتا1|مطعمنا1|لاونجا1|طبختنا1/);
assert.match(readFileSync(join(root, 'src/components/store/StoreCafeDesk.tsx'), 'utf8'), /StoreShopPlaceDesk/);
assert.match(readFileSync(join(root, 'src/components/store/StoreCafeShop.tsx'), 'utf8'), /StoreShopPlacePin/);
assert.match(readFileSync(join(root, 'api/public-store-cafe-live.ts'), 'utf8'), /parseShopPickupPlace/);

console.log('store-cafe-live ok', STORE_CAFE_MENU.length);
