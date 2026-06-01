/**
 * PulseMapPage — خريطة النبض (خطوة 1: رسم المملكة)
 * Route: /radar
 */
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Radar } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { PULSE_MAP_CONFIG, PULSE_MAP_ROUTE } from '@/config/pulseMapConfig';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PulseMapShell, usePulseMapData } from '@/modules/pulse-map';
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
        <p className="mb-2 text-center text-[0.62rem] font-bold tracking-wide text-cyan-200">
          رادار الحلاقة المصغّر
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

    // Fixed city glow baseline so the miniature radar always feels alive.
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

    const livePulseEvents: CyberEvent[] = payload.pulses
      .slice(-26)
      .map((pulse, index) => {
        const slot = slotById.get(pulse.slotId);
        if (!slot) return null;
        const event: CyberEvent = {
          id: `mini-live-${pulse.id}-${index}`,
          kind: pulse.kind === 'link' ? 'defence_action' : 'visit_internal',
          severity: pulse.kind === 'link' ? 'normal' : 'info',
          source: toCyberPoint(slot.x, slot.y),
          description:
            pulse.kind === 'link'
              ? `ربط نشط من ${slot.nameAr}`
              : `بحث نشط من ${slot.nameAr}`,
          originLabelAr: slot.nameAr,
          timestamp: pulse.createdAt,
          lifetimeMs: 5200,
          volume: 1,
          ...(pulse.kind === 'link' ? { target: RIYADH_VIEW } : {}),
        };
        return event;
      })
      .filter((event): event is CyberEvent => event !== null);

    return [...ambientCityGlow, ...livePulseEvents].slice(-40);
  }, [payload]);

  useDocumentTitle(PULSE_MAP_CONFIG.pageTitleAr);

  return (
    <div
      dir="rtl"
      className={cn('pulse-map-page min-h-screen', isLabClone && 'pulse-map-page--lab')}
      style={{ background: 'linear-gradient(165deg, #020617 0%, #041018 45%, #030712 100%)' }}
    >
      <div className="pulse-map-topbar sticky top-0 z-40 border-b border-sky-500/15 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="pulse-map-home-btn flex items-center gap-2 text-sm text-sky-400/75 transition-colors hover:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            الرئيسية
          </button>
          <div className="pulse-map-topbar-title flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-black text-sky-100">{PULSE_MAP_CONFIG.titleAr}</span>
            </div>
            <span className="text-[0.62rem] font-medium text-sky-300/75" dir="ltr">
              {PULSE_MAP_CONFIG.subtitleEn}
            </span>
          </div>
          <div className="hidden w-[4.5rem] sm:block" aria-hidden />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-5">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pulse-map-hero mb-8 text-center"
        >
          <div className="pulse-map-hero-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 shadow-[0_0_40px_rgba(56,189,248,0.15)]">
            <Radar className="h-7 w-7 text-sky-300" />
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{PULSE_MAP_CONFIG.heroTitleAr}</h1>
          <p className="mt-1 text-sm font-medium text-sky-300/80" dir="ltr">
            {PULSE_MAP_CONFIG.subtitleEn}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <PulseMapShell
            payload={payload}
            loading={loading}
            error={error}
            tone={isLabClone ? 'comfort' : 'tactical'}
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
