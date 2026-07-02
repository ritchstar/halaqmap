import { ShieldAlert } from 'lucide-react';
import {
  PLATFORM_SECURITY_INCIDENT_MARQUEE_SEGMENTS,
  shouldShowPlatformSecurityIncidentBanner,
} from '@/config/platformSecurityIncidentBanner';
import { cn } from '@/lib/utils';

type PlatformSecurityIncidentStripProps = {
  className?: string;
  /** يُجبر الإظهار دون التحقق من env (معاينة أو صفحات خاصة) */
  forceShow?: boolean;
};

export function PlatformSecurityIncidentStrip({
  className,
  forceShow = false,
}: PlatformSecurityIncidentStripProps) {
  if (!forceShow && !shouldShowPlatformSecurityIncidentBanner()) {
    return null;
  }

  const segments = PLATFORM_SECURITY_INCIDENT_MARQUEE_SEGMENTS;
  const loopItems = [...segments, ...segments];

  return (
    <div
      className={cn(
        'platform-security-incident-strip relative z-[60] shrink-0 overflow-hidden',
        'border-b-2 border-red-500/70',
        'bg-gradient-to-r from-red-950 via-[#1a0508] to-red-950',
        'shadow-[0_0_24px_rgba(239,68,68,0.45),inset_0_1px_0_rgba(252,165,165,0.15)]',
        className,
      )}
      role="alert"
      aria-live="polite"
      aria-label="إعلان استنفار أمني على المنصة"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#1a0508] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#1a0508] to-transparent" />

      <div className="flex min-h-9 items-center gap-2 px-3 py-1.5 sm:min-h-10 sm:px-4">
        <span
          className={cn(
            'platform-security-incident-badge pointer-events-none inline-flex shrink-0 items-center gap-1',
            'rounded-full border border-red-300/50 bg-red-500/20 px-2 py-0.5',
            'text-[0.62rem] font-bold text-red-50 sm:text-[0.68rem]',
          )}
        >
          <ShieldAlert className="h-3 w-3 text-red-300" aria-hidden />
          استنفار أمني
        </span>

        <div className="min-w-0 flex-1 overflow-hidden" data-bidi="off" dir="ltr">
          <div className="platform-security-incident-marquee-track flex w-max items-center gap-10 motion-reduce:animate-none">
            {loopItems.map((segment, index) => (
              <span
                key={`${segment}-${index}`}
                className="whitespace-nowrap text-[0.68rem] font-semibold text-red-50 sm:text-xs"
                dir="rtl"
              >
                {segment}
                <span className="mx-4 text-red-200/45" aria-hidden>
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
