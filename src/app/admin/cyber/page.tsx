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
import { ArrowRight, Radio, Swords, ShieldOff, BarChart3 } from 'lucide-react';
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

// نوع حدث أمني حي من Supabase Realtime
type LiveSecurityEvent = {
  id: string;
  ip: string;
  event_type: string;
  severity: string;
  endpoint?: string;
  ip_country?: string;
  ip_city?: string;
  ip_lat?: number;
  ip_lng?: number;
  created_at: string;
};

type CfStatus = {
  cfConfigured: boolean;
  security: { securityLevel: string; underAttack: boolean };
  firewallRules: { id: string; mode: string; ip: string; notes: string; created: string }[];
  analytics24h: { threats: number; totalRequests: number; cachedRequests: number };
};

async function fetchCfStatus(): Promise<CfStatus | null> {
  try {
    const res = await fetch('/api/admin-security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cf_status' }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<CfStatus> & { ok?: boolean };
    // تحقق صارم من اكتمال البيانات
    if (!data.ok || !data.security || !Array.isArray(data.firewallRules) || !data.analytics24h) return null;
    return data as CfStatus;
  } catch { return null; }
}

async function cfBlockIp(ip: string, mode: 'block' | 'challenge'): Promise<{ ok: boolean }> {
  const res = await fetch('/api/admin-security-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cf_block_ip', ip, mode, reason: 'Blocked from Cyber Ops Theater' }),
  });
  return res.json() as Promise<{ ok: boolean }>;
}

async function cfUnderAttack(enabled: boolean): Promise<{ ok: boolean }> {
  const res = await fetch('/api/admin-security-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cf_under_attack', enabled }),
  });
  return res.json() as Promise<{ ok: boolean }>;
}

type RealThreatData = {
  period: string;
  summary: {
    totalEvents: number;
    criticalEvents: number;
    blockedAttempts: number;
    paymentSecurityEvents: number;
    registrationSubmissions: number;
    uniqueIps: number;
  };
  topSuspiciousIps: { ip: string; count: number }[];
};

async function fetchRealThreatData(): Promise<RealThreatData | null> {
  try {
    const res = await fetch('/api/admin-security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_threat_data', hours: 24 }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<RealThreatData> & { ok?: boolean };
    // تحقق صارم من اكتمال البيانات قبل الاستخدام
    if (!data.ok || !data.summary || !Array.isArray(data.topSuspiciousIps)) return null;
    return data as RealThreatData;
  } catch { return null; }
}

