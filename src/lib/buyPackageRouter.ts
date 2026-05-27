/**
 * buyPackageRouter — منطق موحَّد لتوجيه شراء الحزم
 *
 * يفرّق بين:
 *  · العميل الجديد (غير مسجَّل) → نموذج التسجيل أولاً → الدفع لاحقاً
 *  · الحلاق المسجَّل (شحن رصيد) → صفحة الدفع مباشرة
 *
 * يُستخدم من كل بطاقات شراء الباقات في الصفحات التسويقية.
 */

import { ROUTE_PATHS } from '@/lib/index';
import {
  isBarberLoggedIn,
  readBarberAuthSession,
} from '@/lib/barberPortalSession';

export type BuyPackageParams = {
  /** نوع الباقة */
  tier: 'bronze' | 'gold' | 'diamond';
  /** نوع الخطة */
  plan?: 'monthly' | 'annual';
  /** هل المناوب/المكتب الخاص مفعَّل (للماسي فقط) */
  digitalShiftAddon?: boolean;
  /** عدد أشهر الرخصة (يُمرَّر كـ qty في صفحة الدفع) */
  licenseMonths?: number;
};

export { isBarberLoggedIn };

/**
 * بناء URL الانتقال الصحيح
 *  - مسجَّل → /partners/payment?purpose=recharge&tier=...&plan=...
 *  - جديد  → /partners/register?tier=...&plan=...
 */
export function buildBuyPackageUrl(params: BuyPackageParams): string {
  const tier = params.tier;
  const plan = params.plan ?? 'annual'; // افتراضي: سنوي
  const portalSession = readBarberAuthSession();
  const loggedIn = portalSession != null;

  const search = new URLSearchParams();
  search.set('tier', tier);
  search.set('plan', plan);
  if (params.digitalShiftAddon) search.set('addon', 'office');
  if (params.licenseMonths != null && params.licenseMonths > 0) {
    search.set('qty', String(params.licenseMonths));
  }

  if (loggedIn) {
    search.set('purpose', 'recharge');
    if (portalSession.id) search.set('linkedBarberId', portalSession.id);
    if (portalSession.name) search.set('barberName', portalSession.name);
    return `${ROUTE_PATHS.PAYMENT}?${search.toString()}`;
  }

  // عميل جديد → تعبئة طلب التسجيل أولاً
  search.set('purpose', 'new');
  return `${ROUTE_PATHS.REGISTER}?${search.toString()}`;
}

/**
 * تنفيذ التوجيه — يستقبل navigate من react-router
 */
export function routeToBuyPackage(
  navigate: (to: string) => void,
  params: BuyPackageParams,
): { destination: 'register' | 'payment' } {
  const url = buildBuyPackageUrl(params);
  navigate(url);
  return { destination: isBarberLoggedIn() ? 'payment' : 'register' };
}
