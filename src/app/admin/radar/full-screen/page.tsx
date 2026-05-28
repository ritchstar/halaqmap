import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminDashboardPathFor, getAdminLoginPathFor } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { PulseMapAdmin } from '@/modules/pulse-map/components/PulseMapAdmin';

/**
 * Full-screen cast-ready command center — خريطة النبض الإدارية (zero chrome).
 * Route: `{adminBase}/radar/full-screen`
 */
export default function AdminRadarFullScreenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<'loading' | 'ok' | 'denied' | 'nologin'>('loading');

  useEffect(() => {
    document.documentElement.classList.add('platform-radar-fullscreen');
    return () => {
      document.documentElement.classList.remove('platform-radar-fullscreen');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setPhase('nologin');
        return;
      }
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setPhase('nologin');
        return;
      }

      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email?.trim()) {
        if (!cancelled) setPhase('nologin');
        return;
      }

      const access = await resolveAdminAccess(email);
      if (!access.allowed) {
        if (!cancelled) setPhase('nologin');
        return;
      }

      const canView =
        access.bootstrap ||
        access.permissions.view_command_center ||
        access.permissions.view_overview;

      if (!canView) {
        if (!cancelled) setPhase('denied');
        return;
      }

      if (!cancelled) setPhase('ok');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'loading') {
    return (
      <div className="flex h-[100dvh] w-[100dvw] items-center justify-center bg-[#020617] text-white" dir="rtl">
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-medium text-slate-200">جاري تحميل خريطة النبض…</p>
      </div>
    );
  }

  if (phase === 'nologin') {
    return (
      <div
        className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-4 bg-[#020617] p-6 text-white"
        dir="rtl"
      >
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-medium">يلزم تسجيل دخول الإدارة</p>
        <button
          type="button"
          className="text-[clamp(1rem,2vw,1.25rem)] text-cyan-300 underline"
          onClick={() => navigate(getAdminLoginPathFor(location.pathname), { replace: true })}
        >
          الانتقال لتسجيل الدخول
        </button>
      </div>
    );
  }

  if (phase === 'denied') {
    return (
      <div
        className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-4 bg-[#020617] p-6 text-white"
        dir="rtl"
      >
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-medium text-amber-200">لا تملك صلاحية عرض خريطة النبض</p>
        <button
          type="button"
          className="text-[clamp(1rem,2vw,1.25rem)] text-cyan-300 underline"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname), { replace: true })}
        >
          العودة للوحة التحكم
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-[100dvw] overflow-hidden bg-[#020617]">
      <PulseMapAdmin commandMode pollMs={20_000} className="h-full" />
    </div>
  );
}
