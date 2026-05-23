import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { founderMotion } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/** Staggered fade/slide-up grid for dashboard sections. */
export function FounderStaggerGrid({ children, className }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={founderMotion.staggerContainer}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/** Single stagger child — pair with FounderStaggerGrid. */
export function FounderStaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={founderMotion.staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
