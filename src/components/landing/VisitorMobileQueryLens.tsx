/**
 * عدسة الاستعلام — فلاتر الجوال مدمجة مع زر البحث (بلا تمرير أفقي).
 * أساس: 3 خيارات شائعة | تخصّص: 4 خيارات أدق — كلها ظاهرة دفعة واحدة.
 */
import type { FilterState } from '@/lib/index';
import {
  VISITOR_SERVICE_INTENTS,
  VISITOR_MOBILE_QUERY_PRIMARY_IDS,
  VISITOR_MOBILE_QUERY_REFINE_IDS,
  applyVisitorServiceIntent,
  detectVisitorServiceIntent,
  type VisitorServiceIntentId,
} from '@/lib/visitorServiceIntents';
import {
  VISITOR_MOBILE_QUERY_KICKER_AR,
  VISITOR_MOBILE_QUERY_PRIMARY_AR,
  VISITOR_MOBILE_QUERY_REFINE_AR,
} from '@/config/visitorLandingCopy';
import { cn } from '@/lib/utils';

const INTENT_BY_ID = Object.fromEntries(
  VISITOR_SERVICE_INTENTS.map((item) => [item.id, item]),
) as Record<VisitorServiceIntentId, (typeof VISITOR_SERVICE_INTENTS)[number]>;

type Props = {
  filters: FilterState;
  hasLocation: boolean;
  onIntentChange: (next: FilterState, intentId: VisitorServiceIntentId) => void;
};

function pickIntents(ids: readonly VisitorServiceIntentId[]) {
  return ids.map((id) => INTENT_BY_ID[id]).filter(Boolean);
}

export function VisitorMobileQueryLens({ filters, hasLocation, onIntentChange }: Props) {
  const activeId = detectVisitorServiceIntent(filters) ?? 'near_open';
  const activeLabel = INTENT_BY_ID[activeId]?.shortLabel ?? 'مفتوح الآن';

  const handleSelect = (intentId: VisitorServiceIntentId) => {
    const next =
      activeId === intentId
        ? applyVisitorServiceIntent('near_open', filters.maxDistance)
        : applyVisitorServiceIntent(intentId, filters.maxDistance);
    onIntentChange(next, intentId);
  };

  const primaryIntents = pickIntents(VISITOR_MOBILE_QUERY_PRIMARY_IDS);
  const refineIntents = pickIntents(VISITOR_MOBILE_QUERY_REFINE_IDS);

  return (
    <div className="mb-2.5 space-y-2" dir="rtl">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-[0.62rem] font-black tracking-wide text-teal-300/90">
          {VISITOR_MOBILE_QUERY_KICKER_AR}
        </p>
        <p className="truncate text-[0.68rem] font-bold text-white/90">
          {activeLabel}
          {hasLocation ? (
            <span className="me-1.5 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400 align-middle" />
          ) : null}
        </p>
      </div>

      <div>
        <p className="mb-1 px-0.5 text-[0.55rem] font-semibold text-slate-500">
          {VISITOR_MOBILE_QUERY_PRIMARY_AR}
        </p>
        <div
          className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1"
          role="tablist"
          aria-label="خيارات الاستعلام الأساسية"
        >
          {primaryIntents.map((intent) => {
            const active = activeId === intent.id;
            return (
              <button
                key={intent.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelect(intent.id)}
                className={cn(
                  'touch-manipulation rounded-xl px-1 py-2 text-center transition active:scale-[0.97]',
                  active
                    ? 'bg-teal-500/25 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.45)]'
                    : 'bg-transparent hover:bg-white/[0.04]',
                )}
              >
                <span className="block text-base leading-none">{intent.emoji}</span>
                <span
                  className={cn(
                    'mt-1 block truncate text-[0.62rem] font-bold leading-tight',
                    active ? 'text-teal-100' : 'text-white/80',
                  )}
                >
                  {intent.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1 px-0.5 text-[0.55rem] font-semibold text-slate-500">
          {VISITOR_MOBILE_QUERY_REFINE_AR}
        </p>
        <div
          className="grid grid-cols-4 gap-1"
          role="tablist"
          aria-label="تخصّص الاستعلام"
        >
          {refineIntents.map((intent) => {
            const active = activeId === intent.id;
            return (
              <button
                key={intent.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelect(intent.id)}
                className={cn(
                  'touch-manipulation rounded-xl border px-1 py-1.5 text-center transition active:scale-[0.97]',
                  active
                    ? 'border-teal-400/45 bg-teal-500/15'
                    : 'border-white/8 bg-white/[0.03]',
                )}
              >
                <span className="block text-sm leading-none">{intent.emoji}</span>
                <span
                  className={cn(
                    'mt-0.5 block truncate text-[0.52rem] font-bold leading-tight',
                    active ? 'text-teal-100' : 'text-white/70',
                  )}
                >
                  {intent.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
