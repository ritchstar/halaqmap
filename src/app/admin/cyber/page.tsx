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
import { ArrowRight, Radio, Swords } from 'lucide-react';
import { getAdminDashboardPathFor, getAdminLoginPathFor } from '@/config/adminAuth';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { CyberRadarCanvas } from '@/modules/cyber-radar/components/CyberRadarCanvas';
import {
  AgentResponseFeed,
  CyberEventLog,
  CyberStatsStrip,
  ScenarioControlPanel,
  SecurityLegend,
} from '@/modules/cyber-radar/components/CyberHud';
import { useCyberPlayback } from '@/modules/cyber-radar/hooks/useCyberPlayback';
import { useCyberLiveStream } from '@/modules/cyber-radar/hooks/useCyberLiveStream';
import { useCyberThreatRecorder, sessionToScenario } from '@/modules/cyber-radar/hooks/useCyberThreatRecorder';
import { CyberThreatRecordsPanel } from '@/modules/cyber-radar/components/CyberThreatRecordsPanel';
import { CYBER_SCENARIOS, getScenarioById } from '@/modules/cyber-radar/scenarios';
import type { CyberAgentResponse, CyberMode, CyberThreatSession, CyberScenario } from '@/modules/cyber-radar/types';

type AuthPhase = 'loading' | 'ok' | 'denied' | 'nologin';

