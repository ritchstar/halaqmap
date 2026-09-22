/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * الشاشة الأولى — ربط اختيار المسار بتشغيله من الجوال، مع فصل مسار الزائر عن المشغّل.
 * ألوان النص على لوحة الغلاف الفاتحة (`store-light-canvas`) — حبر غامق لا أبيض.
 *
 * خلفية الهيرو المصوَّرة (2026-09-22 — طلب مستخدم مباشر: "قم بوضع هذه الصورة
 * خلفية للهيرو في الصفحة الرئيسية لخريطة الحل"): صورة توضيحية باهتة الألوان
 * (سُحُب زجاجية شفّافة، دبابيس موقع، بوصلة مضيئة بأسفل المنتصف، بيج/نعناعي
 * فاتح جداً) — خلافاً لصورة الصالون الداكنة في هيرو LandingPreview.tsx، هذه
 * الصورة فاتحة في كل نقطة منها تقريباً؛ محاكاة حسابية دقيقة (luminance فعلي
 * على شبكة نقاط من الصورة بعد قصّ bg-cover) أكّدت أسوأ نسبة تباين ممكنة بين
 * حبر النص الداكن الحالي (#2e2418) وأي نقطة في الصورة = 8.4:1 على الجوال
 * و10.85:1 على الحاسوب — كلاهما أعلى بكثير من حد WCAG AA (4.5:1)، فلا حاجة
 * لأي طبقة تعتيم واقية إطلاقاً؛ نصوص الحبر الداكن الحالية تبقى كما هي دون أي
 * تعديل. bg-center عادية (لا موضع مخصَّص) تُظهر التركيبة كاملة تقريباً على
 * الجوال (سُحُب + دبابيس + بوصلة)، وعلى الحاسوب (قسم عريض قصير نسبياً لصورة
 * عمودية طويلة) تُظهر شريطاً أفقياً أنيقاً من وسط الصورة (سحابتان بالزاويتين
 * + منحنى مسار خفيف) — تأكَّد بمعاينة مركَّبة فعلية قبل الاعتماد.
 *
 * data-contrast-guard-manual-bg: الخلفية الفعلية المرئية لهذا القسم صورة
 * فوتوغرافية (طبقة `absolute inset-0 z-0` شقيقة، لا خلفية CSS على `<section>`
 * نفسه أو أي أب حقيقي للنص) — حرّاسا التباين (StoreTextContrastGuard
 * وStoreButtonContrastGuard) لا يريان هذه الطبقة إطلاقاً ويتسلّقان خطأً إلى
 * خلفية `store-light-canvas` البيج الحقيقية خلفها. بالمصادفة تنتج نفس القرار
 * الصحيح هنا (بيج فاتح ← حبر داكن)، لكن السمة مُضافة صراحةً حماية للمستقبل
 * — راجع توثيق isWithinManualContrastZone في src/lib/colorContrast.ts.
 */
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { STORE_LANDING_COPY } from '@/config/storeFront';
import { STORE_OPERATORS_PLAY_STORE_SHARE_URL } from '@/config/storeOperatorsAppShell';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StorePathEvents } from '@/lib/storePathAnalytics';

export function StoreLandingPitchHero() {
  return (
    <section
      id="store-pitch-hero"
      data-contrast-guard-manual-bg="true"
      className="relative overflow-x-clip px-4 pb-8 pt-6 md:pb-10 md:pt-10"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/store-hero-map-illustration.webp')" }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl text-center md:text-start">
        <span className="store-pitch-aura" aria-hidden />
        <div className="relative">
          <p className="text-xl font-black text-[#2e2418] md:text-2xl">{STORE_LANDING_COPY.shopNameAr}</p>
          <p className="mt-2 text-sm font-bold tracking-wide text-[#6f6250] md:text-base">
            {STORE_LANDING_COPY.pitchKickerAr}
          </p>
          <h1 className="store-pitch-headline relative mx-auto mt-3 max-w-3xl text-[1.7rem] font-black leading-snug text-[#1a140c] sm:text-3xl sm:leading-tight md:mx-0 md:text-[2.35rem]">
            {STORE_LANDING_COPY.pitchH1Ar}
          </h1>
          <p className="relative mx-auto mt-5 max-w-2xl text-base font-bold leading-8 text-[#3d3226] md:mx-0 md:text-lg">
            {STORE_LANDING_COPY.pitchDedicatedLineAr}
          </p>

          <div className="relative mt-7 flex flex-col items-center gap-3 md:items-start">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                to={ROUTE_PATHS.STORE_PATHS_LAB}
                onClick={() => StorePathEvents.homeEntryClick()}
                aria-label={STORE_LANDING_COPY.pitchPathsCtaAr}
                className="store-pitch-paths-cta relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#e8c547] px-5 py-2.5 text-base font-extrabold text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)] hover:bg-[#f0d36a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c547]"
              >
                <span className="store-pitch-paths-cta__ring" aria-hidden />
                <span className="relative z-[1]">{STORE_LANDING_COPY.pitchPathsCtaAr}</span>
              </Link>
              <a
                href={STORE_OPERATORS_PLAY_STORE_SHARE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={STORE_LANDING_COPY.pitchOperatorsAppCtaAr}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#2e2418]/35 bg-[#0d1a16] px-5 py-2.5 text-base font-extrabold text-white hover:border-[#2e2418] hover:bg-[#12241e]"
              >
                <Smartphone className="h-4 w-4 shrink-0 text-[#e8c547]" aria-hidden />
                {STORE_LANDING_COPY.pitchOperatorsAppCtaAr}
              </a>
            </div>
            <p className="max-w-md text-center text-sm leading-6 text-[#6f6250] md:text-start">
              {STORE_LANDING_COPY.pitchOperatorsAppNoteAr}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
