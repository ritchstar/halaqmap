/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة طبختنا1 — مستوحاة من تصميم Chatly.
 */
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

type KitchenTabkhatnaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function KitchenTabkhatnaMark({ className, size = 'md', inverse = false }: KitchenTabkhatnaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة طبختنا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#fde3c6]'
          : 'border-[#f0c8a0] bg-[#fde3c6] text-[#b23a0f]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Home size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
