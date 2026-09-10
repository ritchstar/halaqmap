/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_LANDING_COPY } from '@/config/storeFront';

export function StoreLandingPhilosophySection() {
  return (
    <section id="store-pitch-philosophy" className="scroll-mt-14 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 md:px-8 md:py-8">
        <h2 className="text-xl font-extrabold leading-snug text-[#f4efe4] md:text-2xl">
          {STORE_LANDING_COPY.philosophyTitleAr}
        </h2>
        <div className="mt-4 space-y-4">
          {STORE_LANDING_COPY.philosophyBodyAr.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-white/78">
              {paragraph}
            </p>
          ))}
        </div>
        <p className="mt-6 text-base font-bold leading-8 text-[#e8c547]">
          {STORE_LANDING_COPY.philosophyClosingAr}
        </p>
      </div>
    </section>
  );
}
