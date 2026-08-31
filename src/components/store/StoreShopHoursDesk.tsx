/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تعبئة مفتوح/مغلق وأوقات العمل من لوحة مشغّل المنتج.
 */
import { STORE_SHOP_HOURS_COPY as COPY, type StoreShopHoursState } from '@/config/storeShopHours';
import { isShopClosedNow, parseHourClock } from '@/lib/storeShopHours';
import { cn } from '@/lib/utils';

const timeClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-2 text-sm text-[#f4efe4] outline-none';

function ClockField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        type="time"
        step={60}
        className={timeClass}
        value={parseHourClock(value, '09:00')}
        onChange={(e) => onChange(parseHourClock(e.target.value, value))}
      />
    </label>
  );
}

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

  const chipOn = { background: accent, color: ink };
  const chipOff = { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(244,239,228,0.85)' };

  return (
    <section className="rounded-2xl border border-white/12 p-4">
      <h3 className="font-extrabold">{COPY.deskTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/65">{COPY.deskLeadAr}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ shopOpen: true })}
          className={cn('rounded-full px-4 py-2 text-sm font-bold')}
          style={value.shopOpen ? chipOn : chipOff}
        >
          {COPY.openNowAr}
        </button>
        <button
          type="button"
          onClick={() => patch({ shopOpen: false })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={!value.shopOpen ? chipOn : chipOff}
        >
          {COPY.closedToggleAr}
        </button>
      </div>
      <p className="mt-3 text-sm font-extrabold leading-7">
        {COPY.visitorSignalAr}: {isShopClosedNow(value) ? COPY.closedToggleAr : COPY.openNowAr}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => patch({ hoursEnabled: false })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={!value.hoursEnabled ? chipOn : chipOff}
        >
          {COPY.hoursOffAr}
        </button>
        <button
          type="button"
          onClick={() => patch({ hoursEnabled: true })}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={value.hoursEnabled ? chipOn : chipOff}
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
              style={value.hoursMode === 'single' ? chipOn : chipOff}
            >
              {COPY.modeSingleAr}
            </button>
            <button
              type="button"
              onClick={() => patch({ hoursMode: 'split' })}
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={value.hoursMode === 'split' ? chipOn : chipOff}
            >
              {COPY.modeSplitAr}
            </button>
          </div>
          {value.hoursMode === 'single' ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ClockField label={COPY.fromAr} value={value.hoursOpen} onChange={(hoursOpen) => patch({ hoursOpen })} />
              <ClockField label={COPY.toAr} value={value.hoursClose} onChange={(hoursClose) => patch({ hoursClose })} />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-bold" style={{ color: accent }}>
                  {COPY.morningAr}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <ClockField
                    label={COPY.fromAr}
                    value={value.hoursMorningOpen}
                    onChange={(hoursMorningOpen) => patch({ hoursMorningOpen })}
                  />
                  <ClockField
                    label={COPY.toAr}
                    value={value.hoursMorningClose}
                    onChange={(hoursMorningClose) => patch({ hoursMorningClose })}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: accent }}>
                  {COPY.eveningAr}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <ClockField
                    label={COPY.fromAr}
                    value={value.hoursEveningOpen}
                    onChange={(hoursEveningOpen) => patch({ hoursEveningOpen })}
                  />
                  <ClockField
                    label={COPY.toAr}
                    value={value.hoursEveningClose}
                    onChange={(hoursEveningClose) => patch({ hoursEveningClose })}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
