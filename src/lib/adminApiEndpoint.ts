/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسارات لوحة الإدارة على `/api/...`: تفضيل نفس الأصل لتجنّب CORS
 * وإعادة توجيه apex→www التي تسقط رأس Authorization.
 */
const PRODUCTION_ORIGINS = new Set(['https://halaqmap.com', 'https://www.halaqmap.com']);

export function resolveAdminApiEndpoint(apiPath: string): string {
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (!base) return path;
  if (typeof window === 'undefined') return `${base}${path}`;
  try {
    const baseOrigin = new URL(base).origin;
    const pageOrigin = window.location.origin;
    if (baseOrigin === pageOrigin) return path;
    if (PRODUCTION_ORIGINS.has(baseOrigin) && PRODUCTION_ORIGINS.has(pageOrigin)) return path;
  } catch {
    // أصل غير صالح — نعود للمسار المطلق المُهيّأ
  }
  return `${base}${path}`;
}
