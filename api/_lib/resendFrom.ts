/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * اسم المرسل الظاهر في صندوق الوارد — متجر خريطة الحل مرجع إداري لكل المنتجات،
 * بما فيها منصة حلاق ماب. نوع الرسالة يُذكر في المتن (والموضوع)، لا في خانة المرسل.
 */
export const RESEND_SENDER_DISPLAY_NAME_AR = 'halaqmap خريطة الحل';

const LEGACY_SENDER_NAMES = new Set([
  'حلاق ماب',
  'Halaq Map',
  'HalaqMap',
  'HALAQ MAP',
]);

export function isLegacyResendSenderName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (LEGACY_SENDER_NAMES.has(trimmed)) return true;
  return /^حلاق ماب$/.test(trimmed);
}

export function readResendFromEmailEnv(): string {
  return (process.env.RESEND_FROM_EMAIL || '').trim();
}

/** يستخرج البريد الخام من `admin@…` أو `Name <admin@…>`. */
export function extractResendEmailAddress(raw: string): string {
  const trimmed = raw.trim();
  const m = trimmed.match(/^[^<]*<([^>]+)>$/);
  return (m?.[1] ?? trimmed).trim();
}

/**
 * اسم العرض في خانة From. القيمة القديمة «حلاق ماب» في البيئة تُتجاهل حتى لا تبقى في الإنتاج.
 */
export function resolveResendSenderDisplayName(): string {
  const raw = (process.env.RESEND_FROM_NAME || process.env.RESEND_SENDER_NAME || '').trim();
  if (!raw || isLegacyResendSenderName(raw)) return RESEND_SENDER_DISPLAY_NAME_AR;
  return raw;
}

/**
 * يُرجع حقل `from` بصيغة Resend: `halaqmap خريطة الحل <noreply@…>`.
 * يمنع ظهور ADMIN (من local-part مثل admin@…) كاسم مرسل في صندوق الوارد.
 */
export function resolveResendFromAddress(rawFrom?: string): string {
  const raw = (rawFrom ?? readResendFromEmailEnv()).trim();
  if (!raw) return '';
  const email = extractResendEmailAddress(raw);
  if (!email.includes('@')) return raw;
  const name = resolveResendSenderDisplayName();
  return `${name} <${email}>`;
}

export function isResendFromConfigured(): boolean {
  return Boolean(readResendFromEmailEnv());
}
