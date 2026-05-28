import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PulseMapAdminControls } from '@/modules/pulse-map/components/PulseMapAdminControls';
import { PulseMapHudStart } from '@/modules/pulse-map/components/PulseMapHud';
import { PulseMapShell } from '@/modules/pulse-map/components/PulseMapShell';
import { usePulseMapAdminData } from '@/modules/pulse-map/hooks/usePulseMapAdminData';

type Props = {
  commandMode?: boolean;
  className?: string;
  pollMs?: number;
};

export function PulseMapAdmin({ commandMode = false, className, pollMs }: Props) {
  const [showCities, setShowCities] = useState(true);
  const [showPulses, setShowPulses] = useState(true);
  const [showOrnaments, setShowOrnaments] = useState(true);
  const { payload, loading, refreshing, error, windowMinutes, setWindowMinutes, refresh } =
    usePulseMapAdminData({ pollMs });

  return (
    <PulseMapShell
      payload={payload}
      loading={loading}
      error={error}
      showCities={showCities}
      showPulses={showPulses}
      showOrnaments={showOrnaments}
      ornamentVariant="admin"
      className={cn(commandMode ? 'h-full min-h-0 gap-2 p-2 lg:grid-cols-[minmax(10rem,12rem)_1fr_minmax(13rem,16rem)]' : className)}
      mapClassName={commandMode ? 'max-h-[min(52rem,88vh)]' : undefined}
      startPanel={<PulseMapHudStart payload={payload} loading={loading} />}
      endPanel={
        <PulseMapAdminControls
          payload={payload}
          loading={loading}
          refreshing={refreshing}
          windowMinutes={windowMinutes}
          onWindowMinutesChange={setWindowMinutes}
          onRefresh={() => void refresh()}
          showCities={showCities}
          showPulses={showPulses}
          onShowCitiesChange={setShowCities}
          onShowPulsesChange={setShowPulses}
          showOrnaments={showOrnaments}
          onShowOrnamentsChange={setShowOrnaments}
          compact={commandMode}
        />
      }
    />
  );
}
