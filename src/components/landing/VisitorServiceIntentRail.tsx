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
  layout?: 'horizontal' | 'vertical';
  onIntentChange: (next: FilterState, intentId: VisitorServiceIntentId) => void;
  onNeedLocation?: () => void;
};

export function VisitorServiceIntentRail({
  filters,
  hasLocation,
  compact = false,
  layout = 'horizontal',
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

  const isVertical = layout === 'vertical';

  return (
    <div
      className={cn(
        isVertical
          ? 'w-[7.25rem] shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3'
          : compact
            ? 'rounded-xl border border-white/8 bg-white/[0.03] p-2'
            : cn(
                'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent',
                'p-4 sm:p-5',
              ),
      )}
      dir="rtl"
    >
      <div
        className={cn(
          'mb-2',
          isVertical
            ? 'text-center'
            : compact
              ? 'hidden'
              : 'flex flex-wrap items-center justify-between gap-2',
        )}
      >
        <p
          className={cn(
            'font-black text-white',
            isVertical ? 'text-[0.62rem] leading-snug' : compact ? 'text-sm' : 'text-base',
          )}
        >
          {isVertical ? 'فلاتر' : VISITOR_INTENT_RAIL_TITLE_AR}
        </p>
        {!isVertical ? (
          <span className="rounded-full border border-teal-400/20 bg-teal-500/10 px-2.5 py-0.5 text-[0.62rem] font-semibold text-teal-200">
            {hasLocation ? 'فلترة نشطة' : 'اختر ثم حدّد الموقع'}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          isVertical
            ? 'flex flex-col gap-1'
            : cn(
                'flex gap-2 pb-1 scrollbar-thin',
                compact ? 'flex-nowrap overflow-x-auto' : 'flex-wrap',
              ),
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
                'transition-all',
                isVertical
                  ? cn(
                      'flex w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-right',
                      active
                        ? 'border-teal-400/50 bg-teal-500/15'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
                    )
                  : cn(
                      'shrink-0 rounded-2xl border px-3 py-2.5 text-right',
                      compact ? 'min-w-[7.5rem]' : 'min-w-[8.5rem] sm:min-w-0 sm:flex-1',
                      active
                        ? 'border-teal-400/55 bg-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]',
                    ),
              )}
            >
              <span className={cn('leading-none', isVertical ? 'text-sm' : 'block text-lg')}>
                {intent.emoji}
              </span>
              <span
                className={cn(
                  'font-bold text-white',
                  isVertical
                    ? 'flex-1 text-[0.58rem] leading-tight'
                    : cn('mt-1 block', compact ? 'text-[0.68rem]' : 'text-xs'),
                )}
              >
                {isVertical || compact ? intent.shortLabel : intent.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {!isVertical && !compact ? (
        <p className="mt-3 text-[0.68rem] leading-relaxed text-slate-400">
          {hasLocation ? VISITOR_INTENT_RAIL_HINT_WITH_LOCATION_AR : VISITOR_INTENT_RAIL_HINT_NO_LOCATION_AR}
        </p>
      ) : isVertical ? (
        <p className="mt-2 text-center text-[0.52rem] leading-snug text-slate-500">
          {hasLocation ? 'نشطة' : 'ثم الموقع'}
        </p>
      ) : null}
    </div>
  );
}
