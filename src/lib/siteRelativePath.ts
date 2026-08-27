/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار داخل الموقع من رابط نسبي أو مطلق.
 * يمنع `/https://www.halaqmap.com/...` عندما يُمرَّر أصل كامل إلى دوال المسارات.
 */
export function siteRelativePath(path: string): string {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  if (raw.startsWith('/#/')) return raw.slice(2) || '/';
  if (raw.startsWith('#/')) return raw.slice(1) || '/';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) {
    try {
      const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      if (u.hash.startsWith('#/')) return u.hash.slice(1) || '/';
      if (u.hash.length > 1) {
        const rest = u.hash.slice(1);
        return rest.startsWith('/') ? rest : `/${rest}`;
      }
      const rel = `${u.pathname}${u.search}` || '/';
      return rel.startsWith('/') ? rel : `/${rel}`;
    } catch {
      return '/';
    }
  }
  if (/^\/https?:/i.test(raw)) {
    const healed = raw.replace(/^\/https:\/*/i, 'https://');
    return siteRelativePath(healed);
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}
