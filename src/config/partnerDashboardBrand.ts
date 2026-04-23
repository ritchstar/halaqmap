/**
 * هوية لوحة الشركاء (الحلاق): العنوان الثابت للمنصة + اسم الصالون من الجلسة (جدول barbers.name عبر API البوابة).
 */

export const PARTNER_DASHBOARD_BRAND_LABEL = 'لوحة تحكم حلاق ماب';

/** يُعرض في العنوان والوثائق — لا يُستخدم كاسم صالون وهمي */
export const PARTNER_DASHBOARD_PRODUCT_NAME = 'حلاق ماب';

/**
 * أسماء كانت تُستخدم في بيانات العرض/الخرائط التجريبية؛ إن بقيت كقيمة `barbers.name`
 * بالخطأ لا نُظهرها كاسم حقيقي — نرجع لجزء البريد أو الاحتياط المحايد.
 */
const LEGACY_DEMO_SALON_REGISTERED_NAMES = new Set<string>([
  'صالون النخبة الماسي',
  '[عرض] صالون النخبة الماسي',
]);

export function isLegacyDemoSalonRegisteredName(name: string): boolean {
  return LEGACY_DEMO_SALON_REGISTERED_NAMES.has((name || '').trim());
}

/**
 * اسم الصالون للعرض: يعتمد على `name` القادم من قاعدة البيانات؛ إن كان فارغاً يُستبدل بجزء آمن من البريد دون اسم تجريبي ثابت.
 */
export function partnerSalonDisplayName(input: { name: string; email: string }): string {
  const raw = (input.name || '').trim();
  const n = isLegacyDemoSalonRegisteredName(raw) ? '' : raw;
  if (n.length > 0) return n;
  const local = (input.email || '').split('@')[0]?.trim();
  if (local && local.length > 0) return local;
  return 'الشريك المعتمد';
}

/** عنوان تبويب المتصفح — يتبع اسم الصالون من الجلسة (قاعدة البيانات عبر البوابة). */
export function partnerDashboardDocumentTitleFromSession(input: { name: string; email: string }): string {
  const s = partnerSalonDisplayName(input);
  return `${PARTNER_DASHBOARD_BRAND_LABEL} — ${s} | ${PARTNER_DASHBOARD_PRODUCT_NAME}`;
}
