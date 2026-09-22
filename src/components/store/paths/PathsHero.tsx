/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مقدمة صفحة المسارات — العنوان والرسالة الأساسية وزرا الدعوة.
 *
 * خلفية البطاقة المصوَّرة (2026-09-22 — طلب مستخدم مباشر مصحوب بلقطة شاشة
 * لصفحة "المسارات" كاملة: "قم بتركيب هذه الصورة كخلفية على صفحة الهبوط
 * مسارات" — صورة زجاجية توضيحية: مركز بيضاوي شفاف تتفرَّع منه أنابيب زجاجية
 * لستة أيقونات تمثّل فئات المسارات نفسها (متجر، سلة بقالة، دبوس موقع، كوب
 * قهوة، طبق مقبّب، مقص) — تركيبة مطابقة مفهومياً لبطاقة "اختر مسار مهنتك"
 * هذه بالذات، فاعتُمدت هنا لا في PathsBackHeader.tsx (الذي له خلفية صورة
 * سوق تراثي منفصلة أصلاً بنفس الغرض التصميمي) ولا في كامل صفحة المسارات
 * القابلة للتمرير (لتفادي تمدّد الصورة بشكل مفرط فوق ارتفاع محتوى طويل).
 *
 * خلافاً لصورتي خريطة الحل الباهتتين (patches 0052/0053)، هذه الصورة تحمل
 * نقاطاً صغيرة داكنة نسبياً متناثرة (كرات زجاجية ملوّنة على مسار الأنابيب،
 * ظلال تحت الأقراص الزجاجية) — محاكاة luminance فعلية عبر PIL أظهرت أن أضعف
 * نص هنا (الفقرة الفرعية الرمادية #566269) قد يهبط لتباين خطير جداً (~1.0:1)
 * إن حاذى نصّها إحدى هذه النقاط الداكنة دون حماية. لذلك أُضيف حجاب بيج شبه
 * معتم موحَّد (bg-[#fffaf4]/90 — نفس درجة لون خلفية البطاقة الأصلية ونفس
 * نسبة 90% المعتمدة سابقاً لبطاقات "٣ خطوات"/"طلبك سريع" فوق صور مزدحمة)
 * فوق الصورة مباشرة — رفع أسوأ تباين للفقرة الفرعية إلى ≥4.95:1 (وللعنوان
 * الرئيسي h1 إلى ≥11.6:1)، مع بقاء تركيبة الأنابيب/الأيقونات مرئية كنقش خلفي
 * خفيف أنيق خلف الحجاب — تأكَّد بمعاينة مركَّبة فعلية عبر PIL قبل الاعتماد.
 *
 * data-contrast-guard-manual-bg: نفس منطق هيرو/بطاقة فلسفة خريطة الحل
 * (patches 0052/0053) بالضبط — الخلفية الفعلية المرئية صورة + حجاب (طبقتان
 * absolute شقيقتان)، لا يراهما حارسا التباين، فتُوضع السمة صراحةً.
 */
const PATHS_HERO_NETWORK_IMAGE = '/images/store-paths-hero-network.webp';

export function PathsHero({
  onExplore,
  onHelp,
}: {
  onExplore: () => void;
  onHelp: () => void;
}) {
  return (
    <section
      data-contrast-guard-manual-bg="true"
      className="relative overflow-hidden rounded-3xl border border-[#bdb5a7] px-5 py-10 text-center sm:px-10 sm:py-14"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PATHS_HERO_NETWORK_IMAGE})` }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#fffaf4]/90" aria-hidden />
      <div className="relative z-10">
        <p className="text-xs font-bold tracking-wide text-[#566269]">منصة خريطة الحل — منظومة تشغيل رقمية متخصصة لمهنتك</p>
        <h1 className="mt-3 text-balance text-2xl font-extrabold leading-snug text-[#1f2933] sm:text-4xl">
          اختر مسار مهنتك، وابدأ بمنتج صُمم لطبيعة عملك
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#566269] sm:text-base">
          لكل مهنة طريقة مختلفة في التشغيل والوصول إلى الزبائن. استعرض المسارات، وتعرّف على المنتج المناسب قبل أن تبدأ.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onExplore}
            className="min-h-11 rounded-full bg-[#b84c3a] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b84c3a]"
          >
            استكشف المسارات
          </button>
          <button
            type="button"
            onClick={onHelp}
            className="min-h-11 rounded-full border border-[#1d4f69] px-6 py-3 text-sm font-extrabold text-[#1d4f69] transition hover:bg-[#1d4f69]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f69]"
          >
            ساعدني في الاختيار
          </button>
        </div>
      </div>
    </section>
  );
}
