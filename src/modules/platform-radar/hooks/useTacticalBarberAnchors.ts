import { useEffect, useState } from 'react';
import { listBarbersForAdmin, type AdminBarberRow } from '@/lib/adminBarbersRemote';
import {
  KSA_MAJOR_CITIES,
  resolveCityCoordinates,
} from '@/modules/platform-radar/lib/saudiKingdomProjection';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

const FALLBACK_HUBS = KSA_MAJOR_CITIES.filter((c) => c.tier === 'capital' || c.tier === 'major');

function barberToAnchorPulse(barber: AdminBarberRow, index: number): PlatformRadarMapPulse | null {
  let lat = barber.latitude;
  let lng = barber.longitude;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const city = resolveCityCoordinates(barber.city);
    if (!city) return null;
    lat = city.lat + (index % 5) * 0.04 - 0.08;
    lng = city.lng + (index % 3) * 0.05 - 0.05;
  }

  return {
    id: `barber-${barber.id}`,
    kind: 'barber_anchor',
    lat: lat!,
    lng: lng!,
    createdAt: barber.createdAt ?? new Date().toISOString(),
    label: barber.name,
    suspicious: false,
  };
}

export function useTacticalBarberAnchors(enabled = true) {
  const [anchors, setAnchors] = useState<PlatformRadarMapPulse[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    void (async () => {
      const barbers = await listBarbersForAdmin();
      if (cancelled) return;

      const mapped = barbers
        .filter((b) => b.is_active)
        .map((b, i) => barberToAnchorPulse(b, i))
        .filter((p): p is PlatformRadarMapPulse => p != null)
        .slice(0, 120);

      if (mapped.length > 0) {
        setAnchors(mapped);
        return;
      }

      const now = new Date().toISOString();
      setAnchors(
        FALLBACK_HUBS.map((hub, i) => ({
          id: `hub-${hub.nameAr}`,
          kind: 'barber_anchor' as const,
          lat: hub.lat + (i % 2) * 0.03,
          lng: hub.lng + (i % 3) * 0.02,
          createdAt: now,
          label: hub.nameAr,
          suspicious: false,
        })),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return anchors;
}
