/**
 * تغطية سكربت index.html لإعادة توجيه عودة ميسر (قبل تحميل React) لكل purpose معروف.
 *
 * الخلل المُصلَح: عودة دفع مدرسة البلوت (وبالمثل مدرسة الشطرنج وخضارنا1 المباشر
 * وتمرتنا1 المباشر) كانت تسقط في مسار الشراكة العام /partners/payment بدل صفحة
 * الدفع الفعلية، لأن سكربت index.html (نسخة مطابقة يدوياً لـ storePayReturnPath
 * في src/lib/moyasarPaymentReturn.ts) لم يكن يعرف purpose='baloot_school' ولا
 * 'chess_school' ولا 'store_produce_live' ولا 'store_dates_live' — رغم أن
 * الدالة TS المصدر تدعمها جميعاً. النتيجة: دفعة ناجحة فعلياً تُعرض كنجاح
 * اشتراك صالون عام («دخول لوحة الصالون») بدل صفحة المدرسة/المنتج الصحيحة.
 *
 * تشغيل: npx tsx scripts/test-moyasar-return-redirect-coverage.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const moyasarReturnLib = readFileSync(join(root, 'src/lib/moyasarPaymentReturn.ts'), 'utf8');

// كل purpose تدعمه src/lib/moyasarPaymentReturn.ts (storePayReturnPath) يجب أن
// يكون مذكوراً أيضاً في سكربت index.html المستقل، وإلا سقطت عودة هذا المنتج في
// المسار العام. هذه القائمة يجب تحديثها عند إضافة منتج مباشر أو مدرسة جديدة.
const REQUIRED_PURPOSES = [
  'store_occasion_card',
  'store_wedding_live',
  'store_event_live',
  'store_lounge_live',
  'store_grocers_live',
  'store_restaurant_live',
  'store_cafe_live',
  'store_kitchen_live',
  'store_halana_live',
  'store_produce_live',
  'store_dates_live',
  'chess_school',
  'baloot_school',
] as const;

// بعض الدوال في moyasarPaymentReturn.ts تقارن purpose بثابت مستورد
// (CHESS_SCHOOL_PRODUCT / BALOOT_SCHOOL_PRODUCT) لا بحرف نصي مباشر.
const PURPOSE_CONST_ALIASES: Partial<Record<(typeof REQUIRED_PURPOSES)[number], string>> = {
  chess_school: 'CHESS_SCHOOL_PRODUCT',
  baloot_school: 'BALOOT_SCHOOL_PRODUCT',
};

for (const purpose of REQUIRED_PURPOSES) {
  const alias = PURPOSE_CONST_ALIASES[purpose];
  const libPattern = alias
    ? new RegExp(`purpose !== ${alias}|purpose === ${alias}`)
    : new RegExp(`purpose !== '${purpose}'|purpose === '${purpose}'`);
  assert.match(
    moyasarReturnLib,
    libPattern,
    `moyasarPaymentReturn.ts يجب أن يتعامل مع purpose='${purpose}'`,
  );
  assert.match(
    indexHtml,
    new RegExp(`'${purpose}'`),
    `index.html (سكربت عودة ميسر قبل React) لا يعرف purpose='${purpose}' — سيسقط في /partners/payment العام`,
  );
}

// مسارا مدرسة البلوت ومدرسة الشطرنج تحديداً — أهداف إعادة التوجيه الصحيحة.
assert.match(indexHtml, /\/baloot\/school\/pay\//);
assert.match(indexHtml, /baloot_school_rid/);
assert.match(indexHtml, /\/chess\/school\/pay\//);
assert.match(indexHtml, /chess_school_rid/);
assert.match(indexHtml, /\/pay\/produce\//);
assert.match(indexHtml, /\/pay\/dates\//);

console.log('test-moyasar-return-redirect-coverage: ok');
