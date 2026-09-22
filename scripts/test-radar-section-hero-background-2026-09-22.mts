/**
 * طلب مستخدم مباشر (بلقطة شاشة محدَّدة بخط أصفر على هامشين فارغين، يمين
 * ويسار بطاقة "رادار المملكة — نبض حي"، على الشاشات العريضة سطح المكتب):
 * استخدام نفس صورة خلفية الهيرو (landing-hero-barbershop.webp) خلفيةً لقسم
 * الرادار أيضاً بدل اللون البيج المسطَّح (#fbf6ec) وحده.
 *
 * مؤكَّد بمحاكاة حسابية دقيقة لقصّ bg-cover على أبعاد حاوية عريضة وقصيرة
 * نسبياً (نمطية لهذا القسم على سطح المكتب): على عكس هيرو الجوال (حيث
 * بg-center كانت المشكلة)، هنا نسبة عرض/ارتفاع الحاوية أكبر من نسبة
 * الصورة، فيُحسَب القصّ بحسب العرض ويظهر عرض الصورة كاملاً — كرسيا الحلاقة
 * + الإضاءة الذهبية + المرآتان على طرَفي الصورة كليهما، تماماً في الهامشين
 * اللذين حدّدهما المستخدم — بينما يبقى مركز الصورة (اللوح الزجاجي المفرَغ
 * أصلاً لاستضافة محتوى) خلف بطاقة الرادار المعتمة نفسها.
 *
 * الإصلاح: إضافة نفس صورة خلفية الهيرو + bg-cover bg-center لقسم الرادار،
 * مع تعتيم رأسي خفيف عند الحافتين العلوية والسفلية فقط لإذابة الانتقال في
 * بيج الصفحة المحيط. بطاقة الرادار نفسها (اللغة، الخريطة، الألوان) لم
 * تتغيّر إطلاقاً — فقط خلفية القسم حولها.
 *
 * تشغيل: npx tsx scripts/test-radar-section-hero-background-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/pages/LandingPreview.tsx'), 'utf8');

// ── ١) عزل قسم "رادار المملكة" (بعد نتائج البحث، سطح المكتب فقط) ────────
const sectionMatch = src.match(
  /\{\/\* ── رادار المملكة[\s\S]*?<\/section>\s*\) : null\}/,
);
assert.ok(sectionMatch, 'يجب العثور على قسم "رادار المملكة" كاملاً لفحصه');
const section = sectionMatch![0];

// ── ٢) القسم لا يزال مقيَّداً بسطح المكتب (!isMobile) ولم يفقد بنيته ─────
assert.match(section, /\{!isMobile \? \(/, 'يجب أن يبقى القسم خاصاً بسطح المكتب (!isMobile) كما كان');
assert.match(
  section,
  /<LandingPulseRadarHero \/>/,
  'يجب أن تبقى بطاقة LandingPulseRadarHero نفسها دون أي تعديل على محتواها',
);

// ── ٣) صورة خلفية الهيرو نفسها مضافة كخلفية للقسم (bg-cover bg-center) ──
assert.match(
  section,
  /backgroundImage:\s*"url\('\/images\/landing-hero-barbershop\.webp'\)"/,
  'يجب إضافة نفس صورة خلفية الهيرو (landing-hero-barbershop.webp) كخلفية لقسم الرادار',
);
assert.match(
  section,
  /className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"/,
  'خلفية قسم الرادار يجب أن تستخدم bg-cover bg-center — القسم عريض وقصير نسبياً فيُظهر طرَفي الصورة كليهما دون حاجة لموضع مخصَّص',
);

// ── ٤) تعتيم رأسي خفيف عند الحافتين لإذابة الانتقال في بيج الصفحة ────────
assert.match(
  section,
  /linear-gradient\(180deg, #fbf6ec 0%, rgba\(251,246,236,0\.08\) 16%, rgba\(251,246,236,0\.08\) 84%, #fbf6ec 100%\)/,
  'يجب وجود تعتيم رأسي خفيف عند حافتي القسم لإذابة الانتقال في البيج المحيط',
);

// ── ٥) البطاقة المعتمة فوق الخلفية بترتيب طبقات صحيح (z-10 فوق z-0) ──────
assert.match(
  section,
  /className="relative z-10 mx-auto w-full max-w-\[440px\] px-5"/,
  'حاوية البطاقة يجب أن تبقى فوق طبقتي الخلفية (relative z-10) لضمان ظهورها فوق الصورة بلا تراكب خاطئ',
);

// ── ٦) القسم overflow-hidden لمنع أي فيض من الصورة خارج حدوده ───────────
assert.match(
  section,
  /<section className="relative z-10 overflow-hidden bg-\[#fbf6ec\] py-14">/,
  'يجب أن يبقى القسم overflow-hidden لاحتواء طبقة الخلفية المصوَّرة ضمن حدوده',
);

console.log('✅ خلفية قسم "رادار المملكة" المصوَّرة (نفس صورة الهيرو) موثَّقة ومُتحقَّق منها بالكامل.');
