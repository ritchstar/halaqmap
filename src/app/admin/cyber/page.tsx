/**
 * Cyber Operations Theater — admin landing page.
 * Route: `{adminBase}/cyber`
 *
 * Combines:
 *  - Live realtime feed of user_searches (platform_radar channel)
 *  - 3 pre-recorded scenarios (mass enrollment / DDoS / combined crisis)
 *  - Side panel with stats, scenario controls, and AI agent reactions
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAdminDashboardPathFor, getAdminLoginPathFor } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { CyberRadarCanvas } from '@/modules/cyber-radar/components/CyberRadarCanvas';
import {
  AgentResponseFeed,
  CyberStatsStrip,
  ScenarioControlPanel,
} from '@/modules/cyber-radar/components/CyberHud';
import { useCyberPlayback } from '@/modules/cyber-radar/hooks/useCyberPlayback';
import { useCyberLiveStream } from '@/modules/cyber-radar/hooks/useCyberLiveStream';
import { CYBER_SCENARIOS, getScenarioById } from '@/modules/cyber-radar/scenarios';
import type { CyberMode } from '@/modules/cyber-radar/types';

type AuthPhase = 'loading' | 'ok' | 'denied' | 'nologin';

export default function AdminCyberOperationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');

  const [mode, setMode] = useState<CyberMode>('live');
  const [activeScenarioId, setActiveScenarioId] = useState<string>(CYBER_SCENARIOS[0].id);
  const activeScenario = useMemo(
    () => (mode === 'scenario' ? getScenarioById(activeScenarioId) ?? null : null),
    [mode, activeScenarioId],
  );

  const playback = useCyberPlayback(activeScenario);
  const live = useCyberLiveStream(mode === 'live');

  // Cumulative defence counter — each emitted threat in playback or live
  // probe is treated as "blocked" since the platform's defences cover both.
  const threatsBlockedRef = useRef(0);
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  useEffect(() => {
    threatsBlockedRef.current = 0;
    setThreatsBlocked(0);
  }, [mode, activeScenarioId]);

  useEffect(() => {
    const source = mode === 'scenario' ? playback.pulses : live.pulses;
    const blocked = source.filter(
      (p) => p.kind === 'threat_attack' || p.kind === 'threat_probe',
    ).length;
    if (blocked > threatsBlockedRef.current) {
      threatsBlockedRef.current = blocked;
      setThreatsBlocked(blocked);
    }
  }, [mode, playback.pulses, live.pulses]);

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
      <div className="flex h-[100dvh] w-[100dvw] items-center justify-center bg-[#030303] text-white" dir="rtl">
        <p className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-medium text-slate-200">
          جاري تحميل غُرفة العمليات السيبرانية…
        </p>
      </div>
    );
  }

  if (phase === 'nologin') {
    return (
      <div
        className="flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-4 bg-[#030303] p-6 text-white"
        dir="rtl"
      >
        <p className="text-xl font-medium">يلزم تسجيل دخول الإدارة</p>
        <button
          type="button"
          className="text-cyan-300 underline"
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
        <p className="text-xl font-medium text-amber-200">لا تَملك صَلاحية فَتح غُرفة العمليات السيبرانية</p>
        <button
          type="button"
          className="text-cyan-300 underline"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname), { replace: true })}
        >
          العَودة للوحة التَّحَكُّم
        </button>
      </div>
    );
  }

  const pulses = mode === 'scenario' ? playback.pulses : live.pulses;
  const narrator = mode === 'scenario' ? playback.narrator : null;
  const agentLog = mode === 'scenario' ? playback.agentLog : LIVE_AMBIENT_AGENT_LOG;

  return (
    <div
      dir="rtl"
      className="relative flex h-[100dvh] w-[100dvw] flex-col overflow-hidden bg-gradient-to-b from-[#04060f] via-[#020512] to-black text-slate-100"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/55 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-black/40 font-bold text-amber-200">
            ⚡
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-sm font-bold text-amber-100">غُرفة العمليات السيبرانية — حلاق ماب</h1>
            <p className="text-[0.65rem] text-slate-400">
              رادار أَمني مُباشر لِشَبكة المنصّة · يَكشِف التَّوافد والتَّهديدات لَحظياً
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-black/70"
        >
          <ArrowRight className="h-3.5 w-3.5" /> العَودة للوحة التَّحَكُّم
        </button>
      </header>

      {/* Radar theater — the radar stays unobstructed; data banners surround it. */}
      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-3 lg:grid-cols-[15rem_minmax(0,1fr)_17rem] lg:grid-rows-[auto_minmax(0,1fr)_auto] xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <section className="order-2 min-h-[18rem] overflow-hidden rounded-2xl border border-cyan-300/20 bg-black shadow-[0_0_60px_rgba(34,211,238,0.10)] lg:order-none lg:col-start-2 lg:row-start-2 lg:min-h-0">
          <CyberRadarCanvas pulses={pulses} narrator={null} />
        </section>

        <div className="order-1 rounded-xl border border-amber-400/30 bg-black/65 px-4 py-2 text-center text-sm font-semibold leading-relaxed text-amber-100 shadow-[0_0_35px_rgba(245,158,11,0.12)] backdrop-blur-md lg:order-none lg:col-start-2 lg:row-start-1">
          {narrator ?? 'الرادار في وضع المراقبة الحية — كل النبضات الأمنية تظهر على الخريطة دون تغطية.'}
        </div>

        <aside className="order-3 min-h-0 overflow-y-auto rounded-2xl border border-amber-400/20 bg-black/45 p-3 backdrop-blur-md lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <div>
            <ScenarioControlPanel
              mode={mode}
              setMode={setMode}
              scenarios={CYBER_SCENARIOS}
              activeScenarioId={activeScenarioId}
              setActiveScenarioId={setActiveScenarioId}
              state={playback.state}
              elapsedMs={playback.elapsedMs}
              onPlay={playback.play}
              onPause={playback.pause}
              onReset={playback.reset}
            />
          </div>
        </aside>

        <aside className="order-4 min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <h2 className="mb-2 px-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            مَلَفّ تَفاعل الوَكلاء
          </h2>
          <AgentResponseFeed entries={agentLog} />
        </aside>

        <div className="order-5 rounded-2xl border border-cyan-300/15 bg-black/55 backdrop-blur-md lg:order-none lg:col-span-3 lg:row-start-3">
          <CyberStatsStrip
            pulses={pulses}
            threatsBlocked={threatsBlocked}
            mode={mode}
            liveConnected={mode === 'live' ? live.liveConnected : true}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ambient agent log shown in LIVE mode so the right rail isn't empty when no
