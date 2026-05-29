import { useEffect, useState } from 'react';

/** يحمّل chunk عند الطلب فقط — بلا Suspense لتجنّب تعارض removeChild على الرئيسية */
export function useLandingDeferredChunk<T>(
  loader: () => Promise<{ default: T } | T>,
  enabled: boolean,
): T | null {
  const [component, setComponent] = useState<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      setComponent(null);
      return;
    }
    let cancelled = false;
    void loader().then((mod) => {
      if (cancelled) return;
      const resolved = (mod as { default?: T }).default ?? (mod as T);
      setComponent(resolved);
    });
    return () => {
      cancelled = true;
    };
    // loader ثابت من خارج المكوّن
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enabled only
  }, [enabled]);

  return component;
}
