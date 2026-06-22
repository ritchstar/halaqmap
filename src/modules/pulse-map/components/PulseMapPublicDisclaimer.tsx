import {
  PULSE_MAP_DOCTRINE_LINE_AR,
  PULSE_MAP_PUBLIC_DISCLAIMER_AR,
} from '@/config/pulseMapConfig';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

/** إخلاء مسؤولية + عقيدة الظهور عند الطلب — فوق الخريطة العامة */
export function PulseMapPublicDisclaimer({ className, compact = false }: Props) {
  return (
    <div
      dir="rtl"
      className={cn(
        'rounded-2xl border border-sky-400/20 bg-sky-950/40 px-4 py-3 text-right backdrop-blur-sm',
        compact ? 'text-[0.68rem] leading-relaxed' : 'text-xs leading-relaxed',
        className,
      )}
    >
      <p className="font-semibold text-sky-100">{PULSE_MAP_PUBLIC_DISCLAIMER_AR}</p>
      {!compact ? (
        <p className="mt-2 text-sky-200/75">{PULSE_MAP_DOCTRINE_LINE_AR}</p>
      ) : null}
    </div>
  );
}
