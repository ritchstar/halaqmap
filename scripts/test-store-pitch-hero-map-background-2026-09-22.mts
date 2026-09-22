/**
 * طلب مستخدم مباشر (بصورة توضيحية باهتة الألوان — سُحُب زجاجية، دبابيس موقع،
 * بوصلة مضيئة — مع لقطة شاشة مؤكِّدة لهيرو صفحة "منصة خريطة الحل"):
 * "قم بوضع هذه الصورة خلفية للهيرو في الصفحة الرئيسية لخريطة الحل."
 *
 * يختلف هذا الهيرو جذرياً عن هيرو LandingPreview.tsx (الصالون الداكن):
 * الصورة الجديدة فاتحة في كل نقطة منها تقريباً، ونصوص الهيرو الحالية
 * بالحبر الداكن (#2e2418 وما شابه) مصمَّمة أصلاً للوحة الغلاف الفاتحة
 * (store-light-canvas) — فبقيت كما هي دون أي تحويل للأبيض، ودون أي طبقة
 * تعتيم واقية (محاكاة luminance فعلية أكّدت تبايناً 8.4:1–10.85:1 في أسوأ
 * الحالات، أعلى بكثير من حد WCAG AA 4.5:1).
 *
 * يتحقق هذا الاختبار من:
 * ١) وجود ملف الصورة بحجم محسَّن للويب.
 * ٢) أن <section id="store-pitch-hero"> يستخدمها فعلياً كخلفية (bg-cover
 *    bg-center، طبقة absolute z-0 منفصلة عن محتوى النص).
 * ٣) أن `data-contrast-guard-manual-bg` مضافة على القسم (الخلفية الفعلية
 *    صورة لا يراها حارسا التباين التلقائيان).
 * ٤) أن نصوص الهيرو الداكنة الأصلية لم تتغيّر (لا حاجة لتحويلها لفاتح هنا،
 *    خلافاً لهيرو LandingPreview.tsx الداكن).
 * ٥) أن محتوى النص (الشعار/العنوان/الأزرار) بقي فوق طبقة الخلفية (z-10).
 *
 * تشغيل: npx tsx scripts/test-store-pitch-hero-map-background-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const src = readFileSync(p('src/components/store/StoreLandingPitchHero.tsx'), 'utf8');

// ── ١) ملف الصورة موجود وبحجم محسَّن للويب ────────────────────────────────
const imgStat = statSync(p('public/images/store-hero-map-illustration.webp'));
assert.ok(imgStat.isFile(), 'ملف صورة خلفية هيرو خريطة الحل يجب أن يكون موجوداً');
assert.ok(
  imgStat.size < 400 * 1024,
  `صورة خلفية الهيرو يجب أن تبقى محسَّنة (أقل من 400KB) — كانت ${(imgStat.size / 1024).toFixed(0)}KB`,
);

// ── ٢) القسم يستخدم الصورة خلفيةً عبر طبقة absolute منفصلة ────────────────
assert.match(
  src,
  /<section\s+id="store-pitch-hero"\s+data-contrast-guard-manual-bg="true"\s+className="relative overflow-x-clip/,
  'قسم الهيرو يجب أن يكون relative ويحمل data-contrast-guard-manual-bg',
);
assert.match(
  src,
  /className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"[\s\S]{0,200}store-hero-map-illustration\.webp/,
  'يجب وجود طبقة خلفية منفصلة (absolute inset-0 z-0) تستخدم صورة خريطة الحل عبر bg-cover bg-center',
);

// ── ٣) سمة الانسحاب من حارسي التباين موجودة على القسم ─────────────────────
assert.match(
  src,
  /data-contrast-guard-manual-bg="true"/,
  'يجب وضع data-contrast-guard-manual-bg لأن الخلفية الفعلية صورة لا يراها الحارسان',
);

// ── ٤) نصوص الحبر الداكن الأصلية بقيت دون تغيير (لا تحويل لأبيض هنا) ──────
for (const darkText of ['text-[#2e2418]', 'text-[#6f6250]', 'text-[#1a140c]', 'text-[#3d3226]']) {
  assert.match(src, new RegExp(darkText.replace(/[[\]#]/g, '\\$&')), `يجب أن يبقى ${darkText} كما هو`);
}
// ملاحظة: زر "حمّل تطبيق المشغّلين" الداكن (bg-[#0d1a16]) يستخدم text-white
// شرعياً (نص فاتح فوق بطاقة داكنة صريحة، لا فوق الصورة الفاتحة مباشرة) — لا
// علاقة له بخلفية الهيرو المصوَّرة، فلا يُفحص هنا.
const shopNameLine = src.match(/<p className="text-xl font-black[\s\S]*?<\/p>/)?.[0] ?? '';
assert.doesNotMatch(shopNameLine, /text-white/, 'اسم المتجر أعلى الهيرو يجب أن يبقى بالحبر الداكن فوق الصورة الفاتحة');

// ── ٥) محتوى النص فوق طبقة الخلفية (z-10) ─────────────────────────────────
assert.match(
  src,
  /<div className="relative z-10 mx-auto max-w-3xl text-center md:text-start">/,
  'حاوية محتوى النص يجب أن تعلو طبقة الخلفية عبر z-10',
);

console.log('✅ خلفية هيرو "خريطة الحل" (صورة السحب/البوصلة الباهتة) موثَّقة ومُتحقَّق منها بالكامل.');
