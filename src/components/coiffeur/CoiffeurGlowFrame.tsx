/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  rounded?: 'xl' | '3xl';
};

export function CoiffeurGlowFrame({ children, className, rounded = '3xl' }: Props) {
  const radius = rounded === 'xl' ? 'rounded-xl' : 'rounded-3xl';
  return (
    <div
      className={cn(
        'relative p-[3px]',
        radius,
        'bg-[conic-gradient(from_140deg,#f7efe8_0%,#f4d4c0_22%,#c98b96_48%,#f4d4c0_72%,#f7efe8_100%)]',
        'shadow-[0_0_28px_rgba(244,212,192,0.28),0_0_64px_rgba(201,139,150,0.18)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-70',
          radius,
          'bg-[radial-gradient(circle_at_20%_15%,rgba(247,239,232,0.35),transparent_42%)]',
        )}
        aria-hidden
      />
      <div className={cn('relative overflow-hidden bg-[#14080e]', radius)}>{children}</div>
    </div>
  );
}
