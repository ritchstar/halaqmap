import type { ReactNode } from 'react';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'warn' | 'neutral';

type Props = {
  children: ReactNode;
  tone?: Tone;
  title?: string;
  className?: string;
};

export function FounderGlowBadge({ children, tone = 'neutral', title, className }: Props) {
  const toneClass =
    tone === 'ok' ? founderTheme.badgeOk : tone === 'warn' ? founderTheme.badgeWarn : founderTheme.badgeNeutral;

  return (
    <span title={title} className={cn(toneClass, className)}>
      {children}
    </span>
  );
}
