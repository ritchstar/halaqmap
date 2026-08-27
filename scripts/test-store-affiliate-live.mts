/**
 * فحص عمولات منتجات المتجر: مبالغ ثابتة، عزل كاردي8، صافي المنصة.
 * تشغيل: npx tsx scripts/test-store-affiliate-live.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_AFFILIATE_COPY,
  STORE_AFFILIATE_GROUP_NAME_AR,
  STORE_AFFILIATE_HUB_TITLE_AR,
  STORE_AFFILIATE_LANES,
  STORE_AFFILIATE_LINES,
  affiliateNetSar,
  grocersAffiliateCommissionSar,
  kitchenAffiliateCommissionSar,
  restaurantAffiliateCommissionSar,
  parseAffiliateLane,
} from '../src/config/storeAffiliateLive.ts';
import { STORE_EVENT_LIVE_PRICE_SAR } from '../src/config/storeEventLive.ts';
import { STORE_GROCERS_CHAT_ADDON_12_SAR, STORE_GROCERS_CHAT_ADDON_6_SAR, STORE_GROCERS_LIVE_PRICE_12_SAR, STORE_GROCERS_LIVE_PRICE_6_SAR } from '../src/config/storeGrocersLive.ts';
import { STORE_LOUNGE_LIVE_PRICE_SAR } from '../src/config/storeLoungeLive.ts';
import { STORE_RESTAURANT_LIVE_PRICE_12_SAR, STORE_RESTAURANT_LIVE_PRICE_6_SAR } from '../src/config/storeRestaurantLive.ts';
import { STORE_KITCHEN_LIVE_PRICE_12_SAR, STORE_KITCHEN_LIVE_PRICE_6_SAR } from '../src/config/storeKitchenLive.ts';
import { STORE_WEDDING_LIVE_PRICE_SAR } from '../src/config/storeWeddingLive.ts';
import { parseStoreAffiliateCode, withStoreAffiliateCode } from '../api/_lib/storeAffiliateCode.ts';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';
import { weddingLiveInvoiceMetadata } from '../api/_lib/storeWeddingLive.ts';
import { eventLiveInvoiceMetadata } from '../api/_lib/storeEventLive.ts';
import { loungeLiveInvoiceMetadata } from '../api/_lib/storeLoungeLive.ts';
import { grocersLiveInvoiceMetadata } from '../api/_lib/storeGrocersLive.ts';
import { restaurantLiveInvoiceMetadata } from '../api/_lib/storeRestaurantLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const linesBlob = JSON.stringify(STORE_AFFILIATE_LINES);

assert.equal(STORE_AFFILIATE_LANES.length, 3);
assert.equal(STORE_AFFILIATE_LANES[0].pathAr, '/ambassadors');
assert.equal(STORE_AFFILIATE_LANES[1].pathAr, '/coiffeur/ambassadors');
assert.equal(STORE_AFFILIATE_LANES[2].pathAr, '/store/affiliates');
assert.equal(parseAffiliateLane('store'), 'store');
assert.equal(parseAffiliateLane('coiffeur'), 'coiffeur');
assert.equal(parseAffiliateLane('x'), 'halaq');
assert.ok(STORE_AFFILIATE_HUB_TITLE_AR.includes('خريطة الحل'));
assert.ok(STORE_AFFILIATE_GROUP_NAME_AR.includes('متجر'));
assert.ok(STORE_AFFILIATE_COPY.leadAr.includes('مسوّقات'));
assert.ok(STORE_AFFILIATE_COPY.leadAr.includes('مستقلتان'));
assert.ok(STORE_AFFILIATE_COPY.reviewLeadAr.includes('الإدارة'));
assert.ok(STORE_AFFILIATE_COPY.storeLeadAr.includes('كل عملية شراء جديدة'));
assert.ok(STORE_AFFILIATE_COPY.storeOngoingAr.includes('كل فاتورة جديدة'));

const byId = Object.fromEntries(STORE_AFFILIATE_LINES.map((line) => [line.id, line]));
assert.equal(byId.wedding.priceSar, STORE_WEDDING_LIVE_PRICE_SAR);
assert.equal(byId.wedding.commissionSar, 99);
assert.equal(byId.event.priceSar, STORE_EVENT_LIVE_PRICE_SAR);
assert.equal(byId.event.commissionSar, 99);
assert.equal(byId.lounge.priceSar, STORE_LOUNGE_LIVE_PRICE_SAR);
assert.equal(byId.lounge.commissionSar, 100);
assert.equal(byId.grocers_6.priceSar, STORE_GROCERS_LIVE_PRICE_6_SAR);
assert.equal(byId.grocers_6.commissionSar, 99);
assert.equal(byId.grocers_12.priceSar, STORE_GROCERS_LIVE_PRICE_12_SAR);
assert.equal(byId.grocers_12.commissionSar, 199);
assert.equal(byId.grocers_chat_6.priceSar, STORE_GROCERS_CHAT_ADDON_6_SAR);
assert.equal(byId.grocers_chat_6.commissionSar, 98);
assert.equal(byId.grocers_chat_12.priceSar, STORE_GROCERS_CHAT_ADDON_12_SAR);
assert.equal(byId.grocers_chat_12.commissionSar, 199);
assert.equal(byId.restaurant_6.priceSar, STORE_RESTAURANT_LIVE_PRICE_6_SAR);
assert.equal(byId.restaurant_6.commissionSar, 99);
assert.equal(byId.restaurant_12.priceSar, STORE_RESTAURANT_LIVE_PRICE_12_SAR);
assert.equal(byId.restaurant_12.commissionSar, 199);
assert.equal(byId.kitchen_6.priceSar, STORE_KITCHEN_LIVE_PRICE_6_SAR);
assert.equal(byId.kitchen_6.commissionSar, 100);
assert.equal(byId.kitchen_12.priceSar, STORE_KITCHEN_LIVE_PRICE_12_SAR);
assert.equal(byId.kitchen_12.commissionSar, 200);

assert.equal(affiliateNetSar(899, 99), 800);
assert.equal(affiliateNetSar(600, 100), 500);
assert.equal(affiliateNetSar(599, 99), 500);
assert.equal(affiliateNetSar(899, 199), 700);
assert.equal(affiliateNetSar(299, 98), 201);
assert.equal(affiliateNetSar(499, 199), 300);
assert.equal(grocersAffiliateCommissionSar('m6', false), 99);
assert.equal(grocersAffiliateCommissionSar('m6', true), 197);
assert.equal(grocersAffiliateCommissionSar('m12', false), 199);
assert.equal(grocersAffiliateCommissionSar('m12', true), 398);
assert.equal(affiliateNetSar(699, 99), 600);
assert.equal(affiliateNetSar(999, 199), 800);
assert.equal(restaurantAffiliateCommissionSar('m6'), 99);
assert.equal(restaurantAffiliateCommissionSar('m12'), 199);
assert.equal(kitchenAffiliateCommissionSar('m6'), 100);
assert.equal(kitchenAffiliateCommissionSar('m12'), 200);
assert.equal(affiliateNetSar(300, 100), 200);
assert.equal(affiliateNetSar(600, 200), 400);

assert.doesNotMatch(linesBlob, /store_occasion_card/);
assert.ok(STORE_AFFILIATE_LINES.every((line) => ![12, 29, 59].includes(line.priceSar)));
assert.match(STORE_AFFILIATE_COPY.storeLeadAr, /كاردي8/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeAffiliateLive['"]/);

assert.equal(parseStoreAffiliateCode('AbCdef12'), 'abcdef12');
assert.equal(parseStoreAffiliateCode('bad'), '');
assert.equal(withStoreAffiliateCode({ product: 'store_wedding_live' }, 'AbCdef12').store_affiliate_code, 'abcdef12');
assert.equal('store_affiliate_code' in withStoreAffiliateCode({ product: 'store_wedding_live' }, 'xx'), false);

assert.deepEqual(matchStoreAffiliateCommission('store_wedding_live', 89900), { lineId: 'wedding', commissionHalalas: 9900 });
assert.deepEqual(matchStoreAffiliateCommission('store_event_live', 89900), { lineId: 'event', commissionHalalas: 9900 });
assert.deepEqual(matchStoreAffiliateCommission('store_lounge_live', 60000), { lineId: 'lounge', commissionHalalas: 10000 });
assert.deepEqual(matchStoreAffiliateCommission('store_grocers_live', 59900), { lineId: 'grocers_6', commissionHalalas: 9900 });
assert.deepEqual(matchStoreAffiliateCommission('store_grocers_live', 89900), { lineId: 'grocers_12', commissionHalalas: 19900 });
assert.deepEqual(matchStoreAffiliateCommission('store_grocers_live', 89800), { lineId: 'grocers_chat_6', commissionHalalas: 19700 });
assert.deepEqual(matchStoreAffiliateCommission('store_grocers_live', 139800), { lineId: 'grocers_chat_12', commissionHalalas: 39800 });
assert.deepEqual(matchStoreAffiliateCommission('store_restaurant_live', 69900), { lineId: 'restaurant_6', commissionHalalas: 9900 });
assert.deepEqual(matchStoreAffiliateCommission('store_restaurant_live', 99900), { lineId: 'restaurant_12', commissionHalalas: 19900 });
assert.deepEqual(matchStoreAffiliateCommission('store_kitchen_live', 30000), { lineId: 'kitchen_6', commissionHalalas: 10000 });
assert.deepEqual(matchStoreAffiliateCommission('store_kitchen_live', 60000), { lineId: 'kitchen_12', commissionHalalas: 20000 });
assert.equal(matchStoreAffiliateCommission('store_occasion_card', 5900), null);
assert.equal(matchStoreAffiliateCommission('store_occasion_card', 1200), null);
assert.equal(matchStoreAffiliateCommission('store_wedding_live', 5900), null);
assert.equal(matchStoreAffiliateCommission('store_lounge_live', 89900), null);

assert.equal(weddingLiveInvoiceMetadata('tok_w', 'abcdef12').store_affiliate_code, 'abcdef12');
assert.equal(eventLiveInvoiceMetadata('tok_e', 'abcdef12').store_affiliate_code, 'abcdef12');
assert.equal(loungeLiveInvoiceMetadata('tok_l', 'purchase', 'abcdef12').store_affiliate_code, 'abcdef12');
assert.equal(grocersLiveInvoiceMetadata('tok_g', 'm6', 'purchase', true, 'abcdef12').store_affiliate_code, 'abcdef12');
assert.equal(restaurantLiveInvoiceMetadata('tok_r', 'm6', 'purchase', 'abcdef12').store_affiliate_code, 'abcdef12');
assert.equal('store_affiliate_code' in weddingLiveInvoiceMetadata('tok_w'), false);

const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/174_store_affiliate_live.sql'), 'utf8');
const reviewSql = readFileSync(join(root, 'supabase/migrations/177_store_affiliate_review_gate.sql'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-affiliate.ts'), 'utf8');
const magicLib = readFileSync(join(root, 'api/_lib/storeAffiliateMagic.ts'), 'utf8');
const adminApi = readFileSync(join(root, 'api/admin-store-affiliate.ts'), 'utf8');
const enterPage = readFileSync(join(root, 'src/pages/store/StoreAffiliatesEnterPage.tsx'), 'utf8');
const ambassadorEnter = readFileSync(join(root, 'src/pages/ambassador/AmbassadorEnter.tsx'), 'utf8');
const lane = readFileSync(join(root, 'src/components/affiliate/AffiliateStoreLane.tsx'), 'utf8');
const weddingForm = readFileSync(join(root, 'src/components/store/StoreWeddingOrderForm.tsx'), 'utf8');
const eventForm = readFileSync(join(root, 'src/components/store/StoreEventOrderForm.tsx'), 'utf8');
const loungeForm = readFileSync(join(root, 'src/components/store/StoreLoungeOrderForm.tsx'), 'utf8');
const grocersForm = readFileSync(join(root, 'src/components/store/StoreGrocersOrderForm.tsx'), 'utf8');
const restaurantForm = readFileSync(join(root, 'src/components/store/StoreRestaurantOrderForm.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');

assert.match(webhook, /store_affiliate_ledger/);
assert.match(webhook, /creditStoreAffiliateLedger/);
assert.match(webhook, /store_affiliate_code/);
assert.doesNotMatch(webhook, /store_occasion_card[\s\S]{0,80}creditStoreAffiliateLedger/);
assert.match(sql, /store_affiliate_ledger_payment_uidx/);
assert.match(sql, /moyasar_payment_id/);
assert.match(sql, /store_occasion_card/);
assert.match(api, /send_magic/);
assert.match(api, /sent: true/);
assert.match(api, /token_hash/);
assert.match(api, /action === 'apply'/);
assert.match(api, /pending_review/);
assert.match(magicLib, /store\/affiliates\/desk/);
assert.match(api, /status\) !== 'approved'/);
assert.doesNotMatch(api, /display_name: email\.split/);
assert.match(reviewSql, /pending_review/);
assert.match(reviewSql, /approved/);
assert.match(reviewSql, /declined/);
assert.match(adminApi, /approve/);
assert.match(adminApi, /decline/);
assert.match(adminApi, /send_login/);
assert.match(adminApi, /issueStoreAffiliateMagic/);
assert.match(api, /issueStoreAffiliateMagic/);
assert.match(magicLib, /STORE_AFFILIATE_MAGIC_TTL_MS = 24/);
assert.match(
  readFileSync(join(root, 'src/components/admin/StoreAffiliateApplicationsPanel.tsx'), 'utf8'),
  /send_login/,
);
assert.match(enterPage, /applyStoreAffiliate/);
assert.match(app, /StoreAffiliatesHomePage/);
assert.match(app, /StoreAffiliatesEnterPage/);
assert.doesNotMatch(ambassadorEnter, /AffiliateStoreLane/);
assert.doesNotMatch(ambassadorEnter, /STORE_AFFILIATE_LANES/);
assert.doesNotMatch(ambassadorEnter, /CoiffeurAmbassadorEnter/);
assert.match(ambassadorEnter, /STORE_AFFILIATES/);
assert.match(lane, /STORE_AFFILIATES_DESK/);
assert.match(lane, /sendStoreAffiliateMagic/);
assert.match(lane, /redeemStoreAffiliateMagic/);
assert.match(weddingForm, /affiliateCode: rememberStoreAffiliateRef/);
assert.match(eventForm, /affiliateCode: rememberStoreAffiliateRef/);
assert.match(loungeForm, /affiliateCode/);
assert.match(grocersForm, /affiliateCode/);
assert.match(restaurantForm, /affiliateCode/);
assert.match(lane, /restaurant/);
assert.match(lane, /kitchen/);
assert.match(api, /storeAffiliateCheckoutLinks/);
assert.match(magicLib, /productLinks/);
assert.match(readFileSync(join(root, 'api/_lib/storeAffiliateCode.ts'), 'utf8'), /store\/restaurant\$\{q\}/);
assert.match(readFileSync(join(root, 'api/_lib/storeAffiliateCode.ts'), 'utf8'), /store\/kitchen\$\{q\}/);
assert.match(lane, /StoreProductLinkIconGrid/);
assert.doesNotMatch(STORE_AFFILIATE_COPY.storeLeadAr, /مطعمنا1 حتى/);
assert.match(STORE_AFFILIATE_COPY.storeOngoingAr, /مطعمنا1/);
assert.match(STORE_AFFILIATE_COPY.storeOngoingAr, /طبختنا1/);
assert.match(chrome, /rememberStoreAffiliateRef/);
assert.match(readFileSync(join(root, 'src/lib/storeAffiliateRef.ts'), 'utf8'), /localStorage/);

console.log('store-affiliate-live ok', STORE_AFFILIATE_LINES.length);
