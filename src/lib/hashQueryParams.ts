/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** قراءة معاملات الاستعلام من هاش HashRouter مثل `#/?need=home-visit&near=riyadh` */
export function readHashQueryParams(): URLSearchParams {
  try {
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    if (hash.includes('?')) {
      return new URLSearchParams(hash.slice(hash.indexOf('?') + 1));
    }
    const search = typeof window !== 'undefined' ? window.location.search : '';
    return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  } catch {
    return new URLSearchParams();
  }
}

export function readHashQueryParam(name: string): string | null {
  const value = readHashQueryParams().get(name);
  if (!value) return null;
  try {
    return decodeURIComponent(value).trim() || null;
  } catch {
    return value.trim() || null;
  }
}
