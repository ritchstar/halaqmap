import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RootErrorBoundary } from '@/components/RootErrorBoundary';

const RECOVER_FLAG = 'hm-dom-recover-v2';

/**
 * يعيد mount لحدّ الخطأ عند تغيير المسار حتى لا تبقى شاشة الخطأ بعد تنقّل SPA.
 * لا يمسح علامة الاسترداد عند أول mount — وإلا تتكرر إعادة التحميل التلقائية (~80ms)
 * عند أخطاء removeChild المستمرة (رادار الإدارة، غرفة العمليات).
 */
export function RouteScopedErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  const prevRouteKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevRouteKeyRef.current;
    prevRouteKeyRef.current = routeKey;
    if (prev === null || prev === routeKey) return;
    try {
      sessionStorage.removeItem(RECOVER_FLAG);
    } catch {
      /* ignore */
    }
  }, [routeKey]);

  return <RootErrorBoundary key={routeKey}>{children}</RootErrorBoundary>;
}
