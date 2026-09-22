/**
 * طلب مستخدم مباشر (بلقطتين لكل جزء من الصفحة، مع 2 صورتين صالون جديدتين):
 * "ضع الصورتين المرفقة خلفية للجزء الثالث والرابع لصفحة منصة حلاق ماب بحيث
 * تغطي الصور الاربع كامل الصفحة وترك الفوتر كما هو الان."
 *
 * التفسير المعتمَد (طابق البنية الفعلية للصفحة): الصورتان الجديدتان (لقطة
 * "الجزء الثالث" شملت بطاقة "ما تريد المنصة منك؟" وبداية "٣ خطوات"، ولقطة
 * "الجزء الرابع" شملت نهاية "٣ خطوات" وبداية "طلبك سريع") تُستخدَمان
 * كخلفيتين موحَّدتين لكل النطاق الواقع بين قسم "رادار المملكة" (خلفيته
 * صورة الهيرو نفسها — patch سابق) والفوتر — مقسَّماً لجزأين متتاليين:
 *  · الجزء الثالث: Stats strip + PlatformVoluntaryEngagementStrip + "٣ خطوات"
 *  · الجزء الرابع: VisitorServiceSpotlight ("طلبك سريع") + الأسئلة الشائعة
 * بحيث تُغطّي أربع صور خلفية (الهيرو مرتين + هاتان الصورتان) كامل الصفحة،
 * والفوتر وحده يبقى دون أي تغيير كما طلب المستخدم صراحةً.
 *
 * حجاب بيج موحَّد (لا الحواف فقط كما في قسم الرادار) ضروري هنا: خلافاً
 * لبطاقة الرادار المعتمة، عناصر هذين الجزأين (بطاقات "٣ خطوات" وبطاقات
 * "طلبك سريع" والعناوين المجرّدة) مصمَّمة أصلاً بخلفيات شبه شفافة فوق
 * كانفاس بيج مسطَّح — فرُفعت شفافيتها محلياً أيضاً كطبقة حماية مستقلة.
 *
 * تشغيل: npx tsx scripts/test-part3-part4-hero-backgrounds-2026-09-22.mts
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel: string) => join(root, rel);
const src = readFileSync(p('src/pages/LandingPreview.tsx'), 'utf8');

// ── ١) ملفا الصورتين موجودان وبحجم محسَّن للويب ─────────────────────────
for (const img of ['landing-lounge-secondary.webp', 'landing-mirror-chair.webp']) {
  const stat = statSync(p(`public/images/${img}`));
  assert.ok(stat.isFile(), `ملف ${img} يجب أن يكون موجوداً`);
  assert.ok(stat.size < 400 * 1024, `${img} يجب أن يبقى محسَّناً (أقل من 400KB) — كان ${(stat.size / 1024).toFixed(0)}KB`);
}

// ── ٢) عزل نطاق "الجزء الثالث" (من تعليق البداية حتى تعليق "الجزء الرابع") ─
const part3Match = src.match(/\{\/\* ── الجزء الثالث[\s\S]*?\{\/\* ── الجزء الرابع/);
assert.ok(part3Match, 'يجب العثور على نطاق "الجزء الثالث" كاملاً');
const part3 = part3Match![0];

assert.match(
  part3,
  /backgroundImage:\s*"url\('\/images\/landing-lounge-secondary\.webp'\)"/,
  'الجزء الثالث يجب أن يستخدم landing-lounge-secondary.webp خلفيةً',
);
assert.match(part3, /<StatsStrip \/>/, 'يجب أن يبقى StatsStrip ضمن الجزء الثالث');
assert.match(part3, /<PlatformVoluntaryEngagementStrip \/>/, 'يجب أن يبقى PlatformVoluntaryEngagementStrip ضمن الجزء الثالث');
assert.match(part3, /id="كيف يعمل"/, 'يجب أن يبقى قسم "٣ خطوات" (id="كيف يعمل") ضمن الجزء الثالث');
assert.match(
  part3,
  /className="relative rounded-2xl border border-\[#dac8aa\] bg-\[#fbf6ec\]\/90 p-6"/,
  'بطاقات "٣ خطوات" يجب أن تستخدم خلفية شبه معتمة (bg-[#fbf6ec]/90) بدل التدرّج الشفاف السابق — حماية تباين فوق الصورة',
);
assert.doesNotMatch(
  part3,
  /from-white\/5 to-transparent/,
  'لا يجب أن يبقى تدرّج بطاقات "٣ خطوات" الشفاف القديم (from-white/5) — كان سيفقد النص تباينه فوق الصورة',
);

// ── ٣) عزل نطاق "الجزء الرابع" (من تعليقه حتى تعليق الفوتر) ──────────────
const part4Match = src.match(/\{\/\* ── الجزء الرابع[\s\S]*?\{\/\* ── Footer/);
assert.ok(part4Match, 'يجب العثور على نطاق "الجزء الرابع" كاملاً');
const part4 = part4Match![0];

assert.match(
  part4,
  /backgroundImage:\s*"url\('\/images\/landing-mirror-chair\.webp'\)"/,
  'الجزء الرابع يجب أن يستخدم landing-mirror-chair.webp خلفيةً',
);
assert.match(part4, /<VisitorServiceSpotlight/, 'يجب أن يبقى VisitorServiceSpotlight ("طلبك سريع") ضمن الجزء الرابع');
assert.match(part4, /أسئلة شائعة/, 'يجب أن يبقى قسم الأسئلة الشائعة ضمن الجزء الرابع');

// ── ٤) كلا الجزأين محجوبان بحجاب بيج موحَّد (لا الحواف فقط) لحماية التباين ─
for (const zone of [part3, part4]) {
  assert.match(
    zone,
    /linear-gradient\(180deg, #fbf6ec 0%, rgba\(251,246,236,0\.62\) 8%, rgba\(251,246,236,0\.62\) 92%, #fbf6ec 100%\)/,
    'يجب وجود حجاب بيج موحَّد (~62%) فوق الصورة — لا تعتيم الحواف فقط كما في قسم الرادار',
  );
  assert.match(zone, /\bbg-cover bg-center\b/, 'يجب أن تستخدم خلفية الصورة bg-cover bg-center');
}

// ── ٥) الفوتر بقي دون أي تغيير كما طلب المستخدم صراحةً ───────────────────
assert.match(
  src,
  /<footer\s*\n\s*className=\{cn\(\s*\n\s*'relative z-10 border-t border-\[#dac8aa\] bg-\[#eee2ce\] py-8 md:py-12',/,
  'الفوتر يجب أن يبقى بخلفيته البيج الأصلية (#eee2ce) دون أي صورة خلفية — كما طلب المستخدم صراحةً',
);

// ── ٦) بطاقات "طلبك سريع" رُفعت شفافيتها في مكوّنها الخاص (ملف منفصل) ─────
const spotlightSrc = readFileSync(p('src/components/landing/VisitorServiceSpotlight.tsx'), 'utf8');
assert.match(
  spotlightSrc,
  /bg-\[#fbf6ec\]\/90 bg-gradient-to-br/,
  'بطاقات VisitorServiceSpotlight يجب أن تضيف خلفية أساس شبه معتمة (bg-[#fbf6ec]/90) قبل تدرّج card.accent — حماية تباين فوق الصورة',
);

console.log('✅ خلفيتا الجزأين الثالث والرابع (صورتا الصالون الجديدتان) موثَّقتان ومُتحقَّق منهما بالكامل — الفوتر لم يتأثر.');
