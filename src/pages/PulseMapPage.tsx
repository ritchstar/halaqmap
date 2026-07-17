/**
 * PulseMapPage — خريطة النبض التشغيلية
 * Route: /radar
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { PULSE_MAP_CONFIG, PULSE_MAP_ROUTE } from '@/config/pulseMapConfig';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PulseMapShell, usePulseMapData } from '@/modules/pulse-map';
import { PulseMapPublicDisclaimer } from '@/modules/pulse-map/components/PulseMapPublicDisclaimer';
import { isLabClonePath } from '@/lab/labCloneRouting';
import { cn } from '@/lib/utils';
import type { CyberEvent } from '@/modules/cyber-radar/types';
import { CyberRadarCanvas } from '@/modules/cyber-radar/components/CyberRadarCanvas';
import { PulseMapHudEnd, PulseMapHudStart } from '@/modules/pulse-map/components/PulseMapHud';
import { KSA_VIEWBOX, RIYADH_VIEW } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { PULSE_MAP_VIEWBOX } from '@/config/pulseMapSlots';

function LabMiniCyberPanel({
  payload,
  loading,
  miniEvents,
}: {
  payload: ReturnType<typeof usePulseMapData>['payload'];
  loading: boolean;
  miniEvents: CyberEvent[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <PulseMapHudStart payload={payload} loading={loading} />
      <section className="pulse-map-mini-cyber rounded-2xl border border-cyan-300/25 bg-black/45 p-2.5 backdrop-blur-md">
        <p className="mb-2 text-center text-sm font-bold tracking-wide text-cyan-200">
          معاينة النبض المصغّرة
        </p>
        <div className="overflow-hidden rounded-xl border border-cyan-300/30">
          <CyberRadarCanvas
            pulses={miniEvents}
            narrator={null}
            showOrnaments={false}
            className="pulse-map-mini-cyber-canvas h-[11.5rem]"
          />
        </div>
      </section>
    </div>
  );
}

export default function PulseMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { payload, loading, error } = usePulseMapData();
  const isLabClone = isLabClonePath(location.pathname);
  const miniCyberEvents = useMemo<CyberEvent[]>(() => {
    if (!payload) return [];

    const scaleX = KSA_VIEWBOX.width / PULSE_MAP_VIEWBOX.width;
    const scaleY = KSA_VIEWBOX.height / PULSE_MAP_VIEWBOX.height;
    const toCyberPoint = (x: number, y: number) => ({
      x: x * scaleX,
      y: y * scaleY,
    });

    const slotById = new Map(payload.slots.map((s) => [s.id, s]));

    const ambientCityGlow: CyberEvent[] = payload.slots.slice(0, 18).map((slot, index) => ({
      id: `mini-city-${slot.id}-${index}`,
      kind: 'visit_internal',
      severity: 'info',
      source: toCyberPoint(slot.x, slot.y),
      description: `مدينة ${slot.nameAr} نشطة`,
      originLabelAr: slot.nameAr,
      timestamp: payload.collectedAt,
      lifetimeMs: 6000,
      volume: 1,
    }));

    const livePulseEvents: CyberEvent[] = payload.pulses.slice(-26).flatMap((pulse, index) => {
      const slot = slotById.get(pulse.slotId);
      if (!slot) return [];
      return [{
        id: `mini-live-${pulse.id}-${index}`,
        kind: pulse.kind === 'link' ? 'defence_action' : 'visit_internal',
        severity: pulse.kind === 'link' ? 'normal' : 'info',
        source: toCyberPoint(slot.x, slot.y),
        target: pulse.kind === 'link' ? RIYADH_VIEW : undefined,
        description:
          pulse.kind === 'link'
            ? `تفاعل شريك من ${slot.nameAr}`
            : `استعلام من ${slot.nameAr}`,
        originLabelAr: slot.nameAr,
        timestamp: pulse.createdAt,
        lifetimeMs: 5200,
        volume: 1,
      } satisfies CyberEvent];
    });

    return [...ambientCityGlow, ...livePulseEvents].slice(-40);
  }, [payload]);

  useDocumentTitle(PULSE_MAP_CONFIG.pageTitleAr);

  return (
    <div
      dir="rtl"
      className={cn(
        'pulse-map-page min-h-screen overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
        isLabClone && 'pulse-map-page--lab',
      )}
      style={{ background: 'linear-gradient(165deg, #020617 0%, #041018 45%, #030712 100%)' }}
    >
      <div className="pulse-map-topbar sticky top-0 z-40 border-b border-sky-500/15 bg-[#020617]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3.5">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="pulse-map-home-btn flex items-center gap-2 text-base font-semibold text-sky-300/90 transition-colors hover:text-sky-200"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
            الرئيسية
          </button>
          <div className="pulse-map-topbar-title flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-400" />
              <span className="text-base font-black text-sky-50 sm:text-lg">{PULSE_MAP_CONFIG.titleAr}</span>
            </div>
            <span className="max-w-[16rem] text-center text-xs font-medium leading-snug text-sky-300/85 sm:max-w-none sm:text-sm">
              {PULSE_MAP_CONFIG.subtitleAr}
            </span>
          </div>
          <div className="hidden w-[5.5rem] sm:block" aria-hidden />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-5">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pulse-map-hero mb-7 text-center"
        >
          <div className="pulse-map-hero-icon mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
            <Activity className="h-8 w-8 text-sky-300" />
          </div>
          <h1 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            {PULSE_MAP_CONFIG.heroTitleAr}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium leading-relaxed text-sky-200/90 sm:text-lg">
            {PULSE_MAP_CONFIG.subtitleAr}
          </p>
        </motion.header>

        {!isLabClone ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <PulseMapPublicDisclaimer />
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <PulseMapShell
            payload={payload}
            loading={loading}
            error={error}
            tone={isLabClone ? 'tactical' : 'comfort'}
            showOrnaments={isLabClone}
            startPanel={
              isLabClone ? (
                <LabMiniCyberPanel
                  payload={payload}
                  loading={loading}
                  miniEvents={miniCyberEvents}
                />
              ) : undefined
            }
            endPanel={isLabClone ? <PulseMapHudEnd payload={payload} loading={loading} /> : undefined}
          />
        </motion.div>
      </div>
    </div>
  );
}

export { PULSE_MAP_ROUTE };
