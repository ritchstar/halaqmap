import { DIGITAL_SHIFT_PRODUCT_FEATURES_AR } from '@/config/digitalShiftAssistant';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  /** compact = أصغر للتoggle؛ default = قائمة كاملة */
  variant?: 'default' | 'compact';
  title?: string;
};

export function DigitalShiftFeatureBullets({
  className,
  variant = 'default',
  title = 'مزايا الإضافة البرمجية المتقدمة',
}: Props) {
  const items =
    variant === 'compact'
      ? DIGITAL_SHIFT_PRODUCT_FEATURES_AR.filter((_, i) => i === 1 || i === 2 || i === 3)
      : DIGITAL_SHIFT_PRODUCT_FEATURES_AR;

  return (
    <div className={cn('space-y-2 text-right', className)}>
      {variant === 'default' ? (
        <p className="text-xs font-semibold text-foreground/90">{title}</p>
      ) : null}
      <ul
        className={cn(
          'space-y-1.5',
          variant === 'compact' ? 'text-[10px] leading-relaxed text-slate-400' : 'text-xs leading-relaxed text-muted-foreground',
        )}
      >
        {items.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-right">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/80" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
