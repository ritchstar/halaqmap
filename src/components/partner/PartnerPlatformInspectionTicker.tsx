import { ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  PARTNER_PLATFORM_INSPECTION_MARQUEE_SEGMENTS,
  shouldShowPartnerPlatformInspectionBanner,
} from '@/config/partnerPlatformInspectionBanner';
import { cn } from '@/lib/utils';

type PartnerPlatformInspectionTickerProps = {
  className?: string;
  surface?: 'partner-dark' | 'partner-light' | 'b2b';
  /** صفحة الهبوط الرئيسية — يُجبر الإظهار دون انتظار مسار أو env */
  forceShow?: boolean;
};

export function PartnerPlatformInspectionTicker({
  className,
  surface = 'partner-dark',
  forceShow = false,
}: PartnerPlatformInspectionTickerProps) {
  const { pathname } = useLocation();

  if (!forceShow && !shouldShowPartnerPlatformInspectionBanner(pathname)) {
    return null;
  }

  const segments = PARTNER_PLATFORM_INSPECTION_MARQUEE_SEGMENTS;
  const loopItems = [...segments, ...segments];

  const surfaceClass =
    surface === 'partner-light'
      ? 'border-b-2 border-amber-400/70 bg-gradient-to-r from-amber-50 via-amber-100/80 to-teal-50 shadow-[0_4px_14px_rgba(245,158,11,0.12)]'
      : surface === 'b2b'
        ? 'border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 via-[#0A1628] to-teal-500/15'
        : 'border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-[#071426] to-teal-500/20';

  const badgeClass =
    surface === 'partner-light'
      ? 'border-sky-400/40 bg-sky-100 text-sky-950'
      : 'border-cyan-300/35 bg-cyan-400/15 text-cyan-50';

  const textClass = surface === 'partner-light' ? 'text-sky-950' : 'text-cyan-50';

  const dotClass = surface === 'partner-light' ? 'text-sky-500/45' : 'text-cyan-200/45';

  const fadeClass =
    surface === 'partner-light'
      ? 'from-white to-transparent'
      : surface === 'b2b'
        ? 'from-[#0A1628] to-transparent'
        : 'from-[#071426] to-transparent';

  return (
    <div
      className={cn('relative z-20 shrink-0 overflow-hidden', surfaceClass, className)}
      role="region"
      aria-label="إعلان الفحص الشامل قبل إطلاق المنصة"
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
          <ShieldCheck className="h-3 w-3" aria-hidden />
          فحص شامل
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="ltr">
          <div className="partner-platform-inspection-marquee-track flex w-max items-center gap-10 motion-reduce:animate-none">
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
      </div>
    </div>
  );
}
