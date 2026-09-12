/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة كافينا1 — مستوحاة من تصميم Chatly.
 */
import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

type CafeCafenaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function CafeCafenaMark({ className, size = 'md', inverse = false }: CafeCafenaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة كافينا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#fde8d4]'
          : 'border-[#e8c090] bg-[#fde8d4] text-[#9a5c32]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Coffee size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
