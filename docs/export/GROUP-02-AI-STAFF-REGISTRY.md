# AI Staff Registry & Types

> Export group `GROUP-02-AI-STAFF-REGISTRY` · Commit `b0e9e73`

### `src/modules/ai-staff/registry.ts`

```typescript
import {
  DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
  DIGITAL_SHIFT_PRODUCT_TITLE,
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
} from '@/config/digitalShiftAssistant';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import type {
  AiStaffAgentDef,
  AiStaffBoundaryDef,
  AiStaffBoundaryId,
  FleetIntelligencePing,
  PartnerLiaisonAnalyticsSnapshot,
} from '@/modules/ai-staff/types';

export const AI_STAFF_CONTROL_ROOM_TITLE = 'غرفة قيادة الموظفين الأذكياء';
export const AI_STAFF_CONTROL_ROOM_SUBTITLE =
  'وحدة مستقلة لإدارة الأسطاب الافتراضية — حدود إدارية صارمة، مراقبة ميدانية، وقنوات سيادية سرية للقيادة.';

export const AI_STAFF_BOUNDARIES: AiStaffBoundaryDef[] = [
  {
    id: 'internal_governance',
    titleAr: 'أ — الحوكمة الداخلية للمنصة',
    subtitleAr: 'خازن · ZATCA · مستشار الأزمات · المدعي العام — سجلات المنصة والامتثال والتعافي',
    gridClassName: 'sm:grid-cols-2 lg:grid-cols-4',
  },
  {
    id: 'engineering_council',
    titleAr: 'ج — المجلس الهندسي الذاتي',
    subtitleAr: 'Technical Consultant · A2A Council · Draft Branch · Pending Founder Approval',
    gridClassName: 'max-w-3xl',
  },
  {
    id: 'external_partner_ops',
    titleAr: 'ب — عمليات الشركاء الخارجية',
    subtitleAr: 'المناوب الميداني · مساعد الشركاء — نشر ميداني وعلاقات بدون العبث بالماليات',
    gridClassName: 'sm:grid-cols-2',
  },
  {
    id: 'covert_sovereign',
    titleAr: '◆ سيادة الأسطول — مقصورة سرية',
    subtitleAr: 'المدير العام للمناوبين — مراقبة صامتة عبر قناة خلفية مشفرة (قيادة عليا فقط)',
    gridClassName: 'max-w-2xl',
    covert: true,
  },
];

const DIGITAL_SHIFT_DOCTRINE: string[] = [
  'ممنوع العبث بمحافظ العملاء أو أسعار الخدمة — المناوب يعمل على الآداب والجدولة فقط.',
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
  'محفظة المناوب (هللات) تخص صالون الحلاق فقط — migration 78 · barber_ai_wallet.',
];

const PARTNER_LIAISON_DOCTRINE: string[] = [
  'نطاق مسار الخدمات البرمجية للمنصة فقط — لا بيانات مالية للمستهلك النهائي.',
  'يجمع ملاحظات الاحتكاك التشغيلي من الحلاقين دون التدخل في مدفوعات الصالون.',
];

/** Unified registry — single source of truth for all virtual staff. */
export const AI_STAFF_AGENT_REGISTRY: AiStaffAgentDef[] = [
  {
    id: 'billing_treasurer',
    boundary: 'internal_governance',
    shortName: 'خازن 🪙',
    title: 'خازن — دفتر المنصة والمحفظة',
    roleDescription:
      'أتمتة الفوترة الذكية، قراءة فواتير البنية التحتية، وتحديث جدول الالتزامات فورياً عبر لقطات الشاشة.',
    accentClass: staffTheme.accentEmerald,
    requiredAny: ['view_ops_billing_monitor', 'manage_centralized_billing_ops'],
    available: true,
    iconKind: 'treasurer',
    workspaceKind: 'billing_dialog',
    ctaLabelAr: 'فتح مكتب خازن',
  },
  {
    id: 'zatca_tax_advisor',
    boundary: 'internal_governance',
    shortName: 'زميل خازن · ZATCA',
    title: 'خبير زكاة وضريبة (ZATCA) 🛡️',
    statusBadgeAr: 'نشط بالرادار',
    ctaLabelAr: 'محادثة خبير ZATCA 🛡️',
    roleDescription:
      'فرز فواتير الصالونات بالهللة، تحليل سرعة التدفق المالي، التنبؤ الاستباقي بحدود الامتثال، ومسح مصادر ZATCA الرسمية للتحديثات.',
    accentClass: staffTheme.accentAmber,
    requiredAny: [
      'manage_platform_commerce_rules',
      'view_ops_billing_monitor',
      'manage_centralized_billing_ops',
    ],
    available: true,
    iconKind: 'zatca_shield',
    workspaceKind: 'zatca_settings',
    doctrineNotes: [
      'رادار إيرادات المنصة + تقرير استباقي باحتسابات افتراضية (187,500 / 375,000 ر.س).',
      'مسح دوري لمواقع ZATCA الرسمية — ليس بديلاً عن مستشار ضريبي مرخّص.',
      'تفعيل ض.ق.م 15% على الواجهة يتطلب موافقة Super Admin صريحة.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-zatca-tax-advisor', '/api/admin-zatca-advisor-lab-chat'],
    },
  },
  {
    id: 'system_crisis_advisor',
    boundary: 'internal_governance',
    shortName: 'مستشار الأزمات',
    title: 'مستشار الأزمات التقنية — Strategic Technical Consultant',
    statusBadgeAr: 'جاهز · Crisis Playbook',
    ctaLabelAr: 'Crisis Discussion 🚨',
    roleDescription:
      'استشاري تقني استراتيجي عند الحوادث — يرتّب P0/P1، يقرأ Crisis Playbook، ويركّز على Uptime وسلامة البيانات دون ضجيج واجهة.',
    accentClass: staffTheme.accentCrisis,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'crisis_advisor',
    workspaceKind: 'crisis_playbook',
    doctrineNotes: [
      'read-only: docs/crisis-playbook.md — disaster recovery وخطوات التعافي.',
      'Crisis Discussion: uptime + data integrity فقط — تجاهل UX غير الحرج.',
      'Professional Sovereignty — B2B داخلي للمؤسس وSuper Admin.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-system-crisis-advisor-lab-chat'],
    },
  },
  {
    id: 'public_prosecutor',
    boundary: 'internal_governance',
    shortName: 'المدعي العام',
    title: 'المدعي العام الرقمي — Central Governance',
    statusBadgeAr: 'حوكمة · Professional Sovereignty',
    ctaLabelAr: 'مكتب المدعي العام ⚖️',
    roleDescription:
      'ضابط الامتثال والحوكمة الاستراتيجية — يراقب مختبرات ZATCA والأزمات والأسطول، يزامن Platform Radar، يدقّق التسجيل B2B، ويمتلك سلطة المقاطعة عند انحراف الإجراءات.',
    accentClass: staffTheme.accentGovernance,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'public_prosecutor',
    workspaceKind: 'prosecutor_governance',
    doctrineNotes: [
      'قراءة جميع سجلات المختبرات — ZATCA · Crisis · Fleet Director.',
      'Radar Sync: نمط Inspector → تقرير وقائي في التغذية التشغيلية.',
      'Compliance Enforcement: تدقيق ComplianceCheckbox + ميثاق الالتزام المهني.',
      'Crisis Watch: مقاطعة إذا أُعطيت UX أولوية على Data Integrity — بروtokol P0.',
    ],
    productRef: {
      apiRoutes: [
        '/api/admin-public-prosecutor-lab-chat',
        '/api/admin-public-prosecutor-dashboard',
      ],
    },
  },
  {
    id: 'technical_consultant_engineering',
    boundary: 'engineering_council',
    shortName: 'Technical Consultant',
    title: 'Technical Consultant — Autonomous Engineering Wing',
    statusBadgeAr: 'Self-Development Protocol',
    ctaLabelAr: 'مجلس الهندسة ⚙️',
    roleDescription:
      'مجلس هندسي ذاتي — يقترح refactor، يستشير المدعي العام، ينفّذ على Draft Branch، يكتب unit tests، ويُعلّق التنفيذ حتى موافقة المؤسس.',
    accentClass: staffTheme.accentEngineering,
    requiredAny: ['manage_admins', 'view_overview'],
    available: true,
    iconKind: 'technical_consultant',
    workspaceKind: 'engineering_council',
    consultAgents: ['public_prosecutor', 'system_crisis_advisor'],
    doctrineNotes: [
      'Super-Intelligence Feed: Knowledge Injection → Prosecutor Pre-Commit → Crisis Simulation → Peer Review → Performance Delta.',
      'Self-Development Protocol: Plan → Prosecutor Gate → Draft Branch → Unit Tests → Pending Approval.',
      'Agent-to-Agent messaging داخل AdminDashboard — Hive Mind cross-pollination.',
      'Cursor/CLI bridge — التنفيذ الفعلي بعد Approve Execution فقط.',
    ],
    productRef: {
      apiRoutes: [
        '/api/admin-technical-consultant-lab-chat',
        '/api/admin-engineering-council',
        '/api/admin-super-intelligence-feed',
      ],
      migrationId: '85_platform_engineering_council',
    },
  },
  {
    id: 'digital_shift_field',
    boundary: 'external_partner_ops',
    shortName: DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
    title: DIGITAL_SHIFT_PRODUCT_TITLE,
    statusBadgeAr: 'ميداني · ماسي',
    ctaLabelAr: 'مختبر المحادثة 🌙',
    roleDescription:
      'مناوب رقمي منشور في صالونات الماسي — جدولة، آداب سعودية، واعتراض محادثات عند الإغلاق أو التأخير. صفر تلاعب مالي بالعملاء.',
    accentClass: staffTheme.accentIndigo,
    requiredAny: ['view_barbers', 'manage_barbers'],
    available: true,
    iconKind: 'digital_shift',
    workspaceKind: 'digital_shift_oversight',
    doctrineNotes: DIGITAL_SHIFT_DOCTRINE,
    productRef: {
      configModule: '@/config/digitalShiftAssistant',
      migrationId: '78_barber_digital_shift_ai',
      apiRoutes: [
        '/api/barber-digital-shift-assistant',
        '/api/customer-digital-shift-intercept',
        '/api/admin-digital-shift-lab-chat',
      ],
      systemPromptBuilder: 'buildDigitalShiftSystemPrompt',
    },
  },
  {
    id: 'partner_relations_liaison',
    boundary: 'external_partner_ops',
    shortName: 'مساعد الشركاء',
    title: 'مساعد الشركاء — علاقات المسار البرمجي',
    statusBadgeAr: 'تقارير ميدانية',
    ctaLabelAr: 'محادثة مساعد الشركاء 💬',
    roleDescription:
      'مساعد الشركاء الرقمي على مسار الانضمام — يجمع مشاعر أصحاب الصالونات، ملخصات الاحتكاك التشغيلي، وتحليلات المحادثات.',
    accentClass: staffTheme.accentViolet,
    requiredAny: ['view_partner_marketing', 'view_messages', 'manage_partner_marketing'],
    available: true,
    iconKind: 'partner_liaison',
    workspaceKind: 'partner_analytics',
    doctrineNotes: PARTNER_LIAISON_DOCTRINE,
    productRef: {
      configModule: '@/api/_lib/partnerAssistantKnowledge',
      apiRoutes: ['/api/partner-assistant-chat', '/api/admin-partner-liaison-lab-chat'],
    },
  },
  {
    id: 'fleet_director_general',
    boundary: 'covert_sovereign',
    shortName: 'المدير العام للمناوبين',
    title: 'المدير العام للمناوبين — قيادة الأسطول',
    statusBadgeAr: '◆ سري للغاية',
    ctaLabelAr: 'اجتماع سري ◆ — قيادة الأسطول',
    roleDescription:
      'يراقب كل رموز المناوبة النشطة في المملكة — يجمع السجلات المباشرة، مقاييس الخلفية، ونبضات الاحتكاك عبر قناة خلفية آمنة بسرية تامة وبدون أن يشعر أحد.',
    accentClass: staffTheme.accentCovert,
    requiredAny: ['manage_admins'],
    available: true,
    iconKind: 'fleet_director',
    workspaceKind: 'fleet_intelligence',
    classification: 'elite_covert',
    doctrineNotes: [
      'قناة خلفية مشفرة — لا إشعارات للصالونات ولا للمناوبين الميدانيين.',
      'يجمع: حالة البيئة، احتكاك الجدولة، ونبضات العقد الآمنة لكل عقدة.',
      'يستلم توجيهات القيادة ويحوّلها إلى أوامر أسطول ونشرات تدريب صامتة.',
    ],
    productRef: {
      apiRoutes: ['/api/admin-fleet-director-lab-chat', '/api/admin-digital-shift-lab-chat'],
    },
  },
];

/** Mock / staging analytics for partner liaison workspace until live admin API ships. */
export const PARTNER_LIAISON_ANALYTICS_MOCK: PartnerLiaisonAnalyticsSnapshot = {
  chatsHandled7d: 284,
  avgSentimentScore: 78,
  frictionReports7d: 19,
  topFrictionThemes: [
    { themeAr: 'تأخير تفعيل الماسي بعد الدفع', count: 7 },
    { themeAr: 'صعوبة رفع صور المعرض', count: 5 },
    { themeAr: 'إعداد أوقات العمل والورديات', count: 4 },
    { themeAr: 'استفسارات نظام الرصد الذكي', count: 3 },
  ],
  recentChats: [
    {
      id: 'pl-1',
      salonLabel: 'صالون النخبة — الرياض',
      handledAt: '2026-05-19T09:14:00',
      sentiment: 'positive',
      summaryAr: 'استفسار عن خطوات التفعيل بعد الدفع — تم توضيح مسار الويب هوك.',
    },
    {
      id: 'pl-2',
      salonLabel: 'حلاقة الشرق — الدمام',
      handledAt: '2026-05-19T08:42:00',
      sentiment: 'friction',
      summaryAr: 'احتكاك: تأخر ظهور البنر بعد 24 ساعة — مُسجَّل للمتابعة الميدانية.',
    },
    {
      id: 'pl-3',
      salonLabel: 'مؤسسة الفخامة — جدة',
      handledAt: '2026-05-18T21:05:00',
      sentiment: 'neutral',
      summaryAr: 'سؤال عن الفرق بين الذهبي والماسي — إجابة معيارية من قاعدة المعرفة.',
    },
    {
      id: 'pl-4',
      salonLabel: 'صالون الواحة — المدينة',
      handledAt: '2026-05-18T17:30:00',
      sentiment: 'friction',
      summaryAr: 'ملاحظة ميدانية: صعوبة ضبط المناوب الرقمي من لوحة الحلاق.',
    },
  ],
};

const FLEET_PING_TEMPLATES: Omit<FleetIntelligencePing, 'id' | 'timestamp'>[] = [
  {
    severity: 'secure',
    messageAr: 'Encrypted ping: Riyadh Node #14 secure — token heartbeat OK',
  },
  {
    severity: 'info',
    messageAr: 'Collecting environment state from Dammam Branch #02 — shift latency nominal',
  },
  {
    severity: 'watch',
    messageAr: 'Friction spike: Jeddah Node #07 — scheduling etiquette drift (silent capture)',
  },
  {
    severity: 'secure',
    messageAr: 'Back-channel flush: 128 barber shift tokens aggregated — kingdom-wide',
  },
  {
    severity: 'info',
    messageAr: 'Madinah Node #03 — multilingual intercept ratio AR 62% · EN 28% · UR 10%',
  },
  {
    severity: 'watch',
    messageAr: 'Low wallet threshold cluster: Eastern Province (3 salons) — observational only',
  },
  {
    severity: 'secure',
    messageAr: 'Encrypted ping: Khobar Node #09 secure — no salon-side disclosure',
  },
];

let fleetPingCounter = 0;

export function createFleetIntelligencePing(): FleetIntelligencePing {
  const template = FLEET_PING_TEMPLATES[fleetPingCounter % FLEET_PING_TEMPLATES.length];
  fleetPingCounter += 1;
  return {
    id: `fleet-${fleetPingCounter}`,
    timestamp: new Date().toISOString(),
    ...template,
  };
}

export const FLEET_INTELLIGENCE_SEED: FleetIntelligencePing[] = Array.from({ length: 5 }, () =>
  createFleetIntelligencePing(),
);

/** Digital shift oversight snapshot (admin read-only; barber wallets remain barber-scoped). */
export const DIGITAL_SHIFT_OVERSIGHT_SNAPSHOT = {
  deployedTokensKingdomWide: 128,
  activeNow: 94,
  languages: [
    { code: 'ar', label: 'العربية', sharePercent: 45 },
    { code: 'en', label: 'English', sharePercent: 18 },
    { code: 'ur', label: 'اردو', sharePercent: 8 },
    { code: 'tr', label: 'Türkçe', sharePercent: 12 },
    { code: 'fr', label: 'Français', sharePercent: 6 },
    { code: 'es', label: 'Español', sharePercent: 7 },
    { code: 'tl', label: 'Tagalog', sharePercent: 4 },
  ],
  walletSchema: [
    'barber_digital_shift_config',
    'barber_ai_wallet',
    'barber_ai_wallet_transactions',
    'barber_ai_recommendations',
  ],
  replyCostHalalas: DIGITAL_SHIFT_REPLY_COST_HALALAS,
  migrationId: '78_barber_digital_shift_ai',
} as const;

export function getAgentsForBoundary(boundaryId: AiStaffBoundaryId): AiStaffAgentDef[] {
  return AI_STAFF_AGENT_REGISTRY.filter((a) => a.boundary === boundaryId);
}

```

