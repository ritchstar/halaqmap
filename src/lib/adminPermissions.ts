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
  | 'manage_admin_financial_archive';

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
    title: 'التراخيص والطلبات',
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
    keys: ['view_command_center', 'manage_command_center'],
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
    subtitle: 'فيديو الترحيب للشركاء ودروس التراخيص — منفصل عن «عرض الإعدادات» العام.',
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
  view_requests: 'عرض طلبات التراخيص والإدراج',
  review_requests: 'اعتماد أو رفض طلبات التراخيص والإدراج',
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
  manage_partner_marketing: 'تعديل فيديو الترحيب وفيديوهات شروحات التراخيص',
  manage_platform_commerce_rules: 'حفظ ضريبة العرض والقواعد التجارية على الواجهات العامة',
  manage_centralized_billing_ops: 'مزامنة وتعديل لوحة التزامات التشغيل (سوبر أدمن)',
  view_admin_financial_archive: 'عرض أرشيف فواتير ووثائق الإدارة',
  manage_admin_financial_archive: 'رفع وحذف أرشيف الفواتير وتحديث التزامات التشغيل',
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
