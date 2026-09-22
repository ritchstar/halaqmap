/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فقرة الفلسفة تحت هيرو المتجر — نص غامق على سطح فاتح ضمن الغلاف البيج.
 *
 * خلفية البطاقة المصوَّرة (2026-09-22 — طلب مستخدم مباشر مصحوب بلقطة شاشة
 * محدِّدة لهذه البطاقة بالذات: "قم بوضع الصورة الخلفية في المكان الموضح
 * بالصورة الاخرى لرئيسية منصة خريطة الحل" — أي نفس صورة السحب/الدبابيس/
 * البوصلة الباهتة المستخدمة في هيرو StoreLandingPitchHero.tsx، تُعاد هنا
 * كخلفية لبطاقة الفلسفة تحته مباشرة). bg-[#fbf6ec] الصلبة السابقة استُبدلت
 * بالصورة نفسها (bg-cover bg-center) داخل حاوية overflow-hidden كي تحترم
 * زوايا البطاقة المدوَّرة وحدودها.
 *
 * خلافاً للهيرو (حيث كانت المساحة عريضة قصيرة فتُظهر شريطاً رفيعاً من وسط
 * الصورة)، بطاقة الفلسفة أقرب لمربّع طويل يقارب نسبة الصورة نفسها، فتُظهر
 * bg-cover bg-center معظم ارتفاع الصورة (~88% على الجوال). محاكاة luminance
 * فعلية عبر PIL على شبكة نقاط من الصورة بعد القصّ أظهرت أن أقرب نص لخطر
 * التباين هو السطر الختامي الذهبي الفاتح (#5c4a1a): 4.78:1 فقط على الجوال
 * دون أي حماية — أعلى بقليل من حد WCAG AA (4.5:1) لكن هامشه ضيق مقارنةً
 * بـ7.96:1 فوق الخلفية البيج الصلبة السابقة. لذلك أُضيفت طبقة حجاب بيج
 * شفافة موحَّدة (bg-[#fbf6ec]/35، لا تعتيم حواف فقط) فوق الصورة مباشرة —
 * رفعت أسوأ تباين للسطر الختامي إلى 5.77:1 (وبقية النصوص أعلى من 8:1)،
 * هامش أمان كافٍ ضد أي فرق بسيط بين الأبعاد المفترَضة والفعلية، مع إبقاء
 * نقش الصورة (سحب/دبابيس/بوصلة) شبه كامل الوضوح خلف الحجاب الخفيف.
 *
 * data-contrast-guard-manual-bg: نفس منطق الهيرو أعلاه بالضبط — الخلفية
 * الفعلية المرئية لهذه البطاقة صورة (طبقتان absolute شقيقتان: الصورة ثم
 * الحجاب)، لا يراها StoreTextContrastGuard/StoreButtonContrastGuard، فتُوضع
 * السمة على البطاقة نفسها لمنع أي "تصحيح" خاطئ مستقبلاً.
 */
import { STORE_LANDING_COPY } from '@/config/storeFront';

export function StoreLandingPhilosophySection() {
  return (
    <section id="store-pitch-philosophy" className="scroll-mt-14 px-4 py-8 md:py-10">
      <div
        data-contrast-guard-manual-bg="true"
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#dac8aa] px-5 py-6 md:px-8 md:py-8"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/store-hero-map-illustration.webp')" }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[#fbf6ec]/35" aria-hidden />
        <div className="relative z-10">
          <h2 className="text-xl font-extrabold leading-snug text-[#1a140c] md:text-2xl">
            {STORE_LANDING_COPY.philosophyTitleAr}
          </h2>
          <div className="mt-4 space-y-4">
            {STORE_LANDING_COPY.philosophyBodyAr.map((paragraph) => (
              <p key={paragraph} className="text-base leading-8 text-[#3d3226]">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-6 text-base font-bold leading-8 text-[#5c4a1a]">
            {STORE_LANDING_COPY.philosophyClosingAr}
          </p>
        </div>
      </div>
    </section>
  );
}
