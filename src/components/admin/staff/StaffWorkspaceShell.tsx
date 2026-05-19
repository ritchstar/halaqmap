import type { ReactNode } from 'react';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  header: ReactNode;
  className?: string;
};

/** Professional workspace shell — solid slate-900, no ambient effects. */
export function StaffWorkspaceShell({ children, header, className }: Props) {
  return (
    <div className={cn(staffTheme.shell, 'dark', className)} dir="rtl">
      {header}
      <main className="relative z-10 container mx-auto px-4 py-8 lg:px-6 lg:py-10">{children}</main>
    </div>
  );
}
