/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * الشاشة الأولى — ربط اختيار المسار بتشغيله من الجوال، مع فصل مسار الزائر عن المشغّل.
 */
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { STORE_LANDING_COPY } from '@/config/storeFront';
import {
  STORE_OPERATORS_HERO_PHONE_SRC,
  STORE_OPERATORS_PLAY_STORE_SHARE_URL,
} from '@/config/storeOperatorsAppShell';
import { storeResponsiveWebpSrcSet } from '@/lib/storeResponsiveImage';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StorePathEvents } from '@/lib/storePathAnalytics';

const PHONE_SIZES = '(max-width: 768px) 70vw, 280px';

function OperatorsPhoneMock({ alt }: { alt: string }) {
  const webpSrcSet = storeResponsiveWebpSrcSet(STORE_OPERATORS_HERO_PHONE_SRC);
  return (
    <div className="relative mx-auto w-[min(100%,17.5rem)]">
      <div className="relative overflow-hidden rounded-[1.85rem] border border-white/15 bg-[#0a1218] p-2 shadow-[0_28px_60px_-28px_rgba(0,0,0,0.85)] ring-1 ring-[#e8c547]/25">
        <div className="overflow-hidden rounded-[1.45rem] bg-black">
          {webpSrcSet ? (
            <picture>
              <source type="image/webp" srcSet={webpSrcSet} sizes={PHONE_SIZES} />
              <img
                src={STORE_OPERATORS_HERO_PHONE_SRC}
                alt={alt}
                width={1080}
                height={1920}
                className="block h-auto w-full"
                sizes={PHONE_SIZES}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          ) : (
            <img
              src={STORE_OPERATORS_HERO_PHONE_SRC}
              alt={alt}
              width={1080}
              height={1920}
              className="block h-auto w-full"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function StoreLandingPitchHero() {
  return (
    <section id="store-pitch-hero" className="overflow-x-clip px-4 pb-8 pt-6 md:pb-10 md:pt-10">
      <div className="relative mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:text-start">
        <span className="store-pitch-aura" aria-hidden />
        <div className="relative text-center md:text-start">
          <p className="text-xl font-black text-[#f4efe4] md:text-2xl">{STORE_LANDING_COPY.shopNameAr}</p>
          <p className="mt-2 text-sm font-bold tracking-wide text-[#e8c547]/95 md:text-base">
            {STORE_LANDING_COPY.pitchKickerAr}
          </p>
          <h1 className="store-pitch-headline relative mx-auto mt-3 max-w-3xl text-[1.55rem] font-black leading-snug text-[#e8c547] sm:text-3xl sm:leading-tight md:mx-0 md:text-[2.35rem]">
            {STORE_LANDING_COPY.pitchH1Ar}
          </h1>
          <p className="relative mx-auto mt-5 max-w-2xl text-base font-bold leading-8 text-white/90 md:mx-0 md:text-lg">
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#e8c547]/85 bg-[#0d1a16] px-5 py-2.5 text-base font-extrabold text-white hover:border-[#e8c547] hover:bg-[#12241e]"
              >
                <Smartphone className="h-4 w-4 shrink-0 text-[#e8c547]" aria-hidden />
                {STORE_LANDING_COPY.pitchOperatorsAppCtaAr}
              </a>
            </div>
            <p className="max-w-md text-center text-[0.78rem] leading-6 text-white/55 md:text-start">
              {STORE_LANDING_COPY.pitchOperatorsAppNoteAr}
            </p>
          </div>
        </div>

        <div className="relative">
          <OperatorsPhoneMock alt={STORE_LANDING_COPY.pitchOperatorsPhoneAltAr} />
        </div>
      </div>
    </section>
  );
}