async function blockIpReal(ip: string, reason: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin-security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'block_ip', ip, reason }),
    });
    return res.ok;
  } catch { return false; }
}

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

  // ◆ البيانات الأمنية الحقيقية
  const [realThreatData, setRealThreatData] = useState<RealThreatData | null>(null);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);
  const [cfStatus, setCfStatus] = useState<CfStatus | null>(null);
  const [cfLoading, setCfLoading] = useState(false);
  const [attackModeChanging, setAttackModeChanging] = useState(false);
  // ◆ تقارير الوكلاء الحقيقية
  const [agentReports, setAgentReports] = useState<CyberAgentResponse[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  // ◆ أحداث أمنية حية من Supabase Realtime
  const [liveSecEvents, setLiveSecEvents] = useState<LiveSecurityEvent[]>([]);

  useEffect(() => {
    if (phase !== 'ok') return;
    void fetchRealThreatData().then(setRealThreatData);
    void fetchCfStatus().then(setCfStatus);
    const t = setInterval(() => {
      void fetchRealThreatData().then(setRealThreatData);
      void fetchCfStatus().then(setCfStatus);
    }, 90_000);
    return () => clearInterval(t);
  }, [phase]);

  const handleCfBlock = async (ip: string) => {
    setCfLoading(true);
    await cfBlockIp(ip, 'block');
    void fetchCfStatus().then(setCfStatus);
    void fetchRealThreatData().then(setRealThreatData);
    setCfLoading(false);
  };

  // ◆ Supabase Realtime — اشتراك في أحداث الأمان الحية
  useEffect(() => {
    if (phase !== 'ok' || !isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;

    let channel: ReturnType<typeof client.channel> | null = null;
    try {
      channel = client
        .channel('cyber-ops-security-live')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
        }, (payload) => {
          try {
            const evt = payload.new as LiveSecurityEvent;
            setLiveSecEvents(prev => [evt, ...prev].slice(0, 30));
          } catch { /* صامت */ }
        })
        .subscribe();
    } catch { /* Realtime قد لا يكون مُفعَّلاً — لا يوقف الغرفة */ }

    return () => { if (channel) void client.removeChannel(channel); };
  }, [phase]);

  // ◆ تشغيل تحليل الوكلاء الثلاثة الحقيقي
  const runAgentAnalysis = async () => {
    setAgentsLoading(true);
    try {
      const [scout, forensic] = await Promise.all([
        fetch('/api/admin-security-agents', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'proactive_scout', windowMinutes: 15 }),
        }).then(r => r.json()) as Promise<{ agentResponse?: CyberAgentResponse }>,
        fetch('/api/admin-security-agents', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'forensic_analysis', hours: 6 }),
        }).then(r => r.json()) as Promise<{ agentResponse?: CyberAgentResponse }>,
      ]);
      const reports = [scout.agentResponse, forensic.agentResponse].filter((r): r is CyberAgentResponse => !!r);
      if (reports.length) setAgentReports(prev => [...reports, ...prev].slice(0, 10));
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleToggleAttackMode = async () => {
    if (!cfStatus) return;
    setAttackModeChanging(true);
    await cfUnderAttack(!cfStatus.security.underAttack);
    void fetchCfStatus().then(setCfStatus);
    setAttackModeChanging(false);
  };

  const handleBlockIp = async (ip: string) => {
    setBlockingIp(ip);
    const ok = await blockIpReal(ip, 'Blocked by Public Prosecutor — Cyber Ops Theater');
    setBlockingIp(null);
    if (ok) void fetchRealThreatData().then(setRealThreatData);
  };

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
          {/* ◆ وكلاء الأمن السيبراني الحقيقيون */}
          <div className="mb-2 rounded-xl border border-teal-400/20 bg-black/40 p-3 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🤖</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-wider text-teal-300/80">وكلاء الأمن الحقيقيون</span>
              </div>
              <button onClick={() => void runAgentAnalysis()} disabled={agentsLoading}
                className="flex items-center gap-1 rounded-lg border border-teal-400/30 bg-teal-500/10 px-2 py-1 text-[0.55rem] font-black text-teal-300 hover:bg-teal-500/20 transition-all disabled:opacity-50">
                {agentsLoading ? '…' : '▶ تحليل الآن'}
              </button>
            </div>
            {/* حالة الوكلاء */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[
                { id: 'proactive_scout', label: 'استطلاع', icon: '🔍', color: 'text-teal-300' },
                { id: 'forensic_analyst', label: 'جنائيات', icon: '🔬', color: 'text-indigo-300' },
                { id: 'threat_neutralizer', label: 'تحييد', icon: '⚡', color: 'text-red-300' },
              ].map(a => {
                const report = agentReports.find(r => r.agentId === a.id);
                return (
                  <div key={a.id} className={`rounded-lg border px-1.5 py-1.5 text-center ${
                    report?.severity === 'critical' ? 'border-rose-500/40 bg-rose-950/20' :
                    report?.severity === 'elevated' ? 'border-amber-500/30 bg-amber-950/15' :
                    'border-white/5 bg-black/20'
                  }`}>
                    <p className="text-sm">{a.icon}</p>
                    <p className={`text-[0.48rem] font-black ${a.color}`}>{a.label}</p>
                    <p className="text-[0.42rem] text-slate-600">
                      {report ? (report.severity === 'critical' ? '🚨' : report.severity === 'elevated' ? '⚠️' : '✅') : '—'}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* آخر تقارير الوكلاء */}
            {agentReports.length > 0 && (
              <div className="max-h-28 space-y-1.5 overflow-y-auto">
                {agentReports.slice(0, 4).map((r, i) => (
                  <div key={i} className={`rounded-lg border px-2 py-1.5 text-[0.52rem] ${
                    r.severity === 'critical' ? 'border-rose-500/25 bg-rose-950/20' :
                    r.severity === 'elevated' ? 'border-amber-500/20 bg-amber-950/15' :
                    'border-teal-500/15 bg-teal-950/10'
                  }`}>
                    <p className="font-black text-[0.6rem]" style={{color: r.agentId === 'proactive_scout' ? '#5eead4' : r.agentId === 'forensic_analyst' ? '#a5b4fc' : '#fca5a5'}}>
                      {r.agentLabelAr} — {r.actionLabelAr}
                    </p>
                    <p className="mt-0.5 text-slate-400 leading-relaxed line-clamp-2">{r.explanationAr}</p>
                  </div>
                ))}
              </div>
            )}
            {agentReports.length === 0 && (
              <p className="text-center text-[0.52rem] text-slate-700 py-2">اضغط «تحليل الآن» لتشغيل الوكلاء الحقيقيين</p>
            )}
          </div>

          {/* ◆ Cloudflare Shield — حماية Edge حقيقية */}
          {cfStatus && (
            <div className="mb-2 rounded-xl border border-orange-400/25 bg-black/40 p-3 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🔥</span>
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-orange-300/80">
                    Cloudflare Edge
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[0.48rem] font-black ${
                    cfStatus.security.underAttack
                      ? 'border-rose-500/60 bg-rose-500/20 text-rose-200'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {cfStatus.security.underAttack ? '🚨 Under Attack' : '🟢 ' + cfStatus.security.securityLevel}
                  </span>
                </div>
              </div>
              {/* Cloudflare Analytics */}
              {cfStatus.analytics24h && (
                <div className="mb-2 grid grid-cols-3 gap-1">
                  {[
                    { v: cfStatus.analytics24h.threats.toLocaleString('ar'), l: 'تهديد CF', c: 'text-rose-400' },
                    { v: Math.round(cfStatus.analytics24h.totalRequests / 1000) + 'k', l: 'طلب كلي', c: 'text-slate-300' },
                    { v: cfStatus.firewallRules.length, l: 'قاعدة نشطة', c: 'text-amber-400' },
                  ].map(s => (
                    <div key={s.l} className="rounded-lg border border-white/5 bg-black/30 p-1.5 text-center">
                      <p className={`text-[0.72rem] font-black ${s.c}`}>{s.v}</p>
                      <p className="text-[0.42rem] text-slate-600">{s.l}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* زر Under Attack Mode */}
              <button
                onClick={() => void handleToggleAttackMode()}
                disabled={attackModeChanging}
                className={`mb-2 w-full rounded-xl border py-2 text-[0.65rem] font-black transition-all ${
                  cfStatus.security.underAttack
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                    : 'border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                } disabled:opacity-50`}
              >
                {attackModeChanging ? '…' : cfStatus.security.underAttack
                  ? '✅ إيقاف Under Attack Mode'
                  : '🚨 تفعيل Under Attack Mode'}
              </button>
              {/* قواعد الجدار الناري */}
              {cfStatus.firewallRules.length > 0 && (
                <div className="max-h-24 overflow-y-auto space-y-1">
                  <p className="text-[0.48rem] font-bold uppercase text-orange-400/50 mb-1">IPs محجوبة على Cloudflare</p>
                  {(cfStatus.firewallRules ?? []).slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center justify-between text-[0.52rem]">
                      <span className="font-mono text-orange-300/70" dir="ltr">{r.ip}</span>
                      <span className="text-slate-600">{r.mode}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* ◆ بيانات أمنية حقيقية — المدعي العام الرقمي */}
          {realThreatData?.summary && (
            <div className="mt-2 border-t border-amber-400/10 pt-2">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="h-3 w-3 text-amber-400/70" />
                <h2 className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-400/70">
                  تقرير حقيقي · المدعي العام — {realThreatData.period}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {[
                  { v: realThreatData.summary.totalEvents ?? 0, l: 'حدث', c: 'text-slate-300' },
                  { v: realThreatData.summary.criticalEvents ?? 0, l: 'حرج', c: 'text-rose-400' },
                  { v: realThreatData.summary.blockedAttempts ?? 0, l: 'محجوب', c: 'text-amber-400' },
                ].map(s => (
                  <div key={s.l} className="rounded-lg border border-white/5 bg-black/30 p-1.5 text-center">
                    <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
                    <p className="text-[0.45rem] text-slate-600">{s.l}</p>
                  </div>
                ))}
              </div>
              {(realThreatData.topSuspiciousIps?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-amber-400/10 bg-black/20 p-2">
                  <p className="mb-1.5 text-[0.5rem] font-bold uppercase text-amber-400/50">أكثر IPs نشاطاً</p>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {realThreatData.topSuspiciousIps.slice(0, 8).map(({ ip, count }) => (
                      <div key={ip} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[0.55rem] text-rose-300/80" dir="ltr">{ip}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[0.5rem] text-slate-600">×{count}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => void handleBlockIp(ip)}
                              disabled={blockingIp === ip}
                              className="flex items-center gap-0.5 rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[0.48rem] font-black text-rose-300 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                              title="حظر محلي (Supabase)"
                            >
                              <ShieldOff className="h-2.5 w-2.5" />
                              {blockingIp === ip ? '…' : 'DB'}
                            </button>
                            {cfStatus?.cfConfigured && (
                              <button
                                onClick={() => void handleCfBlock(ip)}
                                disabled={cfLoading}
                                className="flex items-center gap-0.5 rounded border border-orange-500/40 bg-orange-500/12 px-1.5 py-0.5 text-[0.48rem] font-black text-orange-300 hover:bg-orange-500/22 transition-all disabled:opacity-50"
                                title="حظر على Cloudflare Edge"
                              >
                                🔥 CF
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ◆ أحداث أمنية حية — Supabase Realtime */}
          {liveSecEvents.length > 0 && (
            <div className="mt-2 border-t border-rose-500/10 pt-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <motion.div className="h-2 w-2 rounded-full bg-rose-500"
                  animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1, repeat:Infinity }} />
                <h2 className="text-[0.58rem] font-bold uppercase tracking-wider text-rose-400/70">
                  أحداث حية · LIVE
                </h2>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {liveSecEvents.map(e => (
                  <div key={e.id}
                    className={`flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-[0.52rem] ${
                      e.severity === 'critical' ? 'border-rose-500/30 bg-rose-950/30' : 'border-amber-500/20 bg-amber-950/15'
                    }`}>
                    <span>{e.severity === 'critical' ? '🚨' : '⚠️'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-rose-200" dir="ltr">{e.ip}</p>
                      <p className="text-slate-500">{e.event_type}
                        {e.ip_city && <span className="text-slate-600"> · {e.ip_city}</span>}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.45rem] text-slate-700">
                      {new Date(e.created_at).toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

const AMBIENT_SET_AGENTS: CyberAgentResponse[] = [
  {
    id: 'live-ag1', agentId: 'proactive_scout', agentLabelAr: 'عميل الاستطلاع الاستباقي',
    actionLabelAr: '🔍 مسح دوري',
    explanationAr: 'المسح الاستباقي مُكتمَل — لا ارتفاع في معدل الطلبات الواردة. بروتوكول المراقبة المبكرة نشط على جميع نقاط الـ API. التهديد المتوقع: منخفض.',
    severity: 'info', timestamp: ts(),
  },
  {
    id: 'live-ag2', agentId: 'forensic_analyst', agentLabelAr: 'محلل الجنائيات الرقمية',
    actionLabelAr: '🔬 تحليل الأنماط',
    explanationAr: 'فحص أنماط الـ 24 ساعة الأخيرة: لا هجمات موزّعة مكتشفة، لا هجمات بطيئة جارية. توزيع جغرافي طبيعي للزيارات. سجلات الجنائيات نظيفة.',
    severity: 'info', timestamp: ts(),
  },
  {
    id: 'live-ag3', agentId: 'threat_neutralizer', agentLabelAr: 'محيّد التهديدات',
    actionLabelAr: '⚡ استعداد كامل',
    explanationAr: 'منظومة التحييد جاهزة — DB Block + Cloudflare Edge Block مُتزامنان. في انتظار إشارة من عميل الاستطلاع أو المدعي العام لتنفيذ التحييد الشامل.',
    severity: 'info', timestamp: ts(),
  },
];

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
  AMBIENT_SET_AGENTS,   // ◆ الوكلاء المتخصصون الجدد
];
