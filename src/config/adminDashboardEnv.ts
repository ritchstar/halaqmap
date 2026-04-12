/**
 * بيانات تجريبية في لوحة الإدارة (طلبات/مدفوعات/إحصائيات وهمية).
 * الإنتاج: معطّل ما لم تُضبط VITE_ADMIN_SHOW_MOCKS=true صراحةً.
 * التطوير المحلي: مفعّل افتراضياً عند عدم الضبط.
 */
export function shouldShowAdminMocks(): boolean {
  const raw = String(import.meta.env.VITE_ADMIN_SHOW_MOCKS ?? '').trim().toLowerCase();
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return Boolean(import.meta.env.DEV);
}
