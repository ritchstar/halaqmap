/**
 * تحويل الصفحة الرئيسية (/) ومسار الشركاء (/partners) من الكانفاس الداكن
 * (platform-dark) إلى بيج خريطة الحل الفاتح (store-light-canvas)، بنفس منطق
 * StoreVisitorShell: غلاف جذري فاتح + تفعيل حارسي التباين (StoreButtonContrastGuard
 * وStoreTextContrastGuard) عبر توسيع isStoreCustomerSurface، بدل إعادة كتابة
 * كل فئة نص يدوياً في عشرات الملفات.
 *
 * تشغيل: npx tsx scripts/test-landing-partners-light-theme.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isStoreCustomerSurface } from '../src/lib/storeCustomerSurface.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// النطاق: الحارسان يجب أن يعملا الآن على الرئيسية ومسار الشركاء أيضاً.
assert.equal(isStoreCustomerSurface('/'), true, 'الرئيسية يجب أن تدخل نطاق حارسي التباين');
assert.equal(isStoreCustomerSurface('/partners'), true, 'مسار الشركاء يجب أن يدخل نطاق حارسي التباين');
assert.equal(isStoreCustomerSurface('/partners/anything'), true);
// مسارات أخرى غير معنية يجب ألا تتأثر (تفادي توسّع غير مقصود للنطاق).
assert.equal(isStoreCustomerSurface('/dashboard'), false);
assert.equal(isStoreCustomerSurface('/login'), false);

function assertLightCanvasRoot(relPath: string, label: string) {
  const source = readFileSync(join(root, relPath), 'utf8');
  assert.match(source, /store-light-canvas/, `${label}: يجب أن يحمل الغلاف الجذري store-light-canvas`);
  assert.doesNotMatch(source, /platform-dark/, `${label}: لا يجب أن يبقى platform-dark على الغلاف الجذري`);
  assert.doesNotMatch(source, /platform-ambient/, `${label}: لا يجب أن يبقى نظام الإضاءة المحيطية الداكن`);
  assert.doesNotMatch(source, /hm-app-dark-canvas/, `${label}: لا يجب أن يبقى إجبار الكانفاس الداكن على <html>`);
  assert.doesNotMatch(source, /bg-\[#020912\]/, `${label}: لا يجب أن تبقى خلفية الكانفاس الداكن #020912`);
}

assertLightCanvasRoot('src/pages/LandingPreview.tsx', 'الصفحة الرئيسية');
assertLightCanvasRoot('src/pages/PartnerMarketingPreview.tsx', 'صفحة مسار الشركاء');

// حارس ضد ترك بطاقات/شارات بلون نص غامق فوق خلفية متدرّجة داكنة الأصل (خطأ
// نمطي مؤكَّد أثناء هذا التحويل: bg-gradient-to-l from-teal-500 to-cyan-500
// مع text-[#2e2418] بدل text-white — يبقى مقروءاً لأن حارس التباين يصحّحه وقت
// التشغيل، لكن ثبّته هنا في المصدر مباشرة أوضح وأخف من الاعتماد على التصحيح).
for (const [relPath, label] of [
  ['src/pages/LandingPreview.tsx', 'الصفحة الرئيسية'],
  ['src/pages/PartnerMarketingPreview.tsx', 'صفحة مسار الشركاء'],
] as const) {
  const source = readFileSync(join(root, relPath), 'utf8');
  const badButton = /bg-gradient-to-l from-teal-500 to-(?:cyan|teal)-\d{3}[^"]*text-\[#2e2418\]/;
  assert.doesNotMatch(source, badButton, `${label}: زر بخلفية متدرّجة داكنة يجب أن يستخدم text-white لا حبر غامق`);
}

// حارس ضد "علّة CertificateMockup": بطاقة الشهادة داخل صفحة مسار الشركاء
// بقيت عمداً داكنة (خلفية تدرّج تيل غامقة)، لكن تمريرة التحويل الآلي
// (regex) لامست عناصرها الفرعية خطأً في جولة أولى وحوّلتها فاتحة رغم أن
// الحاوية الأم لم تتحوّل. ثبّت هنا أن العناصر الداخلية ما زالت بألوانها
// الداكنة الصحيحة (نص أبيض فوق خلفية داكنة) — أي رجوع لاحق يكسر هذا الحارس.
{
  const source = readFileSync(join(root, 'src/pages/PartnerMarketingPreview.tsx'), 'utf8');
  assert.match(
    source,
    /text-base font-black text-white sm:text-lg">شهادة تفعيل رقمية/,
    'CertificateMockup: عنوان الشهادة يجب أن يبقى نصاً أبيض فوق البطاقة الداكنة',
  );
  assert.match(
    source,
    /rounded-2xl border border-white\/14 bg-black\/30/,
    'CertificateMockup: صندوق اسم الصالون يجب أن يبقى داكناً (border-white\\/14 bg-black\\/30)',
  );
  assert.match(
    source,
    /rounded-xl border border-white\/12 bg-white\/\[0\.07\]/,
    'CertificateMockup: صناديق الإحصائيات يجب أن تبقى داكنة (bg-white/[0.07])',
  );
}

// حارس ضد "علّة تصادم حالة hover": تحويل قاعدة وhover لنفس الخاصية إلى نفس
// القيمة يُفقد إشارة التفاعل البصرية عند المرور بالفأرة (وقعت فعلياً أثناء
// هذا التحويل في PartnerMarketingPreview.tsx وVisitorServiceIntentRail.tsx).
for (const relPath of [
  'src/pages/LandingPreview.tsx',
  'src/pages/PartnerMarketingPreview.tsx',
  'src/components/landing/VisitorServiceIntentRail.tsx',
] as const) {
  const source = readFileSync(join(root, relPath), 'utf8');
  assert.doesNotMatch(
    source,
    /bg-\[#fbf6ec\][^"'`]*hover:bg-\[#fbf6ec\]/,
    `${relPath}: لا يجب أن تتطابق خلفية القاعدة وخلفية hover (تفقد إشارة التفاعل)`,
  );
}

// حارس ضد بقايا "توهّج" نص أبيض (text-shadow) من الكانفاس الداكن القديم:
// كان مصمَّماً ليجعل النص الأبيض يبرز فوق خلفية داكنة، وأصبح بلا معنى
// (بل يُلخبط القراءة) فوق الخلفية البيج الفاتحة الجديدة.
{
  const source = readFileSync(join(root, 'src/pages/LandingPreview.tsx'), 'utf8');
  assert.doesNotMatch(
    source,
    /text-shadow:0_0_\d+px_rgba\(255,255,255/,
    'الصفحة الرئيسية: لا يجب أن يبقى توهّج نص أبيض مصمَّم للكانفاس الداكن القديم',
  );
}

console.log('landing-partners-light-theme: ok');
