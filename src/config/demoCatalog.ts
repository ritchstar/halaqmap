/**
 * حارس كتالوج العرض التجريبي.
 * تم إيقافه افتراضياً لحماية الإنتاج ومنع ظهور حلاقين افتراضيين.
 * لا يُفعّل إلا يدوياً عند الضبط الصريح:
 * VITE_DEMO_CATALOG=true
 */
export function isDemoCatalogEnabled(): boolean {
  return import.meta.env.VITE_DEMO_CATALOG === 'true';
}

export const DEMO_SHOWCASE_BARBER_ID_PREFIX = 'demo-showcase-';

export function isDemoShowcaseBarberId(id: string): boolean {
  return id.startsWith(DEMO_SHOWCASE_BARBER_ID_PREFIX);
}
