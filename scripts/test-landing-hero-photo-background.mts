/**
 * طلب المستخدم: استخدام صورة صالون فاخرة (لوحة زجاجية مفرَغة في المنتصف)
 * كخلفية لقسم البحث في الصفحة الرئيسية، مع موازنة واجهة المستخدم والفلاتر
 * لتتناسق مع الخلفية.
 *
 * يتحقق هذا الاختبار من:
 * ١) وجود ملف الصورة نفسه بحجم معقول (لا PNG ثقيل غير محسَّن).
 * ٢) أن قسم الهيرو في LandingPreview.tsx يستخدم هذه الصورة فعلياً كخلفية،
 *    مع طبقة تعتيم كافية لبقاء النص مقروءاً وانتقال سلس لبيج الصفحة.
 * ٣) أن كل نصوص الهيرو المباشرة (لا البطاقات الصندوقية ذاتية الخلفية) تحوّلت
 *    من الحبر الداكن (مصمَّم أصلاً لكانفاس بيج فاتح) إلى نص فاتح يُقرأ فوق
 *    الصورة الداكنة.
 * ٤) أن الهيدر الثابت يتحوّل بين زجاج داكن (فوق صورة الهيرو، قبل التمرير)
 *    وبيج فاتح (فوق محتوى الصفحة، بعد التمرير) حسب حالة `scrolled`.
 * ٥) أن بطاقة ثقة TLS تستخدم `tone="dark"` في سياق الهيرو الجديد.
 *
 * تشغيل: npx tsx scripts/test-landing-hero-photo-background.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);

// ── ١) الصورة نفسها ─────────────────────────────────────────────────────
const imagePath = p('public/images/landing-hero-barbershop.webp');
const stat = statSync(imagePath);
assert.ok(stat.isFile(), 'ملف صورة خلفية الهيرو يجب أن يكون موجوداً');
assert.ok(
  stat.size < 400 * 1024,
  `حجم صورة الهيرو يجب أن يبقى محسَّناً للويب (أقل من 400KB) — كان ${(stat.size / 1024).toFixed(0)}KB`,
);

// ── ٢) قسم الهيرو يستخدم الصورة + تعتيم كافٍ ────────────────────────────
const src = readFileSync(p('src/pages/LandingPreview.tsx'), 'utf8');
assert.match(
  src,
  /backgroundImage:\s*"url\('\/images\/landing-hero-barbershop\.webp'\)"/,
  'قسم الهيرو يجب أن يضبط صورة الحاسوب كخلفية عبر backgroundImage',
);
assert.match(src, /\bbg-cover bg-center\b/, 'خلفية الهيرو يجب أن تغطي المساحة كاملة ومركّزة (bg-cover bg-center)');
// ملاحظة تاريخية: بين 2026-09-22 (مرتين) — أولاً استُبدلت bg-center الثابتة
// بموضع ديناميكي (10% على الجوال) لتفادي قصّ صورة الحاسوب الأفقية بشكل سيئ
// على الجوال؛ ثم حلّت صورة جوال مخصَّصة (عمودية أصلاً) محل تلك الحيلة كلياً
// — راجع scripts/test-hero-mobile-bg-position-2026-09-22.mts (يوثّق التطوّر
// الكامل لكلا التغييرين) للتفاصيل.
assert.match(
  src,
  /backgroundImage:\s*isMobile\s*\?\s*"url\('\/images\/landing-hero-mobile-corridor\.webp'\)"\s*:\s*"url\('\/images\/landing-hero-barbershop\.webp'\)"/,
  'خلفية الهيرو يجب أن تستخدم صورة جوال مخصَّصة (عمودية) على الجوال، وصورة الحاسوب الأفقية على الحاسوب',
);
assert.match(src, /linear-gradient\(180deg,/, 'يجب وجود طبقة تعتيم رأسية فوق صورة الهيرو');
assert.match(
  src,
  /#eee2ce 100%/,
  'طبقة التعتيم الرأسية يجب أن تذوب في بيج الصفحة (#eee2ce) عند الحافة السفلى لانتقال سلس',
);

// ── ٣) نصوص الهيرو المباشرة تحوّلت لفاتح (لا الحبر الداكن #2e2418) ──────
const heroSectionMatch = src.match(/\{\/\* ── Hero section[\s\S]*?\n {6}<\/section>/);
assert.ok(heroSectionMatch, 'يجب إيجاد كتلة قسم الهيرو كاملة لفحصها');
const heroSection = heroSectionMatch![0];
assert.doesNotMatch(
  heroSection,
  /text-\[#2e2418\]/,
  'لا يجب أن يبقى أي نص بالحبر الداكن #2e2418 داخل قسم الهيرو المصوَّر — كان يعني نصاً غير مقروء فوق الصورة الداكنة',
);
assert.match(heroSection, /text-white/, 'عنوان الهيرو الرئيسي يجب أن يستخدم نصاً أبيض فوق الصورة');
assert.match(heroSection, /text-emerald-200/, 'شارة الهيرو يجب أن تستخدم نصاً زمردياً فاتحاً فوق الصورة');

// ── ٤) الهيدر الثابت: زجاج داكن قبل التمرير، بيج بعده ───────────────────
const headerMatch = src.match(/<header[\s\S]*?\{\/\* ── Hero section/);
assert.ok(headerMatch, 'يجب إيجاد كتلة الهيدر الثابت كاملة لفحصها');
const header = headerMatch![0];
assert.match(
  header,
  /scrolled\s*\?\s*[\s\S]*?bg-\[#eee2ce\][\s\S]*?:\s*[\s\S]*?bg-\[#0a1512\]/,
  'طبقة خلفية الهيدر يجب أن تتحوّل من زجاج داكن (#0a1512) قبل التمرير إلى بيج (#eee2ce) بعده',
);
assert.match(
  header,
  /scrolled \? 'text-\[#2e2418\]' : 'text-white'/,
  'نص شعار "حلاق ماب" يجب أن يتحوّل بين داكن وأبيض حسب حالة التمرير',
);

// ── ٥) بطاقة ثقة TLS بنمط داكن في سياق الهيرو ───────────────────────────
assert.match(heroSection, /PlatformTlsTrustBadge variant="compact" tone="dark"/);

console.log('✅ خلفية هيرو الصفحة الرئيسية وتناسق واجهة البحث معها موثَّقة ومُتحقَّق منها بالكامل.');
