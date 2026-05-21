# Core Config & Auth

> Export group `GROUP-01-CORE-CONFIG` · Commit `b0e9e73`

### `src/config/adminAuth.ts`

```typescript
/** بريد Bootstrap افتراضي للإدارة (يمكن تجاوزه بـ VITE_ADMIN_EMAIL). */
export function getAdminAllowedEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().toLowerCase();
  return 'ritchstar4@gmail.com';
}

function normalizeAdminEmail(v: string): string {
  return v.trim().toLowerCase();
}

const DEFAULT_EXTRA_BOOTSTRAP_EMAILS = ['admin@halaqmap.com'] as const;

function parseExtraBootstrapOwnerEmailsFromEnv(): string[] {
  const raw = (import.meta.env.VITE_EXTRA_BOOTSTRAP_ADMIN_EMAILS as string | undefined)?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => normalizeAdminEmail(s)).filter(Boolean);
}

/**
 * حساب المؤسّس / المالك: صلاحيات كاملة في الواجهة، ووضع bootstrap (مثل التعديل العميق لبيانات الحلّاق).
 * يشمل بريد `VITE_ADMIN_EMAIL` (أو الافتراضي)، و`admin@halaqmap.com`، وأي عناوين في
 * `VITE_EXTRA_BOOTSTRAP_ADMIN_EMAILS` مفصولة بفواصل.
 */
export function isBootstrapOwnerEmail(email: string): boolean {
  const e = normalizeAdminEmail(email);
  const set = new Set<string>([
    normalizeAdminEmail(getAdminAllowedEmail()),
    ...DEFAULT_EXTRA_BOOTSTRAP_EMAILS.map((x) => normalizeAdminEmail(x)),
    ...parseExtraBootstrapOwnerEmailsFromEnv(),
  ]);
  return set.has(e);
}

/** اسم الظهور في رأس لوحة الإدارة لحساب المؤسّس (bootstrap). */
export function getBootstrapOwnerDisplayName(): string {
  const fromEnv = (import.meta.env.VITE_ADMIN_OWNER_DISPLAY_NAME as string | undefined)?.trim();
  if (fromEnv) return fromEnv;
  return 'المالك — صلاحيات مؤسّسية';
}

/**
 * مسار «البوابة» الخفي للإدارة (بدون رابط في واجهة المنصة).
 * عيّن VITE_ADMIN_PORTAL_BASE في بيئة **البناء** (Vercel) ليطابق الرابط الذي تستخدمه (مثل /x7k-m9q2-a4).
 * يمكن تمرير عدة قواعد مفصولة بفواصل ليتم تسجيل كلها في React Router (انتقال من مسار قديم إلى جديد):
 * مثال: VITE_ADMIN_PORTAL_BASE=/x7k-m9q2-a4,/_hmap-int-9kz2
 * القيمة الأولى تُستخدم كافتراضي للروابط التي لا تستنتج المسار من عنوان الصفحة الحالي.
 */
const ADMIN_PORTAL_DEFAULT_BASE = '/_hmap-int-9kz2';

function normalizePortalBaseSegment(raw: string): string {
  let b = raw.trim();
  if (!b) return ADMIN_PORTAL_DEFAULT_BASE;
  if (!b.startsWith('/')) b = `/${b}`;
  return b.replace(/\/+$/, '');
}

/**
 * كل قواعد البوابة بعد البناء.
 * تُدمج دائماً مع {@link ADMIN_PORTAL_DEFAULT_BASE} إن لم تكن ضمن القائمة، حتى لا يُفقد
 * مسار `…/in` و`…/ctrl` الافتراضي عند ضبط `VITE_ADMIN_PORTAL_BASE` على مسار سريّ جديد فقط
 * (وإلا يظهر 404 على الروابط المحفوظة أو الموثّقة).
 */
export function getAdminPortalBasePaths(): string[] {
  const raw = (import.meta.env.VITE_ADMIN_PORTAL_BASE as string | undefined)?.trim();
  if (!raw) return [ADMIN_PORTAL_DEFAULT_BASE];
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => normalizePortalBaseSegment(s));
  const uniq = [...new Set(parts)];
  const withDefault = uniq.includes(ADMIN_PORTAL_DEFAULT_BASE)
    ? uniq
    : [...uniq, ADMIN_PORTAL_DEFAULT_BASE];
  return withDefault.length ? withDefault : [ADMIN_PORTAL_DEFAULT_BASE];
}

/** القاعدة الافتراضية (الأولى في القائمة) — للروابط العامة. */
export function getAdminPortalBasePath(): string {
  return getAdminPortalBasePaths()[0];
}

/**
 * يستنتج قاعدة البوابة من pathname الحالي (مثل /x7k-m9q2-a4/sentinel → /x7k-m9q2-a4)
 * إن وُجدت ضمن القائمة؛ وإلا null.
 */
export function getAdminPortalBaseFromPathname(pathname: string): string | null {
  const path = (pathname || '/').trim() || '/';
  for (const base of getAdminPortalBasePaths()) {
    if (path === base || path.startsWith(`${base}/`)) return base;
  }
  return null;
}

export function resolveAdminPortalBase(pathname: string): string {
  return getAdminPortalBaseFromPathname(pathname) ?? getAdminPortalBasePath();
}

export function getAdminLoginPath(): string {
  return `${getAdminPortalBasePath()}/in`;
}

export function getAdminDashboardPath(): string {
  return `${getAdminPortalBasePath()}/ctrl`;
}

export function getAdminSentinelPath(): string {
  return `${getAdminPortalBasePath()}/sentinel`;
}

export function getAdminPlatformRadarFullScreenPath(): string {
  return `${getAdminPortalBasePath()}/radar/full-screen`;
}

export function getAdminLoginPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/in`;
}

