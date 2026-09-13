/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة كافينا1 — مستوحاة من تصميم Chatly.
 */
import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

type CafeKafenaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function CafeKafenaMark({ className, size = 'md', inverse = false }: CafeKafenaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة كافينا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#f7e6cd]'
          : 'border-[#e6d2b5] bg-[#f7ecdd] text-[#8a5a28]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Coffee size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
