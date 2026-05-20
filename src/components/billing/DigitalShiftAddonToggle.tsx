import { Checkbox } from '@/components/ui/checkbox';
import { DIGITAL_SHIFT_MONTHLY_ADDON_SAR } from '@/config/subscriptionPricing';
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
        checked && 'border-slate-400 bg-slate-800',
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5 border-slate-500 data-[state=checked]:bg-slate-200 data-[state=checked]:text-slate-900"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-slate-100">المناوب الرقمي الذكي 🌙</p>
        <p className="text-[11px] leading-relaxed text-slate-400">
          ردود على الشات وإدارة الضيافة على البنر —{' '}
          <span className="font-semibold text-slate-200">+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س</span> / حزمة
          برمجية
        </p>
      </div>
    </label>
  );
}
