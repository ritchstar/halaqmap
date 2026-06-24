import { motion } from 'framer-motion';
import { MessageCircle, Shield, Sparkles } from 'lucide-react';
import { VISITOR_TRUST_TRIAD } from '@/config/visitorLandingCopy';
import { cn } from '@/lib/utils';

const ICONS = [MessageCircle, Sparkles, Shield] as const;

type Props = {
  compact?: boolean;
};

export function VisitorTrustTriad({ compact = false }: Props) {
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
