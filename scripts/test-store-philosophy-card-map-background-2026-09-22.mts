/**
 * طلب مستخدم مباشر مصحوب بلقطة شاشة تحدّد بالضبط بطاقة الفلسفة ("ليس كل
 * حضور رقمي يقود العميل إلى نشاطك") تحت هيرو صفحة "منصة خريطة الحل":
 * "قم بوضع الصورة الخلفية في المكان الموضح بالصورة الاخرى لرئيسية منصة
 * خريطة الحل." — نفس صورة السحب/الدبابيس/البوصلة الباهتة المستخدمة في
 * هيرو StoreLandingPitchHero.tsx (patch سابق)، تُعاد هنا كخلفية للبطاقة
 * التالية له مباشرة (StoreLandingPhilosophySection.tsx)، بدل خلفيتها
 * الصلبة السابقة (bg-[#fbf6ec]).
 *
 * خلافاً للهيرو، بطاقة الفلسفة أقرب شكلاً لمربّع طويل يقارب نسبة الصورة
 * نفسها فتُظهر bg-cover bg-center معظم ارتفاعها — ما قلَّص هامش أمان تباين
 * السطر الختامي الذهبي الفاتح (#5c4a1a) إلى 4.78:1 دون حماية (قريب من حد
 * WCAG AA 4.5:1). لذلك أُضيفت طبقة حجاب بيج شفافة موحَّدة (bg-[#fbf6ec]/35)
 * فوق الصورة — رفعت التباين لأسوأ نقطة إلى 5.77:1، مع بقاء نقش الصورة
 * واضحاً خلف الحجاب الخفيف.
 *
 * يتحقق هذا الاختبار من:
 * ١) أن البطاقة تستخدم نفس ملف الصورة خلفيةً (bg-cover bg-center) داخل
 *    حاوية overflow-hidden تحترم الزوايا المدوَّرة.
 * ٢) أن bg-[#fbf6ec] الصلبة القديمة على البطاقة نفسها أُزيلت (حلّت الصورة
 *    محلها) لكن حجاب الحماية الشفاف (bg-[#fbf6ec]/35) موجود فوقها.
 * ٣) أن data-contrast-guard-manual-bg مضافة على حاوية البطاقة.
 * ٤) أن نصوص البطاقة الثلاثة (العنوان والفقرات والسطر الختامي) بألوانها
 *    الداكنة الأصلية لم تتغيّر، وأنها تعلو طبقتي الخلفية عبر z-10.
 * ٥) أن الحدود (border) بقيت كما هي.
 *
 * تشغيل: npx tsx scripts/test-store-philosophy-card-map-background-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const src = readFileSync(p('src/components/store/StoreLandingPhilosophySection.tsx'), 'utf8');

// ── ١) حاوية البطاقة: relative + overflow-hidden + manual-bg + بلا bg-[#fbf6ec] صلبة على نفسها
const cardDivMatch = src.match(
  /data-contrast-guard-manual-bg="true"\s*\n\s*className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-\[#dac8aa\] px-5 py-6 md:px-8 md:py-8"/,
);
assert.ok(cardDivMatch, 'حاوية البطاقة يجب أن تكون relative overflow-hidden وتحمل data-contrast-guard-manual-bg، بلا bg-[#fbf6ec] صلبة على نفس السطر');

// ── ٢) طبقة الصورة نفسها ────────────────────────────────────────────────
assert.match(
  src,
  /className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"[\s\S]{0,150}store-hero-map-illustration\.webp/,
  'يجب وجود طبقة خلفية منفصلة تستخدم نفس صورة خريطة الحل عبر bg-cover bg-center',
);

// ── ٣) طبقة الحجاب الواقي الشفافة فوق الصورة ──────────────────────────────
assert.match(
  src,
  /className="pointer-events-none absolute inset-0 z-0 bg-\[#fbf6ec\]\/35"/,
  'يجب وجود حجاب بيج شفاف موحَّد (35%) فوق الصورة لحماية تباين السطر الختامي',
);

// ── ٤) نصوص البطاقة الداكنة الأصلية بقيت كما هي، وتعلو الخلفية عبر z-10 ────
assert.match(src, /text-\[#1a140c\]/, 'لون عنوان البطاقة يجب أن يبقى كما هو');
assert.match(src, /text-\[#3d3226\]/, 'لون فقرات البطاقة يجب أن يبقى كما هو');
assert.match(src, /text-\[#5c4a1a\]/, 'لون السطر الختامي يجب أن يبقى كما هو');
assert.match(src, /<div className="relative z-10">/, 'محتوى النص يجب أن يعلو طبقتي الخلفية عبر z-10');

// ── ٥) الحدود بقيت ──────────────────────────────────────────────────────
assert.match(src, /border border-\[#dac8aa\]/, 'حدود البطاقة يجب أن تبقى كما هي');

console.log('✅ خلفية بطاقة فلسفة "خريطة الحل" (نفس صورة السحب/البوصلة + حجاب حماية) موثَّقة ومُتحقَّق منها بالكامل.');