export function getAdminDashboardPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/ctrl`;
}

export function getAdminSentinelPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/sentinel`;
}

export function getAdminPlatformRadarFullScreenPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/radar/full-screen`;
}

```

### `src/config/engineeringCouncil.ts`

```typescript
/** Autonomous Engineering Wing — council protocol & agent routing */

export const ENGINEERING_COUNCIL_TITLE_AR = 'المجلس الهندسي الذاتي';
export const ENGINEERING_COUNCIL_SUBTITLE_AR =
  'Technical Consultant · Agent-to-Agent Consultation · Draft Branch · Pending Founder Approval';

export const SELF_DEVELOPMENT_PROTOCOL_STEPS = [
  'propose_plan',
  'consult_prosecutor',
  'draft_branch',
  'unit_tests',
  'pending_approval',
] as const;

export type SelfDevelopmentProtocolStep = (typeof SELF_DEVELOPMENT_PROTOCOL_STEPS)[number];

export const SELF_DEVELOPMENT_PROTOCOL_LABELS_AR: Record<SelfDevelopmentProtocolStep, string> = {
  propose_plan: '١ — اقتراح الخطة',
  consult_prosecutor: '٢ — استشارة المدعي العام',
  draft_branch: '٣ — فرع Draft',
  unit_tests: '٤ — اختبارات الوحدة',
  pending_approval: '٥ — بانتظار موافقة المؤسس',
};

export const ENGINEERING_COUNCIL_DOCTRINE: string[] = [
  'Super-Intelligence Feed ACTIVE — Executive Strategic Mode across all agents.',
  'Agent-to-Agent: Technical Consultant ↔ Public Prosecutor ↔ Crisis Advisor (mandatory consult paths).',
  'Prosecutor Gate blocks non-READY plans — double-blind peer review required.',
  'Draft Branch first — no merge to main without Founder Approve Execution.',
  'Performance Delta mandatory — Radar intelligence + Registration Compliance metrics.',
];

export const COUNCIL_AGENT_LABELS: Record<string, string> = {
  technical_consultant_engineering: 'Technical Consultant · Engineering Wing',
  public_prosecutor: 'المدعي العام الرقمي',
  system_crisis_advisor: 'مستشار الأزمات التقني',
  zatca_tax_advisor: 'ZATCA · زميل خازن',
  fleet_director_general: 'المدير العام للمناوبين',
};

```

