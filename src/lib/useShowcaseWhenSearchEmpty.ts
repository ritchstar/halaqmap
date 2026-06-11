import { useEffect } from 'react';
import type { Barber } from '@/lib/index';
import { resolveShowcaseForEmptyDisplay } from '@/lib/platformShowcaseRemote';

type RemoteStatus = 'unused' | 'loading' | 'ready' | 'error';

/**
 * يحمّل حلاق المعاينة عندما لا توجد نتائج **معروضة** للمستخدم
 * (بعد الفلاتر مثل «مفتوح الآن») — وليس فقط عند فراغ RPC.
 */
export function useShowcaseWhenSearchEmpty(input: {
  remoteStatus: RemoteStatus;
  filteredCount: number;
  showcaseAlreadyLoaded: boolean;
  setShowcaseFallback: (value: { barber: Barber; intro: string } | null) => void;
}) {
  const { remoteStatus, filteredCount, showcaseAlreadyLoaded, setShowcaseFallback } = input;

  useEffect(() => {
    if (remoteStatus !== 'ready') return;

    if (filteredCount > 0) {
      setShowcaseFallback(null);
      return;
    }

    if (showcaseAlreadyLoaded) return;

    let cancelled = false;
    void resolveShowcaseForEmptyDisplay(null).then((fb) => {
      if (!cancelled) setShowcaseFallback(fb);
    });

    return () => {
      cancelled = true;
    };
  }, [remoteStatus, filteredCount, showcaseAlreadyLoaded, setShowcaseFallback]);
}
