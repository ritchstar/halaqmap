/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة بخورنا1 — مستوحاة من تصميم Chatly.
 */
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type BakhurnaMabkharaMarkProps = { className?: string; size?: 'sm' | 'md' | 'lg'; inverse?: boolean };
const sizeClasses = { sm: 'size-9 rounded-lg', md: 'size-11 rounded-xl', lg: 'size-14 rounded-2xl' };

export function BakhurnaMabkharaMark({ className, size = 'md', inverse = false }: BakhurnaMabkharaMarkProps) {
  const iconSize = size === 'sm' ? 17 : size === 'md' ? 21 : 27;
  return (
    <span
      aria-label="دمغة بخورنا1"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border shadow-sm',
        sizeClasses[size],
        inverse ? 'border-white/20 bg-white/10 text-[#f0e2cc]' : 'border-[#c9ae7a] bg-[#f3e6cf] text-[#6e4a26]',
        className,
      )}
    >
      <span className="absolute inset-x-1.5 bottom-1.5 h-1 rounded-full bg-current opacity-25" />
      <Flame size={iconSize} strokeWidth={2} className="relative" />
    </span>
  );
}
