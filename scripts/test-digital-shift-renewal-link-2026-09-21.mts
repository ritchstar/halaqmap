/**
 * المناوب الرقمي يجب ألا يزوّد الحلاق برابط دفع عارٍ /#/partners/payment
 * (يُسقطه في missing_tier بلا بوابة). المسار الصحيح: زر التجديد أسفل اللوحة
 * أو رابط شحن كامل فيه purpose=recharge وtier وlinkedBarberId.
 *
 * تشغيل: npx tsx scripts/test-digital-shift-renewal-link-2026-09-21.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'api/_lib/digitalShiftAssistant.ts'), 'utf8');

assert.doesNotMatch(
  src,
  /رابط تجديد الحزمة \/ الدفع: https:\/\/halaqmap\.com\/#\/partners\/payment(?!\?)/,
  'يجب ألا يبقى رابط الدفع العاري في برومبت المناوب',
);
assert.match(src, /تجديد \/ شحن الحزمة/);
assert.match(src, /purpose.*recharge|purpose: 'recharge'/);
assert.match(src, /linkedBarberId/);
assert.match(src, /ممنوع إرسال الرابط العاري/);

const office = readFileSync(join(root, 'src/components/barber/DigitalShiftPrivateOffice.tsx'), 'utf8');
assert.match(office, /كيف أجدّد الحزمة؟/);
assert.doesNotMatch(office, /أرسل لي رابط التجديد/);

console.log('✅ برومبت المناوب يوجّه لزر التجديد ولا يرسل رابط دفع ناقص.');
