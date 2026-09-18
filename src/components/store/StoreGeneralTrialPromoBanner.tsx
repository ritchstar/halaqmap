/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إبراز التجربة العامة على رئيسية المتجر فقط. لا على صفحات عرض المنتجات.
 * خلفية داكنة تحت النص؛ لمسة تيل خفيفة بلا وهج يغسل الكتابة.
 */
import { Link, useLocation } from 'react-router-dom';
import {
  STORE_GENERAL_TRIAL_COPY,
  STORE_GENERAL_TRIAL_PUBLIC_ENABLED,
} from '@/config/storeProductTrial';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function StoreGeneralTrialPromoBanner() {
  const location = useLocation();
  if (!STORE_GENERAL_TRIAL_PUBLIC_ENABLED) return null;
  if (location.pathname.startsWith(ROUTE_PATHS.STORE_GENERAL_TRIAL)) return null;
  const copy = STORE_GENERAL_TRIAL_COPY;

  return (
    <section className="px-4 pb-8" aria-label={copy.promoAriaAr}>
      <Link
        to={ROUTE_PATHS.STORE_GENERAL_TRIAL}
        className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-teal-500/45 bg-gradient-to-l from-[#061018] via-[#0b1a24] to-[#0b1a24] px-5 py-5 shadow-[0_12px_28px_-18px_rgba(6,16,24,0.55)] ring-1 ring-teal-500/20 hover:ring-teal-400/35 sm:flex-row sm:items-center sm:justify-between md:px-6"
      >
        <div className="min-w-0">
          <p className="inline-flex rounded-full border border-teal-400/40 bg-teal-500/10 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-teal-200">
            {copy.promoBadgeAr}
          </p>
          <p className="mt-2 text-lg font-extrabold leading-7 text-[#f4efe4] md:text-xl">{copy.promoTitleAr}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#d9d0c0]">{copy.promoLeadAr}</p>
        </div>
        <span className="inline-flex shrink-0 rounded-full bg-teal-400 px-5 py-2.5 text-center text-sm font-extrabold text-[#061018]">
          {copy.promoCtaAr}
        </span>
      </Link>
    </section>
  );
}