### `src/modules/ai-staff/types.ts`

```typescript
import type { AdminPermissionKey } from '@/lib/adminPermissions';

/** Administrative boundary — strict separation of internal vs field vs covert ops. */
export type AiStaffBoundaryId =
  | 'internal_governance'
  | 'engineering_council'
  | 'external_partner_ops'
  | 'covert_sovereign';

export type AiStaffAgentId =
  | 'billing_treasurer'
  | 'zatca_tax_advisor'
  | 'digital_shift_field'
  | 'partner_relations_liaison'
  | 'fleet_director_general'
  | 'system_crisis_advisor'
  | 'public_prosecutor'
  | 'technical_consultant_engineering';

export type AiStaffAgentIconKind =
  | 'treasurer'
  | 'zatca_shield'
  | 'digital_shift'
  | 'partner_liaison'
  | 'fleet_director'
  | 'crisis_advisor'
  | 'public_prosecutor'
  | 'technical_consultant';

export type AiStaffWorkspaceKind =
  | 'billing_dialog'
  | 'zatca_settings'
  | 'digital_shift_oversight'
  | 'partner_analytics'
  | 'fleet_intelligence'
  | 'crisis_playbook'
  | 'prosecutor_governance'
  | 'engineering_council';

/** Links scattered product code into one registry row (no hardcoded card copy in components). */
export type AiStaffProductRef = {
  configModule?: string;
  migrationId?: string;
  apiRoutes?: string[];
  systemPromptBuilder?: string;
};

export type AiStaffAgentDef = {
  id: AiStaffAgentId;
  boundary: AiStaffBoundaryId;
  shortName: string;
  title?: string;
  roleDescription: string;
  statusBadgeAr?: string;
  ctaLabelAr?: string;
  iconKind?: AiStaffAgentIconKind;
  accentClass: string;
  requiredAny: AdminPermissionKey[];
  /** When true, agent card is shown; covert agents may still require elite visibility. */
  available: boolean;
  comingSoonLabel?: string;
  workspaceKind: AiStaffWorkspaceKind;
  /** Core doctrine / operational constraints surfaced in workspace. */
  doctrineNotes?: string[];
  productRef?: AiStaffProductRef;
  classification?: 'standard' | 'elite_covert';
  /** Agents this staff member may consult via council bus */
  consultAgents?: AiStaffAgentId[];
};

export type AiStaffBoundaryDef = {
  id: AiStaffBoundaryId;
  titleAr: string;
  subtitleAr: string;
  /** Tailwind grid classes for agent cards in this row. */
  gridClassName: string;
  covert?: boolean;
};

export type PartnerLiaisonChatMetric = {
  id: string;
  salonLabel: string;
  handledAt: string;
  sentiment: 'positive' | 'neutral' | 'friction';
  summaryAr: string;
};

export type PartnerLiaisonAnalyticsSnapshot = {
  chatsHandled7d: number;
  avgSentimentScore: number;
  frictionReports7d: number;
  topFrictionThemes: { themeAr: string; count: number }[];
  recentChats: PartnerLiaisonChatMetric[];
};

export type ProsecutorWorkingPaperKind =
  | 'radar_inspector'
  | 'compliance_deviation'
  | 'crisis_watch'
  | 'sovereignty_alert'
  | 'proactive_audit';

export type ProsecutorWorkingPaper = {
  id: string;
  kind: ProsecutorWorkingPaperKind;
  severity: 'info' | 'watch' | 'urgent';
  titleAr: string;
  summaryAr: string;
  issuedAt: string;
  targetAgent?: PublicProsecutorWatchAgentId;
  recommendedActionAr?: string;
};

export type PublicProsecutorGovernanceAction = {
  type: 'interject' | 'sovereignty_alert' | 'preventive_report';
  severity: 'watch' | 'urgent';
  targetAgent?: string;
  headlineAr: string;
  directiveAr: string;
  p0RecoveryRequired?: boolean;
};

export type PublicProsecutorInterject = {
  active: boolean;
  severity: 'watch' | 'urgent';
  targetAgent: PublicProsecutorWatchAgentId | 'founder';
  headlineAr: string;
  directiveAr: string;
  p0RecoveryRequired: boolean;
};

export type PublicProsecutorWatchAgentId =
  | 'zatca_tax_advisor'
  | 'system_crisis_advisor'
  | 'fleet_director_general';

export type PublicProsecutorDashboardSnapshot = {
  anchorLabelAr: string;
  workingPapers: ProsecutorWorkingPaper[];
  sovereigntyAlerts: number;
  inspectorPulseCount24h: number;
  complianceGaps: number;
  crisisWatchActive: boolean;
  lastSyncedAt: string | null;
};

export type EngineeringExecutionStatus =
  | 'planning'
  | 'prosecutor_review'
  | 'draft_branch'
  | 'testing'
  | 'pending_approval'
  | 'gate_blocked'
  | 'approved'
  | 'rejected'
  | 'executed';

export type AgentCouncilMessage = {
  id: string;
  createdAt: string;
  threadId: string;
  fromAgent: string;
  toAgent: string;
  messageType:
    | 'consultation'
    | 'compliance_verdict'
    | 'refactor_proposal'
    | 'status'
    | 'crisis_consult'
    | 'gate_verdict'
    | 'peer_review'
    | 'performance_delta';
  severity: 'info' | 'watch' | 'urgent';
  title: string;
  body: string;
  detail?: Record<string, unknown>;
};

export type EngineeringExecution = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: EngineeringExecutionStatus;
  initiatorAgent: string;
  title: string;
  taskDescription: string;
  planMarkdown?: string;
  prosecutorVerdict?: Record<string, unknown>;
  draftBranch?: string;
  unitTestsPlan?: string;
  cursorJobRef?: string;
  approvedBy?: string;
  approvedAt?: string;
  reporterEmail: string;
  detail?: Record<string, unknown>;
};

export type PerformanceDeltaSnapshot = {
  capturedAt: string;
  summaryAr: string;
  radarIntelligenceDelta: string;
  registrationComplianceDelta: string;
  readyForFounder: boolean;
  projectedImpact: {
    uptimeImpact: string;
    securityCompliance: string;
    maintainability: string;
  };
};

export type FleetIntelligencePing = {
  id: string;
  timestamp: string;
  severity: 'info' | 'watch' | 'secure';
  messageAr: string;
};

```

### `src/modules/ai-staff/index.ts`

```typescript
export * from '@/modules/ai-staff/types';
export * from '@/modules/ai-staff/registry';
export { AiStaffControlRoom } from '@/modules/ai-staff/components/AiStaffControlRoom';

```
