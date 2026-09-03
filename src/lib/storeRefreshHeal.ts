/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * جبر عنوان المتجر بعد التحديث: /store#/store/... يكسر عامل الخدمة بعد النشر.
 * المسار الآمن للتحديث هو /#/store/... حتى يُطلب أصل النطاق لا /store.
 */
const DIRTY_PREFIXES = [
  '/store',
  '/h',
  '/w',
  '/e',
  '/l',
  '/g',
  '/k',
  '/r',
  '/v',
  '/oc',
] as const;

export function isDirtyStoreRefreshPath(pathname: string): boolean {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/';
  return DIRTY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function healStoreRefreshUrl(input: { pathname: string; search?: string; hash?: string }): string | null {
  const pathname = String(input.pathname || '/') || '/';
  const search = String(input.search || '');
  const hash = String(input.hash || '');
  if (hash.length <= 1) return null;
  if (!isDirtyStoreRefreshPath(pathname)) return null;
  const next = `/${search}${hash.startsWith('#') ? hash : `#${hash}`}`;
  const current = `${pathname}${search}${hash}`;
  return next === current ? null : next;
}
