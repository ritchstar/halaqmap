/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة تمويناتا1 — مستوحاة من تصميم Chatly.
 */
import { ShoppingBasket } from 'lucide-react';
import { cn } from '@/lib/utils';

type GrocersTamwinatMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function GrocersTamwinatMark({ className, size = 'md', inverse = false }: GrocersTamwinatMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة تمويناتا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#d8f0cc]'
          : 'border-[#c8ddb8] bg-[#eaf4e4] text-[#6fa058]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <ShoppingBasket size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
