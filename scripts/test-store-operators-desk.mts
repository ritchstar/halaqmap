/**
 * لوحة مشغّلي خريطة الحل: تسمية ومسار وعزل الشراء.
 * تشغيل: npx tsx scripts/test-store-operators-desk.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_OPERATOR_PRODUCT_IDS,
  STORE_OPERATOR_PRODUCTS,
  STORE_OPERATORS_DESK_COPY,
  STORE_OPERATORS_DESK_PUBLIC_ENABLED,
  STORE_OPERATORS_STORE_HOME,
} from '../src/config/storeOperatorsDesk.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';
import { isOperatorEmail, normalizeOperatorEmail } from '../api/_lib/storeOperatorsDesk.ts';
import {
  STORE_OPERATORS_ANDROID_PACKAGE_ID,
  STORE_OPERATORS_APP_DISPLAY_NAME_AR,
  STORE_OPERATORS_TWA_HOST,
  STORE_OPERATORS_TWA_LAUNCH_PATH,
  STORE_OPERATORS_TWA_START,
} from '../src/config/storeOperatorsAppShell.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreOperatorsDeskPage.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-operators.ts'), 'utf8');
const lib = readFileSync(join(root, 'api/_lib/storeOperatorsDesk.ts'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/storeOperatorsRemote.ts'), 'utf8');
const session = readFileSync(join(root, 'src/lib/storeOperatorsSession.ts'), 'utf8');
const migration = readFileSync(join(root, 'supabase/migrations/200_store_operators_desk.sql'), 'utf8');
const rule = readFileSync(join(root, '.cursor/rules/store-operators-desk.mdc'), 'utf8');
const copyBlob = JSON.stringify(STORE_OPERATORS_DESK_COPY) + JSON.stringify(STORE_OPERATOR_PRODUCTS);

assert.equal(STORE_OPERATORS_DESK_PUBLIC_ENABLED, true);
assert.equal(STORE_OPERATORS_DESK_COPY.documentTitle, 'لوحة مشغّلي خريطة الحل');
assert.equal(STORE_OPERATORS_DESK_COPY.titleAr, 'لوحة مشغّلي خريطة الحل');
assert.equal(ROUTE_PATHS.STORE_OPERATORS, '/store/operators');
assert.notEqual(ROUTE_PATHS.STORE_OPERATORS, ROUTE_PATHS.STORE_OPS);
assert.equal(STORE_OPERATORS_STORE_HOME, ROUTE_PATHS.STORE_LANDING);
assert.equal(STORE_OPERATOR_PRODUCT_IDS.length, 7);
assert.deepEqual([...STORE_OPERATOR_PRODUCT_IDS], [
  'kitchen',
  'grocers',
  'produce',
  'restaurant',
  'cafe',
  'halana',
  'lounge',
]);
assert.equal(STORE_OPERATOR_PRODUCTS.kitchen.titleAr, 'طبختنا1');
assert.equal(STORE_OPERATOR_PRODUCTS.grocers.titleAr, 'تمويناتا1');
assert.equal(STORE_OPERATOR_PRODUCTS.produce.titleAr, 'خضارنا1');
assert.equal(STORE_OPERATOR_PRODUCTS.restaurant.titleAr, 'مطعمنا1');
assert.equal(STORE_OPERATOR_PRODUCTS.cafe.titleAr, 'كافينا1');
assert.equal(STORE_OPERATOR_PRODUCTS.halana.titleAr, 'حلانا1');
assert.equal(STORE_OPERATOR_PRODUCTS.lounge.titleAr, 'لاونجا1');

assert.doesNotMatch(copyBlob, /اشتر|ميسر|ر\.س|تجربة|سعر|إعادة شراء/);
assert.doesNotMatch(copyBlob, /افراحي1|اجواء1|كاردي8/);
assert.doesNotMatch(page, /اشتر|ميسر|ر\.س|تجربة/);
assert.doesNotMatch(lib, /store_wedding|store_event|store_occasion|افراحي|اجواء|كاردي/);
assert.match(lib, /store_kitchen_live_orders/);
assert.match(lib, /store_halana_copies/);
assert.match(lib, /\/l\/\$\{token\}\/host/);

assert.doesNotMatch(app, /from ['"]@\/config\/storeOperatorsDesk['"]/);
assert.doesNotMatch(app, /storeOperatorsDesk/);
assert.match(app, /StoreOperatorsDeskPage/);
assert.match(app, /STORE_OPERATORS/);
assert.match(app, /\/store\/operators/);
assert.match(app, /STORE_OPS/);

assert.match(api, /send_code/);
assert.match(api, /verify_code/);
assert.match(api, /logout/);
assert.match(api, /SENT_AR/);
assert.match(remote, /public-store-operators/);
assert.match(session, /sessionStorage/);
assert.doesNotMatch(session, /localStorage/);

assert.match(migration, /store_operator_otps/);
assert.match(migration, /store_operator_sessions/);
assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
assert.match(migration, /service_role/);

assert.match(chrome, /STORE_OPERATORS/);
assert.match(chrome, /footerNavAr|لوحة المشغّلين/);
assert.match(page, /noindex/);
assert.match(rule, /لوحة مشغّلي خريطة الحل/);
assert.match(rule, /\/store\/operators/);

assert.equal(normalizeOperatorEmail('  Ali@Shop.sa '), 'ali@shop.sa');
assert.equal(isOperatorEmail('ops@shop.sa'), true);
assert.equal(isOperatorEmail('bad'), false);

const appShell = readFileSync(join(root, 'src/config/storeOperatorsAppShell.ts'), 'utf8');
const twaManifest = readFileSync(join(root, 'android-operators-twa/twa-manifest.json'), 'utf8');
const twaGradle = readFileSync(join(root, 'android-operators-twa/app/build.gradle'), 'utf8');
const twaAndroid = readFileSync(join(root, 'android-operators-twa/app/src/main/AndroidManifest.xml'), 'utf8');
const webManifest = readFileSync(join(root, 'public/manifest-operators.json'), 'utf8');
const assetLinks = readFileSync(join(root, 'public/.well-known/assetlinks.json'), 'utf8');
const partnerTwa = readFileSync(join(root, 'android-partner-twa/twa-manifest.json'), 'utf8');

assert.equal(STORE_OPERATORS_ANDROID_PACKAGE_ID, 'com.halaqmap.operators');
assert.equal(STORE_OPERATORS_TWA_HOST, 'store.halaqmap.com');
assert.equal(STORE_OPERATORS_TWA_START, ROUTE_PATHS.STORE_OPERATORS);
assert.equal(STORE_OPERATORS_TWA_LAUNCH_PATH, `/#${ROUTE_PATHS.STORE_OPERATORS}`);
assert.equal(STORE_OPERATORS_APP_DISPLAY_NAME_AR, 'لوحة مشغّلي خريطة الحل');
assert.match(appShell, /com\.halaqmap\.operators/);
assert.match(appShell, /store\.halaqmap\.com/);
assert.match(appShell, /\/#\/store\/operators/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeOperatorsAppShell['"]/);
assert.doesNotMatch(app, /storeOperatorsAppShell/);
assert.match(twaManifest, /"packageId": "com\.halaqmap\.operators"/);
assert.match(twaManifest, /"host": "store\.halaqmap\.com"/);
assert.match(twaManifest, /\/#\/store\/operators/);
assert.match(twaManifest, /لوحة مشغّلي خريطة الحل/);
assert.match(twaManifest, /2B:CF:4F:45:F3:7C:40:BF:83:EF:E0:D4:19:AA:82:18:83:1A:B1:D5:4E:0F:45:B8:B9:72:D5:36:51:32:A4:87/);
assert.doesNotMatch(twaManifest, /com\.halaqmap\.partner/);
assert.doesNotMatch(twaManifest, /www\.halaqmap\.com/);
assert.match(twaGradle, /com\.halaqmap\.operators/);
assert.match(twaGradle, /store\.halaqmap\.com/);
assert.match(twaAndroid, /com\.halaqmap\.operators/);
assert.match(webManifest, /\/#\/store\/operators/);
assert.match(webManifest, /لوحة مشغّلي خريطة الحل/);
assert.match(assetLinks, /com\.halaqmap\.operators/);
assert.match(assetLinks, /2B:CF:4F:45:F3:7C:40:BF:83:EF:E0:D4:19:AA:82:18:83:1A:B1:D5:4E:0F:45:B8:B9:72:D5:36:51:32:A4:87/);
assert.match(assetLinks, /com\.halaqmap\.partner/);
assert.match(partnerTwa, /com\.halaqmap\.partner/);
assert.doesNotMatch(partnerTwa, /com\.halaqmap\.operators/);
assert.doesNotMatch(twaManifest + twaGradle + webManifest, /اشتر|ميسر|ر\.س|تجربة/);

console.log('store-operators-desk: ok');
