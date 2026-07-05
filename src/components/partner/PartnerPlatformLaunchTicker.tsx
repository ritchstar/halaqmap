import { Link, useLocation } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import {
  PARTNER_PLATFORM_LAUNCH_MARQUEE_SEGMENTS,
  shouldShowPartnerPlatformLaunchBanner,
} from '@/config/partnerPlatformLaunchBanner';
import { cn } from '@/lib/utils';

type PartnerPlatformLaunchTickerProps = {
  className?: string;
  surface?: 'partner-dark' | 'partner-light' | 'b2b';
  forceShow?: boolean;
};

export function PartnerPlatformLaunchTicker({
  className,
  surface = 'partner-dark',
  forceShow = false,
}: PartnerPlatformLaunchTickerProps) {
  const { pathname } = useLocation();

  if (!forceShow && !shouldShowPartnerPlatformLaunchBanner(pathname)) {
    return null;
  }

  const segments = PARTNER_PLATFORM_LAUNCH_MARQUEE_SEGMENTS;
  const loopItems = [...segments, ...segments];

  const surfaceClass =
    surface === 'partner-light'
      ? 'border-b-2 border-emerald-400/60 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-[0_4px_14px_rgba(16,185,129,0.12)]'
      : surface === 'b2b'
        ? 'border-emerald-400/35 bg-gradient-to-r from-emerald-500/20 via-[#0A1628] to-teal-500/15'
        : 'border-emerald-400/30 bg-gradient-to-r from-emerald-500/15 via-[#071426] to-teal-500/20';

  const badgeClass =
    surface === 'partner-light'
      ? 'border-emerald-500/40 bg-emerald-100 text-emerald-950'
      : 'border-emerald-300/40 bg-emerald-400/15 text-emerald-50';

  const textClass = surface === 'partner-light' ? 'text-emerald-950' : 'text-emerald-50';

  const dotClass = surface === 'partner-light' ? 'text-emerald-600/40' : 'text-emerald-200/45';

  const fadeClass =
    surface === 'partner-light'
      ? 'from-emerald-50 to-transparent'
      : surface === 'b2b'
        ? 'from-[#0A1628] to-transparent'
        : 'from-[#071426] to-transparent';

  const ctaClass =
    surface === 'partner-light'
      ? 'border-emerald-700/30 bg-emerald-600/10 text-emerald-900 hover:bg-emerald-600/15'
      : 'border-emerald-300/35 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30';

  return (
    <div
      className={cn('relative z-20 shrink-0 overflow-hidden', surfaceClass, className)}
      role="region"
      aria-label="إعلان فتح التسجيل على المنصة"
    >
      <div className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r', fadeClass)} />
      <div className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l', fadeClass)} />

      <div className="flex min-h-9 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span
          className={cn(
            'pointer-events-none inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold sm:text-[0.68rem]',
            badgeClass,
          )}
        >
          <Rocket className="h-3 w-3" aria-hidden />
          مفتوح الآن
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="ltr">
          <div className="partner-platform-launch-marquee-track flex w-max items-center gap-10 motion-reduce:animate-none">
            {loopItems.map((segment, index) => (
              <span
                key={`${segment}-${index}`}
                className={cn('whitespace-nowrap text-[0.68rem] font-semibold sm:text-xs', textClass)}
                dir="rtl"
              >
                {segment}
                <span className={cn('mx-4', dotClass)} aria-hidden>
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>

        <Link
          to={ROUTE_PATHS.REGISTER}
          className={cn(
            'relative z-20 shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] font-bold transition-colors sm:px-3 sm:text-[0.68rem]',
            ctaClass,
          )}
        >
          سجّل الآن
        </Link>
      </div>
    </div>
  );
}
