import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PULSE_MAP_CONFIG } from '@/config/pulseMapConfig';
import { PULSE_MAP_VIEWBOX } from '@/config/pulseMapSlots';
import { PulseMapBackdrop } from '@/modules/pulse-map/components/PulseMapBackdrop';
import { PulseMapCityMarkers } from '@/modules/pulse-map/components/PulseMapCityMarkers';
import { PulseMapCompassOrnament } from '@/modules/pulse-map/components/PulseMapCompassOrnament';
import { PulseMapDots } from '@/modules/pulse-map/components/PulseMapDots';
import { PulseMapKingdomSweep, type PulseMapOrnamentVariant } from '@/modules/pulse-map/components/PulseMapKingdomSweep';
import { PulseMapHudEnd, PulseMapHudStart } from '@/modules/pulse-map/components/PulseMapHud';
import { getPulseMapCityMarker } from '@/modules/pulse-map/lib/pulseMapCities';
import { placePulses } from '@/modules/pulse-map/lib/pulsePlacement';
import type { PulseMapPayload, PulseMapSlot } from '@/modules/pulse-map/types';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  showCities?: boolean;
  showPulses?: boolean;
  showOrnaments?: boolean;
  ornamentVariant?: PulseMapOrnamentVariant;
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
  showOrnaments = true,
  ornamentVariant = 'public',
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
  const riyadh = getPulseMapCityMarker('riyadh');
  const aspect = `${PULSE_MAP_VIEWBOX.width} / ${PULSE_MAP_VIEWBOX.height}`;

  const start = startPanel ?? <PulseMapHudStart payload={payload} loading={loading} />;
  const end = endPanel ?? <PulseMapHudEnd payload={payload} loading={loading} />;

  return (
    <div className={cn('grid gap-3 lg:grid-cols-[minmax(11rem,13.5rem)_1fr_minmax(11rem,13.5rem)]', className)} dir="rtl">
      <div className="order-2 lg:order-none">{start}</div>

      <div
        className={cn(
          'order-1 overflow-hidden rounded-2xl bg-[#020617] lg:order-none',
          ornamentVariant === 'admin' ? 'border border-violet-400/20' : 'border border-sky-400/15',
        )}
      >
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
            {showOrnaments && riyadh ? (
              <PulseMapKingdomSweep cx={riyadh.x} cy={riyadh.y} variant={ornamentVariant} />
            ) : null}
            {showCities ? <PulseMapCityMarkers /> : null}
            {showPulses ? <PulseMapDots pulses={placedPulses} /> : null}
          </svg>
          {showOrnaments ? (
            <PulseMapCompassOrnament
              variant={ornamentVariant}
              className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
            />
          ) : null}
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
