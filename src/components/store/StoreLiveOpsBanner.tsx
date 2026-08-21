/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنر منتج حلاق ماب — أحد أعمال المتجر، تحت الهيرو فقط.
 */
import { Megaphone } from 'lucide-react';
import { STORE_HALAQMAP_OPS_BANNER } from '@/config/storeFront';

export function StoreLiveOpsBanner() {
  return (
    <section
      className="px-4 pb-8"
      aria-label={STORE_HALAQMAP_OPS_BANNER.ariaAr}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 rounded-2xl border border-[#e8c547]/40 bg-gradient-to-l from-[#e8c547]/16 via-[#0b1a24] to-teal-500/12 px-5 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e8c547]/40 bg-[#e8c547]/15 px-2.5 py-0.5 text-[0.68rem] font-bold text-[#e8c547]">
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            {STORE_HALAQMAP_OPS_BANNER.badgeAr}
          </p>
          <p className="mt-2 text-base font-extrabold leading-7 text-[#f4efe4] md:text-lg">
            {STORE_HALAQMAP_OPS_BANNER.titleAr}
          </p>
        </div>
        <a
          href={STORE_HALAQMAP_OPS_BANNER.packagesHref}
          className="inline-flex shrink-0 rounded-full bg-[#e8c547] px-5 py-2.5 text-sm font-extrabold text-[#061018] hover:bg-[#f0d36a]"
        >
          {STORE_HALAQMAP_OPS_BANNER.ctaAr}
        </a>
      </div>
    </section>
  );
}
