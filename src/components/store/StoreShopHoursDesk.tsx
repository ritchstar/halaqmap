/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعبئة مفتوح/مغلق وأوقات العمل من لوحة مشغّل المنتج.
 */
import { STORE_SHOP_HOURS_COPY as COPY, type StoreShopHoursState } from '@/config/storeShopHours';
import { cn } from '@/lib/utils';

const timeClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-2 text-sm text-[#f4efe4] outline-none';

export function StoreShopHoursDesk({
  value,
  onChange,
  accent,
  ink = '#061018',
}: {
  value: StoreShopHoursState;
  onChange: (next: StoreShopHoursState) => void;
  accent: string;
  ink?: string;
}) {
  function patch(partial: Partial<StoreShopHoursState>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className="rounded-2xl border border-white/12 p-4">
      <h3 className="font-extrabold">{COPY.deskTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/65">{COPY.deskLeadAr}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ shopOpen: true })}
          className={cn('rounded-full px-4 py-2 text-sm font-bold')}
          style={
            value.shopOpen
              ? { background: accent, color: ink }
              : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
          }
        >
          {COPY.openNowAr}
        </button>
        <button
          type="button"
          onClick={() => patch({ shopOpen: false })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={
            !value.shopOpen
              ? { background: accent, color: ink }
              : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
          }
        >
          {COPY.closedToggleAr}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ hoursEnabled: false })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={
            !value.hoursEnabled
              ? { background: accent, color: ink }
              : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
          }
        >
          {COPY.hoursOffAr}
        </button>
        <button
          type="button"
          onClick={() => patch({ hoursEnabled: true })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={
            value.hoursEnabled
              ? { background: accent, color: ink }
              : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
          }
        >
          {COPY.hoursOnAr}
        </button>
      </div>
      {value.hoursEnabled ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => patch({ hoursMode: 'single' })}
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={
                value.hoursMode === 'single'
                  ? { background: accent, color: ink }
                  : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
              }
            >
              {COPY.modeSingleAr}
            </button>
            <button
              type="button"
              onClick={() => patch({ hoursMode: 'split' })}
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={
                value.hoursMode === 'split'
                  ? { background: accent, color: ink }
                  : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' }
              }
            >
              {COPY.modeSplitAr}
            </button>
          </div>
          {value.hoursMode === 'single' ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                {COPY.fromAr}
                <input
                  type="time"
                  className={timeClass}
                  value={value.hoursOpen}
                  onChange={(e) => patch({ hoursOpen: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                {COPY.toAr}
                <input
                  type="time"
                  className={timeClass}
                  value={value.hoursClose}
                  onChange={(e) => patch({ hoursClose: e.target.value })}
                />
              </label>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-bold" style={{ color: accent }}>
                  {COPY.morningAr}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    {COPY.fromAr}
                    <input
                      type="time"
                      className={timeClass}
                      value={value.hoursMorningOpen}
                      onChange={(e) => patch({ hoursMorningOpen: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    {COPY.toAr}
                    <input
                      type="time"
                      className={timeClass}
                      value={value.hoursMorningClose}
                      onChange={(e) => patch({ hoursMorningClose: e.target.value })}
                    />
                  </label>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: accent }}>
                  {COPY.eveningAr}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    {COPY.fromAr}
                    <input
                      type="time"
                      className={timeClass}
                      value={value.hoursEveningOpen}
                      onChange={(e) => patch({ hoursEveningOpen: e.target.value })}
                    />
                  </label>
                  <label className="block text-sm">
                    {COPY.toAr}
                    <input
                      type="time"
                      className={timeClass}
                      value={value.hoursEveningClose}
                      onChange={(e) => patch({ hoursEveningClose: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
