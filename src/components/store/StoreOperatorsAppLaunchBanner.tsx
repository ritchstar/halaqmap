/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط إطلاق تطبيق مشغّلي خريطة الحل — فوق هيدر الرئيسية خلال فترة الإطلاق.
 */
import { STORE_LANDING_COPY } from '@/config/storeFront';
import { STORE_OPERATORS_PLAY_STORE_SHARE_URL } from '@/config/storeOperatorsAppShell';

export function StoreOperatorsAppLaunchBanner() {
  return (
    <div className="border-b border-[#e8c547]/25 bg-gradient-to-l from-[#e8c547]/18 via-[#122018] to-[#0a1410]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-3 py-2.5 text-center md:justify-between md:gap-3 md:px-4 md:text-start">
        <p className="text-sm font-extrabold leading-6 text-[#f4efe4] md:text-[0.95rem]">
          {STORE_LANDING_COPY.pitchOperatorsLaunchBannerAr}
        </p>
        <a
          href={STORE_OPERATORS_PLAY_STORE_SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full bg-[#e8c547] px-3.5 py-1.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
        >
          {STORE_LANDING_COPY.pitchOperatorsLaunchBannerCtaAr}
        </a>
      </div>
    </div>
  );
}
