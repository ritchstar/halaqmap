/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة خضارنا1 — مستوحاة من تصميم Chatly.
 */
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProduceKhudaranaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

export function ProduceKhudaranaMark({ className, size = 'md', inverse = false }: ProduceKhudaranaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;

  return (
    <span
      aria-label="دمغة خضارنا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse
          ? 'border-white/20 bg-white/10 text-[#cbe4b8]'
          : 'border-[#c4d4b9] bg-[#eaf1e4] text-[#4f813f]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Leaf size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
