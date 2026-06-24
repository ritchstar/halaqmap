/**
 * شريط نوايا الخدمة — الزائر يختار حاجته قبل/بعد تحديد الموقع.
 */
import { motion } from 'framer-motion';
import type { FilterState } from '@/lib/index';
import {
  VISITOR_SERVICE_INTENTS,
  applyVisitorServiceIntent,
  detectVisitorServiceIntent,
  type VisitorServiceIntentId,
} from '@/lib/visitorServiceIntents';
import {
  VISITOR_INTENT_RAIL_HINT_NO_LOCATION_AR,
  VISITOR_INTENT_RAIL_HINT_WITH_LOCATION_AR,
  VISITOR_INTENT_RAIL_TITLE_AR,
} from '@/config/visitorLandingCopy';
import { cn } from '@/lib/utils';

type Props = {
  filters: FilterState;
  hasLocation: boolean;
  compact?: boolean;
  onIntentChange: (next: FilterState, intentId: VisitorServiceIntentId) => void;
  onNeedLocation?: () => void;
};

export function VisitorServiceIntentRail({
  filters,
  hasLocation,
  compact = false,
  onIntentChange,
  onNeedLocation,
}: Props) {
  const activeId = detectVisitorServiceIntent(filters);

  const handleSelect = (intentId: VisitorServiceIntentId) => {
    const next =
      activeId === intentId
        ? applyVisitorServiceIntent('near_open', filters.maxDistance)
        : applyVisitorServiceIntent(intentId, filters.maxDistance);
    onIntentChange(next, intentId);
    if (!hasLocation) {
      onNeedLocation?.();
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent',
        compact ? 'p-3' : 'p-4 sm:p-5',
      )}
      dir="rtl"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className={cn('font-black text-white', compact ? 'text-sm' : 'text-base')}>
          {VISITOR_INTENT_RAIL_TITLE_AR}
        </p>
        <span className="rounded-full border border-teal-400/20 bg-teal-500/10 px-2.5 py-0.5 text-[0.62rem] font-semibold text-teal-200">
          {hasLocation ? 'فلترة نشطة' : 'اختر ثم حدّد الموقع'}
        </span>
      </div>

      <div
        className={cn(
          'flex gap-2 overflow-x-auto pb-1 scrollbar-thin',
          compact ? 'flex-nowrap' : 'flex-wrap sm:flex-nowrap',
        )}
      >
        {VISITOR_SERVICE_INTENTS.map((intent, i) => {
          const active = activeId === intent.id;
          return (
            <motion.button
              key={intent.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(intent.id)}
              className={cn(
                'shrink-0 rounded-2xl border px-3 py-2.5 text-right transition-all',
                compact ? 'min-w-[7.5rem]' : 'min-w-[8.5rem] sm:min-w-0 sm:flex-1',
                active
                  ? 'border-teal-400/55 bg-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]',
              )}
            >
              <span className="block text-lg leading-none">{intent.emoji}</span>
              <span className={cn('mt-1 block font-bold text-white', compact ? 'text-[0.68rem]' : 'text-xs')}>
                {compact ? intent.shortLabel : intent.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 text-[0.68rem] leading-relaxed text-slate-400">
        {hasLocation ? VISITOR_INTENT_RAIL_HINT_WITH_LOCATION_AR : VISITOR_INTENT_RAIL_HINT_NO_LOCATION_AR}
      </p>
    </div>
  );
}
