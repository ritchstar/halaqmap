/**
 * فحص خضارنا1: 1350/2500، عمولة 350/500، تجربة 180 يوماً، وعزل تمويناتا1.
 * تشغيل: npx tsx scripts/test-store-produce-live.mts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_PRODUCE_CATALOG, STORE_PRODUCE_UNIT_AR, parseProduceListText } from '../src/config/storeProduceCatalog.ts';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_CHECKOUT_ENABLED,
  STORE_PRODUCE_LIVE_DAYS_12,
  STORE_PRODUCE_LIVE_DAYS_6,
  STORE_PRODUCE_LIVE_FEATURES,
  STORE_PRODUCE_LIVE_LAB_TOKEN,
  STORE_PRODUCE_LIVE_PACKS,
  STORE_PRODUCE_LIVE_PRICE_12_HALALAS,
  STORE_PRODUCE_LIVE_PRICE_12_SAR,
  STORE_PRODUCE_LIVE_PRICE_6_HALALAS,
  STORE_PRODUCE_LIVE_PRICE_6_SAR,
  STORE_PRODUCE_LIVE_PRODUCT,
  STORE_PRODUCE_LIVE_PUBLIC_ENABLED,
  STORE_PRODUCE_TRIAL_DAYS,
} from '../src/config/storeProduceLive.ts';
import { STORE_GROCERS_LIVE_PRODUCT } from '../src/config/storeGrocersLive.ts';
import { STORE_KITCHEN_LIVE_PRODUCT } from '../src/config/storeKitchenLive.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import { STORE_PRODUCT_TRIAL_KEYS, STORE_PRODUCT_TRIAL_PRODUCTS, trialDaysFor } from '../src/config/storeProductTrial.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';
import { produceAffiliateCommissionSar } from '../src/config/storeAffiliateLive.ts';
import { produceCartTotal, defaultProduceLabState } from '../src/lib/storeProduceLiveLab.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
const produceLanding = readFileSync(join(root, 'src/pages/store/StoreProduceLandingPage.tsx'), 'utf8');
const producePay = readFileSync(join(root, 'src/pages/store/StoreProducePayPage.tsx'), 'utf8');
const affiliateConfig = readFileSync(join(root, 'src/config/storeAffiliateLive.ts'), 'utf8');
const affiliateCode = readFileSync(join(root, 'api/_lib/storeAffiliateCode.ts'), 'utf8');
const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const trialApi = readFileSync(join(root, 'api/_lib/storeProductTrial.ts'), 'utf8');
const migrations = readdirSync(join(root, 'supabase/migrations'));

assert.equal(STORE_PRODUCE_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_PRODUCE_LIVE_CHECKOUT_ENABLED, true);
assert.equal(STORE_PRODUCE_LIVE_PRODUCT, 'store_produce_live');
assert.notEqual(STORE_PRODUCE_LIVE_PRODUCT, STORE_GROCERS_LIVE_PRODUCT);
assert.notEqual(STORE_PRODUCE_LIVE_PRODUCT, STORE_KITCHEN_LIVE_PRODUCT);
assert.equal(STORE_PRODUCE_LIVE_PRICE_6_SAR, 1350);
assert.equal(STORE_PRODUCE_LIVE_PRICE_12_SAR, 2500);
assert.equal(STORE_PRODUCE_LIVE_PRICE_6_HALALAS, 135000);
assert.equal(STORE_PRODUCE_LIVE_PRICE_12_HALALAS, 250000);
assert.equal(STORE_PRODUCE_LIVE_DAYS_6, 180);
assert.equal(STORE_PRODUCE_LIVE_DAYS_12, 360);
assert.equal(STORE_PRODUCE_TRIAL_DAYS, 180);
assert.equal(STORE_PRODUCE_LIVE_PACKS.length, 2);
assert.equal(STORE_PRODUCE_LIVE_FEATURES.length >= 5, true);
assert.ok(STORE_PRODUCE_CATALOG.length >= 20);
assert.equal(STORE_PRODUCE_UNIT_AR.kilo, 'كيلو');
assert.equal(parseProduceListText('طماطم 6\nرمان 11')[0].price, 6);

const demo = defaultProduceLabState();
assert.equal(demo.chatIncluded, true);
assert.ok(demo.shelf.some((item) => item.arrivedToday));
assert.equal(produceCartTotal([{ catalogId: 'x', nameAr: 'طماطم', qty: 2, price: 6 }]), 12);

assert.equal(ROUTE_PATHS.STORE_PRODUCE, '/store/produce');
assert.equal(ROUTE_PATHS.STORE_PRODUCE_VIEW, '/v/:token');
assert.equal(ROUTE_PATHS.STORE_PRODUCE_DESK, '/v/:token/desk');
assert.equal(ROUTE_PATHS.STORE_PRODUCE_PAY, '/pay/produce/:token');
assert.ok(app.includes('StoreProduceLandingPage'));
assert.ok(app.includes('/store/produce'));
assert.ok(app.includes('/v/:token'));
assert.ok(landing.includes('STORE_PRODUCE'));
assert.ok(landing.includes('reel="produce"'));
assert.ok(produceLanding.includes('STORE_PRODUCE_LIVE.priceLineAr'));
assert.ok(produceLanding.includes('reel="produce"'));
assert.match(readFileSync(join(root, 'src/pages/store/StoreProduceShopPage.tsx'), 'utf8'), /nextStoreLivePublicGate/);
assert.ok(!produceLanding.includes('reel="grocers"'));
assert.equal(STORE_PRODUCE_LIVE.heroImage, '/images/store/produce-hero-marketing.jpg');
assert.ok(producePay.includes('2500'));
assert.ok(STORE_PRODUCE_LIVE.priceLineAr.includes('1350'));
assert.ok(!producePay.includes('STORE_PRODUCE_CHAT_ADDON'));
assert.ok(affiliateConfig.includes("id: 'produce_6'"));
assert.ok(affiliateCode.includes('/store/produce'));
assert.ok(webhook.includes('isProduceLiveMeta'));
assert.ok(webhook.includes('135000'));
assert.ok(trialApi.includes("key === 'produce'"));
assert.ok(trialApi.includes('trial-180'));
assert.ok(migrations.some((name) => name.includes('store_produce_live')));
assert.ok(existsSync(join(root, '.cursor/rules/store-produce-live.mdc')));
assert.ok(existsSync(join(root, 'fkrih/خضارنا1.md')));

assert.ok(STORE_PRODUCT_TRIAL_KEYS.includes('produce'));
assert.equal(STORE_PRODUCT_TRIAL_PRODUCTS.produce.productTag, 'store_produce_live');
assert.equal(trialDaysFor('produce'), 180);
assert.equal(trialDaysFor('grocers'), 60);
assert.equal(produceAffiliateCommissionSar('m6'), 350);
assert.equal(produceAffiliateCommissionSar('m12'), 500);
assert.deepEqual(matchStoreAffiliateCommission('store_produce_live', 135000), { lineId: 'produce_6', commissionHalalas: 35000 });
assert.deepEqual(matchStoreAffiliateCommission('store_produce_live', 250000), { lineId: 'produce_12', commissionHalalas: 50000 });
assert.equal(matchStoreAffiliateCommission('store_grocers_live', 135000), null);
assert.equal(STORE_LANDING_COPY.produceLiveTitleAr, 'خضارنا1');
assert.ok(!STORE_PRODUCE_LIVE.leadAr.includes('تمويناتا1'));
assert.ok(!STORE_PRODUCE_LIVE.leadAr.includes('طبختنا1'));
assert.ok(!STORE_PRODUCE_LIVE.problemBodyAr.includes('رمّان'));
assert.ok(!STORE_PRODUCE_LIVE.problemBodyAr.includes('رقان'));
assert.equal(STORE_PRODUCE_LIVE_LAB_TOKEN, 'produce-lab');

console.log('store-produce-live: ok');
