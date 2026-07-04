/** اسم المرسل الظاهر في صندوق الوارد — مصدر واحد لرسائل العملاء والمنصة. */
export const RESEND_SENDER_DISPLAY_NAME_AR = 'حلاق ماب';

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
 * يُرجع حقل `from` بصيغة Resend: `حلاق ماب <noreply@…>`.
 * يمنع ظهور ADMIN (من local-part مثل admin@…) كاسم مرسل في صندوق الوارد.
 */
export function resolveResendFromAddress(rawFrom?: string): string {
  const raw = (rawFrom ?? readResendFromEmailEnv()).trim();
  if (!raw) return '';
  const email = extractResendEmailAddress(raw);
  if (!email.includes('@')) return raw;
  const name =
    (process.env.RESEND_FROM_NAME || process.env.RESEND_SENDER_NAME || RESEND_SENDER_DISPLAY_NAME_AR).trim() ||
    RESEND_SENDER_DISPLAY_NAME_AR;
  return `${name} <${email}>`;
}

export function isResendFromConfigured(): boolean {
  return Boolean(readResendFromEmailEnv());
}
