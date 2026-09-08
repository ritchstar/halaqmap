/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link, useLocation } from 'react-router-dom';
import {
  STORE_NATIONAL_DAY_COPY,
  STORE_NATIONAL_DAY_IDENTITY_MARK_SRC,
  STORE_NATIONAL_DAY_PUBLIC_ENABLED,
  nationalDayCampaignPhase,
} from '@/config/storeNationalDay';
import { ROUTE_PATHS } from '@/lib/routePaths';

export function StoreNationalDayPromoBanner() {
  const location = useLocation();
  if (!STORE_NATIONAL_DAY_PUBLIC_ENABLED) return null;
  if (nationalDayCampaignPhase() !== 'active') return null;
  if (location.pathname.startsWith(ROUTE_PATHS.STORE_NATIONAL_DAY)) return null;

  const copy = STORE_NATIONAL_DAY_COPY;

  return (
    <section className="px-4 pb-4" aria-label={copy.kickerAr}>
      <Link
        to={ROUTE_PATHS.STORE_NATIONAL_DAY}
        className="store-national-day-promo mx-auto flex max-w-5xl items-center gap-4 rounded-2xl border border-[#006c35]/25 bg-gradient-to-l from-[#f5f0e6] to-[#fffdf8] p-4 shadow-sm transition hover:border-[#006c35]/40"
      >
        <img
          src={STORE_NATIONAL_DAY_IDENTITY_MARK_SRC}
          alt=""
          aria-hidden="true"
          className="store-national-day-promo__mark h-20 w-20 shrink-0 rounded-xl object-cover shadow-md"
          width={80}
          height={80}
          decoding="async"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-[#006c35]">{copy.kickerAr}</span>
          <span className="mt-1 block text-base font-extrabold text-[#004d27]">{copy.heroTitleAr}</span>
          <span className="mt-2 block text-sm leading-7 text-[#5c6b65]">{copy.brandLineAr}</span>
          <span className="mt-3 inline-flex min-h-[2.5rem] items-center rounded-full bg-[#006c35] px-4 text-sm font-bold text-white">
            {copy.heroCtaAr}
          </span>
        </span>
      </Link>
    </section>
  );
}
