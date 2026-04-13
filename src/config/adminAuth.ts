/** بريد Bootstrap افتراضي للإدارة (يمكن تجاوزه بـ VITE_ADMIN_EMAIL). */
export function getAdminAllowedEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().toLowerCase();
  return 'ritchstar4@gmail.com';
}

/**
 * مسار «البوابة» الخفي للإدارة (بدون رابط في واجهة المنصة).
 * عيّن VITE_ADMIN_PORTAL_BASE في البيئة للإنتاج (مثل /x7k-m9q2-a4).
 * تحذير: القيمة تُدمج في حزمة الواجهة — الحماية الحقيقية بكلمة مرور قوية + RLS في Supabase.
 */
function normalizePortalBase(raw: string | undefined): string {
  let b = (raw ?? '').trim();
  if (!b) return '/_hmap-int-9kz2';
  if (!b.startsWith('/')) b = `/${b}`;
  return b.replace(/\/+$/, '');
}

export function getAdminPortalBasePath(): string {
  return normalizePortalBase(import.meta.env.VITE_ADMIN_PORTAL_BASE as string | undefined);
}

export function getAdminLoginPath(): string {
  return `${getAdminPortalBasePath()}/in`;
}

export function getAdminDashboardPath(): string {
  return `${getAdminPortalBasePath()}/ctrl`;
}
