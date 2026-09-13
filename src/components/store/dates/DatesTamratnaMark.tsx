/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة تمرتنا1 — مستوحاة من تصميم Chatly.
 */
import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

type DatesTamratnaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function DatesTamratnaMark({ className, size = 'md', inverse = false }: DatesTamratnaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة تمرتنا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#f0e2cc]'
          : 'border-[#d8c19c] bg-[#f3e6cf] text-[#6f4a26]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Gift size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
