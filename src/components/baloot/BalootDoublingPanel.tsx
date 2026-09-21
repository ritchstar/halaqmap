/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة نافذة المضاعفة — تظهر للاعب فقط حين يحق له فعلياً إعلان دبلة (فريق
 * الدفاع) أو ريدبل (فريق المزايدة بعد دبلة الخصم)، مع خيار تجاهل والانتقال
 * مباشرة للعب بالمضاعف الحالي كما هو.
 */
import { BALOOT_ARENA_COPY } from '@/config/balootArena';

type BalootDoublingPanelProps = {
  canDouble: boolean;
  canRedouble: boolean;
  onDouble: () => void;
  onRedouble: () => void;
  onSkip: () => void;
};

export function BalootDoublingPanel({ canDouble, canRedouble, onDouble, onRedouble, onSkip }: BalootDoublingPanelProps) {
  if (!canDouble && !canRedouble) return null;

  return (
    <div className="rounded-2xl border-2 border-[#d8ac52] bg-[#0e262d] p-4 text-center shadow-[0_0_24px_rgba(216,172,82,0.15)]">
      <p className="mb-3 text-sm font-black text-[#e7f4f2]">{BALOOT_ARENA_COPY.doublingWindowTitleAr}</p>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        {canDouble && (
          <button
            type="button"
            onClick={onDouble}
            className="rounded-xl border border-[#d8ac52]/50 bg-[#d8ac52]/10 px-5 py-2.5 text-sm font-bold text-[#e7f4f2] transition-colors hover:bg-[#d8ac52]/25"
          >
            {BALOOT_ARENA_COPY.declareDoubleAr}
          </button>
        )}
        {canRedouble && (
          <button
            type="button"
            onClick={onRedouble}
            className="rounded-xl border border-[#c45c7a]/60 bg-[#c45c7a]/10 px-5 py-2.5 text-sm font-bold text-[#e7f4f2] transition-colors hover:bg-[#c45c7a]/25"
          >
            {BALOOT_ARENA_COPY.declareRedoubleAr}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="rounded-full border border-white/25 px-5 py-2 text-sm font-bold text-white/80 hover:bg-white/5"
      >
        {BALOOT_ARENA_COPY.skipDoublingAr}
      </button>
    </div>
  );
}