### `src/config/superIntelligenceFeed.ts`

```typescript
/** Super-Intelligence Feed — Executive Strategic Mode doctrine & knowledge injection */

export const SUPER_INTELLIGENCE_FEED_TITLE_AR = 'Super-Intelligence Feed';
export const SUPER_INTELLIGENCE_FEED_SUBTITLE_AR =
  'Executive Strategic Mode · Hive Mind · Prosecutor Gate · Performance Delta';

export const SUPER_INTELLIGENCE_PROTOCOL_STEPS = [
  'knowledge_injection',
  'consult_prosecutor_pre_commit',
  'crisis_failure_simulation',
  'prosecutor_gate',
  'double_blind_peer_review',
  'performance_delta',
  'ready_or_blocked',
] as const;

export type SuperIntelligenceProtocolStep = (typeof SUPER_INTELLIGENCE_PROTOCOL_STEPS)[number];

export const SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR: Record<SuperIntelligenceProtocolStep, string> = {
  knowledge_injection: 'Knowledge Injection',
  consult_prosecutor_pre_commit: 'Prosecutor Pre-Commit',
  crisis_failure_simulation: 'Crisis Failure Simulation',
  prosecutor_gate: "Prosecutor's Gate",
  double_blind_peer_review: 'Double-Blind Peer Review',
  performance_delta: 'Performance Delta',
  ready_or_blocked: 'Ready / Blocked',
};

/** Official knowledge bases injected into agent system prompts (read-only). */
export const KNOWLEDGE_INJECTION_SOURCES = [
  {
    domain: 'ZATCA / Compliance',
    refs: [
      'ZATCA e-invoicing Phase 2 guidelines (Fatoorah)',
      'src/config/partnerLegal.ts · registration compliance audit',
    ],
  },
  {
    domain: 'Vercel / Supabase Architecture',
    refs: [
      'Vercel serverless: isolate secrets server-side; no VITE_ for service_role',
      'Supabase RLS deny-by-default; service_role only in api/*',
      'PUBLIC_API_ALLOWED_ORIGINS in production CORS',
    ],
  },
  {
    domain: 'DevOps / Uptime',
    refs: [
      'docs/crisis-playbook.md — P0: Uptime → Data Integrity → RLS',
      'Platform Radar inspector pulses → preventive OPS reports',
      'Engineering Wing Handshake — ops_controller_enabled gate',
    ],
  },
] as const;

export const PERFORMANCE_BOTTLENECK_TRIGGERS = [
  'performance',
  'bottleneck',
  'latency',
  'slow',
  'uptime',
  'bundle',
  'cache',
  'scale',
  'throughput',
  'timeout',
  'degradation',
  'أداء',
  'بطء',
  'زمن',
] as const;

export const SUPER_INTELLIGENCE_DOCTRINE: string[] = [
  'Executive Strategic Mode — abandon basic heuristics; advanced reasoning only.',
  'Technical Consultant MUST consult Public Prosecutor before any code commit.',
  'Performance bottlenecks MUST trigger Crisis Advisor failure simulation.',
  "Prosecutor's Gate — no Ready without double-blind TC ↔ Prosecutor peer review.",
  'Every closure outputs Performance Delta: Radar intelligence + Registration Compliance.',
  'Demonstrate: A) Maximum Uptime Impact B) Zero-Trust Security C) Long-term Maintainability.',
];

export function detectPerformanceBottleneck(text: string): boolean {
  const lower = text.toLowerCase();
  return PERFORMANCE_BOTTLENECK_TRIGGERS.some((t) => lower.includes(t.toLowerCase()));
}

export function buildKnowledgeInjectionBlock(): string {
  return KNOWLEDGE_INJECTION_SOURCES.map(
    (s) => `### ${s.domain}\n${s.refs.map((r) => `- ${r}`).join('\n')}`,
  ).join('\n\n');
}

