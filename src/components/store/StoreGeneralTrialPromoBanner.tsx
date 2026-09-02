/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إبراز التجربة العامة على رئيسية المتجر فقط. لا على صفحات عرض المنتجات.
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
        className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-teal-300 bg-gradient-to-l from-teal-400/20 via-[#0b1a24] to-[#061018] px-5 py-5 shadow-[0_24px_50px_-22px_rgba(45,212,191,0.55)] ring-1 ring-teal-300/35 hover:ring-teal-200 sm:flex-row sm:items-center sm:justify-between md:px-6"
      >
        <div className="min-w-0">
          <p className="inline-flex rounded-full border border-teal-300/50 bg-teal-400/15 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-teal-200">
            {copy.promoBadgeAr}
          </p>
          <p className="mt-2 text-lg font-extrabold leading-7 text-[#f4efe4] md:text-xl">{copy.promoTitleAr}</p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">{copy.promoLeadAr}</p>
        </div>
        <span className="inline-flex shrink-0 rounded-full bg-teal-400 px-5 py-2.5 text-center text-sm font-extrabold text-[#061018]">
          {copy.promoCtaAr}
        </span>
      </Link>
    </section>
  );
}
