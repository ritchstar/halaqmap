/**
 * CyberHud — the side panels for the Cyber Operations Theater.
 *
 * Exports three small components that the parent page composes:
 *  - CyberStatsStrip: numeric telemetry strip
 *  - AgentResponseFeed: scripted/live AI agent reactions
 *  - ScenarioControlPanel: mode + scenario picker + play/pause/reset
 */

import { useMemo } from 'react';
import {
  Activity,
  AlertOctagon,
  Briefcase,
  Crown,
  Globe2,
  Pause,
  Play,
  RefreshCcw,
  Shield,
  ShieldAlert,
  Users2,
  Wrench,
} from 'lucide-react';
import type {
  CyberAgentResponse,
  CyberEvent,
  CyberMode,
  CyberScenario,
} from '../types';

// ============================================================================
// CyberStatsStrip
// ============================================================================

function deriveStats(pulses: ReadonlyArray<CyberEvent>) {
  let connections = 0;
  let registrations = 0;
  let threatsActive = 0;
  let internal = 0;
  let external = 0;
  for (const p of pulses) {
    if (
      p.kind === 'visit_internal' ||
      p.kind === 'visit_external' ||
      p.kind === 'registration' ||
      p.kind === 'login_success'
    ) {
      connections += 1;
      if (p.kind === 'registration') registrations += 1;
      if (p.kind === 'visit_external') external += 1;
      else internal += 1;
    } else if (p.kind === 'threat_probe' || p.kind === 'threat_attack') {
      threatsActive += 1;
    }
  }
  const total = internal + external || 1;
  return {
    connections,
    registrations,
    threatsActive,
    internalShare: internal / total,
    externalShare: external / total,
  };
}

function StatCard({
  icon: Icon,
  labelAr,
  value,
  tone,
}: {
  icon: typeof Activity;
  labelAr: string;
  value: string;
  tone: 'neutral' | 'good' | 'warn' | 'danger';
}) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-400/40 text-emerald-100'
      : tone === 'warn'
        ? 'border-amber-400/40 text-amber-100'
        : tone === 'danger'
          ? 'border-rose-400/50 text-rose-100'
          : 'border-slate-400/30 text-slate-100';
  return (
    <div
      dir="rtl"
      className={`flex min-w-[7.5rem] items-center gap-2 rounded-lg border bg-black/55 px-3 py-2 backdrop-blur-md ${toneClass}`}
    >
      <Icon className="h-4 w-4 opacity-80" aria-hidden />
      <div className="flex flex-col leading-tight">
        <span className="text-[0.65rem] uppercase tracking-wider opacity-75">{labelAr}</span>
        <span className="text-sm font-bold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

export function CyberStatsStrip({
  pulses,
  threatsBlocked,
  mode,
  liveConnected,
}: {
  pulses: ReadonlyArray<CyberEvent>;
  threatsBlocked: number;
  mode: CyberMode;
  liveConnected: boolean;
}) {
  const stats = useMemo(() => deriveStats(pulses), [pulses]);
  const liveBadge =
    mode === 'live'
      ? liveConnected
        ? { text: '🟢 رصد حَيّ', tone: 'good' as const }
        : { text: '🟡 إِعادة اتصال…', tone: 'warn' as const }
      : { text: '🎬 وَضع المُحاكاة', tone: 'warn' as const };

  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-2 px-3 py-2">
      <StatCard icon={Activity} labelAr={liveBadge.text} value="" tone={liveBadge.tone} />
      <StatCard
        icon={Users2}
        labelAr="اتصالات نَشطة"
        value={stats.connections.toLocaleString('ar-SA')}
        tone="neutral"
      />
      <StatCard
        icon={Crown}
        labelAr="طلبات اشتراك"
        value={stats.registrations.toLocaleString('ar-SA')}
        tone="good"
      />
      <StatCard
        icon={ShieldAlert}
        labelAr="تَهديدات نَشطة"
        value={stats.threatsActive.toLocaleString('ar-SA')}
        tone={stats.threatsActive > 0 ? 'danger' : 'neutral'}
      />
      <StatCard
        icon={Shield}
        labelAr="تَهديدات مَحجوبة"
        value={threatsBlocked.toLocaleString('ar-SA')}
        tone="good"
      />
      <StatCard
        icon={Globe2}
        labelAr="داخلي / خارجي"
        value={`${Math.round(stats.internalShare * 100)}% / ${Math.round(stats.externalShare * 100)}%`}
        tone="neutral"
      />
    </div>
  );
}

// ============================================================================
// AgentResponseFeed
// ============================================================================

const AGENT_ICONS = {
  public_prosecutor: Crown,
  compliance: Shield,
  engineering: Wrench,
  partner_liaison: Briefcase,
  ops_controller: Activity,
} as const;

