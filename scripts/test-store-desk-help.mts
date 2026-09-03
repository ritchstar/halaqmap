/**
 * صندوق التعليمات والدعم أسفل لوحات الكاشير، بلا خلط بين المنتجات.
 * تشغيل: npx tsx scripts/test-store-desk-help.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_DESK_HELP,
  STORE_DESK_HELP_COPY,
  STORE_DESK_HELP_PRODUCTS,
} from '../src/config/storeDeskHelp.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const help = readFileSync(join(root, 'src/components/store/StoreDeskHelpSupport.tsx'), 'utf8');
const purchased = readFileSync(join(root, 'src/components/store/StorePurchasedShell.tsx'), 'utf8');

assert.equal(STORE_DESK_HELP_COPY.titleAr, 'التعليمات والدعم');
assert.match(STORE_DESK_HELP_COPY.supportPageAr, /صفحة الدعم/);
assert.match(STORE_DESK_HELP_COPY.whatsappAr, /واتساب/);
assert.match(STORE_DESK_HELP_COPY.chatAr, /محادثة مباشرة مع الإدارة/);
assert.deepEqual([...STORE_DESK_HELP_PRODUCTS], ['grocers', 'restaurant', 'cafe', 'kitchen', 'produce', 'halana']);

const foreign = {
  grocers: /مطعمنا1|كافينا1|طبختنا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8|حلانا1/,
  restaurant: /تمويناتا1|كافينا1|طبختنا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8|حلانا1/,
  cafe: /تمويناتا1|مطعمنا1|طبختنا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8|حلانا1/,
  kitchen: /تمويناتا1|مطعمنا1|كافينا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8|حلانا1/,
  produce: /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|افراحي1|اجواء1|لاونجا1|كاردي8|حلانا1/,
  halana: /تمويناتا1|مطعمنا1|كافينا1|طبختنا1|خضارنا1|افراحي1|اجواء1|لاونجا1|كاردي8/,
} as const;

for (const product of STORE_DESK_HELP_PRODUCTS) {
  const pack = STORE_DESK_HELP[product];
  assert.ok(pack.stepsAr.length >= 3);
  assert.match(pack.whatsappPrefillAr, new RegExp(pack.productAr));
  assert.doesNotMatch(pack.stepsAr.join('\n'), foreign[product]);
  assert.doesNotMatch(pack.whatsappPrefillAr, foreign[product]);
  if (product !== 'halana') {
    assert.match(pack.stepsAr.join('\n'), /تم الاستلام ثم أرشفة وإنهاء/);
  }
}

assert.match(help, /useState\(false\)/);
assert.match(help, /FounderDeskVisitorChat/);
assert.match(help, /origin="store"/);
assert.match(help, /buildWhatsAppChatHref/);
assert.doesNotMatch(help, /مؤسس/);
assert.doesNotMatch(purchased, /StoreDeskHelpSupport/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeDeskHelp['"]/);
assert.doesNotMatch(app, /from ['"]@\/components\/store\/StoreDeskHelpSupport['"]/);

const desks = {
  grocers: 'src/components/store/StoreGrocersDesk.tsx',
  restaurant: 'src/components/store/StoreRestaurantDesk.tsx',
  cafe: 'src/components/store/StoreCafeDesk.tsx',
  kitchen: 'src/components/store/StoreKitchenDesk.tsx',
  produce: 'src/components/store/StoreProduceDesk.tsx',
  halana: 'src/pages/store/StoreHalanaShopPage.tsx',
} as const;

for (const [product, file] of Object.entries(desks)) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.match(src, /StoreDeskHelpSupport/);
  assert.match(src, new RegExp(`product="${product}"`));
}

console.log('store-desk-help: ok');
