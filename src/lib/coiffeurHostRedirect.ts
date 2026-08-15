/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عزل سطح كوافير ماب عن نطاق الرجال:
 * صفحات سمي ومسارات /coiffeur على www تُحوَّل إلى النطاق الفرعي.
 *
 * لا تستورد coiffeurMapUmbrella من هنا — App يستدعي هذا الملف عند الإقلاع،
 * وسحب مظلة كوافير/الشؤون القانونية إلى حزمة App يكسر التحميل الكسول (تعذّر تحميل المنصة).
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

const COIFFEUR_SATELLITE_HOST = 'coiffeur.halaqmap.com';

const MENS_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com']);

export function isHalaqmapMensHost(host: string): boolean {
  return MENS_HOSTS.has(host.trim().toLowerCase());
}

export function resolveMensHostCoiffeurRedirect(input: {
  host: string;
  hashPath: string;
  hashSearch?: string;
}): string | null {
  if (!isHalaqmapMensHost(input.host)) return null;
  const path = (input.hashPath || '/').trim() || '/';
  const rawSearch = String(input.hashSearch || '').trim();
  const search = rawSearch && rawSearch !== '?' ? (rawSearch.startsWith('?') ? rawSearch : `?${rawSearch}`) : '';

  if (path === ROUTE_PATHS.SUMMI_HUB || path.startsWith(`${ROUTE_PATHS.SUMMI_HUB}/`)) {
    return `https://${COIFFEUR_SATELLITE_HOST}${path}${search}`;
  }
  if (path === ROUTE_PATHS.COIFFEUR_LANDING || path.startsWith(`${ROUTE_PATHS.COIFFEUR_LANDING}/`)) {
    return `https://${COIFFEUR_SATELLITE_HOST}/#${path}${search}`;
  }
  return null;
}
