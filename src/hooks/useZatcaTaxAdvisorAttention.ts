import { useCallback, useEffect, useState } from 'react';
import { fetchZatcaTaxAdvisorStateRemote } from '@/lib/zatcaTaxAdvisorRemote';

export type ZatcaAttentionLevel = 'none' | 'warning' | 'critical';

function resolveAttention(
  warnings: { level: string }[],
  hasActivationAlert: boolean,
): ZatcaAttentionLevel {
  if (hasActivationAlert) return 'critical';
  if (warnings.some((w) => w.level === 'mandatory_breached' || w.level === 'critical_run_rate')) {
    return 'critical';
  }
  if (warnings.length > 0) return 'warning';
  return 'none';
}

/** Polls ZATCA advisor state for office-card attention dot (warnings / mandatory alert). */
export function useZatcaTaxAdvisorAttention(enabled: boolean) {
  const [level, setLevel] = useState<ZatcaAttentionLevel>('none');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLevel('none');
      return;
    }
    setLoading(true);
    try {
      const snap = await fetchZatcaTaxAdvisorStateRemote();
      if (snap.uninitialized) {
        setLevel('none');
        return;
      }
      const warnings = snap.warnings?.length ? snap.warnings : (snap.state?.active_warnings ?? []);
      setLevel(resolveAttention(warnings, Boolean(snap.state?.admin_activation_alert)));
    } catch {
      setLevel('none');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { level, loading, refresh };
}
