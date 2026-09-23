/**
 * طلب مستخدم مباشر لاحق (2026-09-23) مصحوب بنفس صورة الشبكة الزجاجية التي
 * اعتُمدت سابقاً (commit 219b45fc) لبطاقة الهيرو وحدها في صفحة المسارات
 * (/store/paths-lab) — "اجعل هذه الصورة خلفية لصفحة مسارات": طلب صريح هذه
 * المرة لتمديدها لكامل الصفحة، لا لبطاقة الهيرو فقط كما كان سابقاً.
 *
 * الفرق عن المرة السابقة: بدل bg-fixed/background-attachment:fixed التقليدية
 * (معطوبة على iOS Safari) أو bg-cover ممدودة فوق كامل ارتفاع المحتوى
 * (تتمدد/تتشوّه فوق صفحة طويلة غير محدودة الارتفاع)، استُخدمت طبقة
 * position:fixed بحجم الشاشة (inset-0) — فتبقى الصورة مثبَّتة بحجم الشاشة
 * فقط خلف المحتوى الذي يتمرّر فوقها، لا تتمدد أبداً.
 *
 * لا حجاب حماية تباين نص صارم هنا (خلافاً لـ PathsHero وبطاقاتها الداخلية):
 * كل نص في هذه الصفحة معزول داخل بطاقة بخلفية شبه صلبة خاصة بها؛ الخلفية
 * الجديدة مرئية فقط في الفراغات بين البطاقات. حجاب بيج شبه معتم (نفس درجة
 * اللون الصلبة السابقة لجذر الصفحة bg-[#e9e5dc] بشفافية 85%) يُبقي الهوية
 * البصرية الهادئة مع بروز نقش الشبكة الزجاجية بخفة خلف البطاقات.
 *
 * يتحقق هذا الاختبار من:
 * ١) استخدام نفس ملف الصورة الموجود مسبقاً (لا تكرار أصول) بحجم محسَّن للويب.
 * ٢) أن جذر صفحة StorePathsLabPage صار relative عبر أبنائه (z-10) بلا خلفية
 *    بيج صلبة مباشرة على نفسه (`bg-[#e9e5dc]` أُزيلت من الجذر نفسه).
 * ٣) وجود طبقتي خلفية: صورة الشبكة (position: fixed + inset-0 + bg-cover
 *    bg-center) وحجاب بيج شبه معتم (bg-[#e9e5dc]/85) فوقها — كلتاهما
 *    fixed inset-0 (بحجم الشاشة، لا يتمددان فوق ارتفاع المحتوى).
 * ٤) أن محتوى الصفحة (PathsBackHeader وما بعدها) يعلو الطبقتين عبر
 *    relative z-10 على الحاوية الأم مباشرة.
 * ٥) أن PathsHero.tsx (خلفية بطاقة الهيرو الخاصة بها) وPathsBackHeader.tsx
 *    (خلفية صورة السوق) لم يتأثرا إطلاقاً بهذا التغيير.
 * ٦) أن جميع مكوّنات البطاقات الفرعية (PathSearch، OperatingModelFilter،
 *    ProductPathCard، PathsPlatformIntro، PathHelpBanner،
 *    SharedDeliverablesSection) ما زالت تحمل خلفياتها الصلبة الخاصة بها —
 *    لا نص يلامس خلفية الصفحة الجديدة مباشرة.
 *
 * تشغيل: npx tsx scripts/test-store-paths-lab-page-background-2026-09-23.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const pageSrc = readFileSync(p('src/pages/store/StorePathsLabPage.tsx'), 'utf8');

// ── ١) الصورة نفسها موجودة مسبقاً وبحجم محسَّن (لا نسخة جديدة مكررة) ────────
const imgStat = statSync(p('public/images/store-paths-hero-network.webp'));
assert.ok(imgStat.isFile(), 'ملف صورة شبكة المسارات الزجاجية يجب أن يكون موجوداً');
assert.ok(
  imgStat.size < 400 * 1024,
  `الصورة يجب أن تبقى محسَّنة (أقل من 400KB) — كانت ${(imgStat.size / 1024).toFixed(0)}KB`,
);
assert.match(
  pageSrc,
  /const STORE_PATHS_PAGE_BACKGROUND_IMAGE = '\/images\/store-paths-hero-network\.webp';/,
  'خلفية الصفحة كاملة يجب أن تُعيد استخدام نفس ملف صورة شبكة PathsHero — لا أصل جديد مكرر',
);

// ── ٢) جذر الصفحة: min-h-screen بلا bg-[#e9e5dc] صلبة على نفس السطر ─────────
assert.match(
  pageSrc,
  /<div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10" dir="rtl">/,
  'جذر صفحة المسارات يجب أن يفقد خلفيته البيج الصلبة المباشرة (حلّت الصورة+الحجاب محلها) مع بقاء باقي كلاسات التخطيط كما هي',
);
assert.doesNotMatch(
  pageSrc,
  /<div className="min-h-screen bg-\[#e9e5dc\]/,
  'لا يجب أن تبقى bg-[#e9e5dc] صلبة على عنصر الجذر نفسه',
);

// ── ٣) طبقتا الخلفية: صورة fixed + حجاب fixed، كلتاهما inset-0 بحجم الشاشة ──
assert.match(
  pageSrc,
  /className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center"[\s\S]{0,150}STORE_PATHS_PAGE_BACKGROUND_IMAGE/,
  'يجب وجود طبقة خلفية مثبَّتة (fixed) بحجم الشاشة تستخدم صورة شبكة المسارات عبر bg-cover bg-center',
);
assert.match(
  pageSrc,
  /className="pointer-events-none fixed inset-0 z-0 bg-\[#e9e5dc\]\/85"/,
  'يجب وجود حجاب بيج شبه معتم (85%) مثبَّت بحجم الشاشة فوق الصورة',
);
assert.doesNotMatch(
  pageSrc,
  /className="[^"]*\bbg-fixed\b/,
  'يجب تفادي استخدام كلاس bg-fixed (background-attachment:fixed التقليدية، معطوبة على iOS Safari) في أي className فعلي — لا يمنع هذا مجرّد ذكرها في تعليق توثيقي',
);

// ── ٤) محتوى الصفحة يعلو الطبقتين عبر relative z-10 على الحاوية الأم ────────
assert.match(
  pageSrc,
  /className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8">\s*\n\s*<PathsBackHeader \/>/,
  'حاوية المحتوى الرئيسية يجب أن تكون relative z-10 لتعلو طبقتي الخلفية الثابتتين',
);

// ── ٥) PathsHero وPathsBackHeader (خلفياتهما الخاصة) لم يتأثرا ─────────────
const heroSrc = readFileSync(p('src/components/store/paths/PathsHero.tsx'), 'utf8');
assert.match(
  heroSrc,
  /const PATHS_HERO_NETWORK_IMAGE = '\/images\/store-paths-hero-network\.webp';/,
  'خلفية بطاقة PathsHero الخاصة يجب أن تبقى دون أي تغيير',
);
assert.match(heroSrc, /data-contrast-guard-manual-bg="true"/, 'حجاب حماية تباين PathsHero الخاص يجب أن يبقى كما هو');

const backHeaderSrc = readFileSync(p('src/components/store/paths/PathsBackHeader.tsx'), 'utf8');
assert.match(
  backHeaderSrc,
  /const PATHS_HERO_IMAGE = '\/images\/store\/paths-hero-souk\.jpg';/,
  'خلفية صورة السوق في PathsBackHeader.tsx يجب أن تبقى دون أي تغيير',
);

// ── ٦) بطاقات المحتوى الفرعية ما زالت بخلفيات صلبة خاصة بها (لا نص عارٍ) ────
const pathSearchSrc = readFileSync(p('src/components/store/paths/PathSearch.tsx'), 'utf8');
assert.match(pathSearchSrc, /bg-\[#fffdf8\]/, 'حقل بحث المسارات يجب أن يبقى بخلفية صلبة خاصة به');

const filterSrc = readFileSync(p('src/components/store/paths/OperatingModelFilter.tsx'), 'utf8');
assert.match(filterSrc, /bg-\[#fffdf8\]/, 'أزرار فلتر نموذج التشغيل يجب أن تبقى بخلفية صلبة خاصة بها');

const cardSrc = readFileSync(p('src/components/store/paths/ProductPathCard.tsx'), 'utf8');
assert.match(cardSrc, /bg-\[#fffdf8\]/, 'بطاقة المسار (ProductPathCard) يجب أن تبقى بخلفية صلبة خاصة بها');

const introSrc = readFileSync(p('src/components/store/paths/PathsPlatformIntro.tsx'), 'utf8');
assert.match(introSrc, /bg-\[#fffdf8\]/, 'بطاقة تعريف المنصة يجب أن تبقى بخلفية صلبة خاصة بها');

const helpSrc = readFileSync(p('src/components/store/paths/PathHelpBanner.tsx'), 'utf8');
assert.match(helpSrc, /bg-\[#f7f4ed\]/, 'بانر المساعدة يجب أن يبقى بخلفية صلبة خاصة به');

const sharedSrc = readFileSync(p('src/components/store/paths/SharedDeliverablesSection.tsx'), 'utf8');
assert.match(sharedSrc, /bg-\[#fffaf4\]/, 'قسم المخرجات المشتركة يجب أن يبقى بخلفية صلبة خاصة به');

console.log('✅ خلفية كامل صفحة "المسارات" (صورة الشبكة الزجاجية مثبَّتة بحجم الشاشة + حجاب بيج 85%) موثَّقة ومُتحقَّق منها بالكامل.');
