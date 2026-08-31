/**
 * تنبيه الطلب أعلى لوحات الكاشير: نغمات وضوء وإشعار جهاز، بلا خلط بالصالون.
 * تشغيل: npx tsx scripts/test-store-desk-order-alert.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_DESK_ORDER_ALERT_ACCENT,
  STORE_DESK_ORDER_ALERT_COPY,
  STORE_DESK_ORDER_ALERT_PRODUCTS,
  STORE_DESK_ORDER_ALERT_TONE_AR,
  STORE_DESK_ORDER_ALERT_TONES,
} from '../src/config/storeDeskOrderAlert.ts';
import { DEFAULT_STORE_DESK_ORDER_ALERT_PREFS } from '../src/lib/storeDeskOrderAlert.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const lib = readFileSync(join(root, 'src/lib/storeDeskOrderAlert.ts'), 'utf8');
const hook = readFileSync(join(root, 'src/hooks/useStoreDeskOrderAlert.ts'), 'utf8');
const ui = readFileSync(join(root, 'src/components/store/StoreDeskOrderAlert.tsx'), 'utf8');
const css = readFileSync(join(root, 'src/index.css'), 'utf8');

assert.deepEqual([...STORE_DESK_ORDER_ALERT_PRODUCTS], ['grocers', 'restaurant', 'cafe', 'kitchen', 'produce']);
assert.deepEqual([...STORE_DESK_ORDER_ALERT_TONES], ['bell', 'chime', 'pulse', 'market']);
assert.equal(STORE_DESK_ORDER_ALERT_COPY.titleAr, 'تنبيه الطلبات');
assert.match(STORE_DESK_ORDER_ALERT_COPY.leadAr, /فعّل التنبيه/);
assert.match(STORE_DESK_ORDER_ALERT_COPY.phoneAr, /إشعار الجهاز/);
assert.match(STORE_DESK_ORDER_ALERT_COPY.lightAr, /الضوئي/);
assert.equal(STORE_DESK_ORDER_ALERT_TONE_AR.market, 'نداء السوق');
assert.equal(DEFAULT_STORE_DESK_ORDER_ALERT_PREFS.armed, false);
assert.equal(DEFAULT_STORE_DESK_ORDER_ALERT_PREFS.phoneNotify, true);
assert.equal(STORE_DESK_ORDER_ALERT_ACCENT.kitchen, '#b45a3c');

assert.match(lib, /unlockStoreDeskOrderAlertAudio/);
assert.match(lib, /showStoreDeskOrderNotice/);
assert.match(lib, /wakeLock/);
assert.match(lib, /navigator\.vibrate/);
assert.doesNotMatch(lib, /barberDashboardChatAlert|barberChatPush/);
assert.match(hook, /repeatWhileUnread/);
assert.match(ui, /StoreDeskOrderAlert/);
assert.match(css, /store-desk-order-alert-light/);
assert.doesNotMatch(app, /storeDeskOrderAlert/);
assert.doesNotMatch(app, /StoreDeskOrderAlert/);

const desks = {
  grocers: 'src/components/store/StoreGrocersDesk.tsx',
  restaurant: 'src/components/store/StoreRestaurantDesk.tsx',
  cafe: 'src/components/store/StoreCafeDesk.tsx',
  kitchen: 'src/components/store/StoreKitchenDesk.tsx',
  produce: 'src/components/store/StoreProduceDesk.tsx',
} as const;

for (const [product, file] of Object.entries(desks)) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.match(src, /StoreDeskOrderAlert/);
  assert.match(src, new RegExp(`product="${product}"`));
  assert.doesNotMatch(src, /play(Kitchen|Grocers|Restaurant|Cafe|Produce)Beep/);
}

const help = readFileSync(join(root, 'src/config/storeDeskHelp.ts'), 'utf8');
assert.match(help, /فعّل تنبيه الطلبات أعلى اللوحة/);
assert.match(help, /تم الاستلام ثم أرشفة وإنهاء/);

console.log('store-desk-order-alert: ok');
