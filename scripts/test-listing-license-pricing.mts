/**
 * فحص أسعار حزم رخصة النفاذ لحلاق ماب وكوافير ماب.
 * تشغيل: npx tsx scripts/test-listing-license-pricing.mts
 */
import assert from 'node:assert/strict';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIAMOND_WITH_ADDON_MONTHLY_SAR,
  TIER_MONTHLY_SAR,
} from '../src/config/subscriptionPricing.ts';
import {
  computeListingLicenseTotalSar,
  computeListingLicenseUnitSar,
} from '../src/config/listingLicenseQuantity.ts';
import { STORE_WEDDING_LIVE_PRICE_SAR } from '../src/config/storeWeddingLive.ts';
import { STORE_EVENT_LIVE_PRICE_SAR } from '../src/config/storeEventLive.ts';
import { STORE_LOUNGE_LIVE_PRICE_SAR } from '../src/config/storeLoungeLive.ts';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR as API_ADDON,
  TIER_MONTHLY_SAR as API_TIER_MONTHLY_SAR,
} from '../api/_lib/subscriptionPricingCopy.ts';

const bronze = 'bronze';
const gold = 'gold';
const diamond = 'diamond';

assert.equal(TIER_MONTHLY_SAR[bronze], 200);
assert.equal(TIER_MONTHLY_SAR[gold], 300);
assert.equal(TIER_MONTHLY_SAR[diamond], 400);
assert.equal(DIGITAL_SHIFT_MONTHLY_ADDON_SAR, 50);
assert.equal(DIAMOND_WITH_ADDON_MONTHLY_SAR, 450);

assert.equal(API_TIER_MONTHLY_SAR.bronze, 200);
assert.equal(API_TIER_MONTHLY_SAR.gold, 300);
assert.equal(API_TIER_MONTHLY_SAR.diamond, 400);
assert.equal(API_ADDON, 50);

assert.equal(computeListingLicenseUnitSar(bronze), 200);
assert.equal(computeListingLicenseUnitSar(gold), 300);
assert.equal(computeListingLicenseUnitSar(diamond), 400);
assert.equal(computeListingLicenseUnitSar(diamond, { digitalShiftAddon: true }), 450);
assert.equal(computeListingLicenseUnitSar(bronze, { digitalShiftAddon: true }), 200);

assert.equal(computeListingLicenseTotalSar(bronze, 3), 600);
assert.equal(computeListingLicenseTotalSar(gold, 3), 900);
assert.equal(computeListingLicenseTotalSar(diamond, 3), 1200);
assert.equal(computeListingLicenseTotalSar(bronze, 6), 1200);
assert.equal(computeListingLicenseTotalSar(gold, 6), 1800);
assert.equal(computeListingLicenseTotalSar(diamond, 6), 2400);
assert.equal(computeListingLicenseTotalSar(bronze, 12), 2400);
assert.equal(computeListingLicenseTotalSar(gold, 12), 3600);
assert.equal(computeListingLicenseTotalSar(diamond, 12), 4800);
assert.equal(computeListingLicenseTotalSar(diamond, 12, { digitalShiftAddon: true }), 5400);

assert.notEqual(TIER_MONTHLY_SAR[bronze], STORE_WEDDING_LIVE_PRICE_SAR);
assert.notEqual(TIER_MONTHLY_SAR[gold], STORE_EVENT_LIVE_PRICE_SAR);
assert.notEqual(TIER_MONTHLY_SAR[diamond], STORE_LOUNGE_LIVE_PRICE_SAR);

console.log('listing-license-pricing: ok');
