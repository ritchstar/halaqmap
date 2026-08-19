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
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#14080e] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#14080e] to-transparent" />

      <div className="flex min-h-9 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span className="pointer-events-none inline-flex shrink-0 items-center gap-1 rounded-full border border-[#f4d4c0]/35 bg-[#f4d4c0]/10 px-2 py-0.5 text-[0.62rem] font-bold text-[#f4d4c0] sm:text-[0.68rem]">
          <Sparkles className="h-3 w-3" aria-hidden />
          {COIFFEUR_STATUS_TICKER.badgeAr}
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="rtl">
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
          className="relative z-20 shrink-0 rounded-full border border-[#f4d4c0]/40 bg-[#f4d4c0]/15 px-2.5 py-1 text-[0.62rem] font-bold text-[#f4d4c0] sm:px-3 sm:text-[0.68rem]"
        >
          {COIFFEUR_STATUS_TICKER.ctaAr}
        </Link>
      </div>
    </div>
  );
}
