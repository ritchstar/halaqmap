/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Sparkles } from 'lucide-react';
import {
  NO_GUARANTEED_CUSTOMERS_LEAD_AR,
  NO_GUARANTEED_CUSTOMERS_POINTS_AR,
  NO_GUARANTEED_CUSTOMERS_TITLE_AR,
  mentionsNoGuaranteedCustomers,
} from '@/config/noGuaranteedCustomersCopy';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'light' | 'dark' | 'compact';
  className?: string;
};

export function NoGuaranteedCustomersNote({ variant = 'light', className }: Props) {
  const isDark = variant === 'dark';
  const compact = variant === 'compact';

  return (
    <aside
      dir="rtl"
      className={cn(
        'rounded-2xl border px-3.5 py-3',
        isDark
          ? 'border-amber-300/35 bg-[linear-gradient(145deg,rgba(251,191,36,0.14),rgba(8,47,73,0.35))] shadow-[0_0_28px_rgba(251,191,36,0.18)]'
          : 'border-amber-200/90 bg-[linear-gradient(145deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] shadow-[0_10px_24px_rgba(245,158,11,0.12)]',
        className,
      )}
    >
      <p
        className={cn(
          'flex items-start gap-1.5 font-black leading-7',
          isDark ? 'text-amber-100' : 'text-amber-900',
          compact ? 'text-[0.72rem]' : 'text-sm',
        )}
      >
        <Sparkles
          className={cn(
            'mt-0.5 shrink-0',
            isDark ? 'text-amber-200' : 'text-amber-600',
            compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
          )}
          aria-hidden
        />
        <span>{NO_GUARANTEED_CUSTOMERS_TITLE_AR}</span>
      </p>
      <p
        className={cn(
          'mt-1.5 leading-7',
          isDark ? 'text-amber-50/90' : 'text-slate-700',
          compact ? 'text-[0.68rem]' : 'text-xs',
        )}
      >
        {NO_GUARANTEED_CUSTOMERS_LEAD_AR}
      </p>
      <ul className={cn('mt-2 space-y-1.5', compact ? 'text-[0.68rem]' : 'text-xs')}>
        {NO_GUARANTEED_CUSTOMERS_POINTS_AR.map((point) => (
          <li
            key={point}
            className={cn(
              'leading-7',
              isDark ? 'text-slate-100' : 'text-slate-700',
            )}
          >
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function NoGuaranteedCustomersNoteIf({
  text,
  variant = 'light',
  className,
}: Props & { text: string }) {
  if (!mentionsNoGuaranteedCustomers(text)) return null;
  return <NoGuaranteedCustomersNote variant={variant} className={className} />;
}
