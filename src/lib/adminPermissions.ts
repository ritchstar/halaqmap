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
  | 'manage_admins';

export type AdminPermissions = Record<AdminPermissionKey, boolean>;

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  view_overview: 'عرض النظرة العامة',
  view_requests: 'عرض طلبات الاشتراك',
  review_requests: 'اعتماد/رفض الطلبات',
  view_barbers: 'عرض قائمة الحلاقين',
  manage_barbers: 'تفعيل/تعطيل الحلاقين',
  view_payments: 'عرض المدفوعات',
  review_payments: 'تأكيد/رفض المدفوعات',
  view_command_center: 'عرض غرفة القيادة',
  manage_command_center: 'إدارة غرفة القيادة',
  view_messages: 'عرض الرسائل',
  view_settings: 'عرض الإعدادات',
  manage_admins: 'إدارة المدراء والصلاحيات',
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
};

export function normalizeAdminPermissions(value: unknown): AdminPermissions {
  const incoming = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const out: Partial<AdminPermissions> = {};
  for (const k of ADMIN_PERMISSION_KEYS) out[k] = Boolean(incoming[k] ?? DEFAULT_ADMIN_PERMISSIONS[k]);
  return out as AdminPermissions;
}
