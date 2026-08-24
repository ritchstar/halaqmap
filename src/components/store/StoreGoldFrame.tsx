/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

export function StoreGoldFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-3xl p-[3px]',
        'bg-[conic-gradient(from_140deg,#f4efe4_0%,#e8c547_28%,#b8860b_52%,#e8c547_78%,#f4efe4_100%)]',
        'shadow-[0_0_28px_rgba(232,197,71,0.28),0_0_64px_rgba(184,134,11,0.16)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_15%,rgba(244,239,228,0.28),transparent_42%)] opacity-70"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl bg-[#061018]">{children}</div>
    </div>
  );
}
