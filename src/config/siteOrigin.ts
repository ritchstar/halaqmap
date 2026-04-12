/** أصل الموقع العام (روابط canonical و JSON-LD و OG). يُفضّل ضبط VITE_SITE_ORIGIN في الإنتاج. */
export function getSiteOrigin(): string {
  const raw = (import.meta.env.VITE_SITE_ORIGIN as string | undefined)?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'https://www.halaqmap.com';
}
