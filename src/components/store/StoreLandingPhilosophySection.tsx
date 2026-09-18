/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فقرة الفلسفة تحت هيرو المتجر — نص غامق على سطح فاتح ضمن الغلاف البيج.
 */
import { STORE_LANDING_COPY } from '@/config/storeFront';

export function StoreLandingPhilosophySection() {
  return (
    <section id="store-pitch-philosophy" className="scroll-mt-14 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#dac8aa] bg-[#fbf6ec] px-5 py-6 md:px-8 md:py-8">
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
    </section>
  );
}
