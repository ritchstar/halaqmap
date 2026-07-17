import {
  PULSE_MAP_DOCTRINE_LINE_AR,
  PULSE_MAP_PUBLIC_DISCLAIMER_AR,
} from '@/config/pulseMapConfig';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

/** إخلاء مسؤولية + مبدأ الظهور عند الطلب — فوق الخريطة العامة */
export function PulseMapPublicDisclaimer({ className, compact = false }: Props) {
  return (
    <div
      dir="rtl"
      className={cn(
        'rounded-2xl border border-sky-400/20 bg-sky-950/40 px-5 py-4 text-right backdrop-blur-sm',
        compact ? 'text-sm leading-relaxed' : 'text-base leading-relaxed',
        className,
      )}
    >
      <p className="font-bold text-sky-50">{PULSE_MAP_PUBLIC_DISCLAIMER_AR}</p>
      {!compact ? (
        <p className="mt-2.5 text-sm leading-relaxed text-sky-100/80 sm:text-base">
          {PULSE_MAP_DOCTRINE_LINE_AR}
        </p>
      ) : null}
    </div>
  );
}
