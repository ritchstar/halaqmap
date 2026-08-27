/**
 * فحص نبض صفحات الحي: عبارة اللوحة فقط، والمحاذير في السياسات.
 * تشغيل: npx tsx scripts/test-store-shop-presence.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_SHOP_PRESENCE_LABEL_AR,
  STORE_SHOP_PRESENCE_PING_MS,
  STORE_SHOP_PRESENCE_TTL_MS,
  isStoreShopPresenceLabToken,
  isStoreShopPresenceTag,
} from '../src/config/storeShopPresence.ts';
import {
  isStoreShopPresenceLiveToken,
  isStoreShopPresenceVisitorKey,
  parseStoreShopPresenceTag,
  storeShopPresenceOrdersTable,
  storeShopRowIsLive,
  STORE_SHOP_PRESENCE_TABLE,
} from '../api/_lib/storeShopPresence.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-shop-presence.ts'), 'utf8');
const apiLib = readFileSync(join(root, 'api/_lib/storeShopPresence.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/183_store_shop_presence.sql'), 'utf8');
const countUi = readFileSync(join(root, 'src/components/store/StoreShopPresenceCount.tsx'), 'utf8');
const legal = readFileSync(join(root, 'src/config/storeIssuedCardsLegal.ts'), 'utf8');
const terms = readFileSync(join(root, 'src/pages/TermsOfService.tsx'), 'utf8');
const privacy = readFileSync(join(root, 'src/pages/Privacy.tsx'), 'utf8');
const userPrivacy = readFileSync(join(root, 'src/pages/UserPrivacyPolicy.tsx'), 'utf8');
const grocersDesk = readFileSync(join(root, 'src/components/store/StoreGrocersDesk.tsx'), 'utf8');
const restaurantDesk = readFileSync(join(root, 'src/components/store/StoreRestaurantDesk.tsx'), 'utf8');
const cafeDesk = readFileSync(join(root, 'src/components/store/StoreCafeDesk.tsx'), 'utf8');
const kitchenDesk = readFileSync(join(root, 'src/components/store/StoreKitchenDesk.tsx'), 'utf8');
const grocersShop = readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8');
const restaurantShop = readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8');
const cafeShop = readFileSync(join(root, 'src/pages/store/StoreCafeShopPage.tsx'), 'utf8');
const kitchenShop = readFileSync(join(root, 'src/pages/store/StoreKitchenShopPage.tsx'), 'utf8');
const cafeHall = readFileSync(join(root, 'src/components/store/StoreCafeHallStage.tsx'), 'utf8');
const cafeGuest = readFileSync(join(root, 'src/components/store/StoreCafeGuestForm.tsx'), 'utf8');
const cafeHost = readFileSync(join(root, 'src/components/store/StoreCafeHostPanel.tsx'), 'utf8');
const desks = grocersDesk + restaurantDesk + cafeDesk + kitchenDesk;

assert.equal(STORE_SHOP_PRESENCE_LABEL_AR, 'عدد المتواجدون الان');
assert.equal(STORE_SHOP_PRESENCE_TTL_MS, 45_000);
assert.equal(STORE_SHOP_PRESENCE_PING_MS, 15_000);
assert.equal(STORE_SHOP_PRESENCE_TABLE, 'store_shop_presence');
assert.equal(isStoreShopPresenceTag('store_grocers_live'), true);
assert.equal(isStoreShopPresenceTag('store_wedding_live'), false);
assert.equal(isStoreShopPresenceTag('store_event_live'), false);
assert.equal(isStoreShopPresenceTag('store_lounge_live'), false);
assert.equal(parseStoreShopPresenceTag('store_kitchen_live'), 'store_kitchen_live');
assert.equal(parseStoreShopPresenceTag('store_occasion_card'), null);
assert.equal(isStoreShopPresenceLabToken('grocers-lab'), true);
assert.equal(isStoreShopPresenceLabToken('kitchen-lab'), true);
assert.equal(isStoreShopPresenceLiveToken('grocers-lab'), false);
assert.equal(isStoreShopPresenceLiveToken('a'.repeat(16)), true);
assert.equal(isStoreShopPresenceVisitorKey('abcdef0123456789'), true);
assert.equal(isStoreShopPresenceVisitorKey('short'), false);
assert.equal(storeShopPresenceOrdersTable('store_grocers_live'), 'store_grocers_live_orders');
assert.equal(storeShopPresenceOrdersTable('store_kitchen_live'), 'store_kitchen_live_orders');
assert.equal(storeShopRowIsLive('store_kitchen_live', { status: 'live', expires_at: null }), true);
assert.equal(storeShopRowIsLive('store_kitchen_live', { status: 'expired', expires_at: null }), false);
assert.equal(
  storeShopRowIsLive('store_kitchen_live', { status: 'live', expires_at: '2000-01-01T00:00:00.000Z' }),
  false,
);

const now = 1_000_000;
function prunePresenceMap(map: Record<string, number>, nowMs: number, ttlMs = STORE_SHOP_PRESENCE_TTL_MS) {
  const next: Record<string, number> = {};
  for (const [key, seen] of Object.entries(map)) {
    if (!/^[a-z0-9]{16,40}$/.test(key)) continue;
    if (nowMs - seen <= ttlMs) next[key] = seen;
  }
  return next;
}
assert.equal(Object.keys(prunePresenceMap({ abcdef0123456789: now, deadbeefdeadbeef: now - 46_000 }, now)).length, 1);
assert.deepEqual(prunePresenceMap({ abcdef0123456789: now, skip: now }, now), { abcdef0123456789: now });

assert.match(countUi, /STORE_SHOP_PRESENCE_LABEL_AR/);
assert.doesNotMatch(countUi, /مجهول|دفتر|تتبع|محذور|خصوصية/);
assert.doesNotMatch(desks, /مجهول|دفتر زيارات|تتبع الحضور|محذور/);
assert.match(grocersDesk, /StoreShopPresenceCount/);
assert.match(restaurantDesk, /StoreShopPresenceCount/);
assert.match(cafeDesk, /StoreShopPresenceCount/);
assert.match(kitchenDesk, /StoreShopPresenceCount/);
assert.match(grocersShop, /useStoreShopPresence/);
assert.match(restaurantShop, /useStoreShopPresence/);
assert.match(cafeShop, /useStoreShopPresence/);
assert.match(kitchenShop, /useStoreShopPresence/);
assert.match(cafeShop, /neighborhoodShop/);
assert.doesNotMatch(cafeHall, /useStoreShopPresence|StoreShopPresenceCount/);
assert.doesNotMatch(cafeGuest, /useStoreShopPresence|StoreShopPresenceCount/);
assert.doesNotMatch(cafeHost, /useStoreShopPresence|StoreShopPresenceCount/);
assert.doesNotMatch(app, /storeShopPresence|StoreShopPresenceCount|useStoreShopPresence/);
assert.doesNotMatch(api, /platform_presence|presence-heartbeat/);
assert.doesNotMatch(apiLib, /store_wedding_live|store_event_live|store_lounge_live/);
assert.match(sql, /service_role/);
assert.match(sql, /ENABLE ROW LEVEL SECURITY/);
assert.match(sql, /REVOKE ALL ON TABLE public.store_shop_presence FROM anon/);
assert.match(legal, /عدد المتواجدون الان/);
assert.match(legal, /بلا اسم ولا هاتف ولا دفتر زيارات/);
assert.match(legal, /افراحي1 ولا اجواء1 ولا لاونجا1/);
assert.match(legal, /مطعمنا1/);
assert.match(legal, /كافينا1/);
assert.match(legal, /طبختنا1/);
assert.match(terms, /عدد المتواجدون الان/);
assert.match(privacy, /عدد المتواجدون الان/);
assert.match(userPrivacy, /عدد المتواجدون الان/);
assert.doesNotMatch(legal + terms + privacy + userPrivacy, /المؤسس/);

console.log('store-shop-presence ok');
