/**
 * مسار عربة مشمول في السعر: مطعمنا1 وتمويناتا1 وكافينا1 فقط.
 * تشغيل: npx tsx scripts/test-store-mobile-vendor.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchStoreAffiliateCommission } from '../api/_lib/storeAffiliateLive.ts';
import { cafeChargeHalalas, cafeLiveInvoiceDescription, isCafePriceHalalas, parseCafeLiveOrderBody } from '../api/_lib/storeCafeLive.ts';
import {
  grocersChargeHalalas,
  grocersLiveInvoiceDescription,
  isGrocersPriceHalalas,
  parseGrocersLiveOrderBody,
} from '../api/_lib/storeGrocersLive.ts';
import { restaurantChargeHalalas, isRestaurantPriceHalalas, parseRestaurantLiveOrderBody } from '../api/_lib/storeRestaurantLive.ts';
import { DEFAULT_SHOP_PICKUP, publicShopPlaceFields } from '../api/_lib/storeShopPlace.ts';
import {
  STORE_MOBILE_VENDOR,
  STORE_MOBILE_VENDOR_PACKS,
  STORE_MOBILE_VENDOR_PRICE_12_HALALAS,
  STORE_MOBILE_VENDOR_PRICE_12_SAR,
  STORE_MOBILE_VENDOR_PRICE_6_HALALAS,
  STORE_MOBILE_VENDOR_PRICE_6_SAR,
} from '../src/config/storeMobileVendor.ts';
import { STORE_GROCERS_LIVE } from '../src/config/storeGrocersLive.ts';
import { STORE_RESTAURANT_LIVE } from '../src/config/storeRestaurantLive.ts';
import { STORE_CAFE_LIVE } from '../src/config/storeCafeLive.ts';
import { STORE_AFFILIATE_LINES } from '../src/config/storeAffiliateLive.ts';
import { isMobileVendorStale, neighborVendorState, parseVendorMode } from '../src/lib/storeMobileVendor.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(STORE_MOBILE_VENDOR_PRICE_6_SAR, 799);
assert.equal(STORE_MOBILE_VENDOR_PRICE_12_SAR, 1250);
assert.equal(STORE_MOBILE_VENDOR_PRICE_6_HALALAS, 79900);
assert.equal(STORE_MOBILE_VENDOR_PRICE_12_HALALAS, 125000);
assert.equal(STORE_MOBILE_VENDOR_PACKS.length, 2);
assert.equal(STORE_GROCERS_LIVE.titleAr, 'تمويناتا1');
assert.equal(STORE_RESTAURANT_LIVE.titleAr, 'مطعمنا1');
assert.equal(STORE_CAFE_LIVE.titleAr, 'كافينا1');
assert.equal(parseVendorMode('mobile'), 'mobile');
assert.equal(parseVendorMode('fixed'), 'fixed');
assert.equal(parseVendorMode(''), 'fixed');

assert.equal(grocersChargeHalalas('m6', true, 'mobile'), 79900);
assert.equal(grocersChargeHalalas('m12', true, 'mobile'), 125000);
assert.equal(grocersChargeHalalas('m6', true), 89800);
assert.equal(restaurantChargeHalalas('m6', 'mobile'), 79900);
assert.equal(cafeChargeHalalas('m12', 'mobile'), 125000);
assert.equal(isGrocersPriceHalalas(79900), true);
assert.equal(isRestaurantPriceHalalas(125000), true);
assert.equal(isCafePriceHalalas(79900), true);
assert.match(grocersLiveInvoiceDescription('m6', true, 'mobile'), /متحرك/);
assert.doesNotMatch(grocersLiveInvoiceDescription('m6', true, 'mobile'), /صندوق محادثة/);
assert.match(cafeLiveInvoiceDescription('m12', 'mobile'), /كافينا1 متحرك/);

const grocersMobile = parseGrocersLiveOrderBody({
  email: 'a@b.co',
  shopName: 'تموينات النخيل',
  packId: 'm6',
  chatAddon: true,
  vendorMode: 'mobile',
});
assert.equal(grocersMobile.ok, true);
if (grocersMobile.ok) {
  assert.equal(grocersMobile.chatAddon, false);
  assert.equal(grocersMobile.vendorMode, 'mobile');
  assert.equal(grocersMobile.payload.vendorMode, 'mobile');
  assert.equal(grocersMobile.payload.chatAddon, false);
}

const restaurantMobile = parseRestaurantLiveOrderBody({
  email: 'a@b.co',
  shopName: 'مطعم السدرة',
  packId: 'm12',
  vendorMode: 'mobile',
});
assert.equal(restaurantMobile.ok, true);
if (restaurantMobile.ok) assert.equal(restaurantMobile.payload.vendorMode, 'mobile');

const cafeFixed = parseCafeLiveOrderBody({
  email: 'a@b.co',
  shopName: 'مقهى السدرة',
  packId: 'm6',
});
assert.equal(cafeFixed.ok, true);
if (cafeFixed.ok) assert.equal(cafeFixed.payload.vendorMode, 'fixed');

assert.deepEqual(matchStoreAffiliateCommission('store_grocers_live', 79900), {
  lineId: 'grocers_mobile_6',
  commissionHalalas: 9900,
});
assert.deepEqual(matchStoreAffiliateCommission('store_restaurant_live', 125000), {
  lineId: 'restaurant_mobile_12',
  commissionHalalas: 25000,
});
assert.deepEqual(matchStoreAffiliateCommission('store_cafe_live', 79900), {
  lineId: 'cafe_mobile_6',
  commissionHalalas: 9900,
});
assert.equal(matchStoreAffiliateCommission('store_kitchen_live', 79900), null);
assert.equal(matchStoreAffiliateCommission('store_lounge_live', 125000), null);
assert.equal(matchStoreAffiliateCommission('store_grocers_live', 59900)?.lineId, 'grocers_6');

const byId = Object.fromEntries(STORE_AFFILIATE_LINES.map((line) => [line.id, line]));
assert.equal(byId.grocers_mobile_6.commissionSar, 99);
assert.equal(byId.cafe_mobile_12.commissionSar, 250);
assert.equal(byId.grocers_mobile_12.priceSar, 1250);

const now = Date.parse('2026-08-29T10:00:00.000Z');
assert.equal(isMobileVendorStale('', now), true);
assert.equal(isMobileVendorStale(new Date(now - 10 * 60 * 1000).toISOString(), now), false);
assert.equal(isMobileVendorStale(new Date(now - 50 * 60 * 1000).toISOString(), now), true);

assert.equal(
  neighborVendorState({
    vendorMode: 'mobile',
    vendorTransit: true,
    pickupPlaceVisible: true,
    pickupUpdatedAt: new Date(now).toISOString(),
    pickupLat: 24.7,
    pickupLng: 46.7,
    closed: false,
  }),
  'in_transit',
);
assert.equal(
  neighborVendorState({
    vendorMode: 'mobile',
    vendorTransit: false,
    pickupPlaceVisible: true,
    pickupUpdatedAt: new Date(now).toISOString(),
    pickupLat: 24.7,
    pickupLng: 46.7,
    closed: false,
  }),
  'at_pin',
);
assert.equal(
  neighborVendorState({
    vendorMode: 'mobile',
    vendorTransit: false,
    pickupPlaceVisible: true,
    pickupUpdatedAt: new Date(now).toISOString(),
    pickupLat: 24.7,
    pickupLng: 46.7,
    closed: true,
  }),
  'closed',
);

const hiddenPublic = publicShopPlaceFields('shop', {
  ...DEFAULT_SHOP_PICKUP,
  vendorMode: 'mobile',
  pickupPlaceVisible: true,
  vendorTransit: true,
  pickupLat: 24.7,
  pickupLng: 46.7,
  pickupMapsUrl: 'https://maps.google.com/?q=24.7,46.7',
  pickupUpdatedAt: new Date().toISOString(),
});
assert.equal(hiddenPublic.pickupLat, 0);
assert.equal(hiddenPublic.pickupMapsUrl, '');
assert.equal(hiddenPublic.pickupHistory.length, 0);

const deskSees = publicShopPlaceFields('desk', {
  ...DEFAULT_SHOP_PICKUP,
  vendorMode: 'mobile',
  pickupLat: 24.7,
  pickupLng: 46.7,
  pickupMapsUrl: 'https://maps.google.com/?q=24.7,46.7',
  pickupHistory: [{ at: '2026-08-29T09:00:00.000Z', lat: 24.7, lng: 46.7, mapsUrl: 'https://maps.google.com/?q=24.7,46.7' }],
});
assert.equal(deskSees.pickupLat, 24.7);
assert.equal(deskSees.pickupHistory.length, 1);

const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/186_store_mobile_vendor_prices.sql'), 'utf8');
const grocersForm = readFileSync(join(root, 'src/components/store/StoreGrocersOrderForm.tsx'), 'utf8');
const loungeApi = readFileSync(join(root, 'api/public-store-lounge-live.ts'), 'utf8');
const kitchenApi = readFileSync(join(root, 'api/_lib/storeKitchenLive.ts'), 'utf8');

assert.match(webhook, /grocers_mobile_6/);
assert.match(webhook, /amount === 125000/);
assert.match(webhook, /amount === 79900/);
assert.match(sql, /79900, 125000/);
assert.match(grocersForm, /vendorMode/);
assert.match(grocersForm, /StoreVendorPathPicker/);
assert.match(loungeApi, /vendorMode: 'fixed'/);
assert.doesNotMatch(kitchenApi, /79900/);
assert.match(STORE_MOBILE_VENDOR.markAr, /متحرك/);
assert.doesNotMatch(STORE_MOBILE_VENDOR.priceLineAr, /إضافة مدفوعة/);

console.log('store-mobile-vendor ok');
