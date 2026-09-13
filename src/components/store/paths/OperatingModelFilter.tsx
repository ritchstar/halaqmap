/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مرشّح نموذج العمل — يبدأ من طريقة تشغيل الزائر، لا من اسم المنتج.
 */
import type { ProductPathOperatingModel, ProductPathOperatingModelOption } from '@/config/storeProductPathTypes';
import { cn } from '@/lib/utils';

export function OperatingModelFilter({
  options,
  active,
  onChange,
}: {
  options: readonly ProductPathOperatingModelOption[];
  active: ProductPathOperatingModel | 'all';
  onChange: (next: ProductPathOperatingModel | 'all') => void;
}) {
  return (
    <div role="group" aria-label="اختر طريقة عملك" className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange('all')}
        aria-pressed={active === 'all'}
        className={cn(
          'min-h-11 rounded-full border px-4 py-2 text-xs font-bold transition sm:text-sm',
          active === 'all'
            ? 'border-[#1f2933] bg-[#1f2933] text-white'
            : 'border-[#bdb5a7] bg-[#fffdf8] text-[#1f2933] hover:border-[#1f2933]',
        )}
      >
        كل المسارات
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={active === option.id}
          className={cn(
            'min-h-11 rounded-full border px-4 py-2 text-xs font-bold transition sm:text-sm',
            active === option.id
              ? 'border-[#1f2933] bg-[#1f2933] text-white'
              : 'border-[#bdb5a7] bg-[#fffdf8] text-[#1f2933] hover:border-[#1f2933]',
          )}
        >
          {option.labelAr}
        </button>
      ))}
    </div>
  );
}
