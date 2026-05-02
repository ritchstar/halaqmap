/** بريد Bootstrap افتراضي للإدارة (يمكن تجاوزه بـ VITE_ADMIN_EMAIL). */
export function getAdminAllowedEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().toLowerCase();
  return 'ritchstar4@gmail.com';
}

/**
 * مسار «البوابة» الخفي للإدارة (بدون رابط في واجهة المنصة).
 * عيّن VITE_ADMIN_PORTAL_BASE في بيئة **البناء** (Vercel) ليطابق الرابط الذي تستخدمه (مثل /x7k-m9q2-a4).
 * يمكن تمرير عدة قواعد مفصولة بفواصل ليتم تسجيل كلها في React Router (انتقال من مسار قديم إلى جديد):
 * مثال: VITE_ADMIN_PORTAL_BASE=/x7k-m9q2-a4,/_hmap-int-9kz2
 * القيمة الأولى تُستخدم كافتراضي للروابط التي لا تستنتج المسار من عنوان الصفحة الحالي.
 */
function normalizePortalBaseSegment(raw: string): string {
  let b = raw.trim();
  if (!b) return '/_hmap-int-9kz2';
  if (!b.startsWith('/')) b = `/${b}`;
  return b.replace(/\/+$/, '');
}

/** كل قواعد البوابة المعرّفة في البيئة (بعد البناء). */
export function getAdminPortalBasePaths(): string[] {
  const raw = (import.meta.env.VITE_ADMIN_PORTAL_BASE as string | undefined)?.trim();
  if (!raw) return ['/_hmap-int-9kz2'];
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => normalizePortalBaseSegment(s));
  const uniq = [...new Set(parts)];
  return uniq.length ? uniq : ['/_hmap-int-9kz2'];
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

export function getAdminLoginPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/in`;
}

export function getAdminDashboardPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/ctrl`;
}

export function getAdminSentinelPathFor(pathname: string): string {
  return `${resolveAdminPortalBase(pathname)}/sentinel`;
}
