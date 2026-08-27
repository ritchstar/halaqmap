/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إبراز هدية خريطة الحل على واجهة المتجر وصفحات افراحي1 واجواء1 فقط.
 */
import { Link, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import {
  STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED,
  STORE_GIFT_COPY,
} from '@/config/storeGiftCampaign';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreGiftPromoBanner({ compact = false }: { compact?: boolean }) {
  const location = useLocation();
  if (!STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED) return null;
  if (location.pathname.startsWith(ROUTE_PATHS.STORE_GIFT)) return null;
  const copy = STORE_GIFT_COPY;

  return (
    <section className={cn('px-4', compact ? 'pb-4 pt-4' : 'pb-8')} aria-label={copy.promoAriaAr}>
      <Link
        to={ROUTE_PATHS.STORE_GIFT}
        className={cn(
          'mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-[#e8c547] bg-gradient-to-l from-[#e8c547]/25 via-[#0b1a24] to-[#061018] shadow-[0_24px_50px_-22px_rgba(232,197,71,0.75)] ring-1 ring-[#e8c547]/40 hover:ring-[#f0d36a]',
          compact ? 'px-4 py-3 sm:flex-row sm:items-center sm:justify-between' : 'px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6',
        )}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#e8c547]/50 bg-[#e8c547]/20 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-[#e8c547]">
            <Gift className="h-3.5 w-3.5" aria-hidden />
            {copy.promoBadgeAr}
          </p>
          <p
            className={cn(
              'mt-2 font-extrabold leading-7 text-[#f4efe4]',
              compact ? 'text-base md:text-lg' : 'text-lg md:text-xl',
            )}
          >
            {copy.promoTitleAr}
          </p>
          {compact ? null : <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">{copy.promoLeadAr}</p>}
        </div>
        <span className="inline-flex shrink-0 rounded-full bg-[#e8c547] px-5 py-2.5 text-center text-sm font-extrabold text-[#061018]">
          {copy.promoCtaAr}
        </span>
      </Link>
    </section>
  );
}
