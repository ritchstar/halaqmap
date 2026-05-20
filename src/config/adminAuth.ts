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
