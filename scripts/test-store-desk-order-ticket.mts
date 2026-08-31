/**
 * مراحل تذكرة الكاشير وأرشيف الألف نسخة، بلا خلط بـ App.
 * تشغيل: npx tsx scripts/test-store-desk-order-ticket.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_DESK_ORDER_ARCHIVE_CAP,
  STORE_DESK_ORDER_LIVE_CAP,
  STORE_DESK_ORDER_TICKET_COPY,
} from '../src/config/storeDeskOrderTicket.ts';
import {
  deskOrderPhase,
  finishDeskTicket,
  hydrateDeskTickets,
  isLiveDeskTicket,
  mergeLiveOrdersOnPoll,
  receiveDeskTicket,
} from '../src/lib/storeDeskOrderTicket.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');

assert.equal(STORE_DESK_ORDER_ARCHIVE_CAP, 1000);
assert.equal(STORE_DESK_ORDER_LIVE_CAP, 80);
assert.equal(STORE_DESK_ORDER_TICKET_COPY.deskTitleAr, 'صفحة الكاشير والتحكم لإدارة العرض والطلبات');
assert.equal(STORE_DESK_ORDER_TICKET_COPY.kitchenTitleAr, 'صفحة النشاط والتحكم لإدارة العرض والطلبات');
assert.equal(STORE_DESK_ORDER_TICKET_COPY.receivedAr, 'تم الاستلام');
assert.equal(STORE_DESK_ORDER_TICKET_COPY.finishAr, 'أرشفة وإنهاء');

assert.equal(deskOrderPhase({ id: 'a' }), 'new');
assert.equal(deskOrderPhase({ id: 'b', seen: true }), 'received');
assert.equal(deskOrderPhase({ id: 'c', seen: false, phase: 'received' }), 'received');
assert.equal(isLiveDeskTicket({ id: 'd', phase: 'done' }), false);

const hydrated = hydrateDeskTickets(
  [
    { id: 'n1' },
    { id: 's1', seen: true },
    { id: 'd1', phase: 'done' },
    { id: 'dup', ticketNo: 9 },
  ],
  [{ id: 'dup', ticketNo: 9, phase: 'done' }],
);
assert.deepEqual(
  hydrated.orders.map((item) => item.id),
  ['n1', 's1'],
);
assert.equal(deskOrderPhase(hydrated.orders[0]), 'new');
assert.equal(deskOrderPhase(hydrated.orders[1]), 'received');
assert.ok(hydrated.orderArchive.some((item) => item.id === 'd1'));
assert.ok(hydrated.orderArchive.some((item) => item.id === 'dup'));

const received = receiveDeskTicket([{ id: 'n1' }, { id: 'n2' }], 'n1');
assert.equal(deskOrderPhase(received[0]), 'received');
assert.equal(received[0].seen, true);
assert.equal(deskOrderPhase(received[1]), 'new');

const finished = finishDeskTicket(received, [], 'n1');
assert.equal(finished.orders.length, 1);
assert.equal(finished.orders[0].id, 'n2');
assert.equal(finished.orderArchive.length, 1);
assert.equal(finished.finished?.id, 'n1');
assert.equal(finished.finished?.phase, 'done');

const fullArchive = Array.from({ length: STORE_DESK_ORDER_ARCHIVE_CAP }, (_, i) => ({ id: `old-${i}` }));
const overflow = finishDeskTicket([{ id: 'fresh' }], fullArchive, 'fresh');
assert.equal(overflow.orderArchive.length, STORE_DESK_ORDER_ARCHIVE_CAP);
assert.equal(overflow.orderArchive[0].id, 'fresh');
assert.equal(overflow.trimmed, true);
assert.ok(!overflow.orderArchive.some((item) => item.id === `old-${STORE_DESK_ORDER_ARCHIVE_CAP - 1}`));

assert.deepEqual(
  mergeLiveOrdersOnPoll([{ id: 'hold' }], [{ id: 'new' }, { id: 'hold' }]).map((item) => item.id),
  ['new', 'hold'],
);

assert.doesNotMatch(app, /storeDeskOrderTicket/);
assert.doesNotMatch(app, /StoreDeskControlTitle/);
assert.doesNotMatch(app, /StoreDeskArchiveDock/);
assert.doesNotMatch(app, /StoreDeskTicketActions/);

const desks = {
  grocers: 'src/components/store/StoreGrocersDesk.tsx',
  restaurant: 'src/components/store/StoreRestaurantDesk.tsx',
  cafe: 'src/components/store/StoreCafeDesk.tsx',
  kitchen: 'src/components/store/StoreKitchenDesk.tsx',
  produce: 'src/components/store/StoreProduceDesk.tsx',
} as const;

for (const src of Object.values(desks)) {
  const text = readFileSync(join(root, src), 'utf8');
  assert.match(text, /StoreDeskControlTitle/, src);
  assert.match(text, /StoreDeskArchiveDock/, src);
  assert.match(text, /StoreDeskTicketActions/, src);
  assert.match(text, /applyDeskFinish/, src);
  assert.doesNotMatch(text, /علّم مقروءاً/, src);
  assert.doesNotMatch(text, /downloadArchive/, src);
  assert.doesNotMatch(text, /StoreTrialOpsNote/, src);
}

assert.match(readFileSync(join(root, desks.kitchen), 'utf8'), /kitchen\n/);
assert.match(readFileSync(join(root, desks.kitchen), 'utf8'), /markReady/);

const shops = [
  'src/pages/store/StoreRestaurantShopPage.tsx',
  'src/pages/store/StoreGrocersShopPage.tsx',
  'src/pages/store/StoreCafeShopPage.tsx',
  'src/pages/store/StoreKitchenShopPage.tsx',
  'src/pages/store/StoreProduceShopPage.tsx',
] as const;

for (const rel of shops) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /hydrateDeskTickets/, rel);
  assert.match(src, /orderArchive/, rel);
}

const apis = [
  'api/_lib/storeRestaurantLive.ts',
  'api/_lib/storeGrocersLive.ts',
  'api/_lib/storeCafeLive.ts',
  'api/_lib/storeKitchenLive.ts',
  'api/_lib/storeProduceLive.ts',
] as const;

for (const rel of apis) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert.match(src, /role === 'desk' && Array.isArray\(payload.orderArchive\)/, rel);
}

const help = readFileSync(join(root, 'src/config/storeDeskHelp.ts'), 'utf8');
assert.match(help, /تم الاستلام ثم أرشفة وإنهاء/);

console.log('store-desk-order-ticket: ok');
