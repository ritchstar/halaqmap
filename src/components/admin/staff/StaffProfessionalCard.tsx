import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { staffMotion, staffTheme } from '@/components/admin/staff/staffTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  animate?: boolean;
};

export function StaffProfessionalCard({ children, className, interactive, animate = false }: Props) {
  const body = (
    <div
      className={cn(
        staffTheme.card,
        interactive && staffTheme.cardInteractive,
        className,
      )}
    >
      {children}
    </div>
  );

  if (!animate) return body;

  return <motion.div {...staffMotion.panel}>{body}</motion.div>;
}