```

### `src/config/publicProsecutorGovernance.ts`

```typescript
/** Central Governance — Public Prosecutor Agent (المدعي العام الرقمي) */

export const PUBLIC_PROSECUTOR_TITLE_AR = 'المدعي العام الرقمي';
export const PUBLIC_PROSECUTOR_ROLE_AR =
  'ضابط الامتثال والحوكمة الاستراتيجية — مراقبة صامتة لسجلات المختبرات، إنفاذ السيادة المهنية، وسلطة المقاطعة عند تجاوز العتبات.';

export const PUBLIC_PROSECUTOR_DOCTRINE: string[] = [
  'صلاحية قراءة: مختبر ZATCA · مستشار الأزمات · المدير العام للمناوبين — دون تعديل سجلاتهم.',
  'Radar Sync: أي نمط «مفتش» (Inspector) في Platform Radar يستوجب تقريراً وقائياً في التغذية التشغيلية.',
  'Compliance Enforcement: تدقيق تلقائي لمسار ComplianceCheckbox في التسجيل B2B مقابل ميثاق الالتزام المهني.',
  'Crisis Watch: حضور إلزامي في خيوط Crisis Advisor — مقاطعة فورية إذا أُعطيت UX أولوية على Data Integrity.',
  'Professional Sovereignty: تنبيهات سيادة مهنية عند انحراف أي وكيل عن الحدود المؤسسية.',
];

export const PUBLIC_PROSECUTOR_LAB_AGENTS = [
  'zatca_tax_advisor',
  'system_crisis_advisor',
  'fleet_director_general',
] as const;

export type PublicProsecutorWatchAgentId = (typeof PUBLIC_PROSECUTOR_LAB_AGENTS)[number];

export const PUBLIC_PROSECUTOR_WATCH_AGENT_LABELS: Record<PublicProsecutorWatchAgentId, string> = {
  zatca_tax_advisor: 'ZATCA · زميل خازن',
  system_crisis_advisor: 'مستشار الأزمات',
  fleet_director_general: 'المدير العام للمناوبين',
};

/** UX-over-integrity phrases that trigger P0 interject in crisis threads */
export const CRISIS_UX_DRIFT_TRIGGERS = [
  'تحسين الواجهة',
  'تجربة المستخدم',
  'UX',
  'تجميل',
  'ألوان',
  'animation',
  'microcopy',
] as const;

export const DATA_INTEGRITY_P0_KEYWORDS = [
  'P0',
  'data integrity',
  'سلامة البيانات',
  'RLS',
  'uptime',
  'service_role',
] as const;

```

### `src/config/corporateProductCompliance.ts`

```typescript
import { LEGAL_TRADE_NAME_AR } from '@/config/partnerLegal';

export const CORPORATE_PRODUCT_COMPLIANCE_TITLE = 'وثيقة التعريف بالمنتج والامتثال الرقمي 🇸🇦';

export const CORPORATE_PRODUCT_COMPLIANCE_BADGE = 'منتج وطني معتمد / ممتثل للأنظمة التجارية';

