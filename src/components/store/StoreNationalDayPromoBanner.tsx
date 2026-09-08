/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link, useLocation } from 'react-router-dom';
import {
  STORE_NATIONAL_DAY_COPY,
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
        className="mx-auto block max-w-5xl rounded-2xl border border-[#006c35]/25 bg-gradient-to-l from-[#f5f0e6] to-[#fffdf8] p-4 shadow-sm transition hover:border-[#006c35]/40"
      >
        <p className="text-xs font-bold text-[#006c35]">{copy.kickerAr}</p>
        <p className="mt-1 text-base font-extrabold text-[#004d27]">{copy.heroTitleAr}</p>
        <p className="mt-2 text-sm leading-7 text-[#5c6b65]">{copy.brandLineAr}</p>
        <span className="mt-3 inline-flex min-h-[2.5rem] items-center rounded-full bg-[#006c35] px-4 text-sm font-bold text-white">
          {copy.heroCtaAr}
        </span>
      </Link>
    </section>
  );
}
