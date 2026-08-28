/**
 * مفتوح/مغلق وأوقات العمل لتمويناتا1 ومطعمنا1 وكافينا1 وطبختنا1.
 * تشغيل: npx tsx scripts/test-store-shop-hours.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_STORE_SHOP_HOURS, STORE_SHOP_HOURS_COPY } from '../src/config/storeShopHours.ts';
import {
  isShopClosedNow,
  isWithinShopHours,
  parseStoreShopHours,
  shopHoursLinesAr,
} from '../src/lib/storeShopHours.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function atRiyadh(hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, 7, 28, hour - 3, minute, 0));
}

const overnight = {
  ...DEFAULT_STORE_SHOP_HOURS,
  shopOpen: true,
  hoursEnabled: true,
  hoursMode: 'single' as const,
  hoursOpen: '18:00',
  hoursClose: '02:00',
};

assert.equal(parseStoreShopHours({}).shopOpen, true);
assert.equal(parseStoreShopHours({}).hoursEnabled, false);
assert.equal(parseStoreShopHours({ shopOpen: false }).shopOpen, false);
assert.equal(parseStoreShopHours({}, { ...DEFAULT_STORE_SHOP_HOURS, shopOpen: false }).shopOpen, false);
assert.equal(parseStoreShopHours({ hoursMode: 'split' }).hoursMode, 'split');
assert.equal(parseStoreShopHours({ hoursOpen: '9:05' }).hoursOpen, '09:05');
assert.equal(parseStoreShopHours({ hoursOpen: 'bad' }).hoursOpen, DEFAULT_STORE_SHOP_HOURS.hoursOpen);

assert.equal(isShopClosedNow({ ...DEFAULT_STORE_SHOP_HOURS, shopOpen: false }), true);
assert.equal(isShopClosedNow({ ...DEFAULT_STORE_SHOP_HOURS, shopOpen: true, hoursEnabled: false }), false);

assert.equal(isWithinShopHours(overnight, atRiyadh(20)), true);
assert.equal(isWithinShopHours(overnight, atRiyadh(1)), true);
assert.equal(isWithinShopHours(overnight, atRiyadh(3)), false);
assert.equal(isShopClosedNow(overnight, atRiyadh(3)), true);
assert.equal(isShopClosedNow({ ...overnight, shopOpen: false }, atRiyadh(20)), true);

const split = {
  ...DEFAULT_STORE_SHOP_HOURS,
  hoursEnabled: true,
  hoursMode: 'split' as const,
  hoursMorningOpen: '08:00',
  hoursMorningClose: '12:00',
  hoursEveningOpen: '16:00',
  hoursEveningClose: '23:00',
};
assert.equal(isWithinShopHours(split, atRiyadh(10)), true);
assert.equal(isWithinShopHours(split, atRiyadh(13)), false);
assert.equal(isWithinShopHours(split, atRiyadh(18)), true);

const invalidClock = {
  ...DEFAULT_STORE_SHOP_HOURS,
  hoursEnabled: true,
  hoursOpen: 'xx',
  hoursClose: 'yy',
};
assert.equal(isWithinShopHours(invalidClock, atRiyadh(12)), true);

assert.match(STORE_SHOP_HOURS_COPY.closedBannerAr, /مغلق الآن/);
assert.match(STORE_SHOP_HOURS_COPY.closedBannerAr, /مذكرة طلب مسبقة/);
assert.equal(STORE_SHOP_HOURS_COPY.preorderTitleAr, 'مذكرة طلب مسبقة');
assert.doesNotMatch(Object.values(STORE_SHOP_HOURS_COPY).join(' '), /كاردي8|افراحي1|اجواء1|لاونجا1/);

const lines = shopHoursLinesAr(split);
assert.equal(lines.length, 2);
assert.match(lines[0], /صباحية/);
assert.match(lines[1], /مسائية/);
assert.deepEqual(shopHoursLinesAr(DEFAULT_STORE_SHOP_HOURS), []);

const desks = [
  read('src/components/store/StoreGrocersDesk.tsx'),
  read('src/components/store/StoreRestaurantDesk.tsx'),
  read('src/components/store/StoreCafeDesk.tsx'),
  read('src/components/store/StoreKitchenDesk.tsx'),
];
for (const desk of desks) {
  assert.match(desk, /StoreShopHoursDesk/);
}

const shops = [
  read('src/components/store/StoreGrocersShop.tsx'),
  read('src/components/store/StoreRestaurantShop.tsx'),
  read('src/components/store/StoreCafeShop.tsx'),
  read('src/components/store/StoreKitchenShop.tsx'),
];
for (const shop of shops) {
  assert.match(shop, /StoreShopHoursBanner/);
  assert.match(shop, /preorderTitleAr/);
  assert.doesNotMatch(shop, /if \(isShopClosedNow/);
}

assert.match(read('src/components/store/StoreKitchenShop.tsx'), /if \(!state\.host\.acceptingOrders\) return;/);

const apis = [
  read('api/_lib/storeGrocersLive.ts'),
  read('api/_lib/storeRestaurantLive.ts'),
  read('api/_lib/storeCafeLive.ts'),
  read('api/_lib/storeKitchenLive.ts'),
  read('api/public-store-grocers-live.ts'),
  read('api/public-store-restaurant-live.ts'),
  read('api/public-store-cafe-live.ts'),
  read('api/public-store-kitchen-live.ts'),
];
for (const api of apis) {
  assert.match(api, /parseStoreShopHours/);
}

assert.match(read('api/_lib/storeKitchenGiftCampaign.ts'), /DEFAULT_STORE_SHOP_HOURS/);
assert.doesNotMatch(read('src/App.tsx'), /storeShopHours/);

console.log('test-store-shop-hours: ok');
