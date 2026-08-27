/**
 * فحص طبختنا1: 300/600، عمولة 100/200، عزل لاونجا1، والتحصيل عبر ميسر.
 * تشغيل: npx tsx scripts/test-store-kitchen-live.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_KITCHEN_MENU, parseKitchenListText } from '../src/config/storeKitchenMenu.ts';
import {
  STORE_KITCHEN_LIVE,
  STORE_KITCHEN_LIVE_CHECKOUT_ENABLED,
  STORE_KITCHEN_LIVE_DAYS_12,
  STORE_KITCHEN_LIVE_DAYS_6,
  STORE_KITCHEN_LIVE_FEATURES,
  STORE_KITCHEN_LIVE_LAB_ITEM_CAP,
  STORE_KITCHEN_LIVE_LAB_TOKEN,
  STORE_KITCHEN_LIVE_PACKS,
  STORE_KITCHEN_LIVE_PRICE_12_HALALAS,
  STORE_KITCHEN_LIVE_PRICE_12_SAR,
  STORE_KITCHEN_LIVE_PRICE_6_HALALAS,
  STORE_KITCHEN_LIVE_PRICE_6_SAR,
  STORE_KITCHEN_LIVE_PRODUCT,
  STORE_KITCHEN_LIVE_PRODUCT_TYPE,
  STORE_KITCHEN_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeKitchenLive.ts';
import { STORE_CAFE_LIVE_PRODUCT } from '../src/config/storeCafeLive.ts';
import { STORE_RESTAURANT_LIVE_PRODUCT } from '../src/config/storeRestaurantLive.ts';
import { STORE_GROCERS_LIVE_PRODUCT } from '../src/config/storeGrocersLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';
import {
  addKitchenOrder,
  defaultKitchenLabState,
  kitchenCartTotal,
  kitchenOrderExists,
  kitchenQrMatches,
  kitchenShopHashPath,
  kitchenWhatsAppText,
  type KitchenOrder,
} from '../src/lib/storeKitchenLiveLab.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const kitchenLanding = readFileSync(join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'), 'utf8');
const kitchenPay = readFileSync(join(root, 'src/pages/store/StoreKitchenPayPage.tsx'), 'utf8');
const affiliateConfig = readFileSync(join(root, 'src/config/storeAffiliateLive.ts'), 'utf8');
const affiliateCode = readFileSync(join(root, 'api/_lib/storeAffiliateCode.ts'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const migrations = readdirSync(join(root, 'supabase/migrations'));

const copyBlob = [
  STORE_KITCHEN_LIVE.leadAr,
  STORE_KITCHEN_LIVE.howLeadAr,
  STORE_KITCHEN_LIVE.whatsappLineAr,
  STORE_KITCHEN_LIVE.payIndependenceAr,
  STORE_KITCHEN_LIVE.opsBodyAr,
  STORE_KITCHEN_LIVE.privacyAr,
  STORE_KITCHEN_LIVE.closeAr,
  STORE_KITCHEN_LIVE.kickerAr,
  STORE_KITCHEN_LIVE.termsFoldBodyAr,
  STORE_KITCHEN_LIVE.priceLineAr,
  STORE_KITCHEN_LIVE.supportLineAr,
  STORE_KITCHEN_LIVE.durationLineAr,
  STORE_KITCHEN_LIVE.labLeadAr,
  STORE_KITCHEN_LIVE.checkoutClosedAr,
  STORE_LANDING_COPY.kitchenLiveLeadAr,
  STORE_KITCHEN_LIVE.ticketItems.join('\n'),
  STORE_KITCHEN_LIVE_FEATURES.map((item) => `${item.titleAr}\n${item.bodyAr}`).join('\n'),
].join('\n');

assert.equal(STORE_KITCHEN_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_KITCHEN_LIVE_CHECKOUT_ENABLED, true);
assert.equal(STORE_KITCHEN_LIVE_PRODUCT, 'store_kitchen_live');
assert.equal(STORE_KITCHEN_LIVE_PRODUCT_TYPE, 'home_food');
assert.equal(STORE_KITCHEN_LIVE_LAB_TOKEN, 'kitchen-lab');
assert.equal(STORE_KITCHEN_LIVE_LAB_ITEM_CAP, 40);
assert.equal(STORE_KITCHEN_LIVE_DAYS_6, 180);
assert.equal(STORE_KITCHEN_LIVE_DAYS_12, 360);
assert.equal(STORE_KITCHEN_LIVE_PACKS.length, 2);
assert.equal(STORE_KITCHEN_LIVE_PRICE_6_SAR, 300);
assert.equal(STORE_KITCHEN_LIVE_PRICE_12_SAR, 600);
assert.equal(STORE_KITCHEN_LIVE_PRICE_6_HALALAS, 30000);
assert.equal(STORE_KITCHEN_LIVE_PRICE_12_HALALAS, 60000);
assert.notEqual(STORE_KITCHEN_LIVE_PRODUCT, STORE_RESTAURANT_LIVE_PRODUCT);
assert.notEqual(STORE_KITCHEN_LIVE_PRODUCT, STORE_CAFE_LIVE_PRODUCT);
assert.notEqual(STORE_KITCHEN_LIVE_PRODUCT, STORE_GROCERS_LIVE_PRODUCT);
assert.notEqual(STORE_KITCHEN_LIVE_PRODUCT, 'store_occasion_card');
assert.equal(STORE_KITCHEN_LIVE.titleAr, 'طبختنا1');
assert.match(STORE_LANDING_COPY.kitchenLiveTitleAr, /طبختنا1/);
assert.match(STORE_KITCHEN_LIVE.leadAr, /للأسر المنتجة/);
assert.match(STORE_KITCHEN_LIVE.privacyAr, /دفتر زبائن/);
assert.match(STORE_KITCHEN_LIVE.closeAr, /التسليم/);
assert.match(STORE_KITCHEN_LIVE.leadAr, /300/);
assert.match(STORE_KITCHEN_LIVE.leadAr, /600/);
assert.match(STORE_KITCHEN_LIVE.supportLineAr, /أسعار مخصصة للأسر المنتجة/);
assert.match(STORE_KITCHEN_LIVE.priceLineAr, /300/);
assert.match(STORE_LANDING_COPY.kitchenLiveLeadAr, /300/);
assert.doesNotMatch(copyBlob, /أكلنا1/);
assert.doesNotMatch(copyBlob, /مطعمنا1|كافينا1|تمويناتا1|افراحي1|اجواء1|لاونجا1|كاردي8/);
assert.doesNotMatch(copyBlob, /تجربة ستون|المسوّق/);
assert.doesNotMatch(copyBlob, /399|699|599|898|899|999|1199|2099|1398/);
assert.doesNotMatch(JSON.stringify(STORE_KITCHEN_LIVE), /399|699/);
assert.match(kitchenLanding, /howTitleAr/);
assert.match(kitchenLanding, /ticketItems/);
assert.match(kitchenLanding, /StoreEnterpriseDirectMail/);
assert.match(kitchenLanding, /StoreKitchenOrderForm/);
assert.match(kitchenLanding, /STORE_KITCHEN_LIVE_PACKS/);
assert.match(kitchenLanding, /supportLineAr/);
assert.doesNotMatch(kitchenLanding, /checkoutClosedAr/);
assert.match(kitchenPay, /priceHalalas/);
assert.match(kitchenPay, /Moyasar/);
assert.doesNotMatch(kitchenPay, /399|699/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeKitchenLive['"]/);
assert.match(app, /\/store\/kitchen/);
assert.match(app, /\/k\/:token\/desk/);
assert.match(app, /\/pay\/kitchen\/:token/);
assert.match(app, /StoreKitchenLandingPage/);
assert.match(app, /StoreKitchenShopPage/);
assert.match(app, /StoreKitchenPayPage/);
assert.match(landing, /kitchenLiveTitleAr/);
assert.match(landing, /STORE_KITCHEN/);
assert.equal(ROUTE_PATHS.STORE_KITCHEN, '/store/kitchen');
assert.equal(ROUTE_PATHS.STORE_KITCHEN_VIEW, '/k/:token');
assert.equal(ROUTE_PATHS.STORE_KITCHEN_DESK, '/k/:token/desk');
assert.equal(ROUTE_PATHS.STORE_KITCHEN_PAY, '/pay/kitchen/:token');

assert.equal(existsSync(join(root, 'src/lib/storeKitchenLiveMoyasar.ts')), true);
assert.equal(existsSync(join(root, 'src/lib/storeKitchenLiveRemote.ts')), true);
assert.equal(existsSync(join(root, 'api/public-store-kitchen-live.ts')), true);
assert.equal(existsSync(join(root, 'api/_lib/storeKitchenLive.ts')), true);
assert.equal(existsSync(join(root, 'src/components/store/StoreKitchenOrderForm.tsx')), true);
assert.equal(migrations.some((name) => name.includes('182_store_kitchen_live')), true);
assert.match(webhook, /store_kitchen_live/);
assert.match(webhook, /isKitchenLiveMeta/);
assert.match(webhook, /store_kitchen_token/);
assert.match(webhook, /amount === 60000 \? 360/);
assert.match(webhook, /amount === 30000 \? 180/);
{
  const kitchenHookStart = webhook.indexOf('if (isKitchenLiveMeta(meta))');
  assert.ok(kitchenHookStart >= 0);
  const kitchenHook = webhook.slice(kitchenHookStart, kitchenHookStart + 1600);
  assert.match(kitchenHook, /store_kitchen_live_orders/);
  assert.doesNotMatch(kitchenHook, /is_trial/);
  assert.doesNotMatch(kitchenHook, /store_product_trials/);
}
assert.match(indexHtml, /store_kitchen_live/);
assert.match(indexHtml, /store_kitchen_token/);
assert.match(affiliateConfig, /store_kitchen_live/);
assert.match(affiliateCode, /store\/kitchen\$\{q\}/);
assert.deepEqual(matchStoreAffiliateCommission('store_kitchen_live', 30000), {
  lineId: 'kitchen_6',
  commissionHalalas: 10000,
});
assert.deepEqual(matchStoreAffiliateCommission('store_kitchen_live', 60000), {
  lineId: 'kitchen_12',
  commissionHalalas: 20000,
});
assert.deepEqual(matchStoreAffiliateCommission('store_lounge_live', 60000), {
  lineId: 'lounge',
  commissionHalalas: 10000,
});
assert.equal(matchStoreAffiliateCommission('store_kitchen_live', 39900), null);
assert.equal(matchStoreAffiliateCommission('store_kitchen_live', 69900), null);
assert.equal(matchStoreAffiliateCommission('store_lounge_live', 30000), null);

assert.equal(kitchenCartTotal([{ catalogId: 'a', nameAr: 'صنف', qty: 2, price: 10 }], 'delivery', 5), 25);
assert.equal(kitchenCartTotal([{ catalogId: 'a', nameAr: 'صنف', qty: 2, price: 10 }], 'pickup', 5), 20);

const sample: KitchenOrder = {
  id: '1',
  ticketNo: 1,
  idempotencyKey: 'k-same',
  name: 'سعد',
  phone: '0500000000',
  place: 'الحي',
  note: '',
  service: 'delivery',
  pay: 'cash',
  lines: [{ catalogId: 'a', nameAr: 'كبسة البيت', qty: 1, price: 25 }],
  deliveryFee: 5,
  total: 30,
  at: '2026-08-26T00:00:00.000Z',
  scheduledAt: '',
  deliveryPhotoSrc: '',
  seen: false,
};
const once = addKitchenOrder(defaultKitchenLabState(), sample);
const twice = addKitchenOrder(once, sample);
assert.equal(once.orders.length, 1);
assert.equal(twice.orders.length, 1);
assert.equal(kitchenOrderExists(once.orders, 'k-same'), true);

const host = defaultKitchenLabState().host;
assert.equal(kitchenQrMatches({ ...host, qrActive: true, qrStamp: 'abc' }, 'abc'), true);
assert.equal(kitchenQrMatches({ ...host, qrActive: true, qrStamp: 'abc' }, 'zzz'), false);
assert.equal(kitchenQrMatches({ ...host, qrActive: false, qrStamp: 'abc' }, 'abc'), false);
assert.match(kitchenShopHashPath('kitchen-lab', 'abc'), /\/k\/kitchen-lab\?qr=abc/);

const wa = kitchenWhatsAppText(sample, 'مطبخ الدار');
assert.match(wa, /الزبون/);
assert.doesNotMatch(wa, /أكلنا1|مطعمنا1|كافينا1/);

assert.ok(STORE_KITCHEN_MENU.length >= 10);
assert.ok(STORE_KITCHEN_MENU.length <= STORE_KITCHEN_LIVE_LAB_ITEM_CAP);
const rows = parseKitchenListText('كبسة البيت 25\nسمبوسة 12');
assert.equal(rows.length, 2);
assert.equal(rows[0].price, 25);
assert.equal(rows[1].nameAr, 'سمبوسة');

const visitorFiles = [
  join(root, 'src/pages/store/StoreKitchenLandingPage.tsx'),
  join(root, 'src/pages/store/StoreKitchenShopPage.tsx'),
  join(root, 'src/pages/store/StoreKitchenPayPage.tsx'),
  join(root, 'src/components/store/StoreKitchenShop.tsx'),
  join(root, 'src/components/store/StoreKitchenDesk.tsx'),
  join(root, 'src/components/store/StoreKitchenOrderForm.tsx'),
  join(root, 'src/config/storeKitchenLive.ts'),
].map((path) => readFileSync(path, 'utf8')).join('\n');
assert.doesNotMatch(visitorFiles, /أكلنا1/);
assert.doesNotMatch(visitorFiles, /WhatsApp Business API/);
assert.doesNotMatch(visitorFiles, /مطعمنا1|كافينا1/);

const apiLib = readFileSync(join(root, 'api/_lib/storeKitchenLive.ts'), 'utf8');
const apiRoute = readFileSync(join(root, 'api/public-store-kitchen-live.ts'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/182_store_kitchen_live.sql'), 'utf8');
assert.match(apiLib, /product_type: STORE_KITCHEN_LIVE_PRODUCT/);
assert.doesNotMatch(apiRoute, /add_chat/);
assert.doesNotMatch(apiRoute, /is_trial/);
assert.doesNotMatch(apiRoute, /markStoreTrialConverted|applyStoreTrialClock/);
assert.match(apiRoute, /kitchenOrderAlreadyStored/);
assert.match(migration, /30000, 60000/);
assert.doesNotMatch(migration, /is_trial/);
assert.doesNotMatch(migration, /store_product_trials/);
assert.doesNotMatch(apiLib + apiRoute + migration, /أكلنا1/);

console.log('store-kitchen-live ok', STORE_KITCHEN_MENU.length);
