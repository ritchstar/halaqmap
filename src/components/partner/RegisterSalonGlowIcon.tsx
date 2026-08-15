/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Scissors, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE = {
  sm: { wrap: 'h-5 w-5', icon: 'h-2.5 w-2.5', spark: 'h-1.5 w-1.5' },
  md: { wrap: 'h-6 w-6', icon: 'h-3 w-3', spark: 'h-2 w-2' },
  lg: { wrap: 'h-7 w-7', icon: 'h-3.5 w-3.5', spark: 'h-2 w-2' },
} as const;

type Tone = 'gold' | 'frost' | 'teal';

const TONE: Record<Tone, string> = {
  gold: 'register-salon-glow--gold',
  frost: 'register-salon-glow--frost',
  teal: 'register-salon-glow--teal',
};

type Props = {
  size?: keyof typeof SIZE;
  tone?: Tone;
  className?: string;
};

/** أيقونة تسجيل الصالون — وهج يحثّ على الإجراء داخل أزرار الانضمام */
export function RegisterSalonGlowIcon({ size = 'md', tone = 'gold', className }: Props) {
  const dim = SIZE[size];
  return (
    <span
      className={cn('register-salon-glow', TONE[tone], dim.wrap, className)}
      aria-hidden
    >
      <span className="register-salon-glow__halo" />
      <span className="register-salon-glow__disc">
        <Scissors className={cn(dim.icon, 'register-salon-glow__blade')} strokeWidth={2.4} />
      </span>
      <Sparkles className={cn(dim.spark, 'register-salon-glow__spark register-salon-glow__spark--a')} />
      <Sparkles className={cn(dim.spark, 'register-salon-glow__spark register-salon-glow__spark--b')} />
    </span>
  );
}
