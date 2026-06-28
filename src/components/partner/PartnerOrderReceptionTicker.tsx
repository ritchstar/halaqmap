import { Link, useLocation } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import {
  buildPartnerOrderReceptionMarqueeSegments,
  getPartnerOrderReceptionDaysUntilOpen,
  shouldShowPartnerOrderReceptionBanner,
} from '@/config/partnerOrderReceptionAnnouncement';
import { cn } from '@/lib/utils';

type PartnerOrderReceptionTickerProps = {
  className?: string;
  /** partner-dark: مسار الشركاء · partner-light: هبوط فاتح · b2b: Skywork */
  surface?: 'partner-dark' | 'partner-light' | 'b2b';
};

export function PartnerOrderReceptionTicker({
  className,
  surface = 'partner-dark',
}: PartnerOrderReceptionTickerProps) {
  const { pathname } = useLocation();
  const daysUntil = getPartnerOrderReceptionDaysUntilOpen();

  if (!shouldShowPartnerOrderReceptionBanner(pathname) || daysUntil == null) {
    return null;
  }

  const segments = buildPartnerOrderReceptionMarqueeSegments(daysUntil);
  const loopItems = [...segments, ...segments];

  const surfaceClass =
    surface === 'partner-light'
      ? 'border-amber-300/40 bg-gradient-to-l from-amber-100 via-amber-50 to-teal-50'
      : surface === 'b2b'
        ? 'border-teal-500/30 bg-gradient-to-l from-teal-500/25 via-amber-400/10 to-[#0A1628]'
        : 'border-amber-400/25 bg-gradient-to-l from-amber-500/20 via-amber-400/10 to-teal-500/15';

  const badgeClass =
    surface === 'partner-light'
      ? 'border-amber-400/40 bg-amber-200/60 text-amber-900'
      : 'border-amber-300/30 bg-amber-400/15 text-amber-100';

  const textClass =
    surface === 'partner-light' ? 'text-amber-950' : 'text-amber-50';

  const dotClass =
    surface === 'partner-light' ? 'text-amber-600/40' : 'text-amber-300/50';

  const fadeClass =
    surface === 'partner-light'
      ? 'from-amber-50 to-transparent'
      : surface === 'b2b'
        ? 'from-[#0A1628] to-transparent'
        : 'from-[#071426] to-transparent';

  const ctaClass =
    surface === 'partner-light'
      ? 'border-teal-600/30 bg-teal-600/10 text-teal-900 hover:bg-teal-600/15'
      : 'border-teal-300/35 bg-teal-500/20 text-teal-50 hover:bg-teal-500/30';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden',
        surfaceClass,
        className,
      )}
      role="region"
      aria-label="إعلان موعد استقبال طلبات الشركاء"
    >
      <div className={cn('pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l', fadeClass)} />
      <div className={cn('pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r', fadeClass)} />

      <div className="flex min-h-9 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span className={cn('pointer-events-none inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold sm:text-[0.68rem]', badgeClass)}>
          <Megaphone className="h-3 w-3" aria-hidden />
          إعلان
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="rtl">
          <div className="partner-order-reception-marquee-track flex w-max items-center gap-8 motion-reduce:animate-none">
            {loopItems.map((segment, index) => (
              <span
                key={`${segment}-${index}`}
                className={cn('whitespace-nowrap text-[0.68rem] font-semibold sm:text-xs', textClass)}
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
          to={ROUTE_PATHS.PARTNER_INTEREST}
          className={cn('relative z-20 shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] font-bold transition-colors sm:px-3 sm:text-[0.68rem]', ctaClass)}
        >
          سجّل اهتمامك
        </Link>
      </div>
    </div>
  );
}
