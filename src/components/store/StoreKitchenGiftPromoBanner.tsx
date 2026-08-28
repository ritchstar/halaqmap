/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إبراز هدية طبختنا1 على صفحة الهبوط فقط.
 */
import { Link, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import {
  STORE_KITCHEN_GIFT_CAMPAIGN_PUBLIC_ENABLED,
  STORE_KITCHEN_GIFT_COPY,
} from '@/config/storeKitchenGiftCampaign';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreKitchenGiftPromoBanner({ compact = false }: { compact?: boolean }) {
  const location = useLocation();
  if (!STORE_KITCHEN_GIFT_CAMPAIGN_PUBLIC_ENABLED) return null;
  if (location.pathname.startsWith(ROUTE_PATHS.STORE_KITCHEN_GIFT)) return null;
  const copy = STORE_KITCHEN_GIFT_COPY;

  return (
    <section className={cn('px-4', compact ? 'pb-4 pt-4' : 'pb-8')} aria-label={copy.promoAriaAr}>
      <Link
        to={ROUTE_PATHS.STORE_KITCHEN_GIFT}
        className={cn(
          'mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-[#b45a3c] bg-gradient-to-l from-[#b45a3c]/25 via-[#1a0c08] to-[#061018] shadow-[0_24px_50px_-22px_rgba(180,90,60,0.75)] ring-1 ring-[#b45a3c]/40 hover:ring-[#d07a5c]',
          compact
            ? 'px-4 py-3 sm:flex-row sm:items-center sm:justify-between'
            : 'px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6',
        )}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#b45a3c]/50 bg-[#b45a3c]/20 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-[#b45a3c]">
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
        <span className="inline-flex shrink-0 rounded-full bg-[#b45a3c] px-5 py-2.5 text-center text-sm font-extrabold text-[#061018]">
          {copy.promoCtaAr}
        </span>
      </Link>
    </section>
  );
}
