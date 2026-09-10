/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * الشاشة الأولى — تسلسل العنوان والصفحة المستقلة والركيزة التسويقية.
 */
import { PanelTop } from 'lucide-react';
import { StoreInViewMount } from '@/components/store/StoreInViewMount';
import { StoreShot } from '@/components/store/StoreShot';
import { STORE_LANDING_COPY } from '@/config/storeFront';

export function StoreLandingPitchHero({ onExplore }: { onExplore: () => void }) {
  return (
    <section id="store-pitch-hero" className="overflow-x-clip px-4 pb-6 pt-8 md:pt-12">
      <div className="relative mx-auto max-w-5xl overflow-hidden text-center">
        <span className="store-pitch-aura" aria-hidden />
        <p className="relative text-2xl font-black text-[#f4efe4] md:text-3xl">
          {STORE_LANDING_COPY.shopNameAr}
        </p>
        <h1 className="store-pitch-headline relative mx-auto mt-3 max-w-4xl text-[1.65rem] font-black leading-snug text-[#e8c547] sm:text-4xl sm:leading-tight md:text-[2.65rem]">
          {STORE_LANDING_COPY.pitchH1Ar}
        </h1>
        <p className="relative mx-auto mt-5 max-w-3xl text-base font-bold leading-8 text-white/90 md:text-lg">
          {STORE_LANDING_COPY.pitchDedicatedLineAr}
        </p>
        <p className="store-pitch-trust relative mx-auto mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-base leading-7 text-white/78">
          <PanelTop className="h-4 w-4 shrink-0 text-[#e8c547]" aria-hidden />
          <span>{STORE_LANDING_COPY.pitchNotMarketplaceAr}</span>
        </p>
        <p className="store-pitch-hook relative mx-auto mt-5 max-w-3xl text-base font-extrabold leading-8 text-[#e8c547] md:text-lg">
          {STORE_LANDING_COPY.pitchTransformAr}
        </p>
        <div className="relative mt-7 flex justify-center">
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#e8c547] px-5 py-2.5 text-base font-extrabold text-[#061018] shadow-[0_12px_30px_-12px_rgba(232,197,71,0.8)] hover:bg-[#f0d36a]"
          >
            {STORE_LANDING_COPY.pitchExploreCtaAr}
          </button>
        </div>
      </div>
      <div className="relative mx-auto mt-8 max-w-3xl px-2">
        <StoreInViewMount minHeightClass="min-h-[12rem]">
          <StoreShot reel="landing" alt={STORE_LANDING_COPY.heroShotAlt} className="aspect-[4/3] w-full rounded-2xl" />
        </StoreInViewMount>
      </div>
    </section>
  );
}
