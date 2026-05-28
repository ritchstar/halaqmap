import { useEffect, useState } from 'react';

/** يؤجّل mount المكوّنات غير الحرجة حتى بعد أول paint أو idle */
export function useDeferredMount(idleTimeoutMs = 2500, fallbackDelayMs = 1200) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(mount, { timeout: idleTimeoutMs });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(mount, fallbackDelayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [idleTimeoutMs, fallbackDelayMs]);

  return ready;
}
