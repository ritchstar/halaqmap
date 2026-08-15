/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { cn } from '@/lib/utils';

type Props = {
  source: string;
  label?: string;
  className?: string;
};

export function CoiffeurInterestCta({
  source,
  label = 'سجّلي اهتمامك وتلقّي التحديثات بالبريد',
  className,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('flex justify-center px-5 py-8', className)}>
      <motion.div
        className="relative w-full max-w-xl"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.015, 1], filter: ['brightness(1)', 'brightness(1.08)', 'brightness(1)'] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[#f4d4c0]/25 blur-xl"
          aria-hidden
        />
        <Link
          to={`${ROUTE_PATHS.COIFFEUR_INTEREST}?utm_source=${encodeURIComponent(source)}`}
          onClick={() => ProductEvents.coiffeurCtaClick({ source: `interest_${source}` })}
          className={cn(
            'relative flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 no-underline',
            'border border-[#f7efe8]/50 bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96]',
            'text-center text-base font-black leading-7 text-[#2a1218] sm:text-lg',
            'shadow-[0_0_28px_rgba(244,212,192,0.55),0_0_56px_rgba(201,139,150,0.32)]',
            'hover:shadow-[0_0_40px_rgba(247,239,232,0.75),0_0_72px_rgba(244,212,192,0.45)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d4c0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080e]',
          )}
        >
          {!reduceMotion ? (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-l from-transparent via-white/45 to-transparent"
              animate={{ x: ['-120%', '140%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
            />
          ) : null}
          <CoiffeurBrandMark className="h-10 w-10 shrink-0 ring-1 ring-[#2a1218]/20" sizes="40px" showWordmark={false} />
          <Mail className="relative h-6 w-6 shrink-0" aria-hidden />
          <span className="relative">{label}</span>
        </Link>
      </motion.div>
    </div>
  );
}
