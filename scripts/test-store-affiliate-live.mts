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
  parseAffiliateLane,
} from '../src/config/storeAffiliateLive.ts';
import { STORE_EVENT_LIVE_PRICE_SAR } from '../src/config/storeEventLive.ts';
import { STORE_GROCERS_CHAT_ADDON_12_SAR, STORE_GROCERS_CHAT_ADDON_6_SAR, STORE_GROCERS_LIVE_PRICE_12_SAR, STORE_GROCERS_LIVE_PRICE_6_SAR } from '../src/config/storeGrocersLive.ts';
import { STORE_LOUNGE_LIVE_PRICE_SAR } from '../src/config/storeLoungeLive.ts';
import { STORE_WEDDING_LIVE_PRICE_SAR } from '../src/config/storeWeddingLive.ts';
import { AMBASSADOR_TELEGRAM_GROUP_NAME_AR } from '../src/config/ambassadorCommunity.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const linesBlob = JSON.stringify(STORE_AFFILIATE_LINES);

assert.equal(STORE_AFFILIATE_LANES.length, 3);
assert.equal(parseAffiliateLane('store'), 'store');
assert.equal(parseAffiliateLane('coiffeur'), 'coiffeur');
assert.equal(parseAffiliateLane('x'), 'halaq');
assert.equal(AMBASSADOR_TELEGRAM_GROUP_NAME_AR, STORE_AFFILIATE_GROUP_NAME_AR);
assert.match(STORE_AFFILIATE_HUB_TITLE_AR, /خريطة الحل/);
assert.match(STORE_AFFILIATE_COPY.leadAr, /مسوّقة/);

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

assert.doesNotMatch(linesBlob, /store_occasion_card/);
assert.ok(STORE_AFFILIATE_LINES.every((line) => ![12, 29, 59].includes(line.priceSar)));
assert.match(STORE_AFFILIATE_COPY.storeLeadAr, /كاردي8/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeAffiliateLive['"]/);

console.log('store-affiliate-live ok', STORE_AFFILIATE_LINES.length);
