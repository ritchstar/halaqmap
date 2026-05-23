import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DigitalShiftFeatureBullets } from '@/components/billing/DigitalShiftFeatureBullets';
import {
  DIGITAL_SHIFT_ADDON_VALUE_AR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
} from '@/config/subscriptionPricing';
import { cn } from '@/lib/utils';

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  id?: string;
};

export function DigitalShiftAddonToggle({ checked, onCheckedChange, className, id = 'digital-shift-addon' }: Props) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-600 bg-slate-900 p-3 text-right transition-colors',
        checked && 'border-cyan-400/50 bg-slate-800 ring-1 ring-cyan-400/20',
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5 border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="border-cyan-400/35 bg-cyan-950/40 text-[10px] font-semibold text-cyan-100"
          >
            {DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR}
          </Badge>
          <p className="text-sm font-semibold text-slate-100">المناوب الرقمي الذكي 🌙</p>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">{DIGITAL_SHIFT_ADDON_VALUE_AR}</p>
        <p className="text-[11px] leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س</span> / حزمة
          رخصة — إضافة منفصلة عن الرخصة التقنية
        </p>
        <DigitalShiftFeatureBullets variant="compact" className="pt-1" />
      </div>
    </label>
  );
}
