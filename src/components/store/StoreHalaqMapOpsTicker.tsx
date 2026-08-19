/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط تشغيل منصة حلاق ماب على واجهة المتجر فقط.
 */
import { Megaphone } from 'lucide-react';
import { STORE_HALAQMAP_OPS_TICKER } from '@/config/storeFront';

const LOOP = [...STORE_HALAQMAP_OPS_TICKER.segments, ...STORE_HALAQMAP_OPS_TICKER.segments];

export function StoreHalaqMapOpsTicker() {
  return (
    <div
      className="relative shrink-0 overflow-hidden border-b border-[#e8c547]/25 bg-gradient-to-l from-[#e8c547]/18 via-[#0b1a24] to-teal-500/15"
      role="region"
      aria-label={STORE_HALAQMAP_OPS_TICKER.ariaAr}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#061018] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#061018] to-transparent" />

      <div className="flex min-h-9 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span className="pointer-events-none inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e8c547]/40 bg-[#e8c547]/15 px-2 py-0.5 text-[0.62rem] font-bold text-[#e8c547] sm:text-[0.68rem]">
          <Megaphone className="h-3 w-3" aria-hidden />
          {STORE_HALAQMAP_OPS_TICKER.badgeAr}
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="rtl">
          <div className="store-halaqmap-ops-marquee-track flex w-max items-center gap-8 motion-reduce:animate-none">
            {LOOP.map((segment, index) => (
              <span
                key={`${segment}-${index}`}
                className="whitespace-nowrap text-[0.68rem] font-semibold text-[#f4efe4] sm:text-xs"
              >
                {segment}
                <span className="mx-4 text-[#e8c547]/50" aria-hidden>
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>

        <a
          href={STORE_HALAQMAP_OPS_TICKER.registerHref}
          className="relative z-20 shrink-0 rounded-full border border-teal-300/40 bg-teal-500/20 px-2.5 py-1 text-[0.62rem] font-bold text-teal-50 sm:px-3 sm:text-[0.68rem]"
        >
          {STORE_HALAQMAP_OPS_TICKER.ctaAr}
        </a>
      </div>
    </div>
  );
}
