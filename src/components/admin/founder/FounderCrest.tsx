import type { ReactNode } from 'react';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/** Founder's crest / logo with subtle cyan pulse glow. */
export function FounderCrest({ children, className }: Props) {
  return (
    <div className={cn(founderTheme.crest, className)}>
      <span className={founderTheme.crestPulse} aria-hidden />
      <span className="relative z-10">{children}</span>
    </div>
  );
}
