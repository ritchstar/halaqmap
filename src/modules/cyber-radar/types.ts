/**
 * Cyber Operations Theater — type contracts shared by canvas, hooks,
 * scenarios, and the live stream feed.
 *
 * The radar visualises *connections* to the platform. Each connection
 * lands as a CyberPulse at a viewBox coordinate; threat events spawn
 * a TraceVector (an animated beam) from an external source toward the
 * KSA origin so the defence story is geometric, not abstract.
 */

import type { ViewPoint } from '@/modules/platform-radar/lib/saudiKingdomGeo';

/** What kind of inbound event is this? Drives colour, glow, sound, narration. */
export type CyberEventKind =
  | 'visit_internal' // legit page view from inside KSA
  | 'visit_external' // legit page view from outside KSA (tourists, expats)
  | 'registration' // barber sign-up / interest submission
  | 'login_success' // partner / admin login
  | 'threat_probe' // suspicious recon / scan
  | 'threat_attack' // active intrusion attempt (DDoS, SQLi, brute force)
  | 'defence_action'; // an AI agent intervention (rate-limit, block, captcha)

/** Severity used to size the pulse and decide if it triggers an agent response. */
export type CyberSeverity = 'info' | 'normal' | 'elevated' | 'critical';

/** Atomic event painted on the radar. */
export type CyberEvent = {
  id: string;
  kind: CyberEventKind;
  severity: CyberSeverity;
  /** Source point on the SVG viewBox (already projected). */
  source: ViewPoint;
  /** Optional target point — required for threat & defence vectors. */
  target?: ViewPoint;
  /** Human-readable description (Arabic) shown in the event log. */
  description: string;
  /** Optional short city / region name (Arabic) for the chip. */
  originLabelAr?: string;
  /** Optional protocol / payload tag (e.g. "TLS 1.3", "SQLi attempt"). */
  protocolTag?: string;
  /** Optional volume hint for batch storms (e.g. 250 — rendered as ×250). */
  volume?: number;
  /** ISO timestamp the event entered the scene (for log ordering). */
  timestamp: string;
  /** Lifetime in ms — when expired the pulse is removed. */
  lifetimeMs?: number;
};

/** Scripted reaction from an AI agent — surfaced in the right-rail feed. */
export type CyberAgentResponse = {
  id: string;
  /** Agent identifier — drives colour / icon. */
  agentId:
    | 'public_prosecutor'   // المُدّعي العام — جنائي وقانوني
    | 'compliance'          // مراقب الامتثال — معايير أمنية
    | 'engineering'         // الجناح الهندسي — البنية التحتية
    | 'ops_controller'      // مراقب العمليات — رصد لحظي
    | 'cyber_defense'       // قائد الدفاع السيبراني — الدور المحوري
    | 'covert_sovereign'    // السيادة الخفية — استخبارات وقناة مشفرة
    | 'proactive_scout'     // عميل الاستطلاع الاستباقي — يكشف قبل الهجوم
    | 'forensic_analyst'    // محلل الجنائيات الرقمية — أنماط خفية
    | 'threat_neutralizer'; // محيّد التهديدات — تحييد شامل DB+CF
  agentLabelAr: string;
  /** Short action verb shown in the badge (e.g. "تفعيل Rate-Limit"). */
  actionLabelAr: string;
  /** Longer explanation rendered as a paragraph. */
  explanationAr: string;
  /** Optional severity for badge colour. */
  severity: CyberSeverity;
  timestamp: string;
};

/** A single timeline step for a recorded scenario. */
export type ScenarioStep = {
  /** Milliseconds offset from scenario start. */
  atMs: number;
  /** Events to spawn at this tick (may be empty if step is narrative only). */
  events?: ReadonlyArray<Omit<CyberEvent, 'id' | 'timestamp'>>;
  /** Agent narration responses to surface at this tick. */
  agentResponses?: ReadonlyArray<Omit<CyberAgentResponse, 'id' | 'timestamp'>>;
  /** Narrator banner text shown briefly at the top of the canvas. */
  narratorAr?: string;
};

/** A full pre-recorded scenario. */
export type CyberScenario = {
  id: string;
  titleAr: string;
  subtitleAr: string;
  totalDurationMs: number;
  /** Sorted by atMs. */
  steps: ReadonlyArray<ScenarioStep>;
};

/** Aggregated radar telemetry derived from current pulses. */
export type CyberStats = {
  connectionsPerMinute: number;
  registrationsPerMinute: number;
  threatsActive: number;
  threatsBlocked: number;
  internalShare: number; // 0..1
  externalShare: number; // 0..1
};

/** Top-level mode for the page. */
export type CyberMode = 'live' | 'scenario';

// ─── DVR: تسجيل جلسات التهديد الحقيقية ─────────────────────────────────────

/** حدث مسجَّل بإزاحة زمنية عن بداية الجلسة */
export type RecordedEvent = {
  kind: CyberEventKind;
  severity: CyberSeverity;
  source: ViewPoint;
  target?: ViewPoint;
  description: string;
  originLabelAr?: string;
  protocolTag?: string;
  volume?: number;
  offsetMs: number; // milliseconds from session start
};

/** جلسة تهديد مسجَّلة — تُخزَّن في localStorage */
export type CyberThreatSession = {
  id: string;
  recordedAt: string;          // ISO timestamp of session start
  titleAr: string;
  subtitleAr: string;
  durationMs: number;
  events: RecordedEvent[];
  stats: {
    totalThreats: number;
    attackKinds: string[];      // e.g. ['DDoS','SQLi']
    sourcesCount: number;
    peakSeverity: CyberSeverity;
  };
  prosecutorReport: {
    title: string;
    body: string;
  };
};
