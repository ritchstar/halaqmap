import type { ReactNode } from 'react';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  header: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function FounderAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={founderTheme.ambientOrbCyan} />
      <div className={founderTheme.ambientOrbGold} />
      <div className={founderTheme.ambientOrbSlate} />
    </div>
  );
}

/** Obsidian luxury shell — wraps the entire admin command surface. */
export function FounderCommandShell({ children, header, footer, className }: Props) {
  return (
    <div className={cn(founderTheme.shell, 'dark', className)} dir="rtl">
      <FounderAmbient />
      {header}
      <main className="relative z-10 container mx-auto px-4 py-8 lg:px-6 lg:py-10">{children}</main>
      {footer ? (
        <footer className="relative z-10 container mx-auto px-4 pb-10 lg:px-6 lg:pb-12">{footer}</footer>
      ) : null}
    </div>
  );
}
