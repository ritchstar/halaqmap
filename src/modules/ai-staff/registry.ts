import {
  DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME,
  DIGITAL_SHIFT_PRODUCT_TITLE,
  DIGITAL_SHIFT_REPLY_COST_HALALAS,
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
    subtitleAr: 'خازن · خبير ZATCA — سجلات المنصة والامتثال الضريبي (زوج ثابت على سطح المكتب)',
    gridClassName: 'sm:grid-cols-2',
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
  'ردود متعددة اللغات: عربي · English · اردو حسب لغة آخر رسالة العميل.',
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
    ctaLabelAr: 'فتح المكتب المالي',
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
      apiRoutes: ['/api/admin-zatca-tax-advisor'],
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
    ctaLabelAr: 'فتح لوحة التقارير',
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
      apiRoutes: ['/api/partner-assistant-chat'],
    },
  },
  {
    id: 'fleet_director_general',
    boundary: 'covert_sovereign',
    shortName: 'المدير العام للمناوبين',
    title: 'المدير العام للمناوبين — قيادة الأسطول',
    statusBadgeAr: '◆ سري للغاية',
    ctaLabelAr: 'فتح مقصورة الاستخبارات',
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
    ],
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
    { code: 'ar', label: 'العربية', sharePercent: 62 },
    { code: 'en', label: 'English', sharePercent: 28 },
    { code: 'ur', label: 'اردو', sharePercent: 10 },
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
