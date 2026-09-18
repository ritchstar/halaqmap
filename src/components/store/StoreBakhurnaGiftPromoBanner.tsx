/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إبراز هدية بخورنا1 على صفحة الهبوط فقط.
 */
import { Link, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import {
  STORE_BAKHURNA_GIFT_CAMPAIGN_PUBLIC_ENABLED,
  STORE_BAKHURNA_GIFT_COPY,
} from '@/config/storeBakhurnaGiftCampaign';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreBakhurnaGiftPromoBanner({ compact = false }: { compact?: boolean }) {
  const location = useLocation();
  if (!STORE_BAKHURNA_GIFT_CAMPAIGN_PUBLIC_ENABLED) return null;
  if (location.pathname.startsWith(ROUTE_PATHS.STORE_BAKHURNA_GIFT)) return null;
  const copy = STORE_BAKHURNA_GIFT_COPY;

  return (
    <section className={cn('px-4', compact ? 'pb-4 pt-4' : 'pb-8')} aria-label={copy.promoAriaAr}>
      <Link
        to={ROUTE_PATHS.STORE_BAKHURNA_GIFT}
        className={cn(
          'mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-[#6E4A26]/55 bg-gradient-to-l from-[#061018] via-[#1a140c] to-[#1a140c] shadow-[0_12px_28px_-18px_rgba(6,16,24,0.55)] ring-1 ring-[#6E4A26]/25 hover:ring-[#8a6239]/50',
          compact
            ? 'px-4 py-3 sm:flex-row sm:items-center sm:justify-between'
            : 'px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6',
        )}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-[#6E4A26]/50 bg-[#6E4A26]/20 px-2.5 py-0.5 text-[0.7rem] font-extrabold text-[#6E4A26]">
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
        <span className="inline-flex shrink-0 rounded-full bg-[#6E4A26] px-5 py-2.5 text-center text-sm font-extrabold text-[#061018]">
          {copy.promoCtaAr}
        </span>
      </Link>
    </section>
  );
}
