import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type FaqItem = { readonly q: string; readonly a: string };

type PartnerLandingFaqAccordionProps = {
  kicker: string;
  lead: string;
  items: readonly FaqItem[];
  variant?: 'default' | 'dark';
  className?: string;
  headingClassName?: string;
};

export function PartnerLandingFaqAccordion({
  kicker,
  lead,
  items,
  variant = 'default',
  className,
  headingClassName,
}: PartnerLandingFaqAccordionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isDark = variant === 'dark';

  return (
    <section className={className}>
      <div className={cn('mb-10 text-center md:text-right', headingClassName)}>
        <h2
          className={cn(
            'text-2xl font-bold md:text-3xl',
            isDark ? 'text-white' : 'text-foreground',
          )}
        >
          {kicker}
        </h2>
        <p className={cn('mt-3 text-sm md:text-base', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
          {lead}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              'overflow-hidden rounded-xl border shadow-sm',
              isDark
                ? 'border-white/10 bg-white/[0.03]'
                : 'border-border/80 bg-card',
            )}
          >
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between gap-3 px-5 py-4 text-right text-sm font-semibold',
                isDark ? 'text-slate-100 hover:text-amber-200' : 'text-foreground hover:text-primary',
              )}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {item.q}
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isDark ? 'text-amber-400' : 'text-primary',
                  openFaq === i && 'rotate-180',
                )}
              />
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p
                    className={cn(
                      'border-t px-5 py-4 text-sm leading-relaxed',
                      isDark
                        ? 'border-white/8 text-slate-400'
                        : 'border-border/60 text-muted-foreground',
                    )}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
