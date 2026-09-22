/**
 * ملاحظة تاريخية مهمة: هذا الاختبار وُثِّق أصلاً (2026-09-22، الصباح) لإصلاح
 * خلل قصّ bg-cover لصورة الهيرو الأفقية (landing-hero-barbershop.webp —
 * 2848×1600px) على حاوية الهيرو الطويلة والضيقة على الجوال، عبر تحريك
 * bg-position أفقياً (10% بدل المركز). لاحقاً في نفس اليوم، طلب المستخدم
 * مباشرةً استبدال خلفية الجوال بالكامل بصورة صالون مختلفة (طلب صريح:
 * "ضع الصورة خلفية لمتصفح الجوال ... بدل الخلفية التي موجودة الان") —
 * فحلّت صورة جوال مخصَّصة (landing-hero-mobile-corridor.webp، عمودية أصلاً
 * 1600×2848) محل حيلة bg-position بالكامل: هذه الصورة الجديدة، لكونها
 * عمودية، تُظهر بـbg-cover bg-center عادية (لا موضع مخصَّص) تقريباً كامل
 * ارتفاعها بقصّ أفقي طفيف فقط (~13%) — محاكاة حسابية دقيقة لقصّ bg-cover
 * أكّدت هذا قبل الاعتماد. صورة الحاسوب (landing-hero-barbershop.webp) لم
 * تتغيّر إطلاقاً ولا تزال center عادية.
 *
 * أُبقي هذا الملف (بدل حذفه) وحُدِّثت اختباراته لتفحص الحالة الحالية —
 * سجلّ تاريخي لتطوّر إصلاح خلفية هيرو الجوال عبر تكرارين متتاليين.
 *
 * تشغيل: npx tsx scripts/test-hero-mobile-bg-position-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const src = readFileSync(p('src/pages/LandingPreview.tsx'), 'utf8');

// ── ١) صورة الجوال الجديدة موجودة وبحجم محسَّن للويب ─────────────────────
const mobileImgStat = statSync(p('public/images/landing-hero-mobile-corridor.webp'));
assert.ok(mobileImgStat.isFile(), 'ملف صورة هيرو الجوال الجديدة يجب أن يكون موجوداً');
assert.ok(
  mobileImgStat.size < 400 * 1024,
  `صورة هيرو الجوال يجب أن تبقى محسَّنة (أقل من 400KB) — كانت ${(mobileImgStat.size / 1024).toFixed(0)}KB`,
);

// ── ٢) عزل حاوية خلفية الهيرو المصوَّرة لفحصها تحديداً ────────────────────
const heroBgDivMatch = src.match(
  /<div\s+className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"[\s\S]{0,400}?landing-hero-mobile-corridor\.webp[\s\S]{0,300}?\/>/,
);
assert.ok(
  heroBgDivMatch,
  'يجب العثور على حاوية خلفية الهيرو المصوَّرة بصيغتها الحالية (صورتان حسب الجهاز)',
);
const heroBgDiv = heroBgDivMatch![0];

// ── ٣) bg-center ثابتة في className مجدَّداً — لا حاجة لموضع مخصَّص الآن،
//    لأن صورة الجوال الجديدة عمودية أصلاً وتُظهر محتواها الغني بـcenter عادية ─
assert.match(
  heroBgDiv,
  /className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"/,
  'bg-cover bg-center يجب أن تكونا ثابتتين في className — لا حاجة لموضع ديناميكي مع صورة الجوال العمودية الجديدة',
);
assert.ok(
  !/style=\{\{[^}]*backgroundPosition/.test(heroBgDiv),
  'لا يجب أن يبقى backgroundPosition ديناميكي في style — استُبدل كلياً بصورة جوال مخصَّصة',
);

// ── ٤) الصورة نفسها تختلف ديناميكياً حسب isMobile ─────────────────────────
assert.match(
  heroBgDiv,
  /backgroundImage:\s*isMobile\s*\?\s*"url\('\/images\/landing-hero-mobile-corridor\.webp'\)"\s*:\s*"url\('\/images\/landing-hero-barbershop\.webp'\)"/,
  'يجب أن تختلف صورة الخلفية نفسها حسب isMobile — صورة عمودية مخصَّصة للجوال، وصورة الحاسوب الأفقية كما كانت',
);

// ── ٥) طبقتا التعتيم (العمودية والأفقية) لم تُعدَّلا إطلاقاً — الإصلاح على
//    الصورة المصدر فقط، لا على التعتيم فوقها ──────────────────────────────
assert.match(
  src,
  /linear-gradient\(180deg, rgba\(6,12,10,0\.62\) 0%, rgba\(8,14,12,0\.5\) 32%, rgba\(10,15,13,0\.58\) 68%, #eee2ce 100%\)/,
  'يجب أن تبقى طبقة التعتيم العمودية دون أي تعديل',
);
assert.match(
  src,
  /linear-gradient\(90deg, rgba\(6,12,10,0\.55\) 0%, rgba\(6,12,10,0\.1\) 45%, rgba\(6,12,10,0\.35\) 100%\)/,
  'يجب أن تبقى طبقة التعتيم الأفقية دون أي تعديل',
);

console.log('✅ صورة هيرو الجوال المخصَّصة (بدل حيلة bg-position السابقة) موثَّقة ومُتحقَّق منها بالكامل.');
