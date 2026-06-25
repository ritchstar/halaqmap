import { motion } from 'framer-motion';
import { MessageCircle, Shield, Sparkles } from 'lucide-react';
import { VISITOR_TRUST_TRIAD } from '@/config/visitorLandingCopy';
import { cn } from '@/lib/utils';

const ICONS = [MessageCircle, Sparkles, Shield] as const;

type Props = {
  compact?: boolean;
  variant?: 'cards' | 'chips';
};

export function VisitorTrustTriad({ compact = false, variant = 'cards' }: Props) {
  if (variant === 'chips') {
    return (
      <div className="flex gap-1.5" dir="rtl" role="list" aria-label="مميزات المنصة">
        {VISITOR_TRUST_TRIAD.map((item, i) => {
          const Icon = ICONS[i] ?? Shield;
          return (
            <motion.div
              key={item.id}
              role="listitem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              title={item.description}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-1 py-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15">
                <Icon className="h-3 w-3 text-teal-300" aria-hidden />
              </div>
              <span className="w-full truncate text-center text-[0.62rem] font-bold leading-tight text-white/90">
                {item.chipLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-3')}
      dir="rtl"
    >
      {VISITOR_TRUST_TRIAD.map((item, i) => {
        const Icon = ICONS[i] ?? Shield;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
                <Icon className="h-4 w-4 text-teal-300" />
              </div>
              <p className={cn('font-bold text-white', compact ? 'text-xs' : 'text-sm')}>{item.title}</p>
            </div>
            <p className={cn('leading-relaxed text-slate-400', compact ? 'text-[0.68rem]' : 'text-xs')}>
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
