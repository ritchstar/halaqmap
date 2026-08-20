/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط كوافير ماب — مستقل عن شريط تشغيل اشتراك حلاق ماب.
 */
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { COIFFEUR_STATUS_TICKER } from '@/config/coiffeurMapUmbrella';
import { ROUTE_PATHS } from '@/lib/routePaths';

const LOOP = [...COIFFEUR_STATUS_TICKER.segments, ...COIFFEUR_STATUS_TICKER.segments];

export function CoiffeurStatusTicker() {
  return (
    <div
      className="relative shrink-0 overflow-hidden border-b border-[#f4d4c0]/20 bg-gradient-to-l from-[#f4d4c0]/12 via-[#14080e] to-rose-900/40"
      role="region"
      aria-label={COIFFEUR_STATUS_TICKER.ariaAr}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-8 bg-gradient-to-l from-[#14080e] to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-8 bg-gradient-to-r from-[#14080e] to-transparent md:block" />

      <div className="flex min-h-11 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span className="pointer-events-none inline-flex shrink-0 items-center gap-1 rounded-full border border-[#f4d4c0]/35 bg-[#f4d4c0]/10 px-2.5 py-1 text-xs font-bold text-[#f4d4c0] sm:text-[0.68rem]">
          <Sparkles className="h-3.5 w-3.5 sm:h-3 sm:w-3" aria-hidden />
          {COIFFEUR_STATUS_TICKER.badgeAr}
        </span>

        <div className="hidden min-w-0 flex-1 overflow-hidden md:block" data-bidi="off" dir="rtl">
          <div className="coiffeur-status-marquee-track flex w-max items-center gap-8 motion-reduce:animate-none">
            {LOOP.map((segment, index) => (
              <span
                key={`${segment}-${index}`}
                className="whitespace-nowrap text-[0.68rem] font-semibold text-rose-50 sm:text-xs"
              >
                {segment}
                <span className="mx-4 text-[#f4d4c0]/45" aria-hidden>
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>

        <Link
          to={ROUTE_PATHS.COIFFEUR_INTEREST}
          className="relative z-20 ms-auto inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#f4d4c0]/40 bg-[#f4d4c0]/15 px-3.5 text-sm font-bold text-[#f4d4c0] sm:min-h-0 sm:px-3 sm:py-1 sm:text-[0.68rem]"
        >
          {COIFFEUR_STATUS_TICKER.ctaAr}
        </Link>
      </div>
    </div>
  );
}
