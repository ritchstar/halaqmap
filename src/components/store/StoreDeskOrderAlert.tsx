/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط تنبيه الطلب أعلى لوحة الكاشير. لا يُستورد من App.
 */
import { useState } from 'react';
import {
  STORE_DESK_ORDER_ALERT_ACCENT,
  STORE_DESK_ORDER_ALERT_COPY,
  STORE_DESK_ORDER_ALERT_TONE_AR,
  STORE_DESK_ORDER_ALERT_TONES,
  STORE_DESK_ORDER_ALERT_VOLUME_AR,
  STORE_DESK_ORDER_ALERT_VOLUMES,
  type StoreDeskOrderAlertProduct,
} from '@/config/storeDeskOrderAlert';
import { useStoreDeskOrderAlert } from '@/hooks/useStoreDeskOrderAlert';
import { cn } from '@/lib/utils';

function Toggle({
  label,
  on,
  accent,
  onClick,
}: {
  label: string;
  on: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="rounded-full border px-2.5 py-1 text-[0.7rem] font-extrabold"
      style={
        on
          ? { borderColor: `${accent}99`, backgroundColor: `${accent}22`, color: accent }
          : { borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.55)' }
      }
    >
      {label}
    </button>
  );
}

export function StoreDeskOrderAlert({
  product,
  token,
  shopName,
  orderIds,
  unreadCount,
}: {
  product: StoreDeskOrderAlertProduct;
  token: string;
  shopName: string;
  orderIds: string[];
  unreadCount: number;
}) {
  const accent = STORE_DESK_ORDER_ALERT_ACCENT[product];
  const copy = STORE_DESK_ORDER_ALERT_COPY;
  const alert = useStoreDeskOrderAlert({ product, token, shopName, orderIds, unreadCount });
  const [open, setOpen] = useState(false);
  const lit = alert.prefs.armed && alert.prefs.lightOn && (alert.flashing || unreadCount > 0);

  return (
    <section
      className={cn('overflow-hidden rounded-2xl border bg-black/35', lit && 'store-desk-order-alert-glow')}
      style={{ borderColor: lit ? `${accent}aa` : 'rgba(255,255,255,0.12)', ['--desk-alert' as string]: accent }}
      aria-label={copy.titleAr}
    >
      <div
        className={cn('store-desk-order-alert-light h-1.5 w-full', lit && 'is-on')}
        style={{ background: lit ? accent : 'rgba(255,255,255,0.08)' }}
        aria-hidden
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <div>
          <p className="text-sm font-extrabold" style={{ color: accent }}>
            {copy.titleAr}
          </p>
          <p className="mt-0.5 text-[0.7rem] leading-5 text-white/55">
            {alert.prefs.armed ? copy.armedAr : copy.leadAr}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {alert.prefs.armed ? (
            <button
              type="button"
              onClick={() => alert.save({ armed: false })}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-extrabold text-white/70"
            >
              {copy.disarmAr}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void alert.arm()}
              className="rounded-full px-3 py-1.5 text-xs font-extrabold text-[#061018]"
              style={{ backgroundColor: accent }}
            >
              {copy.armAr}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border px-3 py-1.5 text-xs font-extrabold"
            style={{ borderColor: `${accent}66`, color: accent }}
            aria-expanded={open}
          >
            {copy.toneAr}
          </button>
        </div>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-white/10 px-3 py-3">
          <div className="flex flex-wrap gap-2">
            {STORE_DESK_ORDER_ALERT_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => {
                  alert.save({ tone });
                  void alert.preview({ tone });
                }}
                className="rounded-full border px-3 py-1.5 text-xs font-extrabold"
                style={
                  alert.prefs.tone === tone
                    ? { borderColor: accent, backgroundColor: `${accent}22`, color: accent }
                    : { borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.65)' }
                }
              >
                {STORE_DESK_ORDER_ALERT_TONE_AR[tone]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void alert.preview()}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70"
            >
              {copy.previewAr}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {STORE_DESK_ORDER_ALERT_VOLUMES.map((volume) => (
              <button
                key={volume}
                type="button"
                onClick={() => alert.save({ volume })}
                className="rounded-full border px-2.5 py-1 text-[0.7rem] font-extrabold"
                style={
                  alert.prefs.volume === volume
                    ? { borderColor: `${accent}99`, color: accent }
                    : { borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                {STORE_DESK_ORDER_ALERT_VOLUME_AR[volume]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Toggle
              label={copy.soundAr}
              on={alert.prefs.soundOn}
              accent={accent}
              onClick={() => alert.save({ soundOn: !alert.prefs.soundOn })}
            />
            <Toggle
              label={copy.lightAr}
              on={alert.prefs.lightOn}
              accent={accent}
              onClick={() => alert.save({ lightOn: !alert.prefs.lightOn })}
            />
            <Toggle
              label={copy.phoneAr}
              on={alert.prefs.phoneNotify}
              accent={accent}
              onClick={() => alert.save({ phoneNotify: !alert.prefs.phoneNotify })}
            />
            <Toggle
              label={copy.vibrateAr}
              on={alert.prefs.vibrateOn}
              accent={accent}
              onClick={() => alert.save({ vibrateOn: !alert.prefs.vibrateOn })}
            />
            <Toggle
              label={copy.awakeAr}
              on={alert.prefs.keepAwake}
              accent={accent}
              onClick={() => alert.save({ keepAwake: !alert.prefs.keepAwake })}
            />
            <Toggle
              label={copy.repeatAr}
              on={alert.prefs.repeatWhileUnread}
              accent={accent}
              onClick={() => alert.save({ repeatWhileUnread: !alert.prefs.repeatWhileUnread })}
            />
          </div>
          <p className="text-[0.7rem] leading-6 text-white/45">{copy.phoneHintAr}</p>
          <p className="text-[0.7rem] leading-6 text-white/40">{copy.lockedHintAr}</p>
        </div>
      ) : null}
    </section>
  );
}
