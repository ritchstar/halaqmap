import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { isAllowedAdminEmail } from '@/config/adminAuth';
import { ROUTE_PATHS } from '@/lib';

/**
 * عند عودة رابط السحر من البريد، يضع Supabase الرموز في الـ hash (#access_token=...)
 * وهذا يتعارض مع HashRouter؛ نسترد الجلسة ثم نعيد التوجيه إلى مسار صالح.
 */
export function AdminAuthHashGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const doneRef = useRef(false);
  const [gate, setGate] = useState<'checking' | 'done'>(() =>
    typeof window !== 'undefined' && window.location.hash.includes('access_token') ? 'checking' : 'done'
  );

  useLayoutEffect(() => {
    if (gate !== 'checking' || doneRef.current) return;
    if (!window.location.hash.includes('access_token')) {
      setGate('done');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      doneRef.current = true;
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${ROUTE_PATHS.ADMIN_LOGIN}`);
      setGate('done');
      navigate(ROUTE_PATHS.ADMIN_LOGIN, { replace: true });
      return;
    }

    void (async () => {
      const { data: { session }, error } = await client.auth.getSession();
      doneRef.current = true;

      if (error || !session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
        await client.auth.signOut();
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${ROUTE_PATHS.ADMIN_LOGIN}`);
        navigate(ROUTE_PATHS.ADMIN_LOGIN, { replace: true });
      } else {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${ROUTE_PATHS.ADMIN_DASHBOARD}`);
        navigate(ROUTE_PATHS.ADMIN_DASHBOARD, { replace: true });
      }
      setGate('done');
    })();
  }, [gate, navigate]);

  if (gate === 'checking') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground"
        dir="rtl"
      >
        <p className="text-lg font-medium">جاري التحقق من رابط الدخول...</p>
        <p className="text-sm text-muted-foreground">يرجى الانتظار لحظات</p>
      </div>
    );
  }

  return <>{children}</>;
}
