/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعريف «رخصة النفاذ الرقمية» — متاح بلوحة المفاتيح والجوال.
 */
import { Info } from 'lucide-react';
import { DIGITAL_ACCESS_LICENSE_DEFINITION_AR } from '@/config/platformSoftwareRegistration';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  label?: string;
};

export function DigitalAccessLicenseHint({
  className,
  label = 'رخصة النفاذ الرقمية',
}: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span>{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-teal-200/80 transition-colors hover:bg-white/10 hover:text-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
            aria-label={`تعريف ${label}`}
          >
            <Info className="h-4 w-4" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="max-w-sm border-white/15 bg-[#0a1628] text-right text-sm leading-7 text-slate-200"
          dir="rtl"
        >
          {DIGITAL_ACCESS_LICENSE_DEFINITION_AR}
        </PopoverContent>
      </Popover>
    </span>
  );
}