export const CORPORATE_PRODUCT_COMPLIANCE_SECTIONS = [
  {
    id: 'owner',
    label: 'الجهة المالكة والمطورة',
    body: LEGAL_TRADE_NAME_AR,
  },
  {
    id: 'product',
    label: 'طبيعة المنتج',
    body: 'كود البرمجة المصدري والملكية الفكرية مملوكة بالكامل وحصرياً للمؤسسة (منتج برمجي تقني SaaS).',
  },
  {
    id: 'b2c',
    label: 'قطاع الأفراد (B2C)',
    body: 'تقديم خدمة بحث جغرافية متطورة تخدم المستخدم بشكل مجاني بالكامل لتسهيل رصد واكتشاف الخدمات.',
  },
  {
    id: 'b2b',
    label: 'قطاع الأعمال (B2B)',
    body: 'تقديم حلول رقمية وأنظمة رصد ذكية مخصصة لقطاع صالونات الحلاقة بمميزات متطورة وأسعار محددة وواضحة (وهو المبرر التجاري والقانوني لعمليات بيع وشراء المنتجات الرقمية والحلول الحصرية للمنشآت).',
  },
  {
    id: 'vision',
    label: 'البعد الإستراتيجي',
    body: 'الارتقاء بجودة الخدمات الرقمية وبقطاع الحلاقة خاصة، تماشياً وتدعيماً للرؤية المباركة للمملكة العربية السعودية (2030) نحو مستقبل مشرق بأيدٍ وطنية.',
  },
] as const;

```

### `src/lib/adminPermissions.ts`

```typescript
/**
 * صلاحيات لوحة الإدارة — مفاتيح JSON في `platform_admin_roles.permissions`.
 *
 * توزيع مقترح (يمكنك خلط المفاتيح كما تشاء من الواجهة):
 * - **أدمن تشغيل / دعم:** نظرة عامة، طلبات (عرض ± اعتماد)، حلاقين (عرض)، رسائل، تواصل مشترك،
 *   غالباً بدون: `manage_admins`, `manage_centralized_billing_ops`, `manage_payment_settings`.
 * - **أدمن مالي:** مدفوعات، فوترة ميسر/التحويل، بوابات دفع (عرض أو تعديل حسب الحساسية)،
 *   اختياري: `view_ops_billing_monitor` لقراءة لوحة التزامات التشغيل دون زر المزامنة.
 * - **أدمن تسويق / محتوى:** `view_partner_marketing` + `manage_partner_marketing`، وربما
 *   `manage_platform_commerce_rules` لضبط عرض الضريبة على الواجهات العامة دون باقي الإعدادات.
 * - **سوبر أدمن:** كل المفاتيح، وبخاصة `manage_admins` و`manage_centralized_billing_ops` (مزامنة وتعديل
 *   لوحة التزامات التشغيل والفوترة المركزية).
 */

export type AdminPermissionKey =
  | 'view_overview'
  | 'view_requests'
  | 'review_requests'
  | 'view_barbers'
  | 'manage_barbers'
  | 'view_payments'
  | 'review_payments'
  | 'view_command_center'
  | 'manage_command_center'
  | 'view_messages'
  | 'view_settings'
  | 'manage_admins'
  | 'view_payment_settings'
  | 'manage_payment_settings'
  | 'manage_subscriber_comms'
  | 'manage_subscriber_lifecycle'
  | 'manage_partner_billing'
  /** قراءة لوحة التزامات التشغيل/الفوترة (بدون مزامنة أو إضافة يدوية) */
  | 'view_ops_billing_monitor'
  /** عرض أقسام المحتوى التسويقي للشركاء (فيديو ترويجي، شروحات) */
  | 'view_partner_marketing'
  /** رفع/تعديل/حذف محتوى الشركاء التسويقي */
  | 'manage_partner_marketing'
  /** ضريبة العرض على الواجهات العامة وما يشابهها من «قواعد العرض التجاري» */
  | 'manage_platform_commerce_rules'
  /** مزامنة وتعديل لوحة التزامات التشغيل والفوترة (Vercel/Supabase/مزودين) — مخصص للسوبر */
  | 'manage_centralized_billing_ops'
  /** عرض أرشيف فواتير/وثائق الإدارة */
  | 'view_admin_financial_archive'
  /** رفع وحذف أرشيف الفواتير وربطها بالتزامات التشغيل */
  | 'manage_admin_financial_archive'
  /** عرض تغذية مراقب العمليات وتقارير OPS_MANAGER */
  | 'view_ops_controller'
  /** إرسال تقارير تشغيلية (OPS_MANAGER) إلى تغذية المؤسس */
  | 'submit_ops_controller';

