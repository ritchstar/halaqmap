import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { PlatformRadar } from '@/modules/platform-radar';
import { getAdminDashboardPathFor, getAdminLoginPathFor } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { playPlatformRadarPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';

const SOUND_PREF_KEY = 'halaqmap.platformRadar.soundEnabled';

function readSoundPref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SOUND_PREF_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSoundPref(enabled: boolean): void {
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

/**
 * Full-screen cast-ready command center — renders ONLY PlatformRadar (zero chrome).
 * Route: `{adminBase}/radar/full-screen`
 */
export default function AdminRadarFullScreenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<'loading' | 'ok' | 'denied' | 'nologin'>('loading');
  const [soundEnabled, setSoundEnabled] = useState(() => readSoundPref());

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

  const enableSound = () => {
    setSoundEnabled(true);
    writeSoundPref(true);
    playPlatformRadarPulseSound(0.08);
  };

  if (phase === 'loading') {
    return (
      <div className="flex h-[100dvh] w-[100dvw] items-center justify-center bg-[#030303] text-white" dir="rtl">
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-medium text-slate-200">جاري تحميل Platform Radar…</p>
      </div>
    );
  }

  if (phase === 'nologin') {
    return (
      <div
        className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-4 bg-[#030303] p-6 text-white"
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
        className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-4 bg-[#030303] p-6 text-white"
        dir="rtl"
      >
        <p className="text-[clamp(1.25rem,3vw,2rem)] font-medium text-amber-200">لا تملك صلاحية عرض الرادار</p>
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
    <div className="relative h-[100dvh] w-[100dvw] overflow-hidden bg-[#030303]">
      {!soundEnabled ? (
        <button
          type="button"
          onClick={enableSound}
          className="absolute bottom-[clamp(1rem,3vh,2rem)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-400/40 bg-black/70 px-[clamp(1rem,3vw,1.75rem)] py-[clamp(0.5rem,1.5vh,0.85rem)] text-[clamp(0.95rem,1.8vw,1.2rem)] font-medium text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-md"
        >
          <Volume2 className="h-5 w-5" />
          تفعيل نبض الصوت
        </button>
      ) : null}
      <PlatformRadar commandMode soundEnabled={soundEnabled} />
    </div>
  );
}
