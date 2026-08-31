/**
 * فحص قيد مبيعات المتجر: شق رجالي/نسائي، باقات تمويناتا1، وعزل App.
 * تشغيل: npx tsx scripts/test-store-sales-ledger.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_SALES_LEDGER_BRANCHES,
  STORE_SALES_LEDGER_COPY,
  STORE_SALES_LEDGER_PRODUCTS,
  isStoreSalesLedgerProduct,
} from '../src/config/storeSalesLedger.ts';
import {
  mapStoreSalesRow,
  summarizeStoreSales,
} from '../api/_lib/storeSalesLedger.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const dashboard = readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8');
const api = readFileSync(join(root, 'api/admin-store-sales.ts'), 'utf8');
const mapper = readFileSync(join(root, 'api/_lib/storeSalesLedger.ts'), 'utf8');

assert.deepEqual([...STORE_SALES_LEDGER_PRODUCTS], [
  'wedding',
  'wedding-women',
  'event',
  'grocers',
  'restaurant',
  'cafe',
  'kitchen',
  'produce',
  'lounge',
]);
assert.equal(STORE_SALES_LEDGER_BRANCHES.length, 9);
assert.ok(STORE_SALES_LEDGER_BRANCHES.every((item) => item.tag !== 'store_occasion_card'));
assert.ok(STORE_SALES_LEDGER_BRANCHES.some((item) => item.id === 'kitchen'));
assert.ok(STORE_SALES_LEDGER_BRANCHES.some((item) => item.id === 'produce'));
assert.ok(STORE_SALES_LEDGER_COPY.leadAr.includes('افراحي1'));
assert.ok(STORE_SALES_LEDGER_COPY.leadAr.includes('تمويناتا1'));
assert.ok(STORE_SALES_LEDGER_COPY.leadAr.includes('طبختنا1'));
assert.ok(STORE_SALES_LEDGER_COPY.leadAr.includes('خضارنا1'));
assert.match(STORE_SALES_LEDGER_COPY.leadAr, /ولا بكاردي8/);
assert.ok(STORE_SALES_LEDGER_COPY.paymentAr.includes('معرّف الدفع'));
assert.ok(isStoreSalesLedgerProduct('wedding-women'));
assert.ok(isStoreSalesLedgerProduct('kitchen'));
assert.ok(isStoreSalesLedgerProduct('produce'));
assert.equal(isStoreSalesLedgerProduct('card'), false);

const secret = 'guest-token-secret-xyz';
const men = mapStoreSalesRow('wedding', {
  id: 'w1',
  status: 'live',
  buyer_name: 'خالد',
  buyer_email: 'khalid@example.com',
  price_halalas: 89900,
  moyasar_payment_id: 'pay_men',
  created_at: '2026-08-01T10:00:00.000Z',
  payload: {
    voice: 'men',
    hostName: 'والد العريس',
    groomName: 'أحمد',
    brideName: 'نورة',
    guest_token: secret,
    host_token: secret,
  },
});
const womenOnMen = mapStoreSalesRow('wedding', {
  id: 'w2',
  status: 'live',
  buyer_name: 'سارة',
  buyer_email: 'sara@example.com',
  price_halalas: 89900,
  moyasar_payment_id: 'pay_women',
  created_at: '2026-08-02T10:00:00.000Z',
  payload: { voice: 'women', hostName: 'والدة العروس', groomName: 'سعد', brideName: 'هند' },
});
const women = mapStoreSalesRow('wedding-women', {
  id: 'w2',
  status: 'live',
  buyer_name: 'سارة',
  buyer_email: 'sara@example.com',
  price_halalas: 89900,
  moyasar_payment_id: 'pay_women',
  created_at: '2026-08-02T10:00:00.000Z',
  payload: { voice: 'women', hostName: 'والدة العروس', groomName: 'سعد', brideName: 'هند' },
});

assert.ok(men);
assert.equal(men?.titleAr, 'افراحي1 رجالي');
assert.equal(men?.subjectAr, 'والد العريس · أحمد ونورة');
assert.equal(men?.amountSar, 899);
assert.equal(womenOnMen, null);
assert.ok(women);
assert.equal(women?.titleAr, 'افراحي1 نسائي');
assert.doesNotMatch(JSON.stringify(men), new RegExp(secret));
assert.doesNotMatch(mapper, /guest_token|host_token|shop_token|desk_token/);

const grocers6 = mapStoreSalesRow('grocers', {
  id: 'g1',
  status: 'live',
  buyer_name: 'تموينات الحي',
  buyer_email: 'shop@example.com',
  price_halalas: 59900,
  moyasar_payment_id: 'pay_g6',
  created_at: '2026-08-03T10:00:00.000Z',
  payload: { shopName: 'تموينات النور', packId: 'm6', chatAddon: false },
});
const grocersChat = mapStoreSalesRow('grocers', {
  id: 'g2',
  status: 'live',
  buyer_name: 'تموينات الحي',
  buyer_email: 'shop@example.com',
  price_halalas: 139800,
  moyasar_payment_id: 'pay_g12c',
  created_at: '2026-08-03T11:00:00.000Z',
  payload: { shopName: 'تموينات النور', packId: 'm12', chatAddon: true },
});
assert.equal(grocers6?.packAr, 'ستة أشهر');
assert.equal(grocersChat?.packAr, 'اثنا عشر شهراً + صندوق محادثة');
assert.equal(grocersChat?.amountSar, 1398);

const event = mapStoreSalesRow('event', {
  id: 'e1',
  status: 'live',
  buyer_name: 'فهد',
  buyer_email: 'fahd@example.com',
  price_halalas: 89900,
  moyasar_payment_id: 'pay_e',
  created_at: '2026-08-04T10:00:00.000Z',
  payload: { occasionTitle: 'مجلس عشاء', hostName: 'فهد', voice: 'men' },
});
const lounge = mapStoreSalesRow('lounge', {
  id: 'l1',
  status: 'live',
  buyer_name: 'لاونج المطار',
  buyer_email: 'lounge@example.com',
  price_halalas: 60000,
  moyasar_payment_id: 'pay_l',
  created_at: '2026-08-05T10:00:00.000Z',
  payload: { loungeName: 'قاعة الاستقبال' },
});
assert.equal(event?.subjectAr, 'مجلس عشاء');
assert.equal(event?.voice, 'men');
assert.equal(lounge?.packAr, 'ثلاثة أشهر');
assert.equal(lounge?.amountSar, 600);

const loungeYear = mapStoreSalesRow('lounge', {
  id: 'l2',
  status: 'live',
  buyer_name: 'لاونج المطار',
  buyer_email: 'lounge@example.com',
  price_halalas: 240000,
  moyasar_payment_id: 'pay_l12',
  created_at: '2026-08-05T11:00:00.000Z',
  payload: { loungeName: 'قاعة الاستقبال', packId: 'm12' },
});
assert.equal(loungeYear?.packAr, 'اثنا عشر شهراً');

const kitchen6 = mapStoreSalesRow('kitchen', {
  id: 'k1',
  status: 'live',
  buyer_name: 'أم سعد',
  buyer_email: 'kitchen@example.com',
  price_halalas: 30000,
  moyasar_payment_id: 'pay_k6',
  created_at: '2026-08-06T10:00:00.000Z',
  payload: { shopName: 'مطبخ الدار', packId: 'm6' },
});
const kitchen12 = mapStoreSalesRow('kitchen', {
  id: 'k2',
  status: 'live',
  buyer_name: 'أم سعد',
  buyer_email: 'kitchen@example.com',
  price_halalas: 60000,
  moyasar_payment_id: 'pay_k12',
  created_at: '2026-08-06T11:00:00.000Z',
  payload: { shopName: 'مطبخ الدار', packId: 'm12' },
});
const kitchenTrial = mapStoreSalesRow('kitchen', {
  id: 'k3',
  status: 'live',
  is_trial: true,
  buyer_name: 'تجربة',
  buyer_email: 'trial@example.com',
  price_halalas: 0,
  created_at: '2026-08-06T12:00:00.000Z',
  payload: { shopName: 'تجربة مطبخ', packId: 'm6', is_trial: true },
});
assert.equal(kitchen6?.titleAr, 'طبختنا1');
assert.equal(kitchen6?.packAr, 'مئة وثمانون يوماً');
assert.equal(kitchen6?.amountSar, 300);
assert.equal(kitchen12?.packAr, 'ثلاثمئة وستون يوماً');
assert.equal(kitchen12?.amountSar, 600);
assert.equal(kitchenTrial, null);

const produce6 = mapStoreSalesRow('produce', {
  id: 'p1',
  status: 'live',
  buyer_name: 'صندوق الحي',
  buyer_email: 'produce@example.com',
  price_halalas: 135000,
  moyasar_payment_id: 'pay_p6',
  created_at: '2026-08-07T10:00:00.000Z',
  payload: { shopName: 'خضار السدرة', packId: 'm6' },
});
assert.equal(produce6?.titleAr, 'خضارنا1');
assert.equal(produce6?.packAr, 'مئة وثمانون يوماً');
assert.equal(produce6?.amountSar, 1350);
assert.equal(produce6?.subjectAr, 'خضار السدرة');

const summary = summarizeStoreSales('wedding', [men!]);
assert.equal(summary.liveCount, 1);
assert.equal(summary.totalSar, 899);

assert.doesNotMatch(app, /from ['"]@\/config\/storeSalesLedger['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeWeddingLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeEventLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeGrocersLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeKitchenLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeProduceLive['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeLoungeLive['"]/);
assert.match(app, /@\/app\/admin\/store-sales\/page/);
assert.match(app, /@\/app\/admin\/store-sales\/\[product\]\/page/);
assert.match(dashboard, /ADMIN_STORE_SALES/);
assert.match(dashboard, /قيد مبيعات المتجر/);
assert.match(api, /view_overview/);
assert.match(api, /view_payments/);
assert.match(api, /is_trial/);
assert.match(mapper, /store_kitchen_live_orders/);
assert.match(mapper, /store_produce_live_orders/);
assert.doesNotMatch(api, /guest_token|host_token|shop_token|desk_token/);

console.log('store-sales-ledger: ok');