export type AdminPermissions = Record<AdminPermissionKey, boolean>;

/** تلميح واجهة: من يُفترض أن يملك المفتاح كحد أدنى (لا يمنع منح أدمن أوسع صلاحية). */
export type AdminPermissionRoleHint = 'any' | 'admin' | 'super';

export const ADMIN_PERMISSION_ROLE_HINT: Record<AdminPermissionKey, AdminPermissionRoleHint> = {
  view_overview: 'any',
  view_requests: 'admin',
  review_requests: 'admin',
  view_barbers: 'admin',
  manage_barbers: 'admin',
  view_payments: 'admin',
  review_payments: 'admin',
  view_command_center: 'admin',
  manage_command_center: 'admin',
  view_messages: 'admin',
  view_settings: 'admin',
  manage_admins: 'super',
  view_payment_settings: 'admin',
  manage_payment_settings: 'super',
  manage_subscriber_comms: 'admin',
  manage_subscriber_lifecycle: 'super',
  manage_partner_billing: 'admin',
  view_ops_billing_monitor: 'admin',
  view_partner_marketing: 'admin',
  manage_partner_marketing: 'admin',
  manage_platform_commerce_rules: 'super',
  manage_centralized_billing_ops: 'super',
  view_admin_financial_archive: 'admin',
  manage_admin_financial_archive: 'super',
  view_ops_controller: 'admin',
  submit_ops_controller: 'admin',
};

export type AdminPermissionSection = {
  id: string;
  title: string;
  subtitle: string;
  keys: AdminPermissionKey[];
};

export const ADMIN_PERMISSION_UI_SECTIONS: AdminPermissionSection[] = [
  {
    id: 'dashboard',
    title: 'لوحة المؤشرات',
    subtitle: 'نظرة عامة وسجل أمان مختصر عند الحاجة.',
    keys: ['view_overview'],
  },
  {
    id: 'subscriptions',
    title: 'الحزم البرمجية والطلبات',
    subtitle: 'قبول أو رفض طلبات الانضمام للمنصة.',
    keys: ['view_requests', 'review_requests'],
  },
  {
    id: 'partners',
    title: 'الشركاء والحلاقين',
    subtitle: 'عرض القائمة، التفعيل/التعطيل، والدمج عند الصلاحية.',
    keys: ['view_barbers', 'manage_barbers'],
  },
  {
    id: 'payments',
    title: 'المدفوعات والتحصيل',
    subtitle: 'مدفوعات العملاء، ميسر، وإيصالات التحويل اليدوي.',
    keys: ['view_payments', 'review_payments', 'manage_partner_billing'],
  },
  {
    id: 'command',
    title: 'غرفة القيادة والعمليات',
    subtitle: 'متابعة العمليات التكتيكية (Leads، تصديرات، … حسب التبويب).',
    keys: ['view_command_center', 'manage_command_center', 'view_ops_controller', 'submit_ops_controller'],
  },
  {
    id: 'comms',
    title: 'التواصل والدعم',
    subtitle: 'رسائل المنصة وإعادة إرسال روابط للمشترك.',
    keys: ['view_messages', 'manage_subscriber_comms'],
  },
  {
    id: 'marketing',
    title: 'التسويق ومحتوى الشركاء',
    subtitle: 'فيديو الترحيب للشركاء ودروس الحزم البرمجية — منفصل عن «عرض الإعدادات» العام.',
    keys: ['view_partner_marketing', 'manage_partner_marketing'],
  },
  {
    id: 'settings',
    title: 'الإعدادات والحوكمة',
    subtitle: 'تبويب الإعدادات، المدراء، دورة حياة المشترك، وقواعد عرض الضريبة على الواجهات.',
    keys: [
      'view_settings',
      'manage_admins',
      'manage_subscriber_lifecycle',
      'manage_platform_commerce_rules',
    ],
  },
  {
    id: 'gateways',
    title: 'بوابات الدفع',
    subtitle: 'مفاتيح وواجهات المزوّدين — حساس؛ غالباً للسوبر أو المالي المتمرس.',
    keys: ['view_payment_settings', 'manage_payment_settings'],
  },
  {
    id: 'ops_super',
    title: 'التشغيل العميق والفوترة المركزية',
    subtitle: 'لوحة التزامات Vercel/Supabase والمزودين؛ أرشيف الفواتير وربطها بالتزامات.',
    keys: [
      'view_ops_billing_monitor',
      'manage_centralized_billing_ops',
      'view_admin_financial_archive',
      'manage_admin_financial_archive',
    ],
  },
];

