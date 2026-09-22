/**
 * طلب مستخدم مباشر مصحوب بلقطة شاشة لصفحة "المسارات" كاملة (store.halaqmap.com/#/store/paths-lab):
 * "قم بتركيب هذه الصورة كخلفية على صفحة الهبوط مسارات" — صورة زجاجية توضيحية
 * لستة أيقونات فئات (متجر، بقالة، موقع، قهوة، مطعم، حلاقة) متفرّعة من مركز
 * بيضاوي مشترك. اعتُمدت البطاقة الأولى المرئية على الصفحة (PathsHero.tsx —
 * "اختر مسار مهنتك، وابدأ بمنتج صُمم لطبيعة عملك") لا:
 * · PathsBackHeader.tsx — له خلفية صورة سوق تراثي منفصلة أصلاً لنفس الغرض.
 * · جذر الصفحة القابل للتمرير كاملاً — لتفادي تمدّد صورة عريضة قصيرة فوق
 *   ارتفاع محتوى طويل غير محدود.
 *
 * خلافاً لصورتي خريطة الحل الباهتتين (patches 0052/0053)، هذه الصورة تحمل
 * نقاطاً داكنة نسبياً متناثرة (كرات زجاجية ملوّنة، ظلال) قد تهبط بتباين نص
 * غير محمي إلى ~1:1 في أسوأ حالة. لذلك أُضيف حجاب بيج شبه معتم موحَّد
 * (bg-[#fffaf4]/90) رفع أسوأ تباين للفقرة الفرعية الأضعف إلى ≥4.95:1.
 *
 * يتحقق هذا الاختبار من:
 * ١) وجود ملف الصورة بحجم محسَّن للويب.
 * ٢) أن قسم PathsHero يستخدمها خلفيةً (bg-cover bg-center) + حجاب حماية 90%.
 * ٣) أن data-contrast-guard-manual-bg مضافة على القسم.
 * ٤) أن bg-[#fffaf4] الصلبة القديمة على القسم نفسه أُزيلت (حلّت الصورة والحجاب محلها).
 * ٥) أن نصوص/أزرار البطاقة الأصلية (الألوان والعناوين) لم تتغيّر، وتعلو الخلفية عبر z-10.
 * ٦) أن PathsBackHeader.tsx (خلفية السوق) وجذر StorePathsLabPage.tsx لم يتأثرا إطلاقاً.
 *
 * تشغيل: npx tsx scripts/test-store-paths-hero-network-background-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const src = readFileSync(p('src/components/store/paths/PathsHero.tsx'), 'utf8');

// ── ١) الصورة موجودة وبحجم محسَّن ──────────────────────────────────────────
const imgStat = statSync(p('public/images/store-paths-hero-network.webp'));
assert.ok(imgStat.isFile(), 'ملف صورة شبكة المسارات الزجاجية يجب أن يكون موجوداً');
assert.ok(
  imgStat.size < 400 * 1024,
  `الصورة يجب أن تبقى محسَّنة (أقل من 400KB) — كانت ${(imgStat.size / 1024).toFixed(0)}KB`,
);

// ── ٢) القسم: relative overflow-hidden + manual-bg، بلا bg-[#fffaf4] صلبة على نفسه
assert.match(
  src,
  /data-contrast-guard-manual-bg="true"\s*\n\s*className="relative overflow-hidden rounded-3xl border border-\[#bdb5a7\] px-5 py-10 text-center sm:px-10 sm:py-14"/,
  'قسم PathsHero يجب أن يكون relative overflow-hidden ويحمل data-contrast-guard-manual-bg، بلا bg-[#fffaf4] صلبة على نفس السطر',
);

// ── ٣) طبقة الصورة + طبقة الحجاب ───────────────────────────────────────────
assert.match(
  src,
  /className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"[\s\S]{0,150}PATHS_HERO_NETWORK_IMAGE/,
  'يجب وجود طبقة خلفية منفصلة تستخدم صورة شبكة المسارات عبر bg-cover bg-center',
);
assert.match(
  src,
  /const PATHS_HERO_NETWORK_IMAGE = '\/images\/store-paths-hero-network\.webp';/,
  'مسار الصورة يجب أن يشير لملف store-paths-hero-network.webp',
);
assert.match(
  src,
  /className="pointer-events-none absolute inset-0 z-0 bg-\[#fffaf4\]\/90"/,
  'يجب وجود حجاب بيج شبه معتم (90%) فوق الصورة لحماية تباين النصوص',
);

// ── ٤) محتوى النص يعلو الخلفية عبر z-10، وألوانه الأصلية لم تتغيّر ──────────
assert.match(src, /<div className="relative z-10">/, 'محتوى القسم يجب أن يعلو طبقتي الخلفية عبر z-10');
for (const color of ['text-[#566269]', 'text-[#1f2933]', 'text-[#1d4f69]']) {
  assert.match(src, new RegExp(color.replace(/[[\]#]/g, '\\$&')), `يجب أن يبقى ${color} كما هو`);
}
assert.match(src, /استكشف المسارات/);
assert.match(src, /ساعدني في الاختيار/);

// ── ٥) القسم الشقيق (خلفية السوق) وجذر الصفحة لم يتأثرا ────────────────────
const backHeaderSrc = readFileSync(p('src/components/store/paths/PathsBackHeader.tsx'), 'utf8');
assert.match(
  backHeaderSrc,
  /const PATHS_HERO_IMAGE = '\/images\/store\/paths-hero-souk\.jpg';/,
  'خلفية صورة السوق في PathsBackHeader.tsx يجب أن تبقى دون أي تغيير',
);
const pageSrc = readFileSync(p('src/pages/store/StorePathsLabPage.tsx'), 'utf8');
assert.match(
  pageSrc,
  /className="min-h-screen bg-\[#e9e5dc\] px-3 py-6 sm:px-6 sm:py-10"/,
  'خلفية جذر صفحة المسارات القابلة للتمرير يجب أن تبقى بيج صلبة دون صورة — التغيير محصور في PathsHero فقط',
);

console.log('✅ خلفية بطاقة "اختر مسار مهنتك" (صورة الشبكة الزجاجية + حجاب حماية 90%) موثَّقة ومُتحقَّق منها بالكامل.');