const AGENT_ACCENT = {
  public_prosecutor: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
  compliance: 'border-sky-400/50 bg-sky-500/10 text-sky-100',
  engineering: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100',
  partner_liaison: 'border-violet-400/50 bg-violet-500/10 text-violet-100',
  ops_controller: 'border-rose-400/50 bg-rose-500/10 text-rose-100',
} as const;

export function AgentResponseFeed({ entries }: { entries: ReadonlyArray<CyberAgentResponse> }) {
  if (entries.length === 0) {
    return (
      <div
        dir="rtl"
        className="rounded-xl border border-white/10 bg-black/40 p-4 text-center text-xs text-slate-400"
      >
        لا تَفاعُلات بَعد — الوَكلاء في وَضع المُراقبة الهَادئة.
      </div>
    );
  }
  return (
    <div dir="rtl" className="flex flex-col gap-2">
      {entries.map((entry) => {
        const Icon = AGENT_ICONS[entry.agentId];
        const accent = AGENT_ACCENT[entry.agentId];
        return (
          <article
            key={entry.id}
            className={`rounded-xl border bg-black/60 p-3 text-xs leading-relaxed backdrop-blur-md ${accent}`}
          >
            <header className="mb-1 flex items-center gap-2">
              <Icon className="h-4 w-4 opacity-90" aria-hidden />
              <span className="text-sm font-bold">{entry.agentLabelAr}</span>
              <span className="ms-auto rounded-full border border-current/30 px-2 py-0.5 text-[0.65rem] opacity-90">
                {entry.actionLabelAr}
              </span>
            </header>
            <p
              dir="rtl"
              className="chat-arabic-text text-[0.78rem] text-white/85"
              style={{ unicodeBidi: 'plaintext' }}
            >
              {entry.explanationAr}
            </p>
          </article>
        );
      })}
    </div>
  );
}

// ============================================================================
// ScenarioControlPanel
// ============================================================================

export function ScenarioControlPanel({
  mode,
  setMode,
  scenarios,
  activeScenarioId,
  setActiveScenarioId,
  state,
  elapsedMs,
  onPlay,
  onPause,
  onReset,
}: {
  mode: CyberMode;
  setMode: (m: CyberMode) => void;
  scenarios: ReadonlyArray<CyberScenario>;
  activeScenarioId: string | null;
  setActiveScenarioId: (id: string) => void;
  state: 'idle' | 'playing' | 'paused' | 'finished';
  elapsedMs: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}) {
  const active = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0];
  const progress = active ? Math.min(1, elapsedMs / active.totalDurationMs) : 0;

  return (
    <div dir="rtl" className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('live')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'live'
              ? 'bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/60'
              : 'bg-black/40 text-slate-300 hover:bg-black/60'
          }`}
        >
          🟢 رادار حَيّ
        </button>
        <button
          type="button"
          onClick={() => setMode('scenario')}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'scenario'
              ? 'bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/60'
              : 'bg-black/40 text-slate-300 hover:bg-black/60'
          }`}
        >
          🎬 مُحاكاة
        </button>
      </div>

      {mode === 'scenario' ? (
        <>
          <div className="flex flex-col gap-1.5">
            {scenarios.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setActiveScenarioId(s.id)}
                className={`rounded-md border px-3 py-2 text-right transition-colors ${
                  activeScenarioId === s.id
                    ? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
                    : 'border-white/10 bg-black/40 text-slate-200 hover:border-white/30'
                }`}
              >
                <div className="text-[0.78rem] font-bold leading-tight">{s.titleAr}</div>
                <div className="mt-0.5 text-[0.65rem] opacity-70">{s.subtitleAr}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {state === 'playing' ? (
              <button
                type="button"
                onClick={onPause}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-100 ring-1 ring-amber-400/60"
              >
                <Pause className="h-3.5 w-3.5" /> إِيقاف مُؤَقَّت
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlay}
                disabled={!active}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/60 disabled:opacity-40"
              >
                <Play className="h-3.5 w-3.5" />{' '}
                {state === 'paused'
                  ? 'مُتابعة'
                  : state === 'finished'
                    ? 'إِعادة'
                    : 'تَشغيل'}
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 rounded-md bg-black/40 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10 hover:bg-black/60"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> صِفر
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[0.62rem] tabular-nums text-slate-400">
              <span>
                {Math.floor(elapsedMs / 1000)}s / {Math.floor((active?.totalDurationMs ?? 0) / 1000)}s
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-l from-amber-300 via-amber-500 to-amber-600 transition-[width] duration-200 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-emerald-400/30 bg-emerald-500/5 p-3 text-[0.78rem] leading-relaxed text-emerald-100/90">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <p
            dir="rtl"
            className="chat-arabic-text"
            style={{ unicodeBidi: 'plaintext' }}
          >
            وَضع المُراقبة الحَيّة — كل نَبضة على الشاشة هي اتصال حقيقي تَلَقّاه النظام الآن. لإِجراء
            عَرض تَدريبي، انتقِل إلى وَضع المُحاكاة.
          </p>
        </div>
      )}
    </div>
  );
}
