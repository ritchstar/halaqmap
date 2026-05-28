import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PULSE_MAP_CONFIG } from '@/config/pulseMapConfig';
import { PULSE_MAP_VIEWBOX } from '@/config/pulseMapSlots';
import { PulseMapBackdrop } from '@/modules/pulse-map/components/PulseMapBackdrop';
import { PulseMapCityMarkers } from '@/modules/pulse-map/components/PulseMapCityMarkers';
import { PulseMapDots } from '@/modules/pulse-map/components/PulseMapDots';
import { PulseMapHudEnd, PulseMapHudStart } from '@/modules/pulse-map/components/PulseMapHud';
import { placePulses } from '@/modules/pulse-map/lib/pulsePlacement';
import type { PulseMapPayload, PulseMapSlot } from '@/modules/pulse-map/types';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  showCities?: boolean;
  showPulses?: boolean;
  startPanel?: ReactNode;
  endPanel?: ReactNode;
  mapClassName?: string;
};

export function PulseMapShell({
  payload,
  loading,
  error,
  className,
  showCities: showCitiesProp,
  showPulses: showPulsesProp,
  startPanel,
  endPanel,
  mapClassName,
}: Props) {
  const slotById = useMemo(() => {
    const map = new Map<string, PulseMapSlot>();
    for (const slot of payload?.slots ?? []) map.set(slot.id, slot);
    return map;
  }, [payload?.slots]);

  const placedPulses = useMemo(
    () => placePulses(payload?.pulses ?? [], slotById),
    [payload?.pulses, slotById],
  );

  const showPulses = showPulsesProp ?? PULSE_MAP_CONFIG.showPulses;
  const showCities = showCitiesProp ?? PULSE_MAP_CONFIG.showCities;
  const aspect = `${PULSE_MAP_VIEWBOX.width} / ${PULSE_MAP_VIEWBOX.height}`;

  const start = startPanel ?? <PulseMapHudStart payload={payload} loading={loading} />;
  const end = endPanel ?? <PulseMapHudEnd payload={payload} loading={loading} />;

  return (
    <div className={cn('grid gap-3 lg:grid-cols-[minmax(11rem,13.5rem)_1fr_minmax(11rem,13.5rem)]', className)} dir="rtl">
      <div className="order-2 lg:order-none">{start}</div>

      <div className="order-1 overflow-hidden rounded-2xl border border-sky-400/15 bg-[#020617] lg:order-none">
        <div
          className={cn('relative mx-auto w-full max-h-[min(44rem,72vh)]', mapClassName)}
          style={{ aspectRatio: aspect }}
        >
          <svg
            viewBox={`0 0 ${PULSE_MAP_VIEWBOX.width} ${PULSE_MAP_VIEWBOX.height}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-label="رادار الرصد — Halaq Map Platform — المملكة العربية السعودية"
          >
            <PulseMapBackdrop />
            {showCities ? <PulseMapCityMarkers /> : null}
            {showPulses ? <PulseMapDots pulses={placedPulses} /> : null}
          </svg>
        </div>
      </div>

      <div className="order-3 lg:order-none">{end}</div>

      {error ? (
        <p
          className="col-span-full rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 text-sm text-red-100 backdrop-blur-md lg:col-span-3"
          dir="rtl"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