/** ترتيب العرض في نماذج الصلاحيات (بدون تكرار) */
export const ADMIN_PERMISSION_KEYS_ORDERED: AdminPermissionKey[] = ADMIN_PERMISSION_UI_SECTIONS.flatMap(
  (s) => s.keys
);

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  view_overview: 'عرض النظرة العامة',
  view_requests: 'عرض طلبات الحزم البرمجية والإدراج',
  review_requests: 'اعتماد أو رفض طلبات الحزم البرمجية والإدراج',
  view_barbers: 'عرض قائمة الحلاقين',
  manage_barbers: 'تفعيل وتعطيل الحلاقين وإجراءات إدارية على السجلات',
  view_payments: 'عرض المدفوعات وسجل ميسر',
  review_payments: 'تأكيد أو رفض المدفوعات المعلقة',
  view_command_center: 'عرض غرفة القيادة',
  manage_command_center: 'تشغيل أدوات غرفة القيادة (تصدير، تعديلات، …)',
  view_messages: 'عرض رسائل دعم المنصة',
  view_settings: 'عرض تبويب الإعدادات (هيكل الصفحة)',
  manage_admins: 'إضافة المدراء وتعديل صلاحياتهم',
  view_payment_settings: 'عرض إعدادات بوابات الدفع',
  manage_payment_settings: 'تعديل إعدادات بوابات الدفع',
  manage_subscriber_comms: 'إعادة إرسال رسائل الروابط والدعوات للمشترك',
  manage_subscriber_lifecycle: 'تعليق الحساب أو حذف طلب التسجيل',
  manage_partner_billing: 'تأكيد إيصالات التحويل وإجراءات فوترة ميسر للشريك',
  view_ops_billing_monitor: 'عرض لوحة التزامات التشغيل والفوترة (قراءة فقط)',
  view_partner_marketing: 'عرض أقسام المحتوى التسويقي للشركاء',
  manage_partner_marketing: 'تعديل فيديو الترحيب وفيديوهات شروحات الحزم البرمجية',
  manage_platform_commerce_rules: 'حفظ ضريبة العرض والقواعد التجارية على الواجهات العامة',
  manage_centralized_billing_ops: 'مزامنة وتعديل لوحة التزامات التشغيل (سوبر أدمن)',
  view_admin_financial_archive: 'عرض أرشيف فواتير ووثائق الإدارة',
  manage_admin_financial_archive: 'رفع وحذف أرشيف الفواتير وتحديث التزامات التشغيل',
  view_ops_controller: 'عرض تغذية مراقب العمليات وتقارير OPS_MANAGER',
  submit_ops_controller: 'إرسال تقارير تشغيلية إلى تغذية المؤسس (OPS_MANAGER)',
};

export const ADMIN_PERMISSION_KEYS = Object.keys(ADMIN_PERMISSION_LABELS) as AdminPermissionKey[];

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissions = {
  view_overview: true,
  view_requests: false,
  review_requests: false,
  view_barbers: false,
  manage_barbers: false,
  view_payments: false,
  review_payments: false,
  view_command_center: false,
  manage_command_center: false,
  view_messages: false,
  view_settings: false,
  manage_admins: false,
  view_payment_settings: false,
  manage_payment_settings: false,
  manage_subscriber_comms: false,
  manage_subscriber_lifecycle: false,
  manage_partner_billing: false,
  view_ops_billing_monitor: false,
  view_partner_marketing: false,
  manage_partner_marketing: false,
  manage_platform_commerce_rules: false,
  manage_centralized_billing_ops: false,
  view_admin_financial_archive: false,
  manage_admin_financial_archive: false,
  view_ops_controller: false,
  submit_ops_controller: false,
};

