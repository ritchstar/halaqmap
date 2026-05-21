import { useEffect, useState } from 'react';
import { fetchEngineeringHandshakeStatus } from '@/lib/engineeringHandshakeRemote';
import { fetchSuperIntelligenceFeed } from '@/lib/superIntelligenceFeedRemote';

export type OpsRadarStatusLine = {
  id: 'prosecutor' | 'compliance' | 'engineering';
  labelAr: string;
  status: 'OK' | 'PENDING' | 'FAIL';
};

export type OpsControllerRadarSnapshot = {
  lines: OpsRadarStatusLine[];
  loading: boolean;
};

function line(
  id: OpsRadarStatusLine['id'],
  labelAr: string,
  status: OpsRadarStatusLine['status'],
): OpsRadarStatusLine {
  return { id, labelAr, status };
}

export function useOpsControllerRadarStatus(pollMs = 45_000): OpsControllerRadarSnapshot {
  const [snapshot, setSnapshot] = useState<OpsControllerRadarSnapshot>({
    loading: true,
    lines: [
      line('prosecutor', 'المدعي العام الرقمي', 'PENDING'),
      line('compliance', 'الامتثال', 'PENDING'),
      line('engineering', 'الجناح الهندسي', 'PENDING'),
    ],
  });

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const [handshake, feed] = await Promise.all([
        fetchEngineeringHandshakeStatus(),
        fetchSuperIntelligenceFeed(),
      ]);

      if (cancelled) return;

      const engineeringOk = handshake.ok && handshake.snapshot.systemStatus === 'OK';
      const engineeringStatus: OpsRadarStatusLine['status'] = !handshake.ok
        ? 'PENDING'
        : handshake.snapshot.systemStatus === 'OK'
          ? 'OK'
          : handshake.snapshot.systemStatus === 'FAIL'
            ? 'FAIL'
            : 'PENDING';

      const complianceOk = feed.ok && feed.snapshot.baseline.complianceGaps === 0;
      const complianceStatus: OpsRadarStatusLine['status'] = !feed.ok
        ? 'PENDING'
        : complianceOk
          ? 'OK'
          : 'FAIL';

      const prosecutorOk = feed.ok && !feed.snapshot.baseline.crisisWatchActive;
      const prosecutorStatus: OpsRadarStatusLine['status'] = !feed.ok
        ? 'PENDING'
        : prosecutorOk
          ? 'OK'
          : 'FAIL';

      setSnapshot({
        loading: false,
        lines: [
          line('prosecutor', 'المدعي العام الرقمي', prosecutorStatus),
          line('compliance', 'الامتثال', complianceStatus),
          line('engineering', 'الجناح الهندسي', engineeringOk ? 'OK' : engineeringStatus),
        ],
      });
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pollMs]);

  return snapshot;
}
