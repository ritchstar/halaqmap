import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RootErrorBoundary } from '@/components/RootErrorBoundary';

const RECOVER_FLAG = 'hm-dom-recover-v2';

/** يعيد mount لحدّ الخطأ عند تغيير المسار حتى لا تبقى شاشة الخطأ بعد تنقّل SPA */
export function RouteScopedErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    try {
      sessionStorage.removeItem(RECOVER_FLAG);
    } catch {
      /* ignore */
    }
  }, [location.pathname, location.search]);

  return (
    <RootErrorBoundary key={`${location.pathname}${location.search}`}>
      {children}
    </RootErrorBoundary>
  );
}
