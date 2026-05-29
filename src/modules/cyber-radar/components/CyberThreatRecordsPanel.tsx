/**
 * CyberThreatRecordsPanel — لوحة تسجيلات التهديد السيبراني
 *
 * تظهر في اللوحة اليسرى من غرفة العمليات.
 * تُعرض بطاقات التسجيلات مع:
 *  · شارة 🔴 REC عند التسجيل النشط
 *  · زر ▶ تشغيل لإعادة عرض الحادثة على الرادار
 *  · تقرير المدعي العام منسَّق
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ChevronDown, ChevronUp, Shield, FileText } from 'lucide-react';
import type { CyberThreatSession } from '../types';

// ── شارة شدة الحدث ────────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'critical'
    ? 'border-rose-500/60 bg-rose-500/15 text-rose-300'
    : severity === 'elevated'
      ? 'border-amber-500/50 bg-amber-500/12 text-amber-300'
      : 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  const label = severity === 'critical' ? '🚨 حرج' : severity === 'elevated' ? '⚠️ مرتفع' : '🔵 متوسط';
  return (
    <span className={`rounded-full border px-1.5 py-0.5 text-[0.5rem] font-black ${cls}`}>{label}</span>
  );
}

// ── تقرير المدعي العام ────────────────────────────────────────────────────────
function ProsecutorReport({ report }: { report: { title: string; body: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-500/6 px-2 py-1.5 text-left transition-colors hover:bg-amber-500/12">
        <FileText className="h-3 w-3 text-amber-400/70" />
        <span className="flex-1 text-[0.58rem] font-bold text-amber-200/80">{report.title}</span>
        {open ? <ChevronUp className="h-3 w-3 text-amber-400/50" /> : <ChevronDown className="h-3 w-3 text-amber-400/50" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-amber-400/12 bg-black/30 px-2 py-2 text-[0.55rem] leading-5 text-amber-100/70">
              {report.body}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── بطاقة جلسة واحدة ──────────────────────────────────────────────────────────
function SessionCard({
  session,
  onPlay,
  onDelete,
}: {
  session: CyberThreatSession;
  onPlay: (session: CyberThreatSession) => void;
  onDelete: (id: string) => void;
}) {
  const dt = new Date(session.recordedAt);
  const timeLabel = dt.toLocaleTimeString('ar-SA', { hour:'2-digit', minute:'2-digit' });
  const dateLabel = dt.toLocaleDateString('ar-SA', { month:'short', day:'numeric' });
  const durSec = Math.round(session.durationMs / 1000);

  return (
    <motion.div
      initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
      className="rounded-xl border border-rose-500/20 bg-black/40 p-2.5 backdrop-blur-sm"
    >
      {/* رأس البطاقة */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[0.58rem] font-black uppercase tracking-wider text-rose-400/80">🔴 DVR</span>
            <SeverityBadge severity={session.stats.peakSeverity} />
          </div>
          <p className="mt-0.5 text-[0.68rem] font-black leading-tight text-rose-100">{session.titleAr}</p>
          <p className="text-[0.52rem] text-slate-500">{session.subtitleAr}</p>
        </div>
        <button onClick={() => onDelete(session.id)}
          className="shrink-0 text-slate-700 hover:text-rose-400 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* إحصاءات */}
      <div className="mb-2 grid grid-cols-3 gap-1 text-center">
        {[
          { v: session.stats.totalThreats, l: 'تهديد' },
          { v: session.stats.sourcesCount, l: 'مصدر' },
          { v: durSec, l: 'ث' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/5 bg-white/[0.025] py-1">
            <p className="text-[0.68rem] font-black text-rose-300">{s.v}</p>
            <p className="text-[0.45rem] text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      {/* توقيت */}
      <div className="mb-2 flex items-center justify-between text-[0.52rem] text-slate-600">
        <span>{dateLabel} · {timeLabel}</span>
        {session.stats.attackKinds.length > 0 && (
          <span className="text-rose-400/50">{session.stats.attackKinds.slice(0,2).join(' · ')}</span>
        )}
      </div>

      {/* تقرير المدعي */}
      <ProsecutorReport report={session.prosecutorReport} />

      {/* زر التشغيل */}
      <button
        onClick={() => onPlay(session)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-400/35 bg-rose-500/12 py-2 text-[0.65rem] font-black text-rose-200 hover:bg-rose-500/22 transition-all active:scale-95"
      >
        <Play className="h-3 w-3 fill-current" />
        ▶ إعادة تشغيل التسجيل على الرادار
      </button>
    </motion.div>
  );
}

// ── المكوّن الرئيسي ────────────────────────────────────────────────────────────
export function CyberThreatRecordsPanel({
  sessions,
  isRecording,
  currentBuffer,
  onPlaySession,
  onDeleteSession,
  onClearAll,
}: {
  sessions: CyberThreatSession[];
  isRecording: boolean;
  currentBuffer: number;
  onPlaySession: (session: CyberThreatSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* رأس القسم */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-rose-400/70 hover:text-rose-300 transition-colors">
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          <Shield className="h-3 w-3" />
          تسجيلات DVR
          {sessions.length > 0 && (
            <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-1.5 text-[0.5rem] font-black text-rose-300">
              {sessions.length}
            </span>
          )}
        </button>
        {sessions.length > 0 && !collapsed && (
          <button onClick={onClearAll}
            className="text-[0.5rem] text-slate-700 hover:text-rose-400 transition-colors">
            مسح الكل
          </button>
        )}
      </div>

      {/* مؤشر التسجيل النشط */}
      {isRecording && (
        <motion.div
          animate={{ opacity:[0.7, 1, 0.7] }}
          transition={{ duration:1.4, repeat:Infinity }}
          className="flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 px-3 py-2"
        >
          <motion.div
            animate={{ scale:[1, 1.4, 1] }}
            transition={{ duration:0.8, repeat:Infinity }}
            className="h-2 w-2 rounded-full bg-rose-500"
          />
          <span className="text-[0.62rem] font-black text-rose-300">تسجيل نشط</span>
          <span className="mr-auto text-[0.55rem] text-rose-400/60">{currentBuffer} حدث</span>
        </motion.div>
      )}

      {/* القائمة */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="flex flex-col gap-2">
            {sessions.length === 0 && !isRecording && (
              <p className="rounded-xl border border-white/5 bg-black/20 px-3 py-4 text-center text-[0.6rem] text-slate-600">
                لا تسجيلات بعد — التسجيل يبدأ تلقائياً عند اكتشاف تهديد
              </p>
            )}
            {sessions.map(s => (
              <SessionCard key={s.id} session={s}
                onPlay={onPlaySession} onDelete={onDeleteSession} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
