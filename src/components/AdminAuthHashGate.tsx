import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { getAdminDashboardPath, getAdminLoginPath } from '@/config/adminAuth';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';

function authReturnNeedsHandling(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isSupabaseConfigured()) return false;
  const h = window.location.hash;
  const s = window.location.search;
  return (
    h.includes('access_token') ||
    h.includes('error=') ||
    h.includes('error_description') ||
    s.includes('code=')
  );
}

function replaceHashOnly(route: string) {
  const path = window.location.pathname || '/';
  window.history.replaceState(null, '', `${path}#${route}`);
}

/**
 * استرداد جلسة من عنوان الرجوع (استعادة كلمة مرور أو روابط OAuth إن أُضيفت لاحقاً):
 * يعالج #access_token أو ?code= قبل مطابقة HashRouter لتفادي 404.
 */
export function AdminAuthHashGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const handledRef = useRef(false);
  const [gate, setGate] = useState<'checking' | 'done'>(() =>
    authReturnNeedsHandling() ? 'checking' : 'done'
  );

  useLayoutEffect(() => {
    if (gate !== 'checking' || handledRef.current) return;

    const hasImplicit =
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('error=') ||
      window.location.hash.includes('error_description');
    const hasPkce = window.location.search.includes('code=');

    if (!hasImplicit && !hasPkce) {
      setGate('done');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      handledRef.current = true;
      replaceHashOnly(getAdminLoginPath());
      navigate(getAdminLoginPath(), { replace: true });
      setGate('done');
      return;
    }

    handledRef.current = true;

    void (async () => {
      try {
        if (hasPkce) {
          const { error: exchangeErr } = await client.auth.exchangeCodeForSession(window.location.href);
          if (exchangeErr) {
            const { data: retrySession } = await client.auth.getSession();
            if (!retrySession.session) {
              await client.auth.signOut();
              replaceHashOnly(getAdminLoginPath());
              navigate(getAdminLoginPath(), { replace: true });
              setGate('done');
              return;
            }
          }
        }

        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        const access = session?.user?.email ? await resolveAdminAccess(session.user.email) : { allowed: false };
        if (error || !session?.user?.email || !access.allowed) {
          await client.auth.signOut();
          replaceHashOnly(getAdminLoginPath());
          navigate(getAdminLoginPath(), { replace: true });
        } else {
          replaceHashOnly(getAdminDashboardPath());
          navigate(getAdminDashboardPath(), { replace: true });
        }
      } finally {
        setGate('done');
      }
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