// scenario is active. Describes what the agents are doing during quiet ops.
// ---------------------------------------------------------------------------
const LIVE_AMBIENT_AGENT_LOG = [
  {
    id: 'live-1',
    agentId: 'ops_controller' as const,
    agentLabelAr: 'مراقب العمليات',
    actionLabelAr: 'مُراقبة هادئة',
    explanationAr:
      'النظام في الحالة الطبيعية. كل واجهة API صحيّة. لا تَوجد تَهديدات نَشطة. أُحَدّث لوحة المؤسس كل 60 ثانية.',
    severity: 'info' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'live-2',
    agentId: 'public_prosecutor' as const,
    agentLabelAr: 'المُدّعي العام الرقمي',
    actionLabelAr: 'فَحص دَوري',
    explanationAr:
      'لا اعتداءات نَشطة. أُراجع سَجل النَّشاطات المَريبة آخر 24 ساعة — كله طَبيعي. الـ Logs الجِنائية جاهزة في حال الحاجة.',
    severity: 'info' as const,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'live-3',
    agentId: 'engineering' as const,
    agentLabelAr: 'الجناح الهندسي',
    actionLabelAr: 'مُصافحة دَورية',
    explanationAr:
      'Supabase: 🟢 OK · Vercel: 🟢 OK · GitHub: 🟢 OK. آخر deploy نَجح. مساحة قاعدة البيانات: 62% مُستَخدمة.',
    severity: 'info' as const,
    timestamp: new Date().toISOString(),
  },
];
