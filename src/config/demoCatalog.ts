/**
 * كتالوج عرض التصميم في الصفحة الرئيسية: ثلاثة حلاقين (برونزي / ذهبي / ماسي)
 * يُستثنون من حدّ المسافة في الفلترة حتى يمكن مراجعة البنرات من أي موقع.
 *
 * الإنتاج / استقبال تسجيلات حقيقية فقط: عيّن في البيئة
 * VITE_DEMO_CATALOG=false
 */
export function isDemoCatalogEnabled(): boolean {
  return import.meta.env.VITE_DEMO_CATALOG !== 'false';
}

export const DEMO_SHOWCASE_BARBER_ID_PREFIX = 'demo-showcase-';

export function isDemoShowcaseBarberId(id: string): boolean {
  return id.startsWith(DEMO_SHOWCASE_BARBER_ID_PREFIX);
}
