import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { founderMotion, founderTheme } from '@/components/admin/founder/founderTheme';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  delay?: number;
  /** When true, participates in parent FounderStaggerGrid variants */
  staggered?: boolean;
};

export function FounderGlassCard({
  children,
  className,
  interactive,
  delay = 0,
  staggered = false,
}: Props) {
  const motionProps = staggered
    ? { variants: founderMotion.staggerItem }
    : {
        initial: founderMotion.stagger.initial,
        animate: founderMotion.stagger.animate,
        transition: { ...founderMotion.stagger.transition, delay },
      };

  return (
    <motion.div
      {...motionProps}
      className={cn(
        founderTheme.glassCard,
        interactive && founderTheme.glassCardInteractive,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
