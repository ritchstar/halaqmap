import { useMemo } from 'react';
import { CyberRadarCanvas } from '@/modules/cyber-radar/components/CyberRadarCanvas';
import type { CyberEvent } from '@/modules/cyber-radar/types';
import { CITY_BEACONS, KSA_VIEWBOX, RIYADH_VIEW } from '@/modules/platform-radar/lib/saudiKingdomGeo';

const DEMO_BEACONS = [
  { id: 1, x: 52, y: 38, name: 'صالون الرياض الذهبي', rating: 4.9, tier: 'diamond', open: true },
  { id: 2, x: 38, y: 55, name: 'حلاق الحي الراقي', rating: 4.7, tier: 'gold', open: true },
  { id: 3, x: 64, y: 62, name: 'ستايل برو للرجال', rating: 4.8, tier: 'diamond', open: true },
  { id: 4, x: 45, y: 42, name: 'الحلاق الكلاسيكي', rating: 4.5, tier: 'bronze', open: false },
  { id: 5, x: 70, y: 45, name: 'برباشوب العاصمة', rating: 4.6, tier: 'gold', open: true },
  { id: 6, x: 30, y: 70, name: 'صالون الفنان', rating: 4.4, tier: 'bronze', open: true },
] as const;

const TIER_COLOR: Record<string, string> = {
  diamond: '#67e8f9',
  gold: '#fbbf24',
  bronze: '#cd7f32',
};

const HERO_CITY_ROUTE_OVERRIDES: Record<string, { x: number; y: number }> = {
  'نجران': {
    x: (64 / 100) * KSA_VIEWBOX.width,
    y: (62 / 100) * KSA_VIEWBOX.height,
  },
};

export function DesktopLandingRadarHero({
  onBeaconClick,
}: {
  onBeaconClick: (id: number) => void;
}) {
  const cityFlowEvents = useMemo<CyberEvent[]>(() => {
    const byName = new Map(
      CITY_BEACONS.map((city) => [
        city.nameAr,
        HERO_CITY_ROUTE_OVERRIDES[city.nameAr] ?? city.view,
      ] as const),
    );
    const routes = [
      ['جدة', 'الرياض'],
      ['الدمام', 'الرياض'],
      ['المدينة', 'الدمام'],
      ['تبوك', 'الرياض'],
      ['حائل', 'الدمام'],
      ['جازان', 'مكة'],
      ['أبها', 'جدة'],
      ['أبها', 'الرياض'],
      ['أبها', 'الأحساء'],
      ['الرياض', 'أبها'],
      ['جدة', 'أبها'],
      ['الأحساء', 'أبها'],
      ['خميس مشيط', 'الرياض'],
      ['خميس مشيط', 'جدة'],
      ['الرياض', 'خميس مشيط'],
      ['الباحة', 'الرياض'],
      ['الخبر', 'المدينة'],
      ['ينبع', 'الرياض'],
      ['بريدة', 'جدة'],
      ['نجران', 'الرياض'],
      ['الجبيل', 'أبها'],
      ['الطائف', 'الدمام'],
      ['الأحساء', 'المدينة'],
      ['عرعر', 'الرياض'],
      ['سكاكا', 'الدمام'],
      ['حفر الباطن', 'الرياض'],
      ['تبوك', 'جدة'],
      ['سكاكا', 'المدينة'],
      ['عرعر', 'حائل'],
      ['جازان', 'الرياض'],
      ['نجران', 'جدة'],
      ['الباحة', 'جدة'],
      ['جازان', 'الدمام'],
    ] as const;

    return routes.flatMap(([from, to], idx) => {
      const source = byName.get(from);
      const target = byName.get(to);
      if (!source || !target) return [];
      const isSouthPriority = from === 'أبها' || from === 'خميس مشيط' || from === 'نجران';
      return [{
        id: `hero-flow-${from}-${to}-${idx}`,
        kind: (isSouthPriority
          ? idx % 2 === 0
            ? 'visit_external'
            : 'registration'
          : idx % 4 === 0
            ? 'visit_external'
            : idx % 4 === 1
              ? 'registration'
              : idx % 4 === 2
                ? 'visit_internal'
                : 'defence_action') as CyberEvent['kind'],
        severity: isSouthPriority ? 'critical' : idx % 3 === 0 ? 'elevated' : 'info',
        source,
        target,
        description: `نبضة رادارية — ${from} → ${to}`,
        originLabelAr: from,
        timestamp: new Date(Date.now() - idx * 35_000).toISOString(),
        lifetimeMs: 8200,
        volume: isSouthPriority ? 5 : idx % 2 === 0 ? 3 : 2,
      } satisfies CyberEvent];
    });
  }, []);

  const cyberEvents = useMemo<CyberEvent[]>(
    () => [
      ...DEMO_BEACONS.map((b, idx) => {
        const x = (b.x / 100) * KSA_VIEWBOX.width;
        const y = (b.y / 100) * KSA_VIEWBOX.height;
        return {
          id: `hero-cyber-${b.id}-${idx}`,
          kind: b.open ? 'visit_internal' : 'threat_probe',
          severity: b.open ? 'info' : 'elevated',
          source: { x, y },
          target: b.open ? undefined : RIYADH_VIEW,
          description: b.name,
          originLabelAr: b.name,
          timestamp: new Date().toISOString(),
          lifetimeMs: 6000,
          volume: b.open ? 1 : 2,
        } satisfies CyberEvent;
      }),
      ...cityFlowEvents,
    ],
    [cityFlowEvents],
  );

  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-2xl" style={{ fontFamily: 'system-ui' }}>
      <CyberRadarCanvas pulses={cyberEvents} narrator={null} showOrnaments={false} mobileLite={false} className="h-full w-full" />

      {DEMO_BEACONS.map((b) => (
        <button
          key={b.id}
          type="button"
          aria-label={b.name}
          onClick={() => onBeaconClick(b.id)}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/45 transition-transform hover:scale-110"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: '11px',
            height: '11px',
            background: TIER_COLOR[b.tier],
            boxShadow: `0 0 0 3px ${TIER_COLOR[b.tier]}33, 0 0 16px ${TIER_COLOR[b.tier]}77`,
          }}
        >
          {!b.open ? (
            <span
              className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white/70"
              aria-hidden
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}