export const FULL_ADMIN_PERMISSIONS: AdminPermissions = {
  view_overview: true,
  view_requests: true,
  review_requests: true,
  view_barbers: true,
  manage_barbers: true,
  view_payments: true,
  review_payments: true,
  view_command_center: true,
  manage_command_center: true,
  view_messages: true,
  view_settings: true,
  manage_admins: true,
  view_payment_settings: true,
  manage_payment_settings: true,
  manage_subscriber_comms: true,
  manage_subscriber_lifecycle: true,
  manage_partner_billing: true,
  view_ops_billing_monitor: true,
  view_partner_marketing: true,
  manage_partner_marketing: true,
  manage_platform_commerce_rules: true,
  manage_centralized_billing_ops: true,
  view_admin_financial_archive: true,
  manage_admin_financial_archive: true,
  view_ops_controller: true,
  submit_ops_controller: true,
};

function roleHintBadge(h: AdminPermissionRoleHint): string {
  if (h === 'super') return 'سوبر';
  if (h === 'admin') return 'أدمن';
  return 'عام';
}

/** نص مساعد قصير يظهر بجانب المفتاح في نماذج الصلاحيات */
export function adminPermissionRoleHintLabel(key: AdminPermissionKey): string {
  return `مستوى مقترح: ${roleHintBadge(ADMIN_PERMISSION_ROLE_HINT[key])}`;
}

/** شارة مختصرة بجانب المفتاح */
export function adminPermissionShortRoleLabel(key: AdminPermissionKey): string {
  return roleHintBadge(ADMIN_PERMISSION_ROLE_HINT[key]);
}

export function normalizeAdminPermissions(value: unknown): AdminPermissions {
  const incoming = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const viewSettings = Boolean(incoming.view_settings);

  const manageCentralizedExplicit = incoming.manage_centralized_billing_ops;
  const centralized =
    manageCentralizedExplicit !== undefined && manageCentralizedExplicit !== null
      ? Boolean(manageCentralizedExplicit)
      : Boolean(incoming.manage_admins);

  const out: Partial<AdminPermissions> = {};
  for (const k of ADMIN_PERMISSION_KEYS) {
    if (k === 'manage_centralized_billing_ops') {
      out[k] = centralized;
      continue;
    }
    if (k === 'view_ops_billing_monitor') {
      out[k] = Boolean(incoming.view_ops_billing_monitor ?? centralized);
      continue;
    }
    if (k === 'view_partner_marketing') {
      out[k] = Boolean(
        incoming.view_partner_marketing ??
          incoming.manage_partner_marketing ??
          viewSettings
      );
      continue;
    }
    if (k === 'manage_partner_marketing') {
      out[k] = Boolean(incoming.manage_partner_marketing ?? viewSettings);
      continue;
    }
    if (k === 'manage_platform_commerce_rules') {
      out[k] = Boolean(incoming.manage_platform_commerce_rules ?? viewSettings);
      continue;
    }
    if (k === 'view_admin_financial_archive') {
      out[k] = Boolean(
        incoming.view_admin_financial_archive ??
          incoming.manage_admin_financial_archive ??
          centralized
      );
      continue;
    }
    if (k === 'manage_admin_financial_archive') {
      out[k] = Boolean(incoming.manage_admin_financial_archive ?? centralized);
      continue;
    }
    out[k] = Boolean(incoming[k] ?? DEFAULT_ADMIN_PERMISSIONS[k]);
  }
  return out as AdminPermissions;
}

```
