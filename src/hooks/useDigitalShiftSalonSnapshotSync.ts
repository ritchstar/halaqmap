import { useEffect, useRef } from 'react';
import type { BarberPlatformBannerState } from '@/lib/barberDashboardLocalState';
import type { Post } from '@/lib';
import { buildSalonSnapshotPayload } from '@/lib/digitalShiftSalonSnapshot';
import { syncDigitalShiftSalonSnapshotRemote } from '@/lib/digitalShiftAssistantRemote';

const SYNC_DEBOUNCE_MS = 2500;

export function useDigitalShiftSalonSnapshotSync(params: {
  barberId: string;
  barberEmail: string;
  enabled: boolean;
  bannerState: BarberPlatformBannerState;
  posts: Post[];
}) {
  const { barberId, barberEmail, enabled, bannerState, posts } = params;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payloadKey = JSON.stringify(buildSalonSnapshotPayload(bannerState, posts));

  useEffect(() => {
    if (!enabled || !barberId || !barberEmail.trim()) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void syncDigitalShiftSalonSnapshotRemote({
        barberId,
        email: barberEmail.trim(),
        ...buildSalonSnapshotPayload(bannerState, posts),
      });
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [barberId, barberEmail, enabled, payloadKey, bannerState, posts]);
}
