import type { AdminPermissionKey } from '@/lib/adminPermissions';

export type AiStaffAgentId =
  | 'billing_treasurer'
  | 'zatca_tax_advisor'
  | 'marketing_growth'
  | 'support_concierge';

export type AiStaffAgentIconKind = 'treasurer' | 'zatca_shield';

export type AiStaffAgentDef = {
  id: AiStaffAgentId;
  shortName: string;
  /** Card headline (defaults to shortName) */
  title?: string;
  roleDescription: string;
  statusBadgeAr?: string;
  ctaLabelAr?: string;
  iconKind?: AiStaffAgentIconKind;
  /** Tailwind gradient / border accent classes for the card shell */
  accentClass: string;
  /** Required permission (any-of) to activate this agent */
  requiredAny: AdminPermissionKey[];
  available: boolean;
  comingSoonLabel?: string;
};

/** Registry of virtual AI staff — extend with new agents as they ship. */
export const ADMIN_AI_STAFF_AGENTS: AiStaffAgentDef[] = [
  {
    id: 'billing_treasurer',
    shortName: 'خازن 🪙',
    roleDescription:
      'أتمتة الفوترة الذكية، قراءة فواتير البنية التحتية، وتحديث جدول الالتزامات فورياً عبر لقطات الشاشة.',
    accentClass: 'from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border-emerald-500/35',
    requiredAny: ['view_ops_billing_monitor', 'manage_centralized_billing_ops'],
    available: true,
    iconKind: 'treasurer',
  },
  {
    id: 'zatca_tax_advisor',
    shortName: 'زميل خازن · ZATCA',
    title: 'خبير زكاة وضريبة (ZATCA) 🛡️',
    statusBadgeAr: 'نشط بالرادار',
    ctaLabelAr: 'فتح المكتب المالي',
    roleDescription:
      'فرز فواتير الصالونات بالهللة، تحليل سرعة التدفق المالي، والتنبؤ الاستباقي بحدود الامتثال الضريبي مع تجهيز مسودات الإقرارات.',
    accentClass: 'from-amber-500/20 via-yellow-500/10 to-cyan-500/8 border-amber-400/45 shadow-[0_0_28px_-8px_rgba(251,191,36,0.35)]',
    requiredAny: [
      'manage_platform_commerce_rules',
      'view_ops_billing_monitor',
      'manage_centralized_billing_ops',
    ],
    available: true,
    iconKind: 'zatca_shield',
  },
  {
    id: 'marketing_growth',
    shortName: 'مساعد التسويق',
    roleDescription: 'حملات الشركاء، نسخ البنرات، وتحليل أداء العروض — قريباً.',
    accentClass: 'from-violet-500/10 to-fuchsia-500/5 border-dashed border-muted-foreground/25',
    requiredAny: ['view_partner_marketing'],
    available: false,
    comingSoonLabel: 'قريباً',
  },
  {
    id: 'support_concierge',
    shortName: 'مساعد الدعم',
    roleDescription: 'تصعيد تذاكر الشركاء وملخص المحادثات — قريباً.',
    accentClass: 'from-sky-500/10 to-blue-500/5 border-dashed border-muted-foreground/25',
    requiredAny: ['view_messages'],
    available: false,
    comingSoonLabel: 'قريباً',
  },
];

export const AI_STAFF_OFFICE_TITLE = 'مكتب الشركاء الأذكياء 🤖';
export const AI_STAFF_OFFICE_SUBTITLE =
  'موظفون افتراضيون متخصصون — افتح مكتبهم من الواجهة الأولى ووزّع المهام side-by-side مع نمو الفريق الذكي.';
