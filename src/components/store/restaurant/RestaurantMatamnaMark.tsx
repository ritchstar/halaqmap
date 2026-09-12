/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة مطعمنا1 — مستوحاة من تصميم Chatly.
 */
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

type RestaurantMatamnaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function RestaurantMatamnaMark({ className, size = 'md', inverse = false }: RestaurantMatamnaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة مطعمنا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#fde8d4]'
          : 'border-[#f0c9a8] bg-[#fdeee0] text-[#c97430]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <UtensilsCrossed size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
