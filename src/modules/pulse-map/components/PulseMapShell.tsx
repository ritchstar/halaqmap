import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PULSE_MAP_CONFIG } from '@/config/pulseMapConfig';
import { PULSE_MAP_VIEWBOX } from '@/config/pulseMapSlots';
import { PulseMapBackdrop } from '@/modules/pulse-map/components/PulseMapBackdrop';
import { PulseMapCityMarkers } from '@/modules/pulse-map/components/PulseMapCityMarkers';
import { PulseMapDots } from '@/modules/pulse-map/components/PulseMapDots';
import { PulseMapHud } from '@/modules/pulse-map/components/PulseMapHud';
import { placePulses } from '@/modules/pulse-map/lib/pulsePlacement';
import type { PulseMapPayload, PulseMapSlot } from '@/modules/pulse-map/types';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

export function PulseMapShell({ payload, loading, error, className }: Props) {
  const slotById = useMemo(() => {
    const map = new Map<string, PulseMapSlot>();
    for (const slot of payload?.slots ?? []) map.set(slot.id, slot);
    return map;
  }, [payload?.slots]);

  const placedPulses = useMemo(
    () => placePulses(payload?.pulses ?? [], slotById),
    [payload?.pulses, slotById],
  );

  const showPulses = PULSE_MAP_CONFIG.showPulses;
  const showCities = PULSE_MAP_CONFIG.showCities;

  const aspect = `${PULSE_MAP_VIEWBOX.width} / ${PULSE_MAP_VIEWBOX.height}`;

  return (
    <div
      className={cn(
        'relative min-h-[min(44rem,72vh)] overflow-hidden rounded-2xl border border-sky-400/15 bg-[#020617] text-white',
        className,
      )}
      dir="rtl"
    >
      <div
        className="relative mx-auto w-full max-h-[min(44rem,72vh)]"
        style={{ aspectRatio: aspect }}
      >
        <svg
          viewBox={`0 0 ${PULSE_MAP_VIEWBOX.width} ${PULSE_MAP_VIEWBOX.height}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="خريطة النبض — المملكة العربية السعودية"
        >
          <PulseMapBackdrop />
          {showCities ? <PulseMapCityMarkers /> : null}
          {showPulses ? <PulseMapDots pulses={placedPulses} /> : null}
        </svg>
      </div>

      <PulseMapHud payload={payload} loading={loading} />

      {error ? (
        <p
          className="absolute left-1/2 top-1/2 z-30 max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
          dir="rtl"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
