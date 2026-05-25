/**
 * useCyberThreatRecorder — DVR لجلسات التهديد السيبراني
 *
 * يراقب البث المباشر ويلتقط الأحداث التهديدية بإحداثياتها الحقيقية.
 * عند اكتشاف أول تهديد → يبدأ التسجيل.
 * بعد 25 ثانية من عدم التهديد → يحفظ الجلسة في localStorage.
 * الحد الأقصى: 12 جلسة مخزَّنة (الأقدم يُحذف).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CyberEvent, CyberThreatSession, RecordedEvent } from '../types';

const STORAGE_KEY = 'halaqmap_cyber_dvr_sessions';
const MAX_SESSIONS = 12;
const IDLE_TIMEOUT_MS = 25_000; // 25s بعد آخر تهديد → نغلق الجلسة

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readSessions(): CyberThreatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CyberThreatSession[]) : [];
  } catch { return []; }
}
function writeSessions(sessions: CyberThreatSession[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
}

// ─── بناء تقرير المدعي العام ──────────────────────────────────────────────────
function buildProsecutorReport(events: RecordedEvent[], durationMs: number): CyberThreatSession['prosecutorReport'] {
  const threats = events.filter(e => e.kind === 'threat_attack' || e.kind === 'threat_probe');
  const attacks = events.filter(e => e.kind === 'threat_attack');
  const probes  = events.filter(e => e.kind === 'threat_probe');
  const sources = [...new Set(events.map(e => e.originLabelAr).filter(Boolean))];
  const protocols = [...new Set(events.map(e => e.protocolTag).filter(Boolean))];
  const secs = Math.round(durationMs / 1000);

  return {
    title: attacks.length > 0
      ? `🚨 هجوم سيبراني موثَّق — ${attacks.length} حادثة عدوانية`
      : `⚠️ رصيد استطلاع مريب — ${probes.length} مسبار`,
    body: [
      `المُدّعي العام الرقمي — تقرير الجلسة المسجَّلة`,
      ``,
      `【ملخص الحادثة】`,
      `إجمالي التهديدات: ${threats.length} (هجوم: ${attacks.length} · استطلاع: ${probes.length})`,
      `مدة الجلسة: ${secs} ثانية`,
      sources.length > 0 ? `المصادر الجغرافية: ${sources.join(' · ')}` : `المصادر: إحداثيات خارجية متعددة`,
      protocols.length > 0 ? `البروتوكولات المستخدمة: ${protocols.join(' · ')}` : '',
      ``,
      `【الحُكم】`,
      attacks.length >= 5
        ? `هجوم منسَّق موثَّق — يُوصى بإحالة السجلات للجهات المختصة وتفعيل نظام مكافحة جرائم المعلوماتية.`
        : attacks.length > 0
          ? `محاولات اختراق مُسجَّلة — تم الحظر والتوثيق. السجلات الجنائية جاهزة.`
          : `نشاط استطلاعي مريب — لا دليل على اختراق. المراقبة مستمرة.`,
      ``,
      `【الدليل الرقمي】`,
      `تم تسجيل ${events.length} حدثاً مع إحداثياتها الجغرافية الحقيقية على رادار المنصة.`,
      `قابل للاستعراض والتشغيل من غرفة العمليات السيبرانية.`,
    ].filter(l => l !== null).join('\n'),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export type CyberThreatRecorderHandle = {
  sessions: CyberThreatSession[];
  isRecording: boolean;
  currentBuffer: number;      // عدد الأحداث المُسجَّلة في الجلسة الحالية
  clearSession: (id: string) => void;
  clearAll: () => void;
};

export function useCyberThreatRecorder(
  pulses: ReadonlyArray<CyberEvent>,
  enabled: boolean,
): CyberThreatRecorderHandle {
  const [sessions, setSessions] = useState<CyberThreatSession[]>(() => readSessions());
  const [isRecording, setIsRecording] = useState(false);
  const [bufferLen, setBufferLen] = useState(0);

  // حالة التسجيل الداخلية
  const sessionStartRef  = useRef<number | null>(null);
  const recordedRef      = useRef<RecordedEvent[]>([]);
  const idleTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processedIds     = useRef<Set<string>>(new Set());

  const closeAndSave = useCallback(() => {
    if (!sessionStartRef.current || recordedRef.current.length === 0) {
      // لا أحداث → لا نحفظ
      sessionStartRef.current = null;
      recordedRef.current = [];
      setIsRecording(false);
      setBufferLen(0);
      return;
    }

    const start   = sessionStartRef.current;
    const events  = [...recordedRef.current];
    const endMs   = events[events.length - 1].offsetMs + 3000;
    const threats = events.filter(e => e.kind === 'threat_attack' || e.kind === 'threat_probe');
    const attacks = events.filter(e => e.kind === 'threat_attack');
    const sources = new Set(events.map(e => e.originLabelAr).filter(Boolean));
    const hasAttacks = attacks.length > 0;
    const hasCritical = events.some(e => e.severity === 'critical');

    const session: CyberThreatSession = {
      id: `dvr-${start}`,
      recordedAt: new Date(start).toISOString(),
      titleAr: hasAttacks
        ? `هجوم سيبراني — ${attacks.length} ضربة`
        : `استطلاع مريب — ${threats.length} مسبار`,
      subtitleAr: hasCritical
        ? 'خطورة عالية · مسجَّل للتحقيق الجنائي'
        : 'خطورة متوسطة · موثَّق للمراجعة',
      durationMs: endMs,
      events,
      stats: {
        totalThreats: threats.length,
        attackKinds: [...new Set(attacks.map(e => e.protocolTag ?? 'مجهول'))].filter(Boolean),
        sourcesCount: sources.size,
        peakSeverity: hasCritical ? 'critical' : events.some(e => e.severity === 'elevated') ? 'elevated' : 'normal',
      },
      prosecutorReport: buildProsecutorReport(events, endMs),
    };

    setSessions(prev => {
      const next = [session, ...prev].slice(0, MAX_SESSIONS);
      writeSessions(next);
      return next;
    });

    // إعادة تعيين
    sessionStartRef.current = null;
    recordedRef.current = [];
    setIsRecording(false);
    setBufferLen(0);
  }, []);

  // مراقبة النبضات الجديدة
  useEffect(() => {
    if (!enabled) return;

    // فحص كل نبضة جديدة
    for (const pulse of pulses) {
      if (processedIds.current.has(pulse.id)) continue;
      processedIds.current.add(pulse.id);

      const isThreat = pulse.kind === 'threat_attack' || pulse.kind === 'threat_probe';
      if (!isThreat) continue;

      // بدء جلسة جديدة إذا لم تكن هناك جلسة نشطة
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
        recordedRef.current = [];
        setIsRecording(true);
      }

      // إعادة ضبط مؤقت الخمول
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(closeAndSave, IDLE_TIMEOUT_MS);

      // تسجيل الحدث
      const offset = Date.now() - sessionStartRef.current;
      const recorded: RecordedEvent = {
        kind: pulse.kind,
        severity: pulse.severity,
        source: pulse.source,
        target: pulse.target,
        description: pulse.description,
        originLabelAr: pulse.originLabelAr,
        protocolTag: pulse.protocolTag,
        volume: pulse.volume,
        offsetMs: offset,
      };
      recordedRef.current.push(recorded);
      setBufferLen(recordedRef.current.length);
    }
  }, [pulses, enabled, closeAndSave]);

  // تنظيف عند إلغاء التفعيل
  useEffect(() => {
    if (!enabled && isRecording) closeAndSave();
  }, [enabled, isRecording, closeAndSave]);

  const clearSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      writeSessions(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSessions([]);
    writeSessions([]);
  }, []);

  return { sessions, isRecording, currentBuffer: bufferLen, clearSession, clearAll };
}

// ─── تحويل جلسة → CyberScenario للتشغيل ─────────────────────────────────────
export function sessionToScenario(session: CyberThreatSession) {
  // نبني steps بإزاحات 3 ثوانٍ بين كل حدث (للوضوح البصري)
  const STEP_GAP = 2500;
  const steps = session.events.map((ev, i) => ({
    atMs: i * STEP_GAP,
    narratorAr: i === 0
      ? `🔴 إعادة تشغيل التسجيل — ${session.titleAr}`
      : undefined,
    events: [{
      kind: ev.kind,
      severity: ev.severity,
      source: ev.source,
      target: ev.target,
      description: ev.description,
      originLabelAr: ev.originLabelAr,
      protocolTag: ev.protocolTag,
      volume: ev.volume,
      lifetimeMs: 5000,
    }],
    agentResponses: i === Math.floor(session.events.length / 2) ? [{
      agentId: 'public_prosecutor' as const,
      agentLabelAr: 'المُدّعي العام الرقمي',
      actionLabelAr: 'إعادة التشغيل — تقرير جنائي',
      explanationAr: session.prosecutorReport.body.split('\n').slice(0, 5).join(' '),
      severity: session.stats.peakSeverity,
    }] : undefined,
  }));

  return {
    id: session.id,
    titleAr: `🔴 تسجيل: ${session.titleAr}`,
    subtitleAr: `مسجَّل ${new Date(session.recordedAt).toLocaleString('ar-SA')} · ${session.stats.totalThreats} تهديد`,
    totalDurationMs: steps.length * STEP_GAP + 3000,
    steps,
  };
}