export default function AdminCyberOperationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');

  const [mode, setMode] = useState<CyberMode>('live');
  const [activeScenarioId, setActiveScenarioId] = useState<string>(CYBER_SCENARIOS[0].id);
  const [customScenario, setCustomScenario] = useState<CyberScenario | null>(null);
  const activeScenario = useMemo(() => {
    if (mode !== 'scenario') return null;
    if (customScenario) return customScenario;
    return getScenarioById(activeScenarioId) ?? null;
  }, [mode, activeScenarioId, customScenario]);

  const playback = useCyberPlayback(activeScenario);
  const live = useCyberLiveStream(mode === 'live');

  // ◆ DVR — التسجيل التلقائي لجلسات التهديد
  const dvr = useCyberThreatRecorder(live.pulses, mode === 'live' && phase === 'ok');

  const handlePlayRecording = (session: CyberThreatSession) => {
    const scenario = sessionToScenario(session);
    setCustomScenario(scenario);
    setMode('scenario');
    playback.reset();
    setTimeout(() => playback.play(), 300);
  };

  const handleScenarioChange = (id: string) => {
    setCustomScenario(null); // مسح أي تسجيل مخصص
    setActiveScenarioId(id);
  };

  // Cumulative defence counter — each emitted threat in playback or live
  // probe is treated as "blocked" since the platform's defences cover both.
  const threatsBlockedRef = useRef(0);
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  useEffect(() => {
    threatsBlockedRef.current = 0;
    setThreatsBlocked(0);
  }, [mode, activeScenarioId]);

  // Rotate the ambient agent log in live mode so it doesn't feel static.
  const [ambientIdx, setAmbientIdx] = useState(0);
  useEffect(() => {
    if (mode !== 'live') return;
    const id = window.setInterval(() => {
      setAmbientIdx((i) => (i + 1) % ALL_AMBIENT_LOGS.length);
    }, 18_000);
    return () => window.clearInterval(id);
  }, [mode]);

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
  const agentLog =
    mode === 'scenario' ? playback.agentLog : ALL_AMBIENT_LOGS[ambientIdx];

  const hasActiveThreats = pulses.some(
    (p) => p.kind === 'threat_attack' || p.kind === 'threat_probe',
  );

  return (
    <div
      dir="rtl"
      className="relative flex h-[100dvh] w-[100dvw] flex-col overflow-hidden bg-gradient-to-b from-[#04060f] via-[#020512] to-black text-slate-100"
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/55 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-black/40 font-bold text-amber-200">
            ⚡
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-sm font-bold text-amber-100">
              غُرفة العمليات السيبرانية — حلاق ماب
            </h1>
            <p className="text-[0.65rem] text-slate-400">
              رادار أَمني مُباشر لِشَبكة المنصّة · يَكشِف التَّوافد والتَّهديدات لَحظياً
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Live / threat status pill */}
          <div
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-[0.65rem] font-semibold sm:flex ${
              hasActiveThreats
                ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                : mode === 'live'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
            }`}
          >
            {hasActiveThreats ? (
              <><Swords className="h-3 w-3" /> تَهديد نَشط</>
            ) : mode === 'live' ? (
              <><Radio className="h-3 w-3 animate-pulse" /> رَصد حَيّ</>
            ) : (
              <>🎬 مُحاكاة</>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-black/70"
          >
            <ArrowRight className="h-3.5 w-3.5" /> لوحة التَّحَكُّم
          </button>
        </div>
      </header>

      {/* ── Radar theater ───────────────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 lg:grid-cols-[15rem_minmax(0,1fr)_17rem] lg:grid-rows-[auto_minmax(0,1fr)_auto] xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">

        {/* Centre — radar canvas */}
        <section className="order-2 min-h-[18rem] overflow-hidden rounded-2xl border border-cyan-300/20 bg-black shadow-[0_0_60px_rgba(34,211,238,0.10)] lg:order-none lg:col-start-2 lg:row-start-2 lg:min-h-0">
          <CyberRadarCanvas pulses={pulses} narrator={null} />
        </section>

        {/* Centre top — narrator / status banner */}
        <div
          className={`order-1 rounded-xl border px-4 py-2 text-center text-sm font-semibold leading-relaxed backdrop-blur-md lg:order-none lg:col-start-2 lg:row-start-1 ${
            hasActiveThreats
              ? 'border-rose-400/40 bg-black/70 text-rose-100 shadow-[0_0_35px_rgba(248,113,113,0.15)]'
              : 'border-amber-400/30 bg-black/65 text-amber-100 shadow-[0_0_35px_rgba(245,158,11,0.12)]'
          }`}
        >
          {narrator ??
            (hasActiveThreats
              ? '⚠ تَهديد نَشط يَستهدف البنية التحتية — الوُكَلاء في وَضع الاستنفار.'
              : 'الرادار في وَضع المُراقبة الحَيّة — كُل النَّبضات الأَمنية تَظهَر على الخَريطة.')}
        </div>

        {/* Right — scenario controls + legend */}
        <aside className="order-3 flex min-h-0 flex-col gap-2 overflow-y-auto rounded-2xl border border-amber-400/20 bg-black/45 p-3 backdrop-blur-md lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <ScenarioControlPanel
            mode={mode}
            setMode={(m) => { setCustomScenario(null); setMode(m); }}
            scenarios={CYBER_SCENARIOS}
            activeScenarioId={customScenario ? 'dvr_replay' : activeScenarioId}
            setActiveScenarioId={handleScenarioChange}
            state={playback.state}
            elapsedMs={playback.elapsedMs}
            onPlay={playback.play}
            onPause={playback.pause}
            onReset={() => { setCustomScenario(null); playback.reset(); }}
          />
          <SecurityLegend />
        </aside>

        {/* Left — agent feed + event log + DVR records */}
        <aside className="order-4 flex min-h-0 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <h2 className="px-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            مَلَفّ تَفاعل الوُكَلاء
          </h2>
          <AgentResponseFeed entries={agentLog} />
          <h2 className="mt-1 px-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
            سِجِل الأَحداث
          </h2>
          <CyberEventLog events={pulses} />

          {/* ◆ تسجيلات DVR — بطاقات جنائية مرفقة بتقارير المدعي العام */}
          <div className="mt-2 border-t border-white/5 pt-2">
            <CyberThreatRecordsPanel
              sessions={dvr.sessions}
              isRecording={dvr.isRecording}
              currentBuffer={dvr.currentBuffer}
              onPlaySession={handlePlayRecording}
              onDeleteSession={dvr.clearSession}
              onClearAll={dvr.clearAll}
            />
          </div>
        </aside>

        {/* Bottom — stats strip */}
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
// Ambient agent log — multiple rotation sets shown in LIVE mode so the
// left rail stays informative even when no real-time scenario is running.
// ---------------------------------------------------------------------------
const ts = () => new Date().toISOString();

const AMBIENT_SET_QUIET: CyberAgentResponse[] = [
  {
    id: 'live-q0',
    agentId: 'cyber_defense',
    agentLabelAr: 'قائد الدفاع السيبراني',
    actionLabelAr: 'وَضع الاستعداد',
    explanationAr:
      'غُرفة العمليات مُفعَّلة. جدار الحماية يعمل على المستويين L3/L7. لا تَهديدات نَشطة مَرصودة. أنا في وَضع الإنذار المُبكر — جاهز للتَّدخُّل الفوري عند أي اختراق.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-q1',
    agentId: 'ops_controller',
    agentLabelAr: 'مراقب العمليات',
    actionLabelAr: 'مُراقبة هادئة',
    explanationAr:
      'النظام في الحالة الطبيعية. كل واجهة API صحيّة. لا تَوجد تَهديدات نَشطة. أُحَدِّث لوحة المؤسس كل 60 ثانية.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-q2',
    agentId: 'public_prosecutor',
    agentLabelAr: 'المُدّعي العام الرقمي',
    actionLabelAr: 'فَحص دَوري',
    explanationAr:
      'لا اعتداءات نَشطة. أُراجع سَجل النَّشاطات المَريبة آخر 24 ساعة — كله طَبيعي. الـ Logs الجِنائية جاهزة في حال الحاجة.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-q3',
    agentId: 'engineering',
    agentLabelAr: 'الجناح الهندسي',
    actionLabelAr: 'مُصافحة دَورية',
    explanationAr:
      'Supabase: 🟢 OK · Vercel: 🟢 OK · GitHub: 🟢 OK. آخر deploy نَجح. مساحة قاعدة البيانات: 62% مُستَخدمة.',
    severity: 'info',
    timestamp: ts(),
  },
];

const AMBIENT_SET_ANALYSIS: CyberAgentResponse[] = [
  {
    id: 'live-a0',
    agentId: 'cyber_defense',
    agentLabelAr: 'قائد الدفاع السيبراني',
    actionLabelAr: 'تَحليل التَّهديدات',
    explanationAr:
      'رصدت 7 نقاط اتصال خارجية بروتوكولها غير معتاد — خضعت للفَحص ولم تُشكّل خطراً. الـ Firewall يُطبّق قواعد GeoIP تلقائياً على الاتصالات من نطاقات عالية الخطورة.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-a1',
    agentId: 'compliance',
    agentLabelAr: 'مراقب الامتثال',
    actionLabelAr: 'تحليل الأنماط',
    explanationAr:
      'رصدت 3 عناوين IP تُكرّر الاستعلام عن نفس المناطق — نشاط طبيعي للزواحف (crawlers). لا يستدعي إجراءً حالياً.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-a2',
    agentId: 'covert_sovereign',
    agentLabelAr: 'السيادة الخفية',
    actionLabelAr: 'مراقبة القنوات الخلفية',
    explanationAr:
      'قناة الاستخبارات نَشطة — أَرصُد 14 عُقدة مناوبة عَبر القناة الخَلفية المُشَفَّرة. لا اختراقات داخلية مَرصودة. المَنفَذ السري في حالة الاستعداد الكاملة.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-a3',
    agentId: 'ops_controller',
    agentLabelAr: 'مراقب العمليات',
    actionLabelAr: 'تقرير الذروة',
    explanationAr:
      'ذروة الاتصال بين 6-8 مساءً بتوقيت الرياض. أُوصي بمراقبة مُكثّفة في هذا النطاق الزمني يومياً.',
    severity: 'info',
    timestamp: ts(),
  },
];

const AMBIENT_SET_NETWORK: CyberAgentResponse[] = [
  {
    id: 'live-n0',
    agentId: 'cyber_defense',
    agentLabelAr: 'قائد الدفاع السيبراني',
    actionLabelAr: 'مُراجعة الدِّرع الرَّقمي',
    explanationAr:
      'Rate limiting نَشط على جميع نقاط الـ API — الحد الأقصى 60 طلب/دقيقة/مصدر. جدار الحماية DDoS يَعمَل بكامل طاقته. لا ثُغرات مكشوفة. الشَّبكة آمنة.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-n1',
    agentId: 'engineering',
    agentLabelAr: 'الجناح الهندسي',
    actionLabelAr: 'مُراجعة الأداء',
    explanationAr:
      'متوسط زمن استجابة API: 187ms. خطوط الاتصال بـ Supabase مستقرة. لا تسرّب ذاكرة في العمليات المُشغَّلة.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-n2',
    agentId: 'public_prosecutor',
    agentLabelAr: 'المُدّعي العام الرقمي',
    actionLabelAr: 'بصمة الشبكة',
    explanationAr:
      '82% من الاتصالات داخل المملكة. 18% من دول الخليج والشتات السعودي. لا اتصالات من مناطق ذات خطر مرتفع.',
    severity: 'info',
    timestamp: ts(),
  },
  {
    id: 'live-n3',
    agentId: 'compliance',
    agentLabelAr: 'مراقب الامتثال',
    actionLabelAr: 'TLS جاهز',
    explanationAr:
      'شهادات SSL/TLS سارية. جميع الاتصالات مُشفَّرة. سياسات CORS مُفعَّلة على كل نقاط الـ API.',
    severity: 'info',
    timestamp: ts(),
  },
];

/** All ambient rotation sets — displayed one-at-a-time, cycling every 18s in live mode. */
const ALL_AMBIENT_LOGS: ReadonlyArray<CyberAgentResponse[]> = [
  AMBIENT_SET_QUIET,
  AMBIENT_SET_ANALYSIS,
  AMBIENT_SET_NETWORK,
];
